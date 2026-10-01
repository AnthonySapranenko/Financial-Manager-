from datetime import date

import pytest
from sqlalchemy import inspect
from sqlalchemy.exc import IntegrityError

from app.models import Category, Transaction, TransactionType


def make_transaction(**overrides):
    fields = {
        "amount_cents": 1234,
        "type": TransactionType.EXPENSE,
        "category": Category.FOOD,
        "description": "Groceries",
        "transaction_date": date(2026, 10, 1),
    }
    fields.update(overrides)
    return Transaction(**fields)


def save(session, transaction):
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction


def test_create_db_and_tables_creates_transactions_table(engine):
    assert "transactions" in inspect(engine).get_table_names()


def test_database_assigns_id(session):
    transaction = make_transaction()
    assert transaction.id is None

    save(session, transaction)

    assert isinstance(transaction.id, int)


def test_transaction_round_trips_all_fields(session):
    saved = save(session, make_transaction())
    session.expire_all()  # forget cached values so the next read hits the database

    loaded = session.get(Transaction, saved.id)

    assert loaded.amount_cents == 1234
    assert isinstance(loaded.amount_cents, int)
    assert loaded.type is TransactionType.EXPENSE
    assert loaded.category is Category.FOOD
    assert loaded.description == "Groceries"
    assert loaded.transaction_date == date(2026, 10, 1)


def test_description_defaults_to_empty_string(session):
    transaction = Transaction(
        amount_cents=500,
        type=TransactionType.INCOME,
        category=Category.SALARY,
        transaction_date=date(2026, 10, 1),
    )

    assert save(session, transaction).description == ""


@pytest.mark.parametrize("bad_amount", [0, -100])
def test_database_rejects_non_positive_amount(session, bad_amount):
    with pytest.raises(IntegrityError):
        save(session, make_transaction(amount_cents=bad_amount))
