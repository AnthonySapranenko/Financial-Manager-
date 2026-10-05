// Formats "1200.00" as "$1,200.00". Number() is only used for display here;
// we never add or subtract amounts in the browser.
const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

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

function TransactionList({ transactions }) {
  // Newest date first, like GET /transactions. Copy before sorting:
  // .sort() changes the array in place, and React state must not be changed.
  // "YYYY-MM-DD" strings sort correctly as plain text.
  const sorted = [...transactions].sort((a, b) =>
    b.transaction_date.localeCompare(a.transaction_date),
  )

  return (
    <section className="panel" aria-labelledby="transactions-heading">
      <h2 id="transactions-heading">Transactions</h2>

      {sorted.length === 0 ? (
        <p className="empty">No transactions yet. Add one with the form.</p>
      ) : (
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
                  {dollars.format(Number(t.amount))}
                </span>
                <time dateTime={t.transaction_date}>
                  {formatDate(t.transaction_date)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TransactionList
