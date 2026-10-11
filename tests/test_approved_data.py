"""Fictional approval fixtures only; never decides real labels or uses corpus rows."""
from collections import Counter
from copy import deepcopy
import json
from pathlib import Path
import pytest
from ml.approved_data import finalize
from ml.data_prep import DataError, digest, json_bytes, prepare, plan_split
from ml.train import Corpus, load_manifest
from ml.training_preflight import check_training_inputs
from tools.human_review.app import summary
from tests.test_data_prep import corpus, csv_data


@pytest.fixture
def approved(tmp_path):
    source=tmp_path/'source.csv'
    source.write_bytes(csv_data(corpus()+[('spam','Fictional conflicting family identical.'),('smishing','Fictional conflicting family identical.')]))
    provenance, rows, expected, report, mapping=prepare(source,tmp_path/'import')
    candidate_path=tmp_path/'candidate.json'
    candidate=plan_split(provenance,rows,expected,report,mapping,candidate_path)
    review_path=tmp_path/'review.json'
    old=deepcopy(expected)
    for r in old['records']:
        r.update(decision='confirmed',language='pending',reviewer_id='fictional-reviewer',reviewed_date='2026-10-10',notes='Retained historical note.')
    review_path.write_bytes(json_bytes(old))
    correction=next(r['row_id'] for r in old['records'] if r['source_label']=='spam')
    staged=[]
    for r in old['records']:
        staged.append(dict(row_id=r['row_id'],source_label=r['source_label'],final_label='smishing' if r['row_id']==correction else r['source_label'],label_rechecked=True,language_confirmed=True,language='en',reviewer_id=r['reviewer_id'],reviewed_date=r['reviewed_date'],label_confirmed_at='2026-10-11T09:00:00+00:00',language_confirmed_at='2026-10-11T09:00:00+00:00',metadata_confirmation=None))
    lookup={r.row_id:r for r in rows}
    raw_rows,_=__import__('ml.data_prep',fromlist=['import_rows']).import_rows(source.read_bytes(),'utf-8-sig')
    quarantine=[dict(group_id=gid,reason='Fictional normalized conflict',rows=[dict(row_id=r.row_id,source_label=r.label) for r in raw_rows if mapping[r.row_id]==gid]) for gid in report['conflicting_groups']]
    overrides=[dict(row_id=correction,source_label='spam',reviewed_label='smishing',group_id=mapping[correction])]
    stage=dict(canonical_pins={str(review_path):digest(review_path.read_bytes()),str(candidate_path):digest(candidate_path.read_bytes())},records=staged,original_conflict_groups=quarantine,effect={'label_overrides':overrides})
    staged_path=tmp_path/'staged.json';staged_path.write_bytes(json_bytes(stage))
    counts=Counter(r.label for r in rows);counts['spam']-=1;counts['smishing']+=1
    approval=dict(explicit_owner_approval=True,approved_by='fictional-owner',staged_sha256=digest(staged_path.read_bytes()),previous_review_sha256=digest(review_path.read_bytes()),quarantine_rows=2,quarantine_groups=1,eligible_counts=dict(counts))
    approval_path=tmp_path/'approval.json';approval_path.write_bytes(json_bytes(approval))
    args=(approval_path,staged_path,review_path,candidate_path,source,tmp_path/'manifest.json',tmp_path/'revision')
    return args,correction


def test_approved_revision_preserves_history_assignments_and_source(approved):
    args,correction=approved
    before=args[2].read_bytes();source_bytes=args[4].read_bytes();candidate_bytes=args[3].read_bytes()
    manifest=finalize(*args)
    assert args[4].read_bytes()==source_bytes and args[3].read_bytes()==candidate_bytes
    assert args[2].with_name('review.before-finalization-'+digest(before)[:16]+'.json').read_bytes()==before
    review=json.loads(args[2].read_bytes())
    assert len(review['records'])==45 and all(r['decision']=='confirmed' for r in review['records'])
    corrected=next(r for r in review['records'] if r['row_id']==correction)
    assert corrected['source_label']=='spam' and summary(corrected)['requested_label']=='smishing'
    assert 'Retained historical note.' in corrected['notes']
    assert manifest['records']==finalize(*args)['records']
    original=json.loads(candidate_bytes)
    assert [(r['row_id'],r['group_id'],r['split']) for r in original['records']]==[(r['row_id'],r['group_id'],r['split']) for r in manifest['records']]
    assert all(not values for values in manifest['leakage_intersections'].values())
    assert check_training_inputs(args[5],args[2],args[4])['training_allowed']
    loaded,_=load_manifest(args[5],False)
    texts,labels,ids=Corpus(args[4],loaded).get('train')
    assert labels[ids.index(correction)]=='smishing'


@pytest.mark.parametrize('problem',['approval','staged_hash','quarantine','pending','source'])
def test_unapproved_or_changed_revision_cannot_write_canonical(approved,problem):
    args,_=approved;before=args[2].read_bytes()
    approval=json.loads(args[0].read_bytes());stage=json.loads(args[1].read_bytes())
    if problem=='approval':approval['explicit_owner_approval']=False
    elif problem=='staged_hash':approval['staged_sha256']='0'*64
    elif problem=='quarantine':approval['quarantine_rows']=1
    elif problem=='pending':
        stage['records'][0]['label_rechecked']=False;args[1].write_bytes(json_bytes(stage));approval['staged_sha256']=digest(args[1].read_bytes())
    else:args[4].write_bytes(args[4].read_bytes()+b'\n')
    args[0].write_bytes(json_bytes(approval))
    with pytest.raises(DataError):finalize(*args)
    assert args[2].read_bytes()==before and not args[5].exists()


def test_changed_frozen_label_or_partition_rejected(approved):
    args,_=approved;finalize(*args)
    m=json.loads(args[5].read_bytes());m['records'][0]['label']='spam' if m['records'][0]['label']!='spam' else 'ham'
    args[5].write_bytes(json_bytes(m));args[5].with_suffix('.sha256').write_text(digest(args[5].read_bytes())+'\n')
    result=check_training_inputs(args[5],args[2],args[4])
    assert not result['training_allowed']
    assert 'approved_revision_manifest_mismatch' in result['blockers']


def test_canonical_symlink_is_not_replaced(approved):
    args,_=approved
    target=args[2].with_name('owner-review.json')
    args[2].rename(target)
    args[2].symlink_to(target)
    before=target.read_bytes()
    with pytest.raises(DataError):finalize(*args)
    assert args[2].is_symlink() and target.read_bytes()==before
