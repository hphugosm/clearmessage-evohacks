"""Offline final audit of approval/provenance and selected-model inference; no fit."""
import os
for name in ('OMP_NUM_THREADS', 'OPENBLAS_NUM_THREADS', 'MKL_NUM_THREADS', 'NUMEXPR_NUM_THREADS', 'VECLIB_MAXIMUM_THREADS'):
    os.environ[name] = '1'
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'

import argparse
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def require(condition):
    if not condition:
        raise ValueError('audit_consistency_failed')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True, help='New report path; never overwrites evidence.')
    args = parser.parse_args()
    events = []
    def network_guard(event, _args):
        if event in ('socket.connect', 'socket.getaddrinfo', 'socket.gethostbyname', 'socket.gethostbyaddr', 'socket.getnameinfo', 'socket.sendto', 'socket.sendmsg'):
            events.append(event)
            raise OSError('audit_network_blocked')
    sys.addaudithook(network_guard)
    from backend.contracts import AnalyzeRequest, POLICY_VERSION
    from backend.inference import CONFIG, LocalClassifier
    from backend.policy import analyze_text
    from ml.data_prep import digest, json_bytes, write_new
    from ml.train import Corpus, load_manifest, metrics, policy_metrics
    from ml.training_preflight import check_training_inputs
    import numpy as np

    review_path = ROOT / 'ml/data/mendeley-v1-audit-v2/review.completed.json'
    source = ROOT / 'ml/data/raw/Dataset_5971.zip'
    review = json.loads(review_path.read_text())
    rows = review['records']
    preflight = check_training_inputs(ROOT / 'ml/manifests/mendeley-v1.split.json', review_path, source)
    approved = CONFIG['human_review_complete'] is True
    manifest_path = ROOT / ('ml/manifests/mendeley-v1.split.json' if approved else 'ml/manifests/mendeley-v1.split.provisional.json')
    manifest, manifest_hash = load_manifest(manifest_path, not approved)
    if approved:
        require(preflight['training_allowed'])
    experiment = json.loads((ROOT / CONFIG['selection_report']).read_text())
    classifier = LocalClassifier(ROOT / CONFIG['artifact_path'])
    require(classifier.ready)
    require(classifier._model.provenance == experiment['data_approval'])
    require(manifest_hash == experiment['data_approval']['split_sha256'])
    require(experiment['selection']['test_used'] is False and experiment['test_evaluation_after_selection'] is True)
    require(manifest['provenance']['input_sha256'] == experiment['data_approval']['source_sha256'])
    corpus = Corpus(source, manifest)
    # Selection is already fixed in the hash-verified historical experiment, never changed here.
    corpus.selection_complete = True
    selection = experiment['selection']
    baseline_class = max(manifest['counts']['train'], key=manifest['counts']['train'].get)
    evaluations = {}
    for split in ('validation', 'test'):
        texts, labels, ids = corpus.get(split)
        scores = classifier._model.predict_proba(texts)
        predictions = classifier._model.classes[scores.argmax(axis=1)]
        computed = metrics(labels, predictions, ids)
        historical = experiment['models'][selection['model']][split]
        require(computed == historical)
        cli_policy = policy_metrics(labels, scores, classifier._model.classes, CONFIG['warning_threshold'])
        expected_policy = (next(p for p in experiment['models'][selection['model']]['validation_policies'] if p['threshold_internal_score'] == CONFIG['warning_threshold']) if split == 'validation' else experiment['models'][selection['model']]['test_policy'])
        require(cli_policy == expected_policy)
        baseline = metrics(labels, np.repeat(baseline_class, len(labels)), ids)
        require(baseline == experiment['majority_baseline'][split])
        policy_counts = Counter()
        tp = fp = fn = completed = invalid = model_errors = 0
        signal_counts = Counter()
        for text, label in zip(texts, labels):
            # Do not invent English confirmations for this unverified-language corpus.
            if not text.strip() or len(text) > 2000:
                invalid += 1
                fn += int(label == 'smishing')
                continue
            response = analyze_text(AnalyzeRequest(text=text, message_language='auto'), classifier)
            require(not response.analysis_complete and response.status != 'no_strong_signals')
            policy_counts[response.status.value] += 1
            completed += int(response.analysis_complete)
            model_errors += int('inference_unavailable' in response.limitations)
            warning = response.status == 'suspicious'
            tp += int(warning and label == 'smishing')
            fp += int(warning and label != 'smishing')
            fn += int(not warning and label == 'smishing')
            for item in response.evidence:
                require(item.basis == 'observed_text_signal')
                signal_counts[item.key] += 1
        require(model_errors == 0)
        evaluations[split] = {
            'classifier': computed, 'classifier_metrics_match_pinned_report': True,
            'majority_baseline': baseline, 'baseline_matches_pinned_report': True,
            'historical_goal02_cli_policy': cli_policy, 'cli_policy_matches_pinned_report': True,
            'current_policy_unspecified_language': {
                'policy_version': POLICY_VERSION, 'message_language': 'auto',
                'scope': 'Unverified-language public source; observed rules may warn, classifier warnings require explicit en and are not attributed here.',
                'counts': dict(policy_counts), 'invalid_input': invalid, 'analysis_complete_count': completed,
                'inference_errors': model_errors, 'observed_evidence_counts': dict(signal_counts),
                'source_smishing_warnings': tp, 'source_non_smishing_warnings': fp,
                'source_smishing_without_explicit_warning': fn,
                'ground_truth_limitation': 'Source labels are unapproved; these are annotation-agreement counts, not verified fraud errors.',
            },
        }
    require(not events)
    comparison = None
    if approved:
        from ml.sparse_model import SparseModel
        previous_path = ROOT / 'ml/reports/goal02-provisional-v2.json'
        require(digest(previous_path.read_bytes()) == 'b0d359771769be9f983370eec8599b7be13a6b55c4bc274259694a317eef3715')
        previous = json.loads(previous_path.read_text())
        old_artifact = previous['artifacts'][previous['selection']['model']]
        old_model = SparseModel(ROOT / old_artifact['file'], old_artifact['sha256'])
        comparison = {'scope': 'Identical previously evaluated validation/test rows; corrected labels affect train only. Not independent blind validation.',
                      'previous_report_sha256': digest(previous_path.read_bytes()), 'previous_model_sha256': old_artifact['sha256'], 'splits': {}}
        for split in ('validation', 'test'):
            texts, labels, ids = corpus.get(split)
            old_predictions = old_model.predict(texts)
            old_metrics = metrics(labels, old_predictions, ids)
            require(old_metrics == previous['models'][previous['selection']['model']][split])
            new_metrics = evaluations[split]['classifier']
            new_predictions = classifier._model.predict(texts)
            comparison['splits'][split] = {'provisional': old_metrics, 'approved': new_metrics,
                'macro_f1_delta': new_metrics['macro_f1'] - old_metrics['macro_f1'],
                'prediction_disagreements': int((new_predictions != old_predictions).sum())}
    result = {
        'goal': 'Approved dataset/ML release' if approved else 'Goal 07', 'executed_at_utc': datetime.now(timezone.utc).isoformat(),
        'training_performed': False, 'selection_or_policy_changed': False,
        'held_out_test_rechecked_after_fixed_selection': True, 'blind_challenges_opened': False,
        'approval_preflight': preflight,
        'canonical_review': {
            'sha256': digest(review_path.read_bytes()), 'records': len(rows),
            'decision_counts': dict(Counter(r.get('decision') for r in rows)),
            'language_counts': dict(Counter(r.get('language') for r in rows)),
            'missing_attribution_count': sum(not r.get('reviewer_id', '').strip() or not r.get('reviewed_date', '').strip() for r in rows),
            'quarantine_approved': bool(review.get('exclusions_approved_by', '').strip()),
        },
        'approved_final_split_exists': (ROOT / 'ml/manifests/mendeley-v1.split.json').exists(),
        'split_sha256': manifest_hash, 'data_split_ready': manifest['data_split_ready'],
        'excluded_conflicting_rows': manifest['conflict_rows_excluded'],
        'conflicting_groups': len(manifest['conflicting_groups']),
        'counts': manifest['counts'], 'model_version': classifier.version,
        'model_sha256': CONFIG['sha256'], 'selection_report_sha256': CONFIG['selection_report_sha256'],
        'runtime_matches_provisional_goal02': not approved, 'runtime_matches_approved_final_model': approved,
        'language_results': {'english': None, 'czech': None, 'unverified_source_languages': True},
        'evaluations': evaluations, 'outgoing_network_attempts': len(events),
        'comparison': comparison,
        'passed_consistency_checks': True, 'release_approval': 'blocked',
    }
    write_new(args.output, json_bytes(result))
    print(json.dumps({'status': 'audited', 'release_approval': 'blocked', 'model_consistency': 'passed', 'test_count': evaluations['test']['classifier']['count'], 'outgoing_network_attempts': 0}))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        raise SystemExit('Final model audit failed: missing/mismatched evidence or inference inconsistency; no private details emitted.') from None
