"""Export only verified aggregate facts from the frozen approved release report."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

def facts() -> dict:
    config = json.loads((ROOT / 'backend/model-config.json').read_bytes())
    report_bytes = (ROOT / config['selection_report']).read_bytes()
    if hashlib.sha256(report_bytes).hexdigest() != config['selection_report_sha256']:
        raise ValueError('report_identity_mismatch')
    report = json.loads(report_bytes)
    manifest_bytes = (ROOT / 'ml/manifests/mendeley-v1.split.json').read_bytes()
    if hashlib.sha256(manifest_bytes).hexdigest() != report['data_approval']['split_sha256']:
        raise ValueError('split_identity_mismatch')
    selected = report['selection']['model']
    if report['artifacts'][selected]['sha256'] != config['sha256'] or report['selection']['test_used'] or report['fresh_independent_test']:
        raise ValueError('approved_report_scope_mismatch')
    counts = {label: sum(split[label] for split in report['counts'].values()) for label in ('ham','spam','smishing')}
    test = report['models'][selected]['test']
    if test['confusion_labels'] != ['ham','spam','smishing']:
        raise ValueError('confusion_labels_mismatch')
    return {
        'formatVersion': 1, 'modelSha256': config['sha256'], 'reportSha256': config['selection_report_sha256'],
        'splitSha256': report['data_approval']['split_sha256'], 'selectedModel': selected,
        'datasetCount': sum(counts.values()), 'classCounts': counts, 'splitCounts': report['counts'],
        'testCount': test['count'], 'macroF1': test['macro_f1'], 'perClass': test['per_class'],
        'confusionMatrix': test['confusion_matrix'], 'smishingCorrect': test['confusion_matrix'][2][2],
        'languageBenchmarks': report['language_results'], 'independentBlindValidation': report['fresh_independent_test'],
    }

def main() -> int:
    try:
        output = ROOT / 'frontend/src/model-facts.json'
        serialized = json.dumps(facts(),indent=2,sort_keys=True)+'\n'
        if sys.argv[1:] == ['--check']:
            if output.read_text() != serialized:
                raise ValueError('transparency_facts_drift')
            print('Transparency facts match the hash-verified approved reports.')
        elif not sys.argv[1:]:
            output.write_text(serialized)
            print('Exported verified aggregate transparency facts.')
        else:
            raise ValueError('invalid_arguments')
        return 0
    except Exception:
        print('ClearMessage transparency check failed; no source data or private diagnostics emitted.')
        return 1

if __name__ == '__main__':
    raise SystemExit(main())
