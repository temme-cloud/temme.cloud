#!/usr/bin/env python3
"""
Delivery Check Recommendation Coverage Test

Verifies that:
1. Every recommendation key in the JSON has a matching trigger in the JS logic.
2. Every trigger condition in the JS references a valid option value.
3. Level-based recommendations cover all defined maturity levels.
4. No recommendation key is orphaned (defined but never triggerable).

Usage: python3 docs/scripts/test-recommendations.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
QUESTIONS_PATH = ROOT / "data" / "delivery-check" / "delivery-questions.json"
QUIZ_JS_PATH = ROOT / "src" / "delivery-check" / "stores" / "quiz.js"


def load_data():
    with open(QUESTIONS_PATH) as f:
        return json.load(f)


def load_js():
    with open(QUIZ_JS_PATH) as f:
        return f.read()


def extract_js_triggers(js_source):
    """
    Extract recommendation triggers from generateRecommendations() in quiz.js.
    Returns a list of (question_id, option_value, rec_key) tuples.
    """
    triggers = []

    # Match single-select checks: responses.X === 'Y' && recommendations.Z
    # or responses.X === 'Y' && recommendations['Z']
    single_pattern = re.compile(
        r"responses\.(\w+)\s*===\s*'([^']+)'\s*&&\s*recommendations(?:\.(\w+)|\['([^']+)'\])"
    )
    for m in single_pattern.finditer(js_source):
        qid = m.group(1)
        value = m.group(2)
        rec_key = m.group(3) or m.group(4)
        triggers.append(("single", qid, value, rec_key))

    # Match multi-select checks: blockers.includes('X') && recommendations['Y']
    # or blockers.includes('X') && recommendations.Y
    multi_pattern = re.compile(
        r"(\w+)\.includes\('([^']+)'\)\s*&&\s*recommendations(?:\.(\w+)|\['([^']+)'\])"
    )
    for m in multi_pattern.finditer(js_source):
        var_name = m.group(1)
        value = m.group(2)
        rec_key = m.group(3) or m.group(4)
        triggers.append(("multi", var_name, value, rec_key))

    # Match level-based: recommendations[levelKey]
    level_pattern = re.compile(r"recommendations\[levelKey\]")
    if level_pattern.search(js_source):
        triggers.append(("level", None, None, "levelKey"))

    return triggers


def get_all_option_values(data):
    """Return a dict of question_id -> set of option values."""
    result = {}
    for q in data["questions"]:
        result[q["id"]] = {o["value"] for o in q["options"]}
    return result


def main():
    data = load_data()
    js_source = load_js()
    recommendations = data["results"]["recommendations"]
    levels = data["results"]["levels"]
    option_values = get_all_option_values(data)
    level_keys = {lvl["key"] for lvl in levels}

    triggers = extract_js_triggers(js_source)
    errors = []
    warnings = []

    print("=" * 60)
    print("RECOMMENDATION COVERAGE TEST")
    print("=" * 60)

    # 1. Check that every trigger references a valid option value
    print("\n--- Trigger validation ---")
    triggered_rec_keys = set()

    for trigger in triggers:
        kind = trigger[0]

        if kind == "single":
            _, qid, value, rec_key = trigger
            triggered_rec_keys.add(rec_key)

            if qid not in option_values:
                errors.append(f"Trigger references unknown question '{qid}' for rec key '{rec_key}'")
            elif value not in option_values[qid]:
                errors.append(
                    f"Trigger references unknown option '{value}' in question '{qid}' for rec key '{rec_key}'"
                )
            else:
                print(f"  OK  {qid} === '{value}' -> {rec_key}")

        elif kind == "multi":
            _, var_name, value, rec_key = trigger
            triggered_rec_keys.add(rec_key)

            # Multi-select triggers use a local variable (e.g. 'blockers')
            # We need to find which question it maps to
            multi_questions = [q for q in data["questions"] if q["type"] == "multi"]
            found = False
            for q in multi_questions:
                if value in {o["value"] for o in q["options"]}:
                    found = True
                    print(f"  OK  {q['id']} includes '{value}' -> {rec_key}")
                    break
            if not found:
                errors.append(
                    f"Multi-select trigger for '{value}' not found in any multi-select question (rec key '{rec_key}')"
                )

        elif kind == "level":
            # Level-based recommendations
            for lk in level_keys:
                triggered_rec_keys.add(lk)
            print(f"  OK  levelKey -> {', '.join(sorted(level_keys))}")

    # 2. Check all recommendation keys have triggers
    print("\n--- Orphan check ---")
    for rec_key in sorted(recommendations.keys()):
        if rec_key not in triggered_rec_keys:
            errors.append(f"Recommendation '{rec_key}' has no trigger in quiz.js")
        else:
            print(f"  OK  '{rec_key}' is triggered")

    # 3. Check all triggers reference existing recommendation keys
    print("\n--- Missing recommendation check ---")
    for trigger in triggers:
        if trigger[0] == "level":
            for lk in level_keys:
                if lk not in recommendations:
                    errors.append(f"Level key '{lk}' referenced but no recommendation defined")
                else:
                    print(f"  OK  level '{lk}' has recommendation text")
        else:
            rec_key = trigger[3]
            if rec_key not in recommendations:
                errors.append(f"Trigger references recommendation '{rec_key}' which is not defined in JSON")
            else:
                print(f"  OK  '{rec_key}' has recommendation text")

    # 4. Check bilingual completeness
    print("\n--- Bilingual check ---")
    for rec_key, rec_val in recommendations.items():
        for lang in ["de", "en"]:
            if lang not in rec_val or not rec_val[lang].strip():
                errors.append(f"Recommendation '{rec_key}' is missing '{lang}' text")
            else:
                print(f"  OK  '{rec_key}' has '{lang}' text")

    # 5. Test scenario: worst-case "none" path
    print("\n--- Worst-case scenario test ---")
    none_responses = {
        "objective": "cost",
        "team": "none-team",
        "delivery": "none-delivery",
        "blockers": ["unsure-blockers"],
        "risk": "low",
        "ops": "reactive",
        "handover": "none-handover",
    }

    total = 0
    for qid, value in none_responses.items():
        q = next(q for q in data["questions"] if q["id"] == qid)
        if isinstance(value, list):
            score = sum(
                next(o["score"] for o in q["options"] if o["value"] == v)
                for v in value
            )
        else:
            score = next(o["score"] for o in q["options"] if o["value"] == value)
        total += score
        print(f"  {qid:16s} = {str(value):20s} -> {score:3d} pts")

    print(f"  {'':16s}   {'TOTAL':20s} -> {total:3d} pts")

    # Determine level
    level = None
    for lvl in levels:
        if lvl["min"] <= total <= lvl["max"]:
            level = lvl["key"]
            break

    if level:
        print(f"  Maturity level: {level}")
        if level != "beginner":
            warnings.append(
                f"Worst-case 'none' path scores {total} -> '{level}', expected 'beginner'"
            )
    else:
        errors.append(f"Score {total} does not fall into any maturity level!")

    # Summary
    print(f"\n{'=' * 60}")
    print("SUMMARY")
    print("=" * 60)

    if warnings:
        for w in warnings:
            print(f"  WARNING: {w}")

    if errors:
        for err in errors:
            print(f"  FAIL: {err}")
        print(f"\n  {len(errors)} error(s) found.")
        sys.exit(1)
    else:
        print(f"  All {len(recommendations)} recommendations are covered.")
        print(f"  All {len(triggers)} triggers reference valid options.")
        print("  All checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
