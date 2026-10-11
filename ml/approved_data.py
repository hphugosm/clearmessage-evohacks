"""Reconcile explicitly approved review metadata; preserve source and assignments."""
from collections import Counter
from copy import deepcopy
from pathlib import Path
import fcntl
import json
import os
import tempfile

from ml.data_prep import (DataError, LABELS, SPLITS, assert_no_leakage, bounded_read,
                          digest, group_rows, import_rows, json_bytes, read_input, write_new)
from tools.human_review.app import MARKER, read_review


def require(condition):
    if not condition:
        raise DataError('approved_revision_mismatch')


def canonical_path(path):
    try:
        return str(path.resolve().relative_to(Path(__file__).resolve().parents[1]))
    except ValueError:
        return str(path)


def build_revision(approval_path, staged_path, review_path, candidate_path, source_path):
    approval_bytes, staged_bytes = bounded_read(approval_path), bounded_read(staged_path)
    approval, staged = json.loads(approval_bytes), json.loads(staged_bytes)
    require(approval['explicit_owner_approval'] is True and approval['approved_by'].strip())
    require(digest(staged_bytes) == approval['staged_sha256'])
    require(staged['canonical_pins'][canonical_path(review_path)] == approval['previous_review_sha256'])
    candidate_bytes = bounded_read(candidate_path)
    require(digest(candidate_bytes) == staged['canonical_pins'][canonical_path(candidate_path)])
    require(candidate_path.with_suffix('.sha256').read_text().strip() == digest(candidate_bytes))
    candidate = json.loads(candidate_bytes)
    history_path = review_path.with_name('review.before-finalization-' + approval['previous_review_sha256'][:16] + '.json')
    # A repeated invocation uses the retained original, never the new decisions as history.
    current, current_bytes = read_review(review_path)
    old_bytes = bounded_read(history_path) if history_path.exists() else current_bytes
    require(digest(old_bytes) == approval['previous_review_sha256'])
    original = json.loads(old_bytes)
    staged_rows = {r['row_id']: r for r in staged['records']}
    require(len(staged_rows) == 45 and set(staged_rows) == {r['row_id'] for r in original['records']})
    payload, observed = read_input(source_path, candidate['provenance']['csv_member'], candidate['provenance']['encoding'])
    require(observed['input_sha256'] == candidate['provenance']['input_sha256'] == original['source_input_sha256'])
    rows, _ = import_rows(payload, candidate['provenance']['encoding'])
    lookup = {r.row_id: r for r in rows}
    mapping, _ = group_rows(rows)
    group_labels = {}
    for row in rows:
        group_labels.setdefault(mapping[row.row_id], set()).add(row.label)
    conflicts = {gid for gid, labels in group_labels.items() if len(labels) > 1}
    quarantine = staged['original_conflict_groups']
    require(set(candidate['conflicting_groups']) == conflicts == {g['group_id'] for g in quarantine})
    quarantine_ids = {r['row_id'] for g in quarantine for r in g['rows']}
    require(quarantine_ids == {r.row_id for r in rows if mapping[r.row_id] in conflicts})
    require(len(quarantine_ids) == approval['quarantine_rows'] and len(conflicts) == approval['quarantine_groups'])
    final = deepcopy(original)
    overrides = []
    sample_labels = Counter()
    for item in final['records']:
        stage = staged_rows[item['row_id']]
        require(stage['label_rechecked'] is True and stage['language_confirmed'] is True)
        require(stage['source_label'] == item['source_label'] == lookup[item['row_id']].label)
        require(stage['final_label'] in LABELS and stage['language'] in ('en', 'cs', 'other', 'und'))
        require(stage['reviewer_id'].strip() and stage['reviewed_date'].strip())
        item.update(decision='confirmed', language=stage['language'], reviewer_id=stage['reviewer_id'], reviewed_date=stage['reviewed_date'])
        # Existing schema and notes/history retained; this explicit annotation disambiguates corrected confirmations.
        annotation = {'version': 1, 'action': 'finalize_approved_review', 'requested_label': stage['final_label'],
                      'approval_sha256': digest(approval_bytes), 'label_confirmed_at': stage['label_confirmed_at'],
                      'language_confirmed_at': stage['language_confirmed_at'], 'metadata_confirmation': stage['metadata_confirmation']}
        item['notes'] = item['notes'].rstrip() + '\n' + MARKER + json.dumps(annotation, sort_keys=True)
        sample_labels[stage['final_label']] += 1
        if stage['final_label'] != stage['source_label']:
            overrides.append({'row_id': item['row_id'], 'source_label': stage['source_label'], 'reviewed_label': stage['final_label'], 'group_id': mapping[item['row_id']]})
    require(sorted(overrides, key=lambda r: r['row_id']) == sorted(staged['effect']['label_overrides'], key=lambda r: r['row_id']))
    final['exclusions_approved_by'] = approval['approved_by']
    final_bytes = json_bytes(final)
    require(current_bytes in (old_bytes, final_bytes))
    records = deepcopy(candidate['records'])
    assignment = {r['row_id']: r for r in records}
    require(set(assignment) == set(lookup) - quarantine_ids)
    corrected = {r['row_id']: r['reviewed_label'] for r in overrides}
    for record in records:
        row = lookup[record['row_id']]
        require(row.label == record['label'] and row.text_hash == record['text_sha256'] and mapping[row.row_id] == record['group_id'])
        record['source_label'] = row.label
        record['label'] = corrected.get(row.row_id, row.label)
        if row.row_id in staged_rows:
            require(record['split'] == 'train')
    require(all(assignment[r['row_id']]['split'] == 'train' for r in overrides))
    families = {}
    for record in records:
        families.setdefault(record['group_id'], set()).add(record['label'])
    require(all(len(labels) == 1 for labels in families.values()))
    counts = {s: dict(Counter(r['label'] for r in records if r['split'] == s)) for s in SPLITS}
    require(dict(Counter(r['label'] for r in records)) == approval['eligible_counts'])
    manifest = {'format_version': 1, 'status': 'frozen_after_human_review', 'data_split_ready': True,
                'approved_revision_version': 'approved-data-v1', 'model_trained': False,
                'provenance': candidate['provenance'], 'seed': candidate['seed'], 'ratios': candidate['ratios'],
                'source_file': canonical_path(source_path),
                'parent_candidate_file': candidate_path.name, 'parent_candidate_sha256': digest(candidate_bytes),
                'human_review_file': canonical_path(review_path), 'human_review_sha256': digest(final_bytes),
                'human_reviewed_counts': {label: 15 for label in LABELS},
                'human_sample_languages': dict(Counter(r['language'] for r in final['records'])),
                'reviewed_final_sample_counts': dict(sample_labels), 'remaining_languages': 'unverified',
                'reviewed_families_reserved_for': 'train', 'counts': counts, 'records': records,
                'conflict_rows_excluded': len(quarantine_ids), 'conflicting_groups': sorted(conflicts),
                'label_overrides': overrides, 'leakage_intersections': assert_no_leakage(records),
                'approval_file': canonical_path(approval_path), 'approval_sha256': digest(approval_bytes),
                'staged_file': canonical_path(staged_path), 'staged_sha256': digest(staged_bytes),
                'previous_review_sha256': digest(old_bytes),
                'test_scope': 'Previously evaluated Goal 02/07 comparison set; not fresh blind validation; assignments preserved.',
                'limitations': candidate['limitations'][:1] + ['45 reviewed training rows, not full-corpus annotation/language verification.', 'Time/campaign metadata unavailable; undetected families may remain.', 'Prior test exposure disclosed; no fresh independent benchmark.']}
    return final_bytes, old_bytes, history_path, manifest, quarantine


