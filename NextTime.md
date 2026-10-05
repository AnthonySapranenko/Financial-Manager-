# Next Time

Handoff notes for the next Claude Code session. Read this first, then
`README.md`, `BOSS.md`, `TASKS.md`, and `PRODUCT.md`.

Last updated: 2026-10-05

## Where we are

- Tasks 1–9 are merged (PRs #1–#9). Task 10 (dashboard totals) is on branch
  `feature/dashboard`, pushed; the developer opens and merges the PR.
  **Check that it is merged before starting Task 11.**
- Frontend structure (`frontend/src/`):
  - `api.js`: every `fetch` (`getTransactions`, `createTransaction`,
    `getSummary`); `/api/...` is proxied by Vite to `http://127.0.0.1:8000`.
  - `money.js`: `formatMoney()`, shared display formatting. The browser
    never does money math; totals come from the backend.
  - `App.jsx`: owns state; loads the list and the summary independently
    (each has its own error), refreshes the summary after each add.
  - `Summary.jsx` (all-time totals strip: income green `+`, expenses red
    `−`, balance dark or red `−` when negative), `TransactionForm.jsx`,
    `TransactionList.jsx`.
- Design so far: one page; totals strip under the title, then form and list
  (stacked on phones, side by side from 768px). Plain styling; a full visual
  identity (Impeccable visual-direction round, `DESIGN.md`) was deferred
  until after the dashboard, so it's now up for discussion.
- Tests: 37 backend (pytest) and 14 frontend (Vitest, `fetch` faked by URL
  with `vi.stubGlobal`), all passing.
- Running the app needs both servers (see `README.md`). A manual run creates
  `backend/finance.db`; delete it to start empty.

## Start here: Task 11, spending by category

1. Confirm Task 10 is merged, then sync `master` and create
   `feature/category-spending`.
2. Plan with the developer. This one needs **backend work**: there is no
   endpoint for per-category totals yet. Questions to settle:
   - The endpoint (e.g. `GET /summary/categories`): expenses only, summed in
     cents with `GROUP BY category` in SQL, like `/summary` does; new pytest
     tests.
   - All time, or a month? Task 12 (monthly budgets) will need per-month
     category spending, so a month filter may be worth designing now.
   - How to show it: a simple list with amounts and share of total, or a
     chart. Load the `dataviz` skill before any chart work; avoid a chart
     library unless clearly needed.
   - Whether to do the deferred visual-identity round before or after.
3. Present the plan (files, tests, decisions) and wait for approval.

Small follow-ups found in reviews (not done yet):
- The amount `.5` is rejected (must type `0.5`); the backend would accept it.
- "Today" is computed when the page loads, so it goes stale past midnight.
- The "date defaults to today" test could flake if it runs exactly at midnight.
- `api.js` assumes a 422 `detail` is a list (true for FastAPI validation
  errors; a plain-text `detail` would show a confusing message).
- Two very fast adds could get summary responses out of order and briefly
  show stale totals (practically impossible on localhost).

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
