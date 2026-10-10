#!/usr/bin/env python3
"""Render English tables from computed experiment/verification JSON, no raw text."""

import argparse
import json
from pathlib import Path


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--report", type=Path, required=True)
    p.add_argument("--verification", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    a = p.parse_args()
    r, v = json.loads(a.report.read_text()), json.loads(a.verification.read_text())
    lines = ["# ClearMessage provisional experiment report", "",
             "Computed 2026-10-10. The user explicitly authorized original-label training while human review remains incomplete.",
             "These measure agreement with unapproved source annotations, not verified fraud ground truth or real-world protection.",
             "Source languages are unverified: English and Czech results are unavailable and are not merged into these aggregate results.", "",
             "Raw messages and dangerous links are excluded. Error IDs and source/predicted labels are in the machine-readable report.", "",
             f"Machine-readable experiment: `{a.report}`; verification: `{a.verification}`.", "",
             "## Data and selection", "", "| Split | ham | spam | smishing | Total |", "|---|---:|---:|---:|---:|"]
    for split in ("train", "validation", "test"):
        counts = r["counts"][split]
        lines.append(f"| {split} | {counts['ham']} | {counts['spam']} | {counts['smishing']} | {sum(counts.values())} |")
    s = r["selection"]
    lines += ["", f"Seed: **{r['seed']}**. Selected **{s['model']}** using validation macro-F1 × token coverage.",
              f"Internal warning threshold: **{s['threshold']}**, selected from the predefined grid by validation warning F1, then higher threshold on ties.",
              "Internal scores are not calibrated user-facing fraud probabilities. No test metric changed selection or thresholds.",
              "The source parser routes all public CSV records by ID; test texts are not featurized, embedded or scored before selection is saved.", "",
              "## Classifier comparison", "", "| Candidate | Validation macro-F1 | Test macro-F1 | Test token coverage | Fit seconds |", "|---|---:|---:|---:|---:|"]
    for name, model in sorted(r["models"].items()):
        lines.append(f"| {name} | {model['validation']['macro_f1']:.6f} | {model['test']['macro_f1']:.6f} | {model['test_token_coverage']:.6f} | {model['fit_seconds']:.3f} |")
    for name, baseline in r["majority_baseline"].items():
        lines += ["", f"Majority baseline ({name}): macro-F1 **{baseline['macro_f1']:.6f}**, {baseline['count']} records; fitted only on train."]
    combined = {**r["models"], "majority_baseline": r["majority_baseline"]}
    for name, model in combined.items():
        lines += ["", f"## {name}", ""]
        for split in ("validation", "test"):
            metric = model[split]
            lines += [f"### {split}: {metric['count']} scored records", "",
                      "| Class | Precision | Recall | F1 | Support | False positives | False negatives |", "|---|---:|---:|---:|---:|---:|---:|"]
            for label in ("ham", "spam", "smishing"):
                c = metric["per_class"][label]
                lines.append(f"| {label} | {c['precision']:.6f} | {c['recall']:.6f} | {c['f1-score']:.6f} | {int(c['support'])} | {c['false_positives']} | {c['false_negatives']} |")
            lines += ["", "Confusion matrix: rows are source labels, columns predictions, order ham / spam / smishing.", "", "```text"]
            lines += [" ".join(f"{n:5d}" for n in row) for row in metric["confusion_matrix"]]
            lines += ["```", ""]
        if name in r["models"]:
            policy = model["test_policy"]
            lines += ["Test provisional policy (same selected threshold for the frozen comparison):", "",
                      f"- suspicious: {policy['suspicious']}; review: {policy['review']}; no_strong_signals: {policy['no_strong_signals']}.",
                      f"- Review/abstention rate: {policy['abstention_rate']:.6f}; completed-analysis coverage: {policy['completed_coverage']:.6f}.",
                      f"- Explicit smishing warnings: TP {policy['smishing_true_positives']}, FP {policy['smishing_false_positives']}; source smishing without explicit warning: {policy['smishing_without_explicit_warning']}.",
                      f"- Warning precision / recall / F1: {policy['warning_precision']:.6f} / {policy['warning_recall']:.6f} / {policy['warning_f1']:.6f}.",
                      "Review is an abstention, not a reassuring negative. Every analysis_complete remains false because the audit and language validation are incomplete.", ""]
    e = r["encoder"]
    lines += ["## Encoder benchmark and coverage", "",
              f"Frozen encoder revision `{e.get('revision')}`, license {e.get('license')}; CPU, max {e.get('max_tokens')} tokens including special tokens.",
              f"First batch: {e.get('benchmark_count')} train messages in {e.get('benchmark_seconds', 0):.6f} s; load {e.get('load_seconds', 0):.6f} s.",
              f"Coverage: train {e.get('train_covered')}/{e.get('train_total')}, validation {e.get('validation_covered')}/{e.get('validation_total')}.",
              "Overflow rows are excluded from encoder fitting/scoring, counted in coverage and remain review in policy. The TF-IDF vocabulary and both classifiers fit only train.",
              "All candidates use the identical row/group split assignments; encoder validation metrics have a smaller covered denominator, explicitly penalized during selection.",
              "The encoder was not pretrained or fine-tuned by this project. Only our linear head was trained. Cached NPY files contain public development embeddings only.", "",
              "## Integrity and latency", "",
              f"Measured device: {v.get('device', v['architecture'])}, {v['system']} {v['architecture']}, RAM {v.get('ram_bytes')} B. CPU execution, four numerical compute threads.",
              "Fresh-process inference disables network connections. Warm single-message latency uses 32 public validation messages, includes policy, excludes model loading.", "",
              "| Model | Median ms | P95 ms | Fresh-process wall s | Batch amortized ms/message |", "|---|---:|---:|---:|---:|"]
    for name, verification in v["models"].items():
        latency = verification["latency"]
        lines.append(f"| {name} | {latency['median_ms']:.3f} | {latency['p95_ms']:.3f} | {verification['fresh_process_wall_seconds_including_imports']:.3f} | {r['models'][name]['test_batch_latency']['amortized_ms_per_message']:.3f} |")
    lines += ["", "All saved artifacts passed hash and reload checks; validation score differences were zero.",
              "Repeated TF-IDF training produced identical artifact bytes; repeated encoder-head fitting produced identical weights on fixed embeddings.",
              "Encoder recomputation and fresh-process predictions are recorded separately in verification JSON. JSON/safetensors/NPY only; no pickle or runtime downloads.", "",
              "## Limitations", "",
              "Human review paused after four decisions, including two requested corrections; original training labels deliberately remain unchanged under the user's provisional authorization.",
              "41 sample entries remain pending and exclusion approval is absent. The approved Goal 01 gate still blocks. Grouping may miss paraphrases or campaigns; time/campaign metadata are unavailable.",
              "No verified English or Czech benchmark exists. No blind Czech challenge was opened. No application API integration or deployment occurred in this phase.",
              "Test results are now known: future changes selected using them would make this a development test, not a new blind evaluation.", ""]
    a.output.write_text("\n".join(lines))
    print(json.dumps({"english_report": str(a.output)}))


if __name__ == "__main__":
    main()
