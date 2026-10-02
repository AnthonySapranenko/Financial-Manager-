from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlmodel import Session, func, select

from app.database import create_db_and_tables, get_session
from app.models import (
    Summary,
    Transaction,
    TransactionCreate,
    TransactionRead,
    TransactionType,
    cents_to_dollars,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()  # runs once, when the server starts
    yield


app = FastAPI(title="Finance Manager API", lifespan=lifespan)


@app.get("/health")
def health_check():
    """Report that the API is running."""
    return {"status": "ok"}


@app.post("/transactions", status_code=201, response_model=TransactionRead)
def create_transaction(
    data: TransactionCreate, session: Session = Depends(get_session)
):
    """Save a new transaction."""
    transaction = data.to_transaction()
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return TransactionRead.from_transaction(transaction)


@app.get("/transactions", response_model=list[TransactionRead])
def list_transactions(session: Session = Depends(get_session)):
    """List all transactions, newest date first."""
    statement = select(Transaction).order_by(
        Transaction.transaction_date.desc(), Transaction.id.desc()
    )
    transactions = session.exec(statement).all()
    return [TransactionRead.from_transaction(t) for t in transactions]


@app.get("/summary", response_model=Summary)
def get_summary(session: Session = Depends(get_session)):
    """Total income, total expenses, and balance across all transactions."""
    # Let the database add up the cents for each type: one row per type.
    statement = select(Transaction.type, func.sum(Transaction.amount_cents)).group_by(
        Transaction.type
    )
    totals = dict(session.exec(statement).all())

    income_cents = totals.get(TransactionType.INCOME, 0)
    expense_cents = totals.get(TransactionType.EXPENSE, 0)

    return Summary(
        total_income=cents_to_dollars(income_cents),
        total_expenses=cents_to_dollars(expense_cents),
        balance=cents_to_dollars(income_cents - expense_cents),
    )
