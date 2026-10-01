from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlmodel import Session, select

from app.database import create_db_and_tables, get_session
from app.models import Transaction, TransactionCreate, TransactionRead


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
