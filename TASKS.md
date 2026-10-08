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
10. **Dashboard**: all-time income, expenses, and balance strip from `GET /summary`, refreshed after each add (PR #10)
11. **Spending by category**: `GET /summary/categories?month=YYYY-MM` + this month's donut chart and legend (PR #11)
12. **Monthly budgets**: standing budget per expense category (`/budgets` GET/PUT/DELETE), budget vs. spending meters; totals strip switched to this month (PR #12)
13. **Visual identity**: banknote-engraving look (`DESIGN.md`), self-hosted Bodoni Moda for money figures, three-column desktop / phone-first layout, unboxed sections (PR #13)
14. **Amount input polish**: `.5` accepted, budget amounts checked in the browser, midnight-proof date test (PR #14)
15. **Delete a transaction**: `DELETE /transactions/{id}`, a confirm-then-delete button on each row, totals reload after (PR #15)

16. **Focus after a delete**: keyboard focus moves to the Transactions heading instead of the page top (PR #16)

## In review

17. **Stay current past midnight**: `useToday()` hook (checks every minute and when the tab comes back into view); the form's date and the month's numbers move on to the new day (branch `feature/stay-current-past-midnight`)
18. **Browse past months**: previous/next month buttons on the totals plate; totals, spending, and budgets follow the chosen month; "next" stops at this month (branch `feature/browse-months`, on top of 17)
19. **Ignore stale responses**: every reload of the month's numbers goes through one effect with an `ignore` flag, so a late answer for an older request (fast month clicks, two quick adds) is thrown away (branch `feature/ignore-stale-responses`, on top of 18)
20. **Phone spacing fix**: the phone `@media` block moved to the end of `index.css`, so its tighter spacing and smaller balance actually apply (later rules were overriding it) (branch `fix/phone-spacing`, on top of 19)

## Planned

Nothing yet. Editing a transaction in place is still undecided in `PRODUCT.md`.

## Agreed decisions

- SQLModel + SQLite; money stored as integer cents
- Amounts are always positive; `type` says income or expense
- Fixed starter categories (enum): salary, food, housing, transportation,
  utilities, entertainment, health, shopping, other
- Plain JavaScript + Vite React
- Python 3.14 (FastAPI and SQLModel verified working)
