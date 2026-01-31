#!/usr/bin/env python3
"""
Delivery Check Score Analysis

Calculates all possible score paths, min/max scores per path,
and validates that maturity level thresholds cover the full range.

Usage: python3 docs/scripts/score-analysis.py
"""

import json
import sys
from itertools import combinations
from pathlib import Path

QUESTIONS_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "delivery-check" / "delivery-questions.json"


def load_data():
    with open(QUESTIONS_PATH) as f:
        return json.load(f)


def get_question(questions, qid):
    return next((q for q in questions if q["id"] == qid), None)


def determine_next(question, option_value):
    """Get next question ID given a question and selected option value."""
    if question["type"] == "single":
        opt = next((o for o in question["options"] if o["value"] == option_value), None)
        if opt and "next" in opt:
            return opt["next"]
    return question.get("next", "contact")


def enumerate_paths(questions):
    """
    Enumerate all unique question paths through the quiz.
    Returns list of paths, where each path is a list of question IDs.
    """
    paths = set()

    def walk(qid, path):
        q = get_question(questions, qid)
        if not q:
            paths.add(tuple(path))
            return
        path = path + [qid]
        if q["type"] == "multi":
            # Multi-select: next is always question-level
            next_id = q.get("next", "contact")
            if next_id == "contact":
                paths.add(tuple(path))
            else:
                walk(next_id, path)
        else:
            # Single-select: each option may route differently
            next_ids = set()
            for opt in q["options"]:
                nid = opt.get("next", q.get("next", "contact"))
                next_ids.add(nid)
            for nid in next_ids:
                if nid == "contact":
                    paths.add(tuple(path))
                else:
                    walk(nid, path)

    walk(questions[0]["id"], [])
    return [list(p) for p in sorted(paths)]


def score_range_for_path(questions, path):
    """Calculate min and max possible scores for a given question path."""
    min_score = 0
    max_score = 0

    for qid in path:
        q = get_question(questions, qid)
        option_scores = [o["score"] for o in q["options"]]

        if q["type"] == "multi":
            # Multi-select: min = pick 1 lowest, max = pick all
            min_score += min(option_scores)
            max_score += sum(option_scores)
        else:
            # Single-select: min/max of available options
            # But we must only count options that lead to this path's next question
            next_qid_in_path = None
            path_idx = path.index(qid)
            if path_idx + 1 < len(path):
                next_qid_in_path = path[path_idx + 1]

            valid_scores = []
            for opt in q["options"]:
                opt_next = opt.get("next", q.get("next", "contact"))
                if next_qid_in_path is None or opt_next == next_qid_in_path:
                    valid_scores.append(opt["score"])

            if not valid_scores:
                # Fallback: all options valid (question-level next)
                valid_scores = option_scores

            min_score += min(valid_scores)
            max_score += max(valid_scores)

    return min_score, max_score


def validate_levels(data, global_min, global_max):
    """Validate that maturity levels cover the full score range without gaps."""
    levels = data["results"]["levels"]
    errors = []

    # Check coverage
    if levels[0]["min"] != 0:
        errors.append(f"First level starts at {levels[0]['min']}, expected 0")

    if levels[-1]["max"] < global_max:
        errors.append(
            f"Last level max ({levels[-1]['max']}) is below the highest possible score ({global_max})"
        )

    # Check for gaps between levels
    for i in range(1, len(levels)):
        expected_min = levels[i - 1]["max"] + 1
        actual_min = levels[i]["min"]
        if actual_min != expected_min:
            errors.append(
                f"Gap between '{levels[i-1]['key']}' (max={levels[i-1]['max']}) "
                f"and '{levels[i]['key']}' (min={actual_min}), expected min={expected_min}"
            )

    return errors


def main():
    data = load_data()
    questions = data["questions"]
    levels = data["results"]["levels"]

    print("=" * 60)
    print("DELIVERY CHECK SCORE ANALYSIS")
    print("=" * 60)

    # Enumerate paths
    paths = enumerate_paths(questions)
    print(f"\nFound {len(paths)} unique question paths:\n")

    global_min = float("inf")
    global_max = 0

    for i, path in enumerate(paths, 1):
        min_s, max_s = score_range_for_path(questions, path)
        global_min = min(global_min, min_s)
        global_max = max(global_max, max_s)

        path_label = " -> ".join(path)
        print(f"  Path {i}: {path_label}")
        print(f"          Steps: {len(path)} questions + contact form")
        print(f"          Score: {min_s} -- {max_s}")
        print()

    print(f"  Global score range: {global_min} -- {global_max}")

    # Maturity levels
    print(f"\n{'=' * 60}")
    print("MATURITY LEVELS")
    print("=" * 60)
    for level in levels:
        print(f"  {level['key']:12s}  {level['min']:3d} -- {level['max']:3d}  {level['color']}")

    # Validate
    print(f"\n{'=' * 60}")
    print("VALIDATION")
    print("=" * 60)

    errors = validate_levels(data, global_min, global_max)

    if errors:
        for err in errors:
            print(f"  ERROR: {err}")
        sys.exit(1)
    else:
        print("  All levels cover the full score range. No gaps detected.")

    # Per-question breakdown
    print(f"\n{'=' * 60}")
    print("PER-QUESTION SCORE RANGES")
    print("=" * 60)
    for q in questions:
        scores = [o["score"] for o in q["options"]]
        q_type = "multi" if q["type"] == "multi" else "single"
        if q_type == "multi":
            print(f"  {q['id']:16s}  [{q_type}]  min={min(scores):3d}  max={sum(scores):3d}  (all selected)")
        else:
            print(f"  {q['id']:16s}  [{q_type}]   min={min(scores):3d}  max={max(scores):3d}")

    print()


if __name__ == "__main__":
    main()
