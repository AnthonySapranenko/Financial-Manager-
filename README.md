# Finance Manager

A small full-stack personal finance manager built as a learning project and an experiment in AI-assisted software development.

## Purpose

The purpose of this project is to learn how to build a complete software application while experimenting with a "Boss" development workflow.

The Boss is an AI development orchestrator that helps plan tasks, implement features, review code, run tests, and keep the project organized.

This is primarily a learning project, not a production financial application.

## Goals

The project is intended to help me learn:

* Full-stack application development
* Frontend and backend architecture
* APIs
* Databases
* Python
* JavaScript/React
* Testing
* Git and GitHub
* Software project organization
* AI-assisted development
* How to work effectively with an AI coding agent

## Planned Features

The first version will include:

* Add income
* Add expenses
* Categorize transactions
* View transactions
* Calculate total income
* Calculate total expenses
* Calculate current balance
* Set simple budgets
* View spending by category
* Save financial data
* Display a simple dashboard

Additional features should only be added after the core application works reliably.

## Planned Technology

### Frontend

* React
* JavaScript
* CSS

### Backend

* Python
* FastAPI

### Database

* SQLite

### Development Tools

* VS Code
* Git
* GitHub
* Claude Code / Boss workflow

## Planned Architecture

```text
User
 |
 v
React Frontend
 |
 | HTTP/API requests
 v
FastAPI Backend
 |
 v
SQLite Database
```

The frontend is responsible for the user interface.

The backend is responsible for application logic, validation, and API endpoints.

The database is responsible for persistent data storage.

## Development Philosophy

This project should be built incrementally.

The AI should not generate the entire application at once.

Each feature should be:

1. Planned
2. Implemented
3. Tested
4. Reviewed
5. Documented when appropriate

The goal is for me to understand the code that is being created.

## Learning Rule

AI assistance is encouraged, but I should be able to explain the major parts of the application.

When the Boss makes an important architectural or technical decision, it should explain:

* What was changed
* Why it was changed
* How it works
* What alternatives were considered when relevant

## Project Status

The backend API works: transactions can be saved, listed, and summarized.
The React frontend is set up but does not talk to the backend yet.

See [TASKS.md](TASKS.md) for what is done and what comes next.

## Running the Backend

Requires Python 3.14. From the `backend/` folder:

```text
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at http://127.0.0.1:8000. Interactive API docs are at
http://127.0.0.1:8000/docs.

Data is saved in `backend/finance.db`, which is created automatically on
startup and is not committed to Git. Delete it to start with an empty database.

## Running Tests

From the `backend/` folder, with the virtual environment activated:

```text
pytest
```

Tests use a temporary in-memory database and never touch `finance.db`.

## Running the Frontend

Requires Node.js 22 or newer (developed on Node 24). From the `frontend/` folder:

```text
npm install
npm run dev
```

The app runs at http://localhost:5173.

Other commands, also run from `frontend/`:

| Command | What it does |
|---|---|
| `npm test` | Run the frontend tests (Vitest), re-running on file changes |
| `npm run lint` | Check the code for common mistakes (oxlint) |
| `npm run build` | Build the production version into `dist/` |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Check that the API is running |
| POST | `/transactions` | Add an income or expense |
| GET | `/transactions` | List all transactions, newest first |
| GET | `/summary` | Total income, total expenses, and balance |

Amounts are sent and returned in dollars (for example `12.34`) and stored
in the database as whole cents (`1234`) to avoid rounding errors.

Example request body for `POST /transactions`:

```json
{
  "amount": 12.34,
  "type": "expense",
  "category": "food",
  "description": "Groceries",
  "transaction_date": "2026-10-01"
}
```

`type` is `income` or `expense`. `category` is one of: `salary`, `food`,
`housing`, `transportation`, `utilities`, `entertainment`, `health`,
`shopping`, `other`.

## Disclaimer

This project is for educational purposes. It is not intended to provide financial advice or securely manage real financial accounts.
