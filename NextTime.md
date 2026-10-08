# Next Time

Handoff notes for the next Claude Code session. Read this first, then
`README.md`, `BOSS.md`, `TASKS.md`, and `PRODUCT.md`.

Last updated: 2026-10-08 (Task 21 in review)

## Where we are

- Tasks 1–20 are merged (PRs #1–#20). Task 21 (all-time balance) is in
  review on `feature/all-time-balance`.
- When a PR is reported merged, verify before building on it: after
  `git fetch`, run `git merge-base --is-ancestor <branch> origin/master`.
- Backend endpoints: `/health`; `POST`/`GET /transactions`;
  `DELETE /transactions/{id}` (204, also when already gone);
  `GET /summary` (optional `?month=YYYY-MM`, otherwise all time);
  `GET /summary/categories?month=`; `GET /budgets?month=` (every expense
  category with `budget` or null, `spent`, `remaining`, negative when over);
  `PUT /budgets/{category}` (upsert, salary rejected with a plain-text 422);
  `DELETE /budgets/{category}` (204). Helpers in `main.py`: `month_range()`,
  `spending_by_category()`. Tables: `transactions`, `budgets` (category is the
  primary key).
- Frontend (`frontend/src/`): `api.js` (all fetches; handles 204 and
  plain-text 422), `dates.js` (`useToday()` hook, `shiftMonth`,
  `monthName`), `money.js` (`formatMoney`, `isValidAmount`, `AMOUNT_ERROR`),
  `App.jsx` (state; `month` = `chosenMonth ?? thisMonth`; one effect loads the
  month's numbers, keyed on `[month, reloads]`, with an `ignore` flag;
  `refreshMonth()` just bumps `reloads`), `Summary.jsx` (totals plate with
  previous/next month buttons), `CategorySpending.jsx` (SVG donut + legend),
  `Budgets.jsx`, `TransactionForm.jsx` (date state `null` = "today"),
  `TransactionList.jsx` (focus moves to the heading after a delete).
- Tests (after Task 21): 59 backend (pytest) and 44 frontend (Vitest), all
  passing.
- Running the app needs both servers (see `README.md`). A manual run creates
  `backend/finance.db`; delete it to start empty.

## Start here: Task 21 is in review

Once it's merged (verify with `git merge-base --is-ancestor`), pick Task 22
from master. Candidates:
- Editing a transaction in place (still undecided in `PRODUCT.md`).
- `PRODUCT.md` "Capabilities" section is out of date (lists the UI as
  planned); `Summary` docstring in `models.py` says "all transactions"
  though it also serves one month.
- Category/type mismatch is allowed: an expense can be "salary" and income
  can be "food" (the developer's own sample data has both). Budgets already
  reject salary. Product call: restrict salary to income?

Recent tasks, for context:
- Task 21: `getSummary()` with no month calls `GET /summary` (all time).
  App loads it in the month effect (it changes whenever a transaction
  does). `Summary.jsx` shows it as a footnote row; `balanceText()` /
  `balanceClass()` format both balances the same way.
- Task 20: the phone `@media (max-width: 767px)` block was above the base
  rules it overrides; same selector, so the later base rule won. Moved to
  the end of `index.css` with a comment saying it must stay last.
- Task 19: race conditions. Each run of the month effect has its own
  `ignore`; React runs the previous run's cleanup first, so late answers
  are dropped. Test: a slow September answer resolved after going back to
  October.
- Task 18: `shiftMonth(month, ±1)` (Date handles the year change). "Next"
  is disabled on the current month. Choosing the current month stores
  `null`, so it keeps following the date.
- Task 17: `useToday()` re-checks every minute and on `visibilitychange`
  (hidden tabs pause timers). Tests fire `visibilitychange` after
  `vi.setSystemTime`.
- Task 16: `TransactionList` wraps `onDelete`; after it resolves,
  `headingRef.current.focus()`. The `<h2>` has `tabIndex={-1}` (focusable by
  code, skipped by Tab). A failed delete throws first, so focus stays on the
  button. The global `:focus-visible` ring shows only for keyboard users.
- Task 15 (PR #15): delete a transaction. `DELETE /transactions/{id}` (204,
  also when already gone); each row has a quiet "Delete" on its date line;
  `window.confirm()` asks first; totals, chart, and budgets reload after.
  Tests stub the question with `vi.spyOn(window, 'confirm')`. Claude made
  the PRODUCT.md call (delete yes, edit undecided) because the developer
  asked Claude to choose.
- Task 14 (PR #14): `.5` accepted; budget amounts checked in the browser;
  midnight-proof date test (`vi.useFakeTimers({ toFake: ['Date'] })`).

Visual identity (Task 13, merged): read `DESIGN.md` before any UI change.
Money figures use Bodoni Moda at `'opsz' 6` at every size (the display cut
hides a negative balance's "−"). The developer asked for that round to run
unattended, so there was no direction round; if they want a different look,
re-run Impeccable's new-work flow with them.

Small follow-ups found in reviews (not done yet):
- After a month switch, the old month's numbers show under the new label
  until the answers arrive (milliseconds on localhost). Clearing them would
  make the panels flash "Loading…" and jump on every click.
- No "back to this month" shortcut; clicking "Next" walks back.
- Donut tooltips are mouse-only (the legend carries all values).
- A budget row's input keeps its typed value if the budget changes elsewhere
  (e.g. another tab) until reload.

## How the developer wants to work

- Beginner learning full-stack. The goal is to understand the code
  (`BOSS.md` §17).
- One task at a time: inspect, plan, wait for approval, implement, test,
  **review** (`BOSS.md` §7: always do it, report findings ranked by severity),
  explain the concepts, commit.
- Before changing anything, state exactly which files will be created or
  modified.
- Since 2026-10-06 the developer often says "continue with the boss loop, do
  not ask me": then pick the next task yourself, run the whole loop
  (understand, plan, implement, test, review, fix, explain), commit and push
  the feature branch, and give the PR link. Explain choices in the final
  report instead of asking. Without that instruction, the default is still:
  plan, wait for approval, and commit/push only when asked.
- One feature branch and one PR per task, always from an up-to-date
  `master`. Don't stack a new task on an unmerged branch: if the last PR
  isn't merged, stop and say so. The developer merges PRs on GitHub.
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
| DELETE | `/transactions/{id}` | 204; also 204 if already gone; 422 if the id isn't a number |
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
