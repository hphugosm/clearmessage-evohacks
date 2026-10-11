#!/usr/bin/env python3
"""Apply a separately recorded explicit owner approval; never infers approval."""
import argparse
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.approved_data import finalize
from ml.data_prep import bounded_read, digest, write_new


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--approval', type=Path, required=True)
    p.add_argument('--staged', type=Path, required=True)
    p.add_argument('--review', type=Path, default=Path('ml/data/mendeley-v1-audit-v2/review.completed.json'))
    p.add_argument('--candidate', type=Path, default=Path('ml/manifests/mendeley-v1.split.candidate.json'))
    p.add_argument('--source', type=Path, default=Path('ml/data/raw/Dataset_5971.zip'))
    p.add_argument('--manifest', type=Path, default=Path('ml/manifests/mendeley-v1.split.json'))
    p.add_argument('--output', type=Path, default=Path('ml/data/mendeley-v1-approved'))
    p.add_argument('--restore-review-history', type=Path, help='Clean checkout only: restore the hash-pinned previous review when canonical is absent.')
    a=p.parse_args()
    try:
        if a.restore_review_history is not None:
            approval = json.loads(bounded_read(a.approval))
            history = bounded_read(a.restore_review_history)
            if approval['explicit_owner_approval'] is not True or digest(history) != approval['previous_review_sha256']:
                raise ValueError('history_authority_mismatch')
            if not a.review.exists():
                write_new(a.review, history)
        m=finalize(a.approval,a.staged,a.review,a.candidate,a.source,a.manifest,a.output)
        print(json.dumps({'status':m['status'],'counts':m['counts'],'eligible_rows':len(m['records']),'quarantine_rows':m['conflict_rows_excluded']}))
        return 0
    except Exception:
        print('{"status":"blocked","code":"approved_data_integrity_or_authority_failed"}')
        return 2

if __name__=='__main__':
    raise SystemExit(main())
