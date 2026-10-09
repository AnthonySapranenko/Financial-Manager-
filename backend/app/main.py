from contextlib import asynccontextmanager
from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Session, func, select

from app.database import create_db_and_tables, get_session
from app.models import (
    Budget,
    BudgetRead,
    BudgetSet,
    BudgetStatus,
    Category,
    CategorySpending,
    CategoryTotal,
    Summary,
    Transaction,
    TransactionCreate,
    TransactionRead,
    TransactionType,
    cents_to_dollars,
    dollars_to_cents,
)

# "YYYY-MM" with a real month (01-12); anything else is a 422 error.
MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"

# Salary is income, so it never gets a budget.
EXPENSE_CATEGORIES = [c for c in Category if c != Category.SALARY]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()  # runs once, when the server starts
    yield


app = FastAPI(title="Finance Manager API", lifespan=lifespan)


def month_range(month: str) -> tuple[date, date]:
    """"2026-10" -> (2026-10-01, 2026-11-01). A day is in the month when
    start <= day < end, so we never need to know how many days it has."""
    year, month_number = (int(part) for part in month.split("-"))
    start = date(year, month_number, 1)
    if month_number == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month_number + 1, 1)
    return start, end


def spending_by_category(session: Session, month: str) -> list[tuple[Category, int]]:
    """One month's expenses as (category, cents) pairs, largest first."""
    start, end = month_range(month)
    cents = func.sum(Transaction.amount_cents)
    statement = (
        select(Transaction.category, cents)
        .where(Transaction.type == TransactionType.EXPENSE)
        .where(Transaction.transaction_date >= start)
        .where(Transaction.transaction_date < end)
        .group_by(Transaction.category)
        .order_by(cents.desc())
    )
    return session.exec(statement).all()


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


@app.put("/transactions/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: int,
    data: TransactionCreate,
    session: Session = Depends(get_session),
):
    """Replace every field of a saved transaction; the id stays the same.
    Unlike delete, a missing transaction is an error: the change can't be
    saved anywhere (it was deleted in another tab, for example)."""
    transaction = session.get(Transaction, transaction_id)
    if transaction is None:
        raise HTTPException(404, "That transaction no longer exists.")
    # The same checks and dollars -> cents conversion as creating one.
    changed = data.to_transaction()
    transaction.amount_cents = changed.amount_cents
    transaction.type = changed.type
    transaction.category = changed.category
    transaction.description = changed.description
    transaction.transaction_date = changed.transaction_date
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return TransactionRead.from_transaction(transaction)


@app.delete("/transactions/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, session: Session = Depends(get_session)):
    """Delete a transaction. Deleting one that's already gone is fine, so a
    double click or a second browser tab can't cause an error."""
    transaction = session.get(Transaction, transaction_id)
    if transaction is not None:
        session.delete(transaction)
        session.commit()


@app.get("/summary", response_model=Summary)
def get_summary(
    month: str | None = Query(default=None, pattern=MONTH_PATTERN),
    session: Session = Depends(get_session),
):
    """Total income, total expenses, and balance: for one month if given,
    otherwise across all transactions."""
    # Let the database add up the cents for each type: one row per type.
    statement = select(Transaction.type, func.sum(Transaction.amount_cents)).group_by(
        Transaction.type
    )
    if month is not None:
        start, end = month_range(month)
        statement = statement.where(Transaction.transaction_date >= start).where(
            Transaction.transaction_date < end
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
    month: str = Query(pattern=MONTH_PATTERN),
    session: Session = Depends(get_session),
):
    """Expenses in one month, added up per category, largest first."""
    rows = spending_by_category(session, month)
    return CategorySpending(
        month=month,
        total=cents_to_dollars(sum(row_cents for _, row_cents in rows)),
        categories=[
            CategoryTotal(category=category, amount=cents_to_dollars(row_cents))
            for category, row_cents in rows
        ],
    )


@app.get("/budgets", response_model=list[BudgetStatus])
def list_budgets(
    month: str = Query(pattern=MONTH_PATTERN),
    session: Session = Depends(get_session),
):
    """Every expense category: its budget (if any), what was spent in the
    month, and what's left. All the money math happens here, in cents."""
    spent = dict(spending_by_category(session, month))
    budgets = {b.category: b.amount_cents for b in session.exec(select(Budget)).all()}

    statuses = []
    for category in EXPENSE_CATEGORIES:
        spent_cents = spent.get(category, 0)
        budget_cents = budgets.get(category)  # None when no budget is set
        has_budget = budget_cents is not None
        statuses.append(
            BudgetStatus(
                category=category,
                budget=cents_to_dollars(budget_cents) if has_budget else None,
                spent=cents_to_dollars(spent_cents),
                remaining=(
                    cents_to_dollars(budget_cents - spent_cents) if has_budget else None
                ),
            )
        )
    return statuses


def reject_salary(category: Category):
    if category == Category.SALARY:
        raise HTTPException(422, "Salary is income, so it can't have a budget.")


@app.put("/budgets/{category}", response_model=BudgetRead)
def set_budget(
    category: Category, data: BudgetSet, session: Session = Depends(get_session)
):
    """Create the category's budget, or change it if it already exists."""
    reject_salary(category)
    budget = session.get(Budget, category)  # look up by primary key
    if budget is None:
        budget = Budget(category=category, amount_cents=dollars_to_cents(data.amount))
    else:
        budget.amount_cents = dollars_to_cents(data.amount)
    session.add(budget)
    session.commit()
    # From cents, so "400" comes back as "400.00" like every other amount.
    return BudgetRead(category=category, amount=cents_to_dollars(budget.amount_cents))


@app.delete("/budgets/{category}", status_code=204)
def clear_budget(category: Category, session: Session = Depends(get_session)):
    """Remove the category's budget. Removing one that doesn't exist is fine."""
    budget = session.get(Budget, category)
    if budget is not None:
        session.delete(budget)
        session.commit()
