import { useState } from 'react'
import { AMOUNT_ERROR, isValidAmount } from './money.js'

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
  const [error, setError] = useState('') // problem with the amount
  const [saveError, setSaveError] = useState('') // the server refused or failed
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    const trimmed = amount.trim()
    if (!isValidAmount(trimmed)) {
      setError(AMOUNT_ERROR)
      return
    }
    setError('')
    setSaveError('')
    setSaving(true)

    try {
      // await pauses here until the backend answers. No id: the database picks it.
      await onAdd({
        amount: trimmed,
        type,
        category,
        description: description.trim(),
        transaction_date: date,
      })
      // Saved: clear the form for the next entry.
      setAmount('')
      setType('')
      setCategory('')
      setDescription('')
      setDate(today())
    } catch (err) {
      // Not saved: keep what the user typed so they can fix it and retry.
      setSaveError(err.message)
    } finally {
      setSaving(false) // runs either way
    }
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

      {/* Two short fields side by side, so the form fits on a phone screen. */}
      <div className="field-row">
        <label className="field">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Choose…</option>
            {CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {name[0].toUpperCase() + name.slice(1)}
              </option>
            ))}
          </select>
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
      </div>

      <label className="field">
        Description (optional)
        <input
          type="text"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {saveError && (
        <p className="form-error" role="alert">
          {saveError}
        </p>
      )}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Add transaction'}
      </button>
    </form>
  )
}

export default TransactionForm
