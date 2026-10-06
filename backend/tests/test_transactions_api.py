import pytest
from sqlmodel import select

from app.models import Transaction

VALID_TRANSACTION = {
    "amount": 12.34,
    "type": "expense",
    "category": "food",
    "description": "Groceries",
    "transaction_date": "2026-10-01",
}


def post_transaction(client, **overrides):
    return client.post("/transactions", json={**VALID_TRANSACTION, **overrides})


def test_create_transaction_returns_saved_transaction(client):
    response = post_transaction(client)

    assert response.status_code == 201
    body = response.json()
    assert isinstance(body["id"], int)
    assert body["amount"] == "12.34"
    assert body["type"] == "expense"
    assert body["category"] == "food"
    assert body["description"] == "Groceries"
    assert body["transaction_date"] == "2026-10-01"


def test_create_transaction_stores_amount_as_cents(client, session):
    post_transaction(client, amount=12.34)

    saved = session.exec(select(Transaction)).one()
    assert saved.amount_cents == 1234


def test_whole_dollar_amount_returns_two_decimal_places(client):
    response = post_transaction(client, amount=20)

    assert response.json()["amount"] == "20.00"


def test_amount_without_leading_zero_is_accepted(client):
    # The frontend sends what the user typed, so ".5" must work like "0.5".
    response = post_transaction(client, amount=".5")

    assert response.status_code == 201
    assert response.json()["amount"] == "0.50"


def test_list_transactions_is_empty_at_start(client):
    response = client.get("/transactions")

    assert response.status_code == 200
    assert response.json() == []


def test_list_transactions_returns_newest_first(client):
    post_transaction(client, description="older", transaction_date="2026-09-01")
    post_transaction(client, description="newer", transaction_date="2026-10-01")

    response = client.get("/transactions")

    descriptions = [t["description"] for t in response.json()]
    assert descriptions == ["newer", "older"]


@pytest.mark.parametrize(
    "overrides",
    [
        {"amount": 0},
        {"amount": -5},
        {"amount": 1.234},
        {"category": "vacation"},
        {"type": "transfer"},
        {"transaction_date": "not-a-date"},
        {"description": "x" * 201},
    ],
)
def test_create_transaction_rejects_invalid_input(client, overrides):
    response = post_transaction(client, **overrides)

    assert response.status_code == 422


def test_create_transaction_rejects_missing_field(client):
    incomplete = {k: v for k, v in VALID_TRANSACTION.items() if k != "amount"}

    response = client.post("/transactions", json=incomplete)

    assert response.status_code == 422
