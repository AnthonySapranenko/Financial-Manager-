import { formatMoney } from './money.js'

// Slots 1-5 of a colorblind-checked chart palette, used largest slice first.
// Neighbors stay distinguishable for colorblind readers; the legend still
// names every slice, so color is never the only clue.
const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4']
const FOLDED_COLOR = '#afb8c1' // gray for "N more categories"

// A donut stays readable with at most 6 slices: the 5 largest, plus one for
// everything else.
const MAX_COLORED = COLORS.length

// Display only: "64.18" -> 6418 whole cents, so grouping can't create
// float errors. The real totals always come from the backend.
function toCents(amount) {
  return Math.round(Number(amount) * 100)
}

// Turns the API's categories (largest first) into at most 6 slices.
function toSlices(categories) {
  const slices = categories.slice(0, MAX_COLORED).map((c, i) => ({
    label: c.category[0].toUpperCase() + c.category.slice(1),
    cents: toCents(c.amount),
    color: COLORS[i],
  }))
  const rest = categories.slice(MAX_COLORED)
  if (rest.length > 0) {
    slices.push({
      label: `${rest.length} more ${rest.length === 1 ? 'category' : 'categories'}`,
      cents: rest.reduce((total, c) => total + toCents(c.amount), 0),
      color: FOLDED_COLOR,
    })
  }
  return slices
}

// "2026-10" -> "October 2026"
function monthName(month) {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

// The donut is one circle per slice, drawn as a dashed outline. pathLength=100
// makes the circle's outline 100 units long, so a 25% slice is a 25-unit dash.
// Each circle's dash starts where the previous slice ended.
function Donut({ slices, totalCents }) {
  const gap = slices.length > 1 ? 0.6 : 0 // thin white gap between slices

  // First work out where each slice starts and how long it is.
  const arcs = []
  let start = 0
  for (const slice of slices) {
    const length = (slice.cents / totalCents) * 100
    arcs.push({ ...slice, start, length })
    start += length
  }

  return (
    <svg className="donut" viewBox="0 0 42 42" aria-hidden="true">
      {arcs.map((arc) => (
        <circle
          key={arc.label}
          cx="21"
          cy="21"
          r="16"
          pathLength="100"
          fill="none"
          stroke={arc.color}
          strokeWidth="6"
          strokeDasharray={`${Math.max(arc.length - gap, 0.1)} 100`}
          strokeDashoffset={-arc.start}
          transform="rotate(-90 21 21)" // start at 12 o'clock, not 3
        >
          <title>{`${arc.label}: ${formatMoney(arc.cents / 100)}`}</title>
        </circle>
      ))}
    </svg>
  )
}

// data is what GET /summary/categories returns, e.g.
// { month: "2026-10", total: "64.18", categories: [{ category: "food", amount: "64.18" }] }
function CategorySpending({ month, data, error }) {
  const title = `Spending · ${monthName(month)}`

  let content
  if (error) {
    content = (
      <p className="load-error" role="alert">
        {error}
      </p>
    )
  } else if (!data) {
    content = <p className="empty">Loading spending…</p>
  } else if (data.categories.length === 0) {
    content = <p className="empty">No spending yet in {monthName(month)}.</p>
  } else {
    const slices = toSlices(data.categories)
    const totalCents = toCents(data.total)
    content = (
      <div className="spending">
        <div className="donut-wrap">
          <Donut slices={slices} totalCents={totalCents} />
          <p className="donut-total">
            <span className="amount">{formatMoney(data.total)}</span>
            <span>spent</span>
          </p>
        </div>
        <ul className="legend">
          {slices.map((slice) => (
            <li key={slice.label}>
              <span className="swatch" style={{ background: slice.color }} />
              <span className="legend-label">{slice.label}</span>
              <span className="amount">{formatMoney(slice.cents / 100)}</span>
              <span className="percent">
                {Math.round((slice.cents / totalCents) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <section className="panel" aria-labelledby="spending-heading">
      <h2 id="spending-heading">{title}</h2>
      {content}
    </section>
  )
}

export default CategorySpending
