# Next Time

Handoff notes for the next Claude Code session. Read this first, then
`README.md`, `BOSS.md`, `TASKS.md`, and `PRODUCT.md`.

Last updated: 2026-10-06

## Where we are

- Tasks 1–12 are merged (PRs #1–#12). All originally planned features are
  done.
- Task 13 (visual identity) is done and waiting for its PR; see below.
- When a PR is reported merged, verify before building on it: after
  `git fetch`, run `git merge-base --is-ancestor <branch> origin/master`.
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

## Start here: Task 13 is in review

Task 13 (visual identity) is committed and pushed on `feature/visual-identity`;
the PR still needs to be opened (link from `git push`) and merged by the
developer. After the merge, verify with `git merge-base --is-ancestor`.

- The look is "banknote engraving", recorded in `DESIGN.md` (read it before any
  UI change) and `.impeccable/design.json`. The direction contract lives in
  `.impeccable/surfaces/frontend-src-app-jsx.md`.
- The developer asked for this round to run unattended, so there was no
  direction round. If they want a different look, re-run Impeccable's
  new-work flow with them.
- Money figures use the self-hosted Bodoni Moda (`frontend/public/fonts/`) at
  `'opsz' 6` at every size; the display cut hides a negative balance's "−".
- Layout: phone is one column (totals, form, transactions, month); 768px+ has
  the form beside transactions; 1100px+ has three columns. The form's Category
  and Date share a row.
- Impeccable's finish reviewer scored all fixes resolved (disposition: ship).

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
- Node is not on the Bash/PowerShell PATH in Claude sessions: prefix
  PowerShell commands with `$env:Path = "C:\Program Files\nodejs;$env:Path"`.
- Screenshots at true phone width (390px): drive Edge over the DevTools
  protocol (`Emulation.setDeviceMetricsOverride`) from a small Node script;
  the iframe trick below loses API data.
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
