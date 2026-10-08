import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'

// What our fake backend "has saved". Same shape as GET /transactions.
const SAVED = [
  {
    id: 2,
    amount: '64.18',
    type: 'expense',
    category: 'food',
    description: 'Groceries',
    transaction_date: '2026-09-28',
  },
  {
    id: 1,
    amount: '2400.00',
    type: 'income',
    category: 'salary',
    description: 'Paycheck',
    transaction_date: '2026-09-15',
  },
]

// What our fake GET /summary answers, matching SAVED. Tests may change it.
const SUMMARY = {
  total_income: '2400.00',
  total_expenses: '64.18',
  balance: '2335.82',
}
let summary

// What our fake GET /summary (no month) answers: all-time totals.
const OVERALL = {
  total_income: '9600.00',
  total_expenses: '4479.60',
  balance: '5120.40',
}
let overall

// What our fake GET /summary/categories answers for this month.
function thisMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
const SPENDING = {
  month: thisMonth(),
  total: '64.18',
  categories: [{ category: 'food', amount: '64.18' }],
}
let spending

// What our fake GET /budgets answers: one budget left, one over, one unset.
const BUDGETS = [
  { category: 'food', budget: '400.00', spent: '64.18', remaining: '335.82' },
  { category: 'housing', budget: '1100.00', spent: '1200.00', remaining: '-100.00' },
  { category: 'health', budget: null, spent: '0.00', remaining: null },
]
let budgets

// The fake backend: answers each URL like the real API would.
function fakeBackend(url, options) {
  if (url.startsWith('/api/summary/categories')) return respond(spending)
  if (url === '/api/summary') return respond(overall)
  if (url.startsWith('/api/summary')) return respond(summary)
  if (url.startsWith('/api/budgets/')) {
    // PUT returns the saved budget; DELETE returns 204, no body.
    return options.method === 'DELETE'
      ? new Response(null, { status: 204 })
      : respond({ category: 'food', amount: '450.00' })
  }
  if (url.startsWith('/api/budgets')) return respond(budgets)
  if (url.startsWith('/api/transactions/') && options?.method === 'DELETE') {
    return new Response(null, { status: 204 })
  }
  return respond(SAVED)
}

// Builds a real Response object, like the one fetch gives back.
function respond(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Tests never call the real backend: we swap the browser's fetch for a fake
// (vi.fn) that answers by URL and records how it was called.
beforeEach(() => {
  summary = SUMMARY
  overall = OVERALL
  spending = SPENDING
  budgets = BUDGETS
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options) => fakeBackend(url, options)),
  )
})

// The POST request the app sent, if any: [url, options].
function postCall() {
  return fetch.mock.calls.find(([, options]) => options?.method === 'POST')
}

function totals() {
  return screen.getByRole('region', { name: 'Totals' })
}

function budgetsPanel() {
  return screen.getByRole('region', { name: /^Budgets/ })
}

// The request the app sent with this method, if any: [url, options].
function callWith(method) {
  return fetch.mock.calls.find(([, options]) => options?.method === method)
}

function spendingPanel() {
  return screen.getByRole('region', { name: /^Spending/ })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers() // undo any test that froze the clock
  vi.restoreAllMocks() // undo any spy, like the one on window.confirm
})

// The Delete button for one transaction, found by its full accessible name.
function deleteButton(name) {
  return screen.getByRole('button', { name: `Delete ${name}` })
}

// Fills in the form the way a user would, then clicks the button.
function addTransaction({ amount, type, category, description = '', date }) {
  fireEvent.change(screen.getByLabelText('Amount ($)'), {
    target: { value: amount },
  })
  fireEvent.click(screen.getByLabelText(type))
  fireEvent.change(screen.getByLabelText('Category'), {
    target: { value: category },
  })
  fireEvent.change(screen.getByLabelText('Description (optional)'), {
    target: { value: description },
  })
  if (date) {
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: date },
    })
  }
  fireEvent.click(screen.getByRole('button', { name: 'Add transaction' }))
}

