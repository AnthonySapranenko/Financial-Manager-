import {
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

// The fake backend: answers each URL like the real API would.
function fakeBackend(url) {
  if (url === '/api/summary') return respond(summary)
  if (url.startsWith('/api/summary/categories')) return respond(spending)
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
  spending = SPENDING
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => fakeBackend(url)),
  )
})

// The POST request the app sent, if any: [url, options].
function postCall() {
  return fetch.mock.calls.find(([, options]) => options?.method === 'POST')
}

function totals() {
  return screen.getByRole('region', { name: 'Totals' })
}

function spendingPanel() {
  return screen.getByRole('region', { name: /^Spending/ })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

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
  render(<App />)

  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  expect(screen.getByLabelText('Date')).toHaveValue(
    `${now.getFullYear()}-${month}-${day}`,
  )
  await listItems()
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

test.each(['0', '12.345', 'abc'])('rejects amount %s without calling the API', async (amount) => {
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
    url === '/api/summary' ? respond({}, 500) : fakeBackend(url),
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
