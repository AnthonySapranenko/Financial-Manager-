# Next Time

Handoff notes for the next Claude Code session. Read this first, then
`README.md`, `BOSS.md`, `TASKS.md`, and `PRODUCT.md`.

Last updated: 2026-10-05

## Where we are

- Tasks 1–11 are merged (PRs #1–#11). Task 12 (monthly budgets) is on branch
  `feature/monthly-budgets`, pushed; the developer opens and merges the PR.
  **Check that it is merged before starting** (after `git fetch`, run
  `git merge-base --is-ancestor <branch> origin/master`).
- All originally planned features are done. Next is Task 13, the visual
  identity round (planned for after Task 12, by the developer's choice).
- Backend endpoints: `/health`; `POST`/`GET /transactions`;
  `GET /summary` (optional `?month=YYYY-MM`, otherwise all time);
  `GET /summary/categories?month=`; `GET /budgets?month=` (every expense
  category with `budget` or null, `spent`, `remaining`, negative when over);
  `PUT /budgets/{category}` (upsert, salary rejected with a plain-text 422);
  `DELETE /budgets/{category}` (204). Helpers in `main.py`: `month_range()`,
  `spending_by_category()`. Tables: `transactions`, `budgets` (category is the
  primary key).
- Frontend (`frontend/src/`): `api.js` (all fetches; handles 204 and
  plain-text 422), `dates.js` (`currentMonth`, `monthName`), `money.js`
  (`formatMoney`), `App.jsx` (state; `refresh()` helper, `refreshMonth()`
  reloads totals, spending, and budgets after each add), `Summary.jsx`
  (this month's totals strip), `CategorySpending.jsx` (SVG donut + legend),
  `Budgets.jsx` (one form per category row, meter bar, "Over by" in red
  bold), `TransactionForm.jsx`, `TransactionList.jsx`.
- Tests: 54 backend (pytest) and 23 frontend (Vitest), all passing.
- Running the app needs both servers (see `README.md`). A manual run creates
  `backend/finance.db`; delete it to start empty.

## Start here: Task 13, visual identity

1. Confirm Task 12 is merged, then sync `master` and create
   `feature/visual-identity`.
2. Run `/impeccable` (load its `context` first). There is no `DESIGN.md` yet,
   so this is a new visual world: follow its new-work flow (direction round
   with the developer, then build, finish review, and `DESIGN.md` by its
   documenter). Keep `PRODUCT.md`'s principles: logging takes seconds, exact
   numbers, income vs. expense unmistakable, phone and desktop.
3. Known layout issues to solve in the redesign: the Budgets panel (8 rows)
   pushes the Transactions list far down, especially on phones; the page is
   one long column of panels.
4. Scope check with the developer first: `BOSS.md` wins over Impeccable on
   scope and code complexity (plain CSS, no new dependencies unless agreed).
   Present the plan (files, decisions) and wait for approval.

Small follow-ups found in reviews (not done yet):
- The amount `.5` is rejected (must type `0.5`); the backend would accept it.
- "Today" and "this month" are computed when the page loads, so they go
  stale past midnight.
- The "date defaults to today" test could flake if it runs exactly at midnight.
- Two very fast adds could get responses out of order and briefly show
  stale numbers (practically impossible on localhost).
- Donut tooltips are mouse-only (the legend carries all values).
- A budget row's input keeps its typed value if the budget changes elsewhere
  (e.g. another tab) until reload.
- Budget amounts aren't checked in the browser; the backend's 422 message
  ("amount: Input should be greater than 0") is shown as is.

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
