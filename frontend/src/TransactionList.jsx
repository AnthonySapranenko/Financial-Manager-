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

function TransactionList({ transactions, loading, error }) {
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
          <li key={t.id} className="transaction">
            <div>
              <span className="category">{t.category}</span>
              {t.description && (
                <span className="description">{t.description}</span>
              )}
            </div>
            <div className="amount-date">
              <span className={`amount ${t.type}`}>
                {t.type === 'income' ? '+' : '−'}
                {formatMoney(t.amount)}
              </span>
              <time dateTime={t.transaction_date}>
                {formatDate(t.transaction_date)}
              </time>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="panel" aria-labelledby="transactions-heading">
      <h2 id="transactions-heading">Transactions</h2>
      {content}
    </section>
  )
}

export default TransactionList
