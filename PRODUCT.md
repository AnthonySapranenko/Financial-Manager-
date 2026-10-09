# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **The developer (primary).** A beginner programmer building this app to learn
  full-stack development with an AI "Boss" workflow (see `BOSS.md`). Success is
  measured first by understanding the code, not by shipping features.
- **Portfolio viewers.** People the developer shows the project to, who judge it
  by how well it works and how clear the code and interface are.
- **The modeled end user.** One person tracking their own money. Not a real user
  base: the app is used with fake sample data. Designs should still serve this
  person realistically, because that is what makes the portfolio credible.

## Product Purpose

A small personal finance manager: record income and expenses, categorize them,
see totals and the current balance, set simple monthly budgets, and view
spending by category.

It exists as a learning and portfolio project. It is not meant for real daily
use or for managing real financial accounts.

Success means:

1. The developer can explain how every major part works.
2. Logging a transaction is fast and effortless.

## Positioning

Not competing with commercial budgeting apps. What sets it apart is how it was
built: incrementally, tested at every step, and kept simple enough that a
beginner can understand and explain all of it.

## Operating Context

The modeled user opens the app in two situations:

- **Right after spending.** A quick entry on the go, often on a phone. This must
  take seconds.
- **Periodic review.** A weekly or monthly session, usually on a computer, to
  enter a batch of transactions and see where the money went.

Both phone and desktop browsers matter.

## Capabilities and Constraints

Built so far (one page, backed by the API):

- Add a transaction: amount, income or expense, category, optional
  description (up to 200 characters), and date (today by default).
- List transactions, newest first; edit one in the form, or delete one
  after a confirm step.
- Totals for one month (income, expenses, balance), with previous/next
  month buttons and a "This month" shortcut, plus the all-time balance.
- Spending by category for the month (donut chart and legend).
- One standing monthly budget per expense category, with spending against it.

Planned: nothing yet (see `TASKS.md`).

Terminology and rules:

- Amounts are entered and shown in dollars with two decimal places, and stored
  as whole cents. They are always positive. The **type** (`income` or
  `expense`) says which direction the money moved.
- Categories are a fixed list: salary, food, housing, transportation,
  utilities, entertainment, health, shopping, other. Users cannot add their own.
- A balance can be negative.

Out of scope (per `BOSS.md`): user accounts or authentication, bank
connections, investments, financial advice, and AI features.

Constraints:

- Single user, no login.
- Fake or sample data only, never real financial information.
- Code must stay simple enough for a beginner to understand. Avoid dependencies
  and abstractions that are not needed.

Decided (2026-10-06, Task 15): transactions can be deleted, after a confirm
step, so a mistaken entry no longer leaves the totals wrong.

Decided (2026-10-08, Task 23, made by Claude because the developer asked
not to be asked): transactions can be edited in place. "Edit" loads one
into the same form used for adding; every field can change. No confirm
step: "Cancel" is right there, and nothing is lost.

Undecided:

- Currency handling beyond US-style dollars.

## Brand Commitments

The name is "Finance Manager". The visual identity (banknote engraving) is
recorded in `DESIGN.md`. The favicon in `frontend/public/favicon.svg` is a
small authored mark: a green note with an engraved frame and an "F". There is
no voice guide.

## Evidence on Hand

There is no real user data, and there are no testimonials, screenshots, or
metrics. Future work must not invent them. All transactions shown anywhere
must be clearly fake sample data.

## Product Principles

1. **Logging takes seconds.** Adding a transaction is the most frequent action.
   Optimize it before anything else.
2. **Exact numbers.** Money is never rounded, approximated, or shown
   ambiguously. Income and expense must be unmistakable at a glance.
3. **Understandable over clever.** Prefer the simple, explainable solution,
   in the interface and in the code.
4. **A small scope that works.** Finish and polish the core features before
   adding new ones.
5. **Phone and desktop both work.** Quick entry on a phone and periodic review
   on a computer are both first-class.