// Waits until the transaction list has loaded, then returns its rows.
async function listItems() {
  const section = screen.getByRole('region', { name: 'Transactions' })
  const list = await within(section).findByRole('list')
  return within(list).getAllByRole('listitem')
}

test('shows the app title', async () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: 'Finance Manager' }),
  ).toBeInTheDocument()
  await listItems() // let loading finish before the test ends
})

test('shows a loading message, then transactions from the API', async () => {
  render(<App />)

  expect(screen.getByText('Loading transactions…')).toBeInTheDocument()
  const items = await listItems()
  expect(items).toHaveLength(2)
  expect(items[0]).toHaveTextContent('Groceries')
  expect(fetch).toHaveBeenCalledWith('/api/transactions', undefined)
})

test('shows income with + and expense with −', async () => {
  render(<App />)

  const items = await listItems()
  expect(items[1]).toHaveTextContent('+$2,400.00')
  expect(items[0]).toHaveTextContent('−$64.18')
})

test('shows an error when the backend is unreachable', async () => {
  fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
  render(<App />)

  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Can't reach the server. Is the backend running?",
  )
})

test('date defaults to today', async () => {
  // Freeze the clock (only Date, so timers and promises still work). Without
  // this, a run that crosses midnight would compare two different "todays".
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 2, 15, 23, 59)) // March 15, 11:59 pm local
  render(<App />)

  expect(screen.getByLabelText('Date')).toHaveValue('2026-03-15')
  await listItems()
})

// Pretends the user comes back to the tab: the browser fires
// "visibilitychange" on the document. act() lets React finish re-rendering.
function comeBackToPage() {
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

test('a page left open past midnight moves on to the new day and month', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 31, 23, 59)) // Oct 31, 11:59 pm local
  render(<App />)
  await listItems()
  expect(within(totals()).getByText('Totals for October 2026')).toBeInTheDocument()

  vi.setSystemTime(new Date(2026, 10, 1, 7, 30)) // the next morning
  comeBackToPage()

  expect(screen.getByLabelText('Date')).toHaveValue('2026-11-01')
  expect(within(totals()).getByText('Totals for November 2026')).toBeInTheDocument()
  // The new month's numbers are fetched, not just the label changed.
  expect(fetch).toHaveBeenCalledWith('/api/summary?month=2026-11', undefined)
  expect(fetch).toHaveBeenCalledWith('/api/summary/categories?month=2026-11', undefined)
  expect(fetch).toHaveBeenCalledWith('/api/budgets?month=2026-11', undefined)
})

test('a date the user picked is kept past midnight', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 31, 23, 59))
  render(<App />)
  await listItems()
  fireEvent.change(screen.getByLabelText('Date'), {
    target: { value: '2026-10-15' },
  })

  vi.setSystemTime(new Date(2026, 10, 1, 7, 30))
  comeBackToPage()

  expect(screen.getByLabelText('Date')).toHaveValue('2026-10-15')
})

test('adding sends it to the API and shows the saved transaction', async () => {
  render(<App />)
  await listItems()
  fetch.mockResolvedValueOnce(
    respond(
      {
        id: 3,
        amount: '12.50',
        type: 'expense',
        category: 'food',
        description: 'Lunch',
        transaction_date: '2026-10-05',
      },
      201,
    ),
  )

  addTransaction({
    amount: '12.5',
    type: 'Expense',
    category: 'food',
    description: 'Lunch',
    date: '2026-10-05',
  })

  // The button says "Saving…" while we wait for the backend.
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()

  await waitFor(async () => expect(await listItems()).toHaveLength(3))
  const [url, options] = postCall()
  expect(url).toBe('/api/transactions')
  expect(options.method).toBe('POST')
  expect(JSON.parse(options.body)).toEqual({
    amount: '12.5',
    type: 'expense',
    category: 'food',
    description: 'Lunch',
    transaction_date: '2026-10-05',
  })
  const items = await listItems()
  expect(items[0]).toHaveTextContent('Lunch')
  expect(items[0]).toHaveTextContent('−$12.50')
  expect(screen.getByLabelText('Amount ($)')).toHaveValue('')
})

