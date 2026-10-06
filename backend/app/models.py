from datetime import date
from decimal import Decimal
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


def dollars_to_cents(amount: Decimal) -> int:
    """Convert an exact dollar amount like Decimal("12.34") to 1234 cents."""
    return int(amount * 100)


def cents_to_dollars(cents: int) -> Decimal:
    """Convert 1234 cents back to Decimal("12.34"), always with 2 decimal places."""
    return (Decimal(cents) / 100).quantize(Decimal("0.01"))


class TransactionCreate(SQLModel):
    """What a client sends to create a transaction. No id: the database picks it."""

    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    type: TransactionType
    category: Category
    description: str = Field(default="", max_length=200)
    transaction_date: date

    def to_transaction(self) -> Transaction:
        return Transaction(
            amount_cents=dollars_to_cents(self.amount),
            type=self.type,
            category=self.category,
            description=self.description,
            transaction_date=self.transaction_date,
        )


class TransactionRead(SQLModel):
    """What the API sends back: the saved transaction, with amount in dollars."""

    id: int
    amount: Decimal
    type: TransactionType
    category: Category
    description: str
    transaction_date: date

    @classmethod
    def from_transaction(cls, transaction: Transaction) -> "TransactionRead":
        return cls(
            id=transaction.id,
            amount=cents_to_dollars(transaction.amount_cents),
            type=transaction.type,
            category=transaction.category,
            description=transaction.description,
            transaction_date=transaction.transaction_date,
        )


class Summary(SQLModel):
    """Totals across all transactions, in dollars."""

    total_income: Decimal
    total_expenses: Decimal
    balance: Decimal


class CategoryTotal(SQLModel):
    """How much was spent in one category, in dollars."""

    category: Category
    amount: Decimal


class CategorySpending(SQLModel):
    """Expenses for one month, per category (largest first) and in total."""

    month: str  # "YYYY-MM"
    total: Decimal
    categories: list[CategoryTotal]


class Budget(SQLModel, table=True):
    """A standing monthly budget. category is the primary key, so the database
    itself allows only one budget per category."""

    __tablename__ = "budgets"
    __table_args__ = (CheckConstraint("amount_cents > 0", name="budget_positive"),)

    category: Category = Field(primary_key=True)
    amount_cents: int


class BudgetSet(SQLModel):
    """What a client sends to set a budget."""

    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class BudgetRead(SQLModel):
    """A saved budget, in dollars."""

    category: Category
    amount: Decimal


class BudgetStatus(SQLModel):
    """One category's budget compared with what was spent in a month.
    budget and remaining are None when the category has no budget;
    remaining is negative when over budget."""

    category: Category
    budget: Decimal | None
    spent: Decimal
    remaining: Decimal | None
