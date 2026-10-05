import { formatMoney } from './money.js'

// Puts a sign in front of an amount, except for zero ("+$0.00" looks odd).
function withSign(sign, amount) {
  return amount === '0.00' ? formatMoney(amount) : sign + formatMoney(amount)
}

// summary is what GET /summary returns, e.g.
// { total_income: "2400.00", total_expenses: "1353.58", balance: "1046.42" }
function Summary({ summary, error }) {
  let content
  if (error) {
    content = (
      <p className="load-error" role="alert">
        {error}
      </p>
    )
  } else if (!summary) {
    content = <p className="empty">Loading totals…</p>
  } else {
    // The balance is the only total that can be negative: "-150.00".
    const negative = summary.balance.startsWith('-')
    content = (
      <dl className="totals">
        <div>
          <dt>Income</dt>
          <dd className="amount income">
            {withSign('+', summary.total_income)}
          </dd>
        </div>
        <div>
          <dt>Expenses</dt>
          <dd className="amount expense">
            {withSign('−', summary.total_expenses)}
          </dd>
        </div>
        <div>
          <dt>Balance</dt>
          <dd className={negative ? 'amount expense' : 'amount'}>
            {negative
              ? withSign('−', summary.balance.slice(1)) // drop the "-"
              : formatMoney(summary.balance)}
          </dd>
        </div>
      </dl>
    )
  }

  return (
    <section className="panel summary" aria-label="Totals">
      {content}
    </section>
  )
}

export default Summary