test('shows the API error and keeps the form filled when saving fails', async () => {
  render(<App />)
  await listItems()
  fetch.mockResolvedValueOnce(
    respond(
      {
        detail: [
          {
            loc: ['body', 'amount'],
            msg: 'Decimal input should have no more than 12 digits in total',
          },
        ],
      },
      422,
    ),
  )

  addTransaction({ amount: '12345678901.00', type: 'Income', category: 'salary' })

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'amount: Decimal input should have no more than 12 digits in total',
  )
  expect(screen.getByLabelText('Amount ($)')).toHaveValue('12345678901.00')
  expect(await listItems()).toHaveLength(2)
  expect(screen.getByRole('button', { name: 'Add transaction' })).toBeEnabled()
})

test('accepts an amount without a leading zero, like .5', async () => {
  render(<App />)
  await listItems()
  fetch.mockResolvedValueOnce(
    respond(
      {
        id: 3,
        amount: '0.50',
        type: 'expense',
        category: 'food',
        description: '',
        transaction_date: '2026-10-05',
      },
      201,
    ),
  )

  addTransaction({ amount: '.5', type: 'Expense', category: 'food' })

  await waitFor(async () => expect(await listItems()).toHaveLength(3))
  expect(JSON.parse(postCall()[1].body).amount).toBe('.5')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test.each(['0', '.0', '.', '12.345', '.123', 'abc'])('rejects amount %s without calling the API', async (amount) => {
  render(<App />)
  await listItems()

  addTransaction({ amount, type: 'Income', category: 'salary' })

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Enter an amount greater than 0',
  )
  expect(postCall()).toBeUndefined()
})

test('shows income, expenses, and balance from the API', async () => {
  render(<App />)

  expect(within(totals()).getByText('Loading totals…')).toBeInTheDocument()
  expect(await within(totals()).findByText('+$2,400.00')).toBeInTheDocument()
  expect(within(totals()).getByText('−$64.18')).toBeInTheDocument()
  expect(within(totals()).getByText('$2,335.82')).not.toHaveClass('expense')
})

test('shows the all-time balance under the month', async () => {
  render(<App />)

  const line = await within(totals()).findByText('All-time balance')
  expect(line).toHaveTextContent('All-time balance$5,120.40')
  expect(fetch).toHaveBeenCalledWith('/api/summary', undefined)
})

test('a negative all-time balance is red with a minus sign', async () => {
  overall = { total_income: '0.00', total_expenses: '20.00', balance: '-20.00' }
  render(<App />)

  const amount = await within(totals()).findByText('−$20.00')
  expect(amount).toHaveClass('expense')
})

test('the all-time balance reloads after adding a transaction', async () => {
  render(<App />)
  await within(totals()).findByText('$5,120.40')
  fetch.mockResolvedValueOnce(
    respond(
      {
        id: 3,
        amount: '100.00',
        type: 'income',
        category: 'salary',
        description: '',
        transaction_date: '2026-09-30',
      },
      201,
    ),
  )
  overall = { ...OVERALL, balance: '5220.40' }

  addTransaction({ amount: '100', type: 'Income', category: 'salary' })

  expect(await within(totals()).findByText('$5,220.40')).toBeInTheDocument()
})

test('shows a negative balance in red with a minus sign', async () => {
  summary = { total_income: '0.00', total_expenses: '150.00', balance: '-150.00' }
  render(<App />)

  await within(totals()).findByText('Balance')
  // In the HTML, each amount (<dd>) comes right after its label (<dt>).
  const balance = within(totals()).getByText('Balance').nextElementSibling
  expect(balance).toHaveTextContent('−$150.00')
  expect(balance).toHaveClass('expense') // red
  expect(within(totals()).getByText('$0.00')).toBeInTheDocument() // no "+" on zero
})

test('refreshes the totals after adding a transaction', async () => {
  render(<App />)
  await within(totals()).findByText('$2,335.82')
  fetch.mockResolvedValueOnce(
    respond(
      {
        id: 3,
        amount: '35.82',
        type: 'expense',
        category: 'food',
        description: '',
        transaction_date: '2026-10-05',
      },
      201,
    ),
  )
  // What the backend will answer after the new transaction is saved.
  summary = { total_income: '2400.00', total_expenses: '100.00', balance: '2300.00' }

  addTransaction({ amount: '35.82', type: 'Expense', category: 'food' })

  expect(await within(totals()).findByText('$2,300.00')).toBeInTheDocument()
})

test('a failed summary shows an error but the list still loads', async () => {
  fetch.mockImplementation(async (url) =>
    url.startsWith('/api/summary?') ? respond({}, 500) : fakeBackend(url),
  )
  render(<App />)

  expect(await within(totals()).findByRole('alert')).toHaveTextContent(
    'The server had a problem (error 500)',
  )
  expect(await listItems()).toHaveLength(2)
})

test("shows this month's spending per category", async () => {
  render(<App />)

  const monthName = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  expect(
    screen.getByRole('heading', { name: `Spending · ${monthName}` }),
  ).toBeInTheDocument()
  const legend = await within(spendingPanel()).findByRole('list')
  expect(legend).toHaveTextContent('Food$64.18100%')
  expect(fetch).toHaveBeenCalledWith(
    `/api/summary/categories?month=${thisMonth()}`,
    undefined,
  )
})

test('folds categories past the 5 largest into one slice', async () => {
  spending = {
    month: thisMonth(),
    total: '100.00',
    categories: [
      { category: 'housing', amount: '40.00' },
      { category: 'food', amount: '20.00' },
      { category: 'transportation', amount: '15.00' },
      { category: 'utilities', amount: '10.00' },
      { category: 'health', amount: '5.00' },
      { category: 'shopping', amount: '5.00' },
      { category: 'other', amount: '5.00' },
    ],
  }
  render(<App />)

  const legend = await within(spendingPanel()).findByRole('list')
  const rows = within(legend).getAllByRole('listitem')
  expect(rows).toHaveLength(6)
  expect(rows[0]).toHaveTextContent('Housing$40.0040%')
  expect(rows[5]).toHaveTextContent('2 more categories$10.0010%')
})

test('says so when there is no spending this month', async () => {
  spending = { month: thisMonth(), total: '0.00', categories: [] }
  render(<App />)

  expect(
    await within(spendingPanel()).findByText(/No spending yet in/),
  ).toBeInTheDocument()
})

test('refreshes spending after adding a transaction', async () => {
  render(<App />)
  await within(spendingPanel()).findByRole('list')
  fetch.mockResolvedValueOnce(
    respond(
      {
        id: 3,
        amount: '10.00',
        type: 'expense',
        category: 'health',
        description: '',
        transaction_date: '2026-10-05',
      },
      201,
    ),
  )
  spending = {
    month: thisMonth(),
    total: '74.18',
    categories: [
      { category: 'food', amount: '64.18' },
      { category: 'health', amount: '10.00' },
    ],
  }

  addTransaction({ amount: '10', type: 'Expense', category: 'health' })

  expect(
    await within(spendingPanel()).findByText('Health'),
  ).toBeInTheDocument()
})

test("the totals strip shows this month's totals", async () => {
  render(<App />)

  const monthName = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  expect(within(totals()).getByText(`Totals for ${monthName}`)).toBeInTheDocument()
  expect(fetch).toHaveBeenCalledWith(`/api/summary?month=${thisMonth()}`, undefined)
  await within(totals()).findByText('$2,335.82')
})

test('previous and next month switch the totals, spending, and budgets', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 0, 20)) // Jan 20, 2026
  render(<App />)
  await listItems()
  const next = screen.getByRole('button', { name: 'Next month' })
  expect(next).toBeDisabled() // nothing to see after this month

  // Back across the new year: January 2026 -> December 2025.
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))

  expect(within(totals()).getByText('Totals for December 2025')).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { name: 'Budgets · December 2025' }),
  ).toBeInTheDocument()
  expect(fetch).toHaveBeenCalledWith('/api/summary?month=2025-12', undefined)
  expect(fetch).toHaveBeenCalledWith('/api/summary/categories?month=2025-12', undefined)
  expect(fetch).toHaveBeenCalledWith('/api/budgets?month=2025-12', undefined)
  expect(next).toBeEnabled()

  fireEvent.click(next)
  expect(within(totals()).getByText('Totals for January 2026')).toBeInTheDocument()
  expect(next).toBeDisabled()
  await within(totals()).findByText('$2,335.82') // let the reload finish
})

