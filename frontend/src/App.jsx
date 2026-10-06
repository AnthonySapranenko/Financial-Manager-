import { useEffect, useState } from 'react'
import {
  clearBudget,
  createTransaction,
  getBudgets,
  getCategorySpending,
  getSummary,
  getTransactions,
  setBudget,
} from './api.js'
import Budgets from './Budgets.jsx'
import CategorySpending from './CategorySpending.jsx'
import { currentMonth } from './dates.js'
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

  // This month's numbers, all calculated by the backend. null = not loaded yet.
  const month = currentMonth()
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

  // Load everything once, after the first render. (In development, React runs
  // effects twice on purpose to catch bugs; `ignore` makes the first,
  // cancelled list load harmless. A second refreshMonth just stores the same
  // numbers again.)
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

    refreshMonth()

    return () => {
      ignore = true
    }
    // The empty list [] means "run once". The linter wants refreshMonth listed,
    // but it's a new function on every render, so listing it would reload on
    // every render. Running once is what we want here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // An empty box means "no budget". Errors go back to that budget's row.
  async function saveBudget(category, amount) {
    if (amount === '') {
      await clearBudget(category)
    } else {
      await setBudget(category, amount)
    }
    await refresh(() => getBudgets(month), setBudgets, setBudgetsError)
  }

  return (
    <main>
      <header>
        <h1>Finance Manager</h1>
        <p className="note">Practice app: use made-up data only.</p>
      </header>
      <Summary month={month} summary={summary} error={summaryError} />
      <div className="layout">
        <TransactionForm onAdd={addTransaction} />
        <div className="column">
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
