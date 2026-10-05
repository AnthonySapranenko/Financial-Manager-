import { useEffect, useState } from 'react'
import { createTransaction, getTransactions } from './api.js'
import TransactionForm from './TransactionForm.jsx'
import TransactionList from './TransactionList.jsx'

function App() {
  // App owns the list, because both the form (adds) and the list (shows)
  // need it. Children get the data and functions they need as props.
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Load the list once, after the first render. (In development, React runs
  // effects twice on purpose to catch bugs; `ignore` makes the first,
  // cancelled run harmless.)
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
  }, [])

  // Save first, then show what the backend saved (it has the real id).
  // If saving fails, the error goes back to the form, which shows it.
  async function addTransaction(transaction) {
    const saved = await createTransaction(transaction)
    // Make a new array instead of changing the old one, so React notices.
    setTransactions((current) => [saved, ...current])
  }

  return (
    <main>
      <header>
        <h1>Finance Manager</h1>
        <p className="note">Practice app: use made-up data only.</p>
      </header>
      <div className="layout">
        <TransactionForm onAdd={addTransaction} />
        <TransactionList
          transactions={transactions}
          loading={loading}
          error={loadError}
        />
      </div>
    </main>
  )
}

export default App
