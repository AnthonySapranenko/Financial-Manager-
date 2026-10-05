import { useState } from 'react'
import sampleTransactions from './sampleTransactions.js'
import TransactionForm from './TransactionForm.jsx'
import TransactionList from './TransactionList.jsx'

function App() {
  // App owns the list, because both the form (adds) and the list (shows)
  // need it. Children get the data and functions they need as props.
  const [transactions, setTransactions] = useState(sampleTransactions)

  function addTransaction(transaction) {
    // Make a new array instead of changing the old one, so React notices.
    setTransactions((current) => [transaction, ...current])
  }

  return (
    <main>
      <header>
        <h1>Finance Manager</h1>
        <p className="note">
          Sample data only. Changes reset when you reload the page.
        </p>
      </header>
      <div className="layout">
        <TransactionForm onAdd={addTransaction} />
        <TransactionList transactions={transactions} />
      </div>
    </main>
  )
}

export default App
