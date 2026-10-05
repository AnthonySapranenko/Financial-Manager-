from contextlib import asynccontextmanager
from datetime import date

from fastapi import Depends, FastAPI, Query
from sqlmodel import Session, func, select

from app.database import create_db_and_tables, get_session
from app.models import (
    CategorySpending,
    CategoryTotal,
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


@app.get("/summary/categories", response_model=CategorySpending)
def get_category_spending(
    # "YYYY-MM" with a real month (01-12); anything else is a 422 error.
    month: str = Query(pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    session: Session = Depends(get_session),
):
    """Expenses in one month, added up per category, largest first."""
    year, month_number = (int(part) for part in month.split("-"))
    # The month runs from its 1st day up to (not including) the next month's 1st.
    start = date(year, month_number, 1)
    if month_number == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month_number + 1, 1)

    cents = func.sum(Transaction.amount_cents)
    statement = (
        select(Transaction.category, cents)
        .where(Transaction.type == TransactionType.EXPENSE)
        .where(Transaction.transaction_date >= start)
        .where(Transaction.transaction_date < end)
        .group_by(Transaction.category)
        .order_by(cents.desc())
    )
    rows = session.exec(statement).all()

    return CategorySpending(
        month=month,
        total=cents_to_dollars(sum(row_cents for _, row_cents in rows)),
        categories=[
            CategoryTotal(category=category, amount=cents_to_dollars(row_cents))
            for category, row_cents in rows
        ],
    )
