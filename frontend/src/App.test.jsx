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

// Builds a real Response object, like the one fetch gives back.
function respond(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Tests never call the real backend: we swap the browser's fetch for a fake
// (vi.fn) that answers with SAVED and records how it was called.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => respond(SAVED)),
  )
})

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

// Waits until the list has loaded, then returns its rows.
async function listItems() {
  const list = await screen.findByRole('list')
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

  expect(await screen.findByText('+$2,400.00')).toBeInTheDocument()
  expect(screen.getByText('−$64.18')).toBeInTheDocument()
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
  const [url, options] = fetch.mock.calls[1]
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
  expect(fetch).toHaveBeenCalledTimes(1) // only the initial GET
})
