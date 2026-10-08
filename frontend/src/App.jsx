import { useEffect, useState } from 'react'
import {
  clearBudget,
  createTransaction,
  deleteTransaction,
  getBudgets,
  getCategorySpending,
  getSummary,
  getTransactions,
  setBudget,
} from './api.js'
import Budgets from './Budgets.jsx'
import CategorySpending from './CategorySpending.jsx'
import { useToday } from './dates.js'
import Summary from './Summary.jsx'
import TransactionForm from './TransactionForm.jsx'
import TransactionList from './TransactionList.jsx'

function App() {
  // App owns the list, because both the form (adds) and the list (shows)
  // need it. Children get the data and functions they need as props.
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // useToday re-renders App when the date changes, even with the page left
  // open overnight. "2026-10-08".slice(0, 7) is the month: "2026-10".
  const today = useToday()
  const thisMonth = today.slice(0, 7)

  // The month being looked at. null means "this month, whatever month that
  // is" (the same trick as the form's date), so it moves on at midnight on
  // the 1st, unless the user went back to an earlier month.
  const [chosenMonth, setChosenMonth] = useState(null)
  const month = chosenMonth ?? thisMonth

  function showMonth(newMonth) {
    setChosenMonth(newMonth === thisMonth ? null : newMonth)
  }

  // The month's numbers, all calculated by the backend. null = not loaded yet.
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState('')
  const [spending, setSpending] = useState(null)
  const [spendingError, setSpendingError] = useState('')
  const [budgets, setBudgets] = useState(null)
  const [budgetsError, setBudgetsError] = useState('')
  // Totals across every month, for the all-time balance.
  const [overall, setOverall] = useState(null)
  const [overallError, setOverallError] = useState('')

  // Counts the changes that should reload the month's numbers. Bumping it
  // re-runs the effect below, so every reload goes through one place.
  const [reloads, setReloads] = useState(0)

  // Reload everything that depends on the month's transactions. We never add
  // up money in the browser: the backend does it in whole cents.
  function refreshMonth() {
    setReloads((count) => count + 1)
  }

  // Load the transactions once, after the first render. (In development,
  // React runs effects twice on purpose to catch bugs; `ignore` makes the
  // first, cancelled load harmless.)
  useEffect(() => {
    let ignore = false

    getTransactions()
      .then((data) => {
        if (!ignore) setTransactions(data)
      })
      .catch((error) => {
        if (!ignore) setLoadError(error.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, []) // the empty list [] means "run once"

  // Load the month's numbers after the first render, and again whenever the
  // month changes (the user picks another month, or midnight on the 1st) or
  // something was saved (reloads went up).
  //
  // Answers can come back in any order. Click "Previous month" twice
  // quickly, and September's answer might arrive after August's, so the
  // page would say August but show September's numbers. To stop that, each
  // run of this effect has its own `ignore` flag. When month or reloads
  // changes, React first runs the cleanup of the previous run (ignore =
  // true), so a late answer to an older request is thrown away.
  useEffect(() => {
    let ignore = false

    // Fetch one thing and store it, or store its error. Each piece of data
    // has its own error, so one failing doesn't hide the others.
    function load(fetchIt, setData, setError) {
      fetchIt().then(
        (data) => {
          if (ignore) return
          setData(data)
          setError('')
        },
        (error) => {
          if (!ignore) setError(error.message)
        },
      )
    }

    load(() => getSummary(month), setSummary, setSummaryError)
    load(() => getCategorySpending(month), setSpending, setSpendingError)
    load(() => getBudgets(month), setBudgets, setBudgetsError)
    // Not about the month, but it changes whenever a transaction does, so
    // it reloads here too (and gets the same protection from late answers).
    load(() => getSummary(), setOverall, setOverallError)

    return () => {
      ignore = true
    }
  }, [month, reloads])

  // Save first, then show what the backend saved (it has the real id).
  // If saving fails, the error goes back to the form, which shows it.
  async function addTransaction(transaction) {
    const saved = await createTransaction(transaction)
    // Make a new array instead of changing the old one, so React notices.
    setTransactions((current) => [saved, ...current])
    // The form can clear right away: the reload happens in the effect, which
    // handles its own errors, because the transaction is already saved.
    refreshMonth()
  }

  // Delete first, then drop it from the list. If deleting fails, the error
  // goes back to that transaction's row and the row stays.
  async function removeTransaction(id) {
    await deleteTransaction(id)
    // filter makes a new array without that one transaction.
    setTransactions((current) => current.filter((t) => t.id !== id))
    refreshMonth()
  }

  // An empty box means "no budget". Errors go back to that budget's row.
  async function saveBudget(category, amount) {
    if (amount === '') {
      await clearBudget(category)
    } else {
      await setBudget(category, amount)
    }
    refreshMonth()
  }

  // Order matters on phones, where everything is one column: logging first,
  // then recent transactions, then the month's review. On wider screens,
  // index.css places the same three blocks side by side.
  return (
    <>
      <header className="masthead">
        <h1>Finance Manager</h1>
        <p>Practice app: use made-up data only.</p>
      </header>
      <main>
        <Summary
          month={month}
          thisMonth={thisMonth}
          onMonthChange={showMonth}
          summary={summary}
          error={summaryError}
          overall={overall}
          overallError={overallError}
        />
        <div className="layout">
          <TransactionForm today={today} onAdd={addTransaction} />
          <TransactionList
            transactions={transactions}
            loading={loading}
            error={loadError}
            onDelete={removeTransaction}
          />
          <div className="month">
            <CategorySpending
              month={month}
              data={spending}
              error={spendingError}
            />
            <Budgets
              month={month}
              budgets={budgets}
              error={budgetsError}
              onSave={saveBudget}
            />
          </div>
        </div>
      </main>
    </>
  )
}

export default App
