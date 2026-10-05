# Next Time

Handoff notes for the next Claude Code session. Read this first, then
`README.md`, `BOSS.md`, `TASKS.md`, and `PRODUCT.md`.

Last updated: 2026-10-05

## Where we are

- Tasks 1–10 are merged (PRs #1–#10). Task 11 (spending by category) is on
  branch `feature/category-spending`, pushed; the developer opens and merges
  the PR. **Check that it is merged before starting Task 12** (last time the
  developer said "merged" before the merge had happened: verify with
  `git merge-base --is-ancestor <branch> origin/master` after fetching).
- Backend endpoints: `/health`, `POST`/`GET /transactions`, `GET /summary`
  (all-time totals), `GET /summary/categories?month=YYYY-MM` (one month's
  expenses per category, largest first, plus `total`; month validated by a
  `Query(pattern=...)`; date range is `>= 1st` and `< next month's 1st`).
- Frontend structure (`frontend/src/`):
  - `api.js`: every `fetch`; `/api/...` is proxied by Vite to
    `http://127.0.0.1:8000`.
  - `money.js`: `formatMoney()`. The browser never does real money math;
    totals come from the backend (the donut's "N more categories" slice is
    grouped in whole cents for display only).
  - `App.jsx`: owns state; loads list, summary, and this month's spending
    independently (each has its own error); refreshes summary and spending
    after each add.
  - `Summary.jsx` (all-time totals strip), `CategorySpending.jsx` (hand-written
    SVG donut via `stroke-dasharray`, max 6 slices: top 5 + gray folded
    slice, legend with amount and percent), `TransactionForm.jsx`,
    `TransactionList.jsx`.
- Chart colors: slots 1–5 of the dataviz skill's palette, validated with its
  `validate_palette.js` (passes; contrast WARN relieved by the legend). The
  developer allowed running that validator.
- Design: plain styling. The visual-identity round is planned for **after
  Task 12** (developer's choice).
- Tests: 44 backend (pytest) and 18 frontend (Vitest), all passing.
- Running the app needs both servers (see `README.md`). A manual run creates
  `backend/finance.db`; delete it to start empty.

## Start here: Task 12, monthly budgets (one per category)

1. Confirm Task 11 is merged, then sync `master` and create
   `feature/monthly-budgets`.
2. Plan with the developer. Agreed earlier: one monthly budget per category.
   Questions to settle:
   - Data model: a `Budget` table (category, amount in cents). Same budget
     every month, or per month? (Simplest: one standing amount per category.)
   - Endpoints, e.g. `GET /budgets`, `PUT /budgets/{category}`; tests.
   - UI: set budgets, and compare with this month's spending from
     `/summary/categories` (a meter per category; see the dataviz skill's
     "meter" form; over-budget must be unmistakable and not color-only).
   - The all-time totals strip vs. this-month donut mismatch (Task 11
     review): consider showing this month's totals too.
3. Present the plan (files, tests, decisions) and wait for approval.
4. After Task 12: the visual-identity round (`/impeccable`, new-work flow,
   `DESIGN.md`).

Small follow-ups found in reviews (not done yet):
- The amount `.5` is rejected (must type `0.5`); the backend would accept it.
- "Today" and "this month" are computed when the page loads, so they go
  stale past midnight.
- The "date defaults to today" test could flake if it runs exactly at midnight.
- `api.js` assumes a 422 `detail` is a list (true for FastAPI validation
  errors; a plain-text `detail` would show a confusing message).
- Two very fast adds could get summary responses out of order and briefly
  show stale totals (practically impossible on localhost).
- Donut tooltips are mouse-only (the legend carries all values).

## How the developer wants to work

- Beginner learning full-stack. The goal is to understand the code
  (`BOSS.md` §17).
- One task at a time: inspect, plan, wait for approval, implement, test,
  **review** (`BOSS.md` §7: always do it, report findings ranked by severity),
  explain the concepts, commit.
- Before changing anything, state exactly which files will be created or
  modified. Never start the next task without approval.
- Commit and push only when asked. One feature branch and one PR per task.
  The developer merges PRs on GitHub.
- The developer usually asks Claude to write the code, then wants a clear
  explanation and "try it yourself" steps.
- Precedence: `BOSS.md` wins over the Ponytail plugin. Impeccable guides UI
  design, but `BOSS.md` wins on scope and code complexity.

## API (backend)

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{"status": "ok"}` |
| POST | `/transactions` | Body: `amount` (dollars, > 0, max 2 decimals), `type` (`income`/`expense`), `category`, `description` (optional, ≤ 200 characters), `transaction_date` (`YYYY-MM-DD`). Returns 201. |
| GET | `/transactions` | Newest date first |
| GET | `/summary` | `total_income`, `total_expenses`, `balance` |

Amounts come back as JSON **strings** (`"12.34"`), not numbers. Validation
errors are 422 responses with FastAPI's `detail` list.

## Environment notes

- Windows 11. Python 3.14 venv at `backend/.venv`. Node 24, npm 11.
- Backend: `cd backend`, then `.venv/Scripts/python.exe -m pytest` or
  `-m uvicorn app.main:app --reload`.
- Frontend: `cd frontend`, then `npm test`, `npm run lint`, `npm run build`,
  `npm run dev`.
- The `gh` CLI is not installed, so open PRs with the link `git push` prints.
- Deleting branches is blocked by the permission classifier. The developer
  deletes them. Old merged local branches still exist and can be removed with
  `git branch -d`.
- Impeccable's folder is allowed in `.claude/settings.local.json`. Its
  `context` command must be run once per session before design work.
- Screenshots: headless Edge (`msedge --headless=new --screenshot`) can't go
  narrower than 504px. For a 390px phone view, load the app in a 390px-wide
  `<iframe>` and add `--virtual-time-budget=5000` (use `vite preview`, not
  the dev server). API data may not arrive inside the iframe in time; a
  direct 504px capture shows the same phone layout with real data.
- Gotcha: when editing files with Python, pass `encoding="utf-8"` (the
  Windows default is cp1252), or use the Edit tool.

## Known, deliberately deferred

- `httpx` deprecation warning in pytest (wants `httpx2`). The developer said
  not to change dependencies yet.
- The database stores enum names (`EXPENSE`) instead of values (`expense`).
  This is harmless while only the API writes to it.
- Any date is accepted, including future dates. This is a product decision
  the developer has not made yet.
- No paging on `GET /transactions`.
- Editing and deleting transactions: undecided (see `PRODUCT.md`).
