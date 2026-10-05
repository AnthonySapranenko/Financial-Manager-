# Next Time

Handoff notes for the next Claude Code session. Read this first, then
`README.md`, `BOSS.md`, `TASKS.md`, and `PRODUCT.md`.

Last updated: 2026-10-05

## Where we are

- Tasks 1–7 are merged (PRs #1–#7). Task 8 (transaction form and list) is
  on branch `feature/transaction-ui`, pushed, PR opened by the developer.
  **Check that it is merged before starting Task 9.**
- Task 8 kept the UI separate from the backend (developer's choice): `App`
  holds `transactions` in `useState`, seeded from `src/sampleTransactions.js`.
  Components: `TransactionForm.jsx` (calls `onAdd`) and `TransactionList.jsx`.
- Design decisions agreed in the shape step: one page (form above the list on
  phones, side by side on desktop), Expense/Income buttons with no default,
  date defaults to today (local time zone), form fully clears after saving,
  plain styling. A full visual identity (Impeccable visual-direction round,
  `DESIGN.md`) is deferred until after the dashboard.
- Tests: 37 backend (pytest) and 8 frontend (Vitest), all passing.

## Start here: Task 9, connect the frontend to the backend

1. Confirm Task 8 is merged, then sync `master` and create
   `feature/connect-backend`.
2. Plan with the developer:
   - CORS in FastAPI (`CORSMiddleware` for `http://localhost:5173`) or a Vite
     proxy. Pick one and explain why.
   - Load with `GET /transactions` (`useEffect` + `fetch`), add with
     `POST /transactions`, then delete `sampleTransactions.js`. Sample data
     already has the API's shape, so `TransactionList` should not change.
   - Loading and error states, and showing the API's 422 `detail` messages.
   - How to test `fetch` in Vitest (mock it).
3. Present the plan (files, tests, decisions) and wait for approval.

Small follow-ups found in the Task 8 review (not done yet):
- The amount `.5` is rejected (must type `0.5`); the backend would accept it.
- "Today" is computed when the page loads, so it goes stale past midnight.
- The "date defaults to today" test could flake if it runs exactly at midnight.

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
  `<iframe>` and add `--virtual-time-budget=5000`.
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
