import { useRef, useState } from 'react'
import { formatMoney } from './money.js'

// Formats "2026-09-28" as "Sep 28, 2026". We build the Date from its parts
// because new Date("2026-09-28") means midnight UTC, which is still Sep 27
// in the US.
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// One transaction: its own component, so each row can be "deleting…" or
// show its own error without affecting the others (like BudgetRow).
function TransactionRow({ transaction: t, onDelete, onEdit }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const sign = t.type === 'income' ? '+' : '−'
  // e.g. "−$64.18 food expense on Sep 28, 2026"
  const summary = `${sign}${formatMoney(t.amount)} ${t.category} ${t.type} on ${formatDate(t.transaction_date)}`

  async function handleDelete() {
    // Deleting can't be undone, so ask first. confirm() is the browser's
    // own OK/Cancel box: it returns true for OK.
    if (!window.confirm(`Delete ${summary}?`)) return
    setDeleting(true)
    setError('')
    try {
      await onDelete(t.id)
      // Success: App removes this row, so there's nothing to reset here.
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <li className="transaction">
      <div>
        <span className="category">{t.category}</span>
        {t.description && <span className="description">{t.description}</span>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="amount-date">
        <span className={`amount ${t.type}`}>
          {sign}
          {formatMoney(t.amount)}
        </span>
        <time dateTime={t.transaction_date}>{formatDate(t.transaction_date)}</time>
        <button
          type="button"
          className="row-button"
          onClick={() => onEdit(t)}
          aria-label={`Edit ${summary}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="row-button delete"
          onClick={handleDelete}
          disabled={deleting}
          aria-label={`Delete ${summary}`}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </li>
  )
}

function TransactionList({ transactions, loading, error, onDelete, onEdit }) {
  // A ref is a box React fills with the real <h2> element once it's on the
  // page, so code can reach it: headingRef.current is the heading.
  const headingRef = useRef(null)

  // After a delete, the row and the button that had keyboard focus are gone,
  // and the browser would drop focus back to the top of the page. Move it to
  // the heading instead, so the next Tab lands on the remaining rows. If
  // onDelete fails it throws, this line never runs, and focus stays on the
  // button next to the error.
  async function deleteAndKeepFocus(id) {
    await onDelete(id)
    headingRef.current.focus()
  }

  // Pick what to show under the heading: one of four states.
  let content
  if (loading) {
    content = <p className="empty">Loading transactions…</p>
  } else if (error) {
    content = (
      <p className="load-error" role="alert">
        {error}
      </p>
    )
  } else if (transactions.length === 0) {
    content = <p className="empty">No transactions yet. Add one with the form.</p>
  } else {
    // Newest date first, like GET /transactions. Copy before sorting:
    // .sort() changes the array in place, and React state must not be changed.
    // "YYYY-MM-DD" strings sort correctly as plain text.
    const sorted = [...transactions].sort((a, b) =>
      b.transaction_date.localeCompare(a.transaction_date),
    )
    content = (
      <ul className="transaction-list">
        {sorted.map((t) => (
          <TransactionRow
            key={t.id}
            transaction={t}
            onDelete={deleteAndKeepFocus}
            onEdit={onEdit}
          />
        ))}
      </ul>
    )
  }

  return (
    <section className="panel transactions" aria-labelledby="transactions-heading">
      {/* tabIndex -1: code can focus the heading, but Tab still skips it. */}
      <h2 id="transactions-heading" ref={headingRef} tabIndex={-1}>
        Transactions
      </h2>
      {content}
    </section>
  )
}

export default TransactionList
