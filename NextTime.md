# Next Time

Handoff notes for the next Claude Code session. Read this first, then
`README.md`, `BOSS.md`, `TASKS.md`, and `PRODUCT.md`.

Last updated: 2026-10-08 (Task 23 in review)

## Where we are

- Tasks 1–22 are merged (PRs #1–#22). Task 23 (edit a transaction) is in
  review on `feature/edit-transaction`.
- When a PR is reported merged, verify before building on it: after
  `git fetch`, run `git merge-base --is-ancestor <branch> origin/master`.
- Backend endpoints: `/health`; `POST`/`GET /transactions`;
  `PUT /transactions/{id}` (same body as POST; plain-text 404 when gone);
  `DELETE /transactions/{id}` (204, also when already gone);
  `GET /summary` (optional `?month=YYYY-MM`, otherwise all time);
  `GET /summary/categories?month=`; `GET /budgets?month=` (every expense
  category with `budget` or null, `spent`, `remaining`, negative when over);
  `PUT /budgets/{category}` (upsert, salary rejected with a plain-text 422);
  `DELETE /budgets/{category}` (204). Helpers in `main.py`: `month_range()`,
  `spending_by_category()`. Tables: `transactions`, `budgets` (category is the
  primary key).
- Frontend (`frontend/src/`): `api.js` (all fetches; handles 204 and
  plain-text 422/404), `dates.js` (`useToday()` hook, `shiftMonth`,
  `monthName`), `money.js` (`formatMoney`, `isValidAmount`, `AMOUNT_ERROR`),
  `App.jsx` (state; `month` = `chosenMonth ?? thisMonth`; one effect loads the
  month's numbers, keyed on `[month, reloads]`, with an `ignore` flag;
  `refreshMonth()` just bumps `reloads`), `Summary.jsx` (totals plate with
  previous/next month buttons, a "This month" shortcut, and an all-time
  balance footnote row), `CategorySpending.jsx` (SVG donut + legend),
  `Budgets.jsx`, `TransactionForm.jsx` (date state `null` = "today";
  `editing` prop switches it to edit mode; App remounts it with `key`),
  `TransactionList.jsx` (Edit/Delete row links, class `row-button`;
  focus moves to the heading after a delete).
- Tests (after Task 23): 63 backend (pytest) and 50 frontend (Vitest), all
  passing.
- Running the app needs both servers (see `README.md`). A manual run creates
  `backend/finance.db`; delete it to start empty.

## Start here: Task 23 is in review

Once it's merged (verify with `git merge-base --is-ancestor`), pick Task 24
from master. Candidates:
- Show which row is being edited (a subtle highlight in the list). Today
  only the filled-in form says which one it is.
- Category/type mismatch is allowed: an expense can be "salary" and income
  can be "food" (the developer's own sample data has both). Budgets already
  reject salary. Product call: restrict salary to income?
- Making the donut tooltips keyboard-friendly (see follow-ups below). Small.

Recent tasks, for context:
- Task 23: edit in place. Product call made by Claude (developer said not
  to ask), recorded in `PRODUCT.md`. App keeps `editing` (a transaction or
  null) and renders `<TransactionForm key={editing ? editing.id : 'new'}>`:
  a new key throws the old form away, so `useState(editing?.amount ?? '')`
  starting values apply fresh. `formFocus` (false until the first edit)
  makes the new form focus its heading, so page load never moves focus.
  Deleting the transaction being edited clears `editing`. Save failures
  (e.g. 404) stay in the form with the user's changes.
- Task 22: `Summary.jsx` shows a "This month" button only when
  `month !== thisMonth`; it calls `onMonthChange(thisMonth)`, which stores
  `null`, so the page follows the date again. `goTo()` moves focus to
  "Previous month" (a ref) whenever the new month is this month, because the
  clicked button vanishes ("This month") or turns disabled ("Next month").
  Also fixed: `PRODUCT.md` "Capabilities" and the `Summary` docstring.
  Screenshots via a throwaway Node CDP script (not in the repo); with
  "This month" showing, long month names wrap the label at 390px.
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
- Donut tooltips are mouse-only (the legend carries all values).
- Clicking "Edit" (or "Cancel") swaps the form, so a half-typed new
  transaction is thrown away without a warning.
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
- Exception (2026-10-08): when the developer asks for several tasks in one
  unattended run ("do at least 4 tasks, don't ask me"), stacking is OK.
  Each branch builds on the previous one, every PR targets master, and the
  final report gives the merge order (normal merge commits, not squash).
  The developer merged PRs #17–#20 that way without trouble.
- When the developer says not to ask, that also overrides Impeccable's
  "probe once" interview step: take direction from `DESIGN.md` and say so
  in the report.
- Product calls (anything marked undecided in `PRODUCT.md`) go to the
  developer as a short multiple-choice question with a recommendation,
  unless they've said not to ask.
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
| GET | `/summary` | `total_income`, `total_expenses`, `balance`; optional `?month=YYYY-MM`, otherwise all time |
| GET | `/summary/categories` | `?month=YYYY-MM` (required): `month`, `total`, `categories` (largest first) |
| GET | `/budgets` | `?month=YYYY-MM` (required): one row per expense category: `category`, `budget` (or null), `spent`, `remaining` (null without a budget, negative when over) |
| PUT | `/budgets/{category}` | Body: `amount`. Creates or changes the budget; salary is a plain-text 422 |
| DELETE | `/budgets/{category}` | 204; also 204 if there was no budget |

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
- Gotcha: PowerShell 5.1's `Set-Content -Encoding utf8` writes a BOM. Strip
  it (`sed -i '1s/^ï»¿//' file`) or edit with Python/Edit.
- `vite preview` forwards `/api` like the dev server does (`preview.proxy`
  defaults to `server.proxy`), so screenshots of a built app get real data.
  Stop both servers afterwards (find them with `Get-CimInstance
  Win32_Process` and match the command line).
- Starting servers from Claude: use separate background commands (one each
  for uvicorn, `vite preview`, headless Edge with
  `--remote-debugging-port`). Foreground `sleep` is blocked, and one long
  combined command got rejected. Node 24 has `fetch` and `WebSocket`
  built in, so a ~30-line CDP script can click and screenshot.
- `.claude/settings.json` allows the common read-only checks without a
  prompt (`npm run lint`, `npx vitest --run`, `npm test -- --run`, pytest,
  `git fetch`, `git merge-base`). Run them in Bash, not behind a
  PowerShell `$env:Path = ...;` prefix, or the rules don't match.
- Mutation check used this session: break the fix on purpose, confirm the
  new test fails, then restore. Cheap proof that a test catches the bug.

## Known, deliberately deferred

- `httpx` deprecation warning in pytest (wants `httpx2`). The developer said
  not to change dependencies yet.
- The database stores enum names (`EXPENSE`) instead of values (`expense`).
  This is harmless while only the API writes to it.
- Any date is accepted, including future dates. This is a product decision
  the developer has not made yet. (Future-dated transactions also count in
  the all-time balance.)
- No paging on `GET /transactions`.
