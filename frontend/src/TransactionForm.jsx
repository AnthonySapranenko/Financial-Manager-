import { useState } from 'react'

// The fixed list from the backend (see TASKS.md "Agreed decisions").
const CATEGORIES = [
  'salary',
  'food',
  'housing',
  'transportation',
  'utilities',
  'entertainment',
  'health',
  'shopping',
  'other',
]

// Digits, optionally followed by a dot and 1 or 2 digits: "12", "12.5", "12.34".
// Same rule as the backend, so we never send it something it would reject.
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

// Today as "YYYY-MM-DD" in the user's own time zone. (new Date().toISOString()
// uses UTC, which is already tomorrow on a US evening.)
function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// onAdd is a function from the parent (App). We call it with the new
// transaction; App decides what to do with it ("lifting state up").
function TransactionForm({ onAdd }) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    const trimmed = amount.trim()
    // Compare as a string pattern, then check > 0. No money math happens here.
    if (!AMOUNT_PATTERN.test(trimmed) || Number(trimmed) === 0) {
      setError('Enter an amount greater than 0, with at most 2 decimals.')
      return
    }

    onAdd({
      id: Date.now(), // temporary unique id; the backend assigns real ids in Task 9
      amount: trimmed,
      type,
      category,
      description: description.trim(),
      transaction_date: date,
    })

    // Clear the form for the next entry.
    setAmount('')
    setType('')
    setCategory('')
    setDescription('')
    setDate(today())
    setError('')
  }

  return (
    <form className="panel transaction-form" onSubmit={handleSubmit}>
      <h2>Add transaction</h2>

      <fieldset className="type-toggle">
        <legend>Type</legend>
        <label className="type-option expense">
          <input
            type="radio"
            name="type"
            value="expense"
            checked={type === 'expense'}
            onChange={(e) => setType(e.target.value)}
            required
          />
          <span>Expense</span>
        </label>
        <label className="type-option income">
          <input
            type="radio"
            name="type"
            value="income"
            checked={type === 'income'}
            onChange={(e) => setType(e.target.value)}
          />
          <span>Income</span>
        </label>
      </fieldset>

      <label className="field">
        Amount ($)
        <input
          type="text"
          inputMode="decimal" // number keyboard on phones
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'amount-error' : undefined}
          required
        />
      </label>
      {error && (
        <p id="amount-error" className="form-error" role="alert">
          {error}
        </p>
      )}

      <label className="field">
        Category
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Choose a category</option>
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>
              {name[0].toUpperCase() + name.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Description (optional)
        <input
          type="text"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="field">
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <button type="submit">Add transaction</button>
    </form>
  )
}

export default TransactionForm
