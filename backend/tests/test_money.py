from decimal import Decimal

import pytest

from app.models import cents_to_dollars, dollars_to_cents

VALID_TRANSACTION = {
    "type": "expense",
    "category": "food",
    "transaction_date": "2026-10-01",
}


@pytest.mark.parametrize(
    ("dollars", "cents"),
    [("12.34", 1234), ("0.01", 1), ("20", 2000), ("9999999999.99", 999999999999)],
)
def test_dollars_to_cents(dollars, cents):
    assert dollars_to_cents(Decimal(dollars)) == cents


@pytest.mark.parametrize(
    ("cents", "dollars"),
    [(1234, "12.34"), (1, "0.01"), (2000, "20.00"), (0, "0.00"), (-1575, "-15.75")],
)
def test_cents_to_dollars_always_has_two_decimal_places(cents, dollars):
    assert str(cents_to_dollars(cents)) == dollars


def test_largest_allowed_amount_is_accepted(client):
    response = client.post(
        "/transactions", json={**VALID_TRANSACTION, "amount": "9999999999.99"}
    )

    assert response.status_code == 201
    assert response.json()["amount"] == "9999999999.99"


@pytest.mark.parametrize("bad_amount", ["10000000000", "NaN", "Infinity"])
def test_too_large_or_non_finite_amount_is_rejected(client, bad_amount):
    response = client.post(
        "/transactions", json={**VALID_TRANSACTION, "amount": bad_amount}
    )

    assert response.status_code == 422
