# Next Time

Handoff notes for the next Claude Code session. Read this first, then
`README.md`, `BOSS.md`, `TASKS.md`, and `PRODUCT.md`.

Last updated: 2026-10-05

## Where we are

- Tasks 1–8 are merged (PRs #1–#8). Task 9 (connect frontend to backend) is
  on branch `feature/connect-backend`, pushed; the developer opens and merges
  the PR. **Check that it is merged before starting Task 10.**
- How the frontend talks to the backend: the browser calls `/api/...` on the
  Vite dev server, which forwards to `http://127.0.0.1:8000` (proxy in
  `frontend/vite.config.js`, chosen over CORS). All `fetch` calls live in
  `frontend/src/api.js`, which turns 422 `detail` lists and unreachable-server
  errors into readable messages.
- `App` loads the list in `useEffect` (with an `ignore` flag) and adds the
  transaction the API returns. `TransactionForm` awaits `onAdd`, shows
  "Saving…", and keeps the input if saving fails. `TransactionList` shows
  loading / error / empty / list.
- Design decisions from the Task 8 shape step: one page (form above the list
  on phones, side by side on desktop), Expense/Income buttons with no
  default, date defaults to today (local time zone), plain styling. A full
  visual identity (Impeccable visual-direction round, `DESIGN.md`) is
  deferred until after the dashboard.
- Tests: 37 backend (pytest) and 10 frontend (Vitest, `fetch` faked with
  `vi.stubGlobal`), all passing.
- Running the app needs both servers (see `README.md`). A manual run creates
  `backend/finance.db`; delete it to start empty.

## Start here: Task 10, dashboard with totals and balance

1. Confirm Task 9 is merged, then sync `master` and create
   `feature/dashboard`.
2. Plan with the developer. `GET /summary` already returns `total_income`,
   `total_expenses`, and `balance` as strings. Questions to settle:
   - Where the totals sit on the page, and whether this needs an
     `/impeccable shape` step (a dashboard is a new screen area).
   - Keeping totals in sync after adding a transaction: refetch `/summary`,
     or get it alongside the list. Never add money up in the browser.
   - Showing a negative balance unmistakably.
3. Present the plan (files, tests, decisions) and wait for approval.

Small follow-ups found in reviews (not done yet):
- The amount `.5` is rejected (must type `0.5`); the backend would accept it.
- "Today" is computed when the page loads, so it goes stale past midnight.
- The "date defaults to today" test could flake if it runs exactly at midnight.
- `api.js` assumes a 422 `detail` is a list (true for FastAPI validation
  errors; a plain-text `detail` would show a confusing message).

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
