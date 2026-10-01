# Tasks

The development plan for the Finance Manager. One task = one feature branch + PR.
Later tasks are a proposed order and may change.

## Done

1. **Project skeleton**: `backend/`, `frontend/`, `.gitignore` (PR #1)
2. **Backend environment**: virtual env + `requirements.txt` (PR #1)
3. **FastAPI health check**: `GET /health` + first pytest test (PR #2)

## In progress

4. **Database foundation**: SQLModel `Transaction` model, SQLite setup, model tests
   (branch `feature/transaction-model`)

## Planned

5. Transaction API: create and list transactions (dollars ↔ cents at the API edge)
6. Summary endpoint: total income, total expenses, balance
7. Frontend setup: Vite + React (plain JavaScript)
8. Transaction form and list in the UI
9. Connect frontend to backend
10. Dashboard: totals and balance
11. Spending by category
12. Monthly budgets (one per category)

## Agreed decisions

- SQLModel + SQLite; money stored as integer cents
- Amounts are always positive; `type` says income or expense
- Fixed starter categories (enum): salary, food, housing, transportation,
  utilities, entertainment, health, shopping, other
- Plain JavaScript + Vite React
- Python 3.14 (FastAPI and SQLModel verified working)