test("a late answer for an earlier month doesn't replace the current one", async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 20)) // October 2026
  // September's totals answer only when the test says so (a slow request).
  let answerSeptember
  const septemberAnswered = new Promise((resolve) => {
    answerSeptember = resolve
  })
  fetch.mockImplementation(async (url, options) => {
    if (url === '/api/summary?month=2026-09') {
      await septemberAnswered
      return respond({ total_income: '0.00', total_expenses: '9.99', balance: '-9.99' })
    }
    return fakeBackend(url, options)
  })
  render(<App />)
  await listItems()

  // Go to September (its answer is still on the way), then straight back.
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
  fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
  // Now September's answer finally arrives, last.
  await act(async () => answerSeptember())

  expect(within(totals()).getByText('Totals for October 2026')).toBeInTheDocument()
  expect(within(totals()).getByText('$2,335.82')).toBeInTheDocument()
  expect(within(totals()).queryByText('−$9.99')).not.toBeInTheDocument()
})

test('an earlier month stays chosen past midnight', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 31, 23, 59))
  render(<App />)
  await listItems()
  fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))

  vi.setSystemTime(new Date(2026, 10, 1, 7, 30)) // November now
  comeBackToPage()

  expect(within(totals()).getByText('Totals for September 2026')).toBeInTheDocument()
  // November exists now, so "Next month" works again.
  expect(screen.getByRole('button', { name: 'Next month' })).toBeEnabled()
})

