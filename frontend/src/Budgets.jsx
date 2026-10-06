import { useState } from 'react'
import { monthName } from './dates.js'
import { AMOUNT_ERROR, formatMoney, isValidAmount } from './money.js'

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

// One category: its own little form, so each row saves (and fails) on its own.
// status is one item from GET /budgets, e.g.
// { category: "food", budget: "400.00", spent: "312.40", remaining: "87.60" }
function BudgetRow({ status, onSave }) {
  const [value, setValue] = useState(status.budget ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const name = capitalize(status.category)

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = value.trim()
    // Empty is allowed: it means "remove this budget".
    if (trimmed !== '' && !isValidAmount(trimmed)) {
      setError(AMOUNT_ERROR)
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(status.category, trimmed)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  let progress
  if (status.budget === null) {
    progress = (
      <p className="budget-status">{formatMoney(status.spent)} spent · no budget</p>
    )
  } else {
    const over = status.remaining.startsWith('-')
    // Display only: how full the bar is. Capped at 100% when over budget.
    const fill = Math.min(Number(status.spent) / Number(status.budget), 1) * 100
    progress = (
      <>
        <p className="budget-status">
          {formatMoney(status.spent)} of {formatMoney(status.budget)}
          {over ? (
            <strong className="over">
              Over by {formatMoney(status.remaining.slice(1))}
            </strong>
          ) : (
            <span>{formatMoney(status.remaining)} left</span>
          )}
        </p>
        <div className={over ? 'meter over' : 'meter'} aria-hidden="true">
          <div style={{ width: `${fill}%` }} />
        </div>
      </>
    )
  }

  return (
    <li className="budget">
      <form className="budget-form" onSubmit={handleSubmit}>
        <label htmlFor={`budget-${status.category}`}>{name}</label>
        <input
          id={`budget-${status.category}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `budget-${status.category}-error` : undefined}
          type="text"
          inputMode="decimal"
          placeholder="No budget"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" disabled={saving} aria-label={`Save ${name} budget`}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
      {progress}
      {error && (
        <p id={`budget-${status.category}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </li>
  )
}

// budgets is what GET /budgets returns: one status per expense category.
// onSave(category, amount) sets the budget, or clears it when amount is "".
function Budgets({ month, budgets, error, onSave }) {
  let content
  if (error) {
    content = (
      <p className="load-error" role="alert">
        {error}
      </p>
    )
  } else if (!budgets) {
    content = <p className="empty">Loading budgets…</p>
  } else {
    content = (
      <ul className="budget-list">
        {budgets.map((status) => (
          <BudgetRow key={status.category} status={status} onSave={onSave} />
        ))}
      </ul>
    )
  }

  return (
    <section className="panel" aria-labelledby="budgets-heading">
      <h2 id="budgets-heading">Budgets · {monthName(month)}</h2>
      <p className="note">Monthly amounts. Leave a box empty for no budget.</p>
      {content}
    </section>
  )
}

export default Budgets
