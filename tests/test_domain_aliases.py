import pytest

from src.validators import (
    check_3_crossover_containment,
    check_9_deck_balance,
    find_questions_by_domain,
    normalize_domain,
)


@pytest.mark.parametrize("value,expected", [
    ("Wrestling", "Pro Wrestling"),
    ("wrestling", "Pro Wrestling"),
    ("  Wrestling ", "Pro Wrestling"),
    ("Pro Wrestling", "Pro Wrestling"),
    ("Video Games / Wrestling", "Video Games / Pro Wrestling"),
    ("Animation/Wrestling", "Animation / Pro Wrestling"),
    ("Video Games / Animation", "Video Games / Animation"),
    ("Comics", "Comics"),
    ("", ""),
    (None, ""),
])
def test_normalize_domain(value, expected):
    assert normalize_domain(value) == expected


@pytest.mark.parametrize("category", [
    "Wrestling", "Pro Wrestling", "Video Games / Wrestling", "Animation / Wrestling",
])
def test_check_3_accepts_both_wrestling_names(category):
    passed, msg, _ = check_3_crossover_containment({"Category / Domain": category})
    assert passed, msg


def test_check_3_still_rejects_other_categories():
    passed, _, _ = check_3_crossover_containment({"Category / Domain": "Comics"})
    assert not passed


def test_check_9_counts_both_wrestling_names_together():
    deck = [{"Category / Domain": c} for c in
            ["Wrestling", "Pro Wrestling", "Wrestling", "Animation", "Video Games"]]
    passed, msg, _ = check_9_deck_balance(deck)
    assert not passed
    assert "Pro Wrestling" in msg


@pytest.mark.parametrize("query", ["Pro Wrestling", "Wrestling", "wrestling"])
def test_find_questions_by_domain_matches_both_names(query):
    db = [
        {"Category / Domain": "Wrestling", "Question": "a"},
        {"Category / Domain": "Pro Wrestling", "Question": "b"},
        {"Category / Domain": "Video Games / Wrestling", "Question": "c"},
        {"Category / Domain": "Animation", "Question": "d"},
    ]
    result = find_questions_by_domain(query, db)
    assert [q["Question"] for q in result["data"]["questions"]] == ["a", "b", "c"]
