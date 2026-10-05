import { useEffect, useState } from 'react'
import {
  createTransaction,
  getCategorySpending,
  getSummary,
  getTransactions,
} from './api.js'
import CategorySpending from './CategorySpending.jsx'
import Summary from './Summary.jsx'
import TransactionForm from './TransactionForm.jsx'
import TransactionList from './TransactionList.jsx'

// This month as "YYYY-MM", in the user's own time zone.
function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function App() {
  // App owns the list, because both the form (adds) and the list (shows)
  // need it. Children get the data and functions they need as props.
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // The totals from GET /summary. null means "not loaded yet".
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState('')

  // This month's spending per category, from GET /summary/categories.
  const month = currentMonth()
  const [spending, setSpending] = useState(null)
  const [spendingError, setSpendingError] = useState('')

  // Load everything once, after the first render. The three requests run at
  // the same time, and each has its own error, so one failing
  // doesn't hide the other. (In development, React runs effects twice on
  // purpose to catch bugs; `ignore` makes the first, cancelled run harmless.)
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

    getSummary()
      .then((data) => {
        if (!ignore) setSummary(data)
      })
      .catch((error) => {
        if (!ignore) setSummaryError(error.message)
      })

    getCategorySpending(currentMonth())
      .then((data) => {
        if (!ignore) setSpending(data)
      })
      .catch((error) => {
        if (!ignore) setSpendingError(error.message)
      })

    return () => {
      ignore = true
    }
  }, [])

  // Ask the backend for fresh totals. We never add up money in the browser:
  // the backend does it in whole cents, so there's one source of truth.
  async function refreshSummary() {
    try {
      setSummary(await getSummary())
      setSummaryError('')
    } catch (error) {
      setSummaryError(error.message)
    }
  }

  async function refreshSpending() {
    try {
      setSpending(await getCategorySpending(currentMonth()))
      setSpendingError('')
    } catch (error) {
      setSpendingError(error.message)
    }
  }

  // Save first, then show what the backend saved (it has the real id).
  // If saving fails, the error goes back to the form, which shows it.
  async function addTransaction(transaction) {
    const saved = await createTransaction(transaction)
    // Make a new array instead of changing the old one, so React notices.
    setTransactions((current) => [saved, ...current])
    // Not awaited: the form can clear right away. The refresh functions
    // handle their own errors, because the transaction is already saved.
    refreshSummary()
    refreshSpending()
  }

  return (
    <main>
      <header>
        <h1>Finance Manager</h1>
        <p className="note">Practice app: use made-up data only.</p>
      </header>
      <Summary summary={summary} error={summaryError} />
      <div className="layout">
        <TransactionForm onAdd={addTransaction} />
        <div className="column">
          <CategorySpending
            month={month}
            data={spending}
            error={spendingError}
          />
          <TransactionList
            transactions={transactions}
            loading={loading}
            error={loadError}
          />
        </div>
      </div>
    </main>
  )
}

export default App