test('shows budget left, over budget, and no budget', async () => {
  render(<App />)

  const rows = await within(budgetsPanel()).findAllByRole('listitem')
  expect(rows[0]).toHaveTextContent('$64.18 of $400.00$335.82 left')
  expect(rows[1]).toHaveTextContent('$1,200.00 of $1,100.00Over by $100.00')
  expect(rows[2]).toHaveTextContent('$0.00 spent · no budget')
  expect(within(rows[0]).getByLabelText('Food')).toHaveValue('400.00')
})

test('saving a budget sends it and reloads the budgets', async () => {
  render(<App />)
  await within(budgetsPanel()).findAllByRole('listitem')
  budgets = [
    { category: 'food', budget: '450.00', spent: '64.18', remaining: '385.82' },
  ]

  fireEvent.change(screen.getByLabelText('Food'), { target: { value: '450' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Food budget' }))

  expect(await within(budgetsPanel()).findByText(/\$385\.82 left/)).toBeInTheDocument()
  const [url, options] = callWith('PUT')
  expect(url).toBe('/api/budgets/food')
  expect(JSON.parse(options.body)).toEqual({ amount: '450' })
})

test('saving an empty box removes the budget', async () => {
  render(<App />)
  await within(budgetsPanel()).findAllByRole('listitem')
  budgets = [{ category: 'food', budget: null, spent: '64.18', remaining: null }]

  fireEvent.change(screen.getByLabelText('Food'), { target: { value: '' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Food budget' }))

  expect(
    await within(budgetsPanel()).findByText('$64.18 spent · no budget'),
  ).toBeInTheDocument()
  expect(callWith('DELETE')[0]).toBe('/api/budgets/food')
})

test.each(['-5', '0', 'abc', '12.345'])(
  'rejects budget %s in the browser without calling the API',
  async (amount) => {
    render(<App />)
    await within(budgetsPanel()).findAllByRole('listitem')

    fireEvent.change(screen.getByLabelText('Food'), { target: { value: amount } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Food budget' }))

    expect(within(budgetsPanel()).getByRole('alert')).toHaveTextContent(
      'Enter an amount greater than 0, with at most 2 decimals.',
    )
    expect(screen.getByLabelText('Food')).toHaveAttribute('aria-invalid', 'true')
    expect(callWith('PUT')).toBeUndefined()
  },
)

test("shows the backend's message when a budget is refused", async () => {
  render(<App />)
  await within(budgetsPanel()).findAllByRole('listitem')
  fetch.mockResolvedValueOnce(
    respond({ detail: "Salary is income, so it can't have a budget." }, 422),
  )

  fireEvent.click(screen.getByRole('button', { name: 'Save Food budget' }))

  expect(await within(budgetsPanel()).findByRole('alert')).toHaveTextContent(
    "Salary is income, so it can't have a budget.",
  )
})

test('deleting asks first, then removes the transaction and reloads totals', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true) // the user clicks OK
  render(<App />)
  await listItems()
  const summaryLoads = () =>
    fetch.mock.calls.filter(([url]) => url.startsWith('/api/summary?')).length
  const loadsBefore = summaryLoads()

  fireEvent.click(deleteButton('−$64.18 food expense on Sep 28, 2026'))

  expect(window.confirm).toHaveBeenCalledWith(
    'Delete −$64.18 food expense on Sep 28, 2026?',
  )
  await waitFor(async () => expect(await listItems()).toHaveLength(1))
  expect(callWith('DELETE')[0]).toBe('/api/transactions/2')
  expect(summaryLoads()).toBeGreaterThan(loadsBefore)
})

test('after deleting, keyboard focus moves to the Transactions heading', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<App />)
  await listItems()
  const button = deleteButton('−$64.18 food expense on Sep 28, 2026')
  button.focus() // as if the user had tabbed to it

  fireEvent.click(button)

  const heading = screen.getByRole('heading', { name: 'Transactions' })
  await waitFor(() => expect(heading).toHaveFocus())
})

test('cancelling the question deletes nothing', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(false) // the user clicks Cancel
  render(<App />)
  await listItems()

  fireEvent.click(deleteButton('+$2,400.00 salary income on Sep 15, 2026'))

  expect(callWith('DELETE')).toBeUndefined()
  expect(await listItems()).toHaveLength(2)
})

test('a failed delete shows the error and keeps the transaction', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<App />)
  await listItems()
  fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

  fireEvent.click(deleteButton('−$64.18 food expense on Sep 28, 2026'))

  const items = await listItems()
  expect(await within(items[0]).findByRole('alert')).toHaveTextContent(
    "Can't reach the server. Is the backend running?",
  )
  expect(items).toHaveLength(2)
  expect(
    deleteButton('−$64.18 food expense on Sep 28, 2026'),
  ).toBeEnabled() // ready to try again
})

test('a failed delete leaves keyboard focus on its button', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<App />)
  await listItems()
  fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
  const button = deleteButton('−$64.18 food expense on Sep 28, 2026')
  button.focus()

  fireEvent.click(button)

  await screen.findByText("Can't reach the server. Is the backend running?")
  expect(button).toHaveFocus() // still next to its error, ready to retry
})
