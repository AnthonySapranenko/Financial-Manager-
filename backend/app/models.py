from datetime import date
from enum import Enum

from sqlalchemy import CheckConstraint
from sqlmodel import Field, SQLModel


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class Category(str, Enum):
    SALARY = "salary"
    FOOD = "food"
    HOUSING = "housing"
    TRANSPORTATION = "transportation"
    UTILITIES = "utilities"
    ENTERTAINMENT = "entertainment"
    HEALTH = "health"
    SHOPPING = "shopping"
    OTHER = "other"


class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"
    # Safety net: the database itself refuses zero or negative amounts.
    __table_args__ = (CheckConstraint("amount_cents > 0", name="amount_positive"),)

    id: int | None = Field(default=None, primary_key=True)
    amount_cents: int  # money in whole cents: $12.34 is stored as 1234
    type: TransactionType
    category: Category
    description: str = Field(default="", max_length=200)
    transaction_date: date
