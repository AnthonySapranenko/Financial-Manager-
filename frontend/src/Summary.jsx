import { monthName, shiftMonth } from './dates.js'
import { formatMoney } from './money.js'

// Puts a sign in front of an amount, except for zero ("+$0.00" looks odd).
function withSign(sign, amount) {
  return amount === '0.00' ? formatMoney(amount) : sign + formatMoney(amount)
}

// A small chevron, drawn as SVG (pointing left; flipped in CSS for "next").
// aria-hidden: the button's aria-label already says what it does.
function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

// The balance is the only total that can be negative: "-150.00" is shown as
// "−$150.00" (a real minus sign, like expenses), "1046.42" as "$1,046.42".
function balanceText(balance) {
  return balance.startsWith('-')
    ? withSign('−', balance.slice(1)) // drop the "-"
    : formatMoney(balance)
}

function balanceClass(balance) {
  return balance.startsWith('-') ? 'amount expense' : 'amount'
}

// summary is what GET /summary?month=... returns, e.g.
// { total_income: "2400.00", total_expenses: "1353.58", balance: "1046.42" }
// onMonthChange("2026-09") asks App to show another month. There's nothing
// to see after this month, so "Next month" stops there.
// overall is what GET /summary returns (no month): the all-time totals.
function Summary({
  month,
  thisMonth,
  onMonthChange,
  summary,
  error,
  overall,
  overallError,
}) {
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
          <dd className={`${balanceClass(summary.balance)} balance`}>
            {balanceText(summary.balance)}
          </dd>
        </div>
      </dl>
    )
  }

  return (
    <section className="panel summary" aria-label="Totals">
      <div className="summary-month">
        {/* aria-live: screen readers read out the new month after a click. */}
        <p aria-live="polite">Totals for {monthName(month)}</p>
        <div className="month-steps">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          >
            <Chevron />
          </button>
          <button
            type="button"
            className="next"
            aria-label="Next month"
            disabled={month === thisMonth}
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          >
            <Chevron />
          </button>
        </div>
      </div>
      {content}
      {/* What all the months add up to: the money you have now. Hidden while
          loading; if the month's totals failed too, their error says enough. */}
      {overallError && !error && (
        <p className="summary-overall">
          All-time balance
          <span className="load-error" role="alert">
            {overallError}
          </span>
        </p>
      )}
      {overall && !overallError && (
        <p className="summary-overall">
          All-time balance
          <span className={balanceClass(overall.balance)}>
            {balanceText(overall.balance)}
          </span>
        </p>
      )}
    </section>
  )
}

export default Summary
