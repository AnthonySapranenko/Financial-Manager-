import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App.jsx'

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

function listItems() {
  return within(screen.getByRole('list')).getAllByRole('listitem')
}

test('shows the app title', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: 'Finance Manager' }),
  ).toBeInTheDocument()
})

test('shows sample transactions, newest date first', () => {
  render(<App />)

  const items = listItems()
  expect(items).toHaveLength(6)
  expect(items[0]).toHaveTextContent('Bus fare (sample)') // 2026-09-30
  expect(items[5]).toHaveTextContent('Rent (sample)') // 2026-09-01
})

test('shows income with + and expense with −', () => {
  render(<App />)

  expect(screen.getByText('+$2,400.00')).toBeInTheDocument()
  expect(screen.getByText('−$1,200.00')).toBeInTheDocument()
})

test('date defaults to today', () => {
  render(<App />)

  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  expect(screen.getByLabelText('Date')).toHaveValue(
    `${now.getFullYear()}-${month}-${day}`,
  )
})

test('adding a transaction puts it at the top and clears the form', () => {
  render(<App />)

  addTransaction({
    amount: '12.5',
    type: 'Expense',
    category: 'food',
    description: 'Lunch',
    date: '2026-10-05',
  })

  const items = listItems()
  expect(items).toHaveLength(7)
  expect(items[0]).toHaveTextContent('Lunch')
  expect(items[0]).toHaveTextContent('−$12.50')
  expect(screen.getByLabelText('Amount ($)')).toHaveValue('')
  expect(screen.getByLabelText('Description (optional)')).toHaveValue('')
  expect(screen.getByLabelText('Expense')).not.toBeChecked()
})

test.each(['0', '12.345', 'abc'])('rejects amount %s', (amount) => {
  render(<App />)

  addTransaction({ amount, type: 'Income', category: 'salary' })

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Enter an amount greater than 0',
  )
  expect(listItems()).toHaveLength(6)
})