def finalize(approval_path, staged_path, review_path, candidate_path, source_path, manifest_path, output):
    require(not review_path.is_symlink())
    with review_path.with_suffix(review_path.suffix + '.lock').open('a+') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        final_bytes, old_bytes, history_path, manifest, quarantine = build_revision(approval_path, staged_path, review_path, candidate_path, source_path)
        write_new(history_path, old_bytes)
        write_new(output / 'quarantine.json', json_bytes({'source_sha256': manifest['provenance']['input_sha256'], 'approval_sha256': manifest['approval_sha256'], 'reversible': True, 'groups': quarantine}))
        write_new(output / 'review.final.json', final_bytes)
        write_new(manifest_path, json_bytes(manifest))
        write_new(manifest_path.with_suffix('.sha256'), (digest(json_bytes(manifest))+'\n').encode())
        if review_path.read_bytes() != final_bytes:
            with tempfile.NamedTemporaryFile(dir=review_path.parent, delete=False) as stream:
                stream.write(final_bytes); stream.flush(); os.fsync(stream.fileno()); temporary = stream.name
            os.replace(temporary, review_path)
            directory_fd = os.open(review_path.parent, os.O_RDONLY)
            try:
                os.fsync(directory_fd)
            finally:
                os.close(directory_fd)
        return manifest
