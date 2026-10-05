# Tasks

The development plan for the Finance Manager. One task = one feature branch + PR.
Later tasks are a proposed order and may change.

## Done

1. **Project skeleton**: `backend/`, `frontend/`, `.gitignore` (PR #1)
2. **Backend environment**: virtual env + `requirements.txt` (PR #1)
3. **FastAPI health check**: `GET /health` + first pytest test (PR #2)
4. **Database foundation**: SQLModel `Transaction` model, SQLite setup, model tests (PR #3)
5. **Transaction API**: `POST /transactions` and `GET /transactions`, dollars ↔ cents at the API edge (PR #4)
6. **Summary endpoint**: `GET /summary` with total income, total expenses, balance (PR #5)
7. **Frontend setup**: Vite + React (plain JavaScript), Vitest + React Testing Library (PR #6)
   - Product brief for design work: `PRODUCT.md` (Impeccable `init`) (PR #7)
8. **Transaction form and list**: one-page UI with sample data in React state (PR #8)
9. **Connect frontend to backend**: Vite proxy `/api` -> FastAPI, `src/api.js`, loading/error states (PR #9)
10. **Dashboard**: all-time income, expenses, and balance strip from `GET /summary`, refreshed after each add

## Planned

11. Spending by category
12. Monthly budgets (one per category)

## Agreed decisions

- SQLModel + SQLite; money stored as integer cents
- Amounts are always positive; `type` says income or expense
- Fixed starter categories (enum): salary, food, housing, transportation,
  utilities, entertainment, health, shopping, other
- Plain JavaScript + Vite React
- Python 3.14 (FastAPI and SQLModel verified working)
