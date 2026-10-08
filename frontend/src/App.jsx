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

// Fetch one thing and store it, or store its error. Each piece of data has
// its own error, so one failing doesn't hide the others.
async function refresh(fetchIt, setData, setError) {
  try {
    setData(await fetchIt())
    setError('')
  } catch (error) {
    setError(error.message)
  }
}

function App() {
  // App owns the list, because both the form (adds) and the list (shows)
  // need it. Children get the data and functions they need as props.
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // useToday re-renders App when the date changes, even with the page left
  // open overnight. "2026-10-08".slice(0, 7) is the month: "2026-10".
  const today = useToday()
  const month = today.slice(0, 7)

  // This month's numbers, all calculated by the backend. null = not loaded yet.
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState('')
  const [spending, setSpending] = useState(null)
  const [spendingError, setSpendingError] = useState('')
  const [budgets, setBudgets] = useState(null)
  const [budgetsError, setBudgetsError] = useState('')

  // Reload everything that depends on this month's transactions. We never add
  // up money in the browser: the backend does it in whole cents.
  function refreshMonth() {
    refresh(() => getSummary(month), setSummary, setSummaryError)
    refresh(() => getCategorySpending(month), setSpending, setSpendingError)
    refresh(() => getBudgets(month), setBudgets, setBudgetsError)
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
  // month changes (past midnight on the last day of the month).
  useEffect(() => {
    refreshMonth()
    // The linter wants refreshMonth listed, but it's a new function on every
    // render, so listing it would reload on every render. month is the value
    // that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month])

  // Save first, then show what the backend saved (it has the real id).
  // If saving fails, the error goes back to the form, which shows it.
  async function addTransaction(transaction) {
    const saved = await createTransaction(transaction)
    // Make a new array instead of changing the old one, so React notices.
    setTransactions((current) => [saved, ...current])
    // Not awaited: the form can clear right away. refresh handles its own
    // errors, because the transaction is already saved.
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
    await refresh(() => getBudgets(month), setBudgets, setBudgetsError)
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
        <Summary month={month} summary={summary} error={summaryError} />
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
