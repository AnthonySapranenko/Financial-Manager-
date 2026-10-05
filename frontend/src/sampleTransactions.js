// Fake transactions so the UI has something to show before it talks to the
// backend (Task 9 replaces this file with real data from GET /transactions).
// Same shape as the API returns: amounts are strings in dollars, dates are
// "YYYY-MM-DD".
const sampleTransactions = [
  {
    id: 1,
    amount: '2400.00',
    type: 'income',
    category: 'salary',
    description: 'Paycheck (sample)',
    transaction_date: '2026-09-15',
  },
  {
    id: 2,
    amount: '1200.00',
    type: 'expense',
    category: 'housing',
    description: 'Rent (sample)',
    transaction_date: '2026-09-01',
  },
  {
    id: 3,
    amount: '64.18',
    type: 'expense',
    category: 'food',
    description: 'Groceries (sample)',
    transaction_date: '2026-09-28',
  },
  {
    id: 4,
    amount: '2.75',
    type: 'expense',
    category: 'transportation',
    description: 'Bus fare (sample)',
    transaction_date: '2026-09-30',
  },
  {
    id: 5,
    amount: '89.40',
    type: 'expense',
    category: 'utilities',
    description: 'Electric bill (sample)',
    transaction_date: '2026-09-20',
  },
  {
    id: 6,
    amount: '15.99',
    type: 'expense',
    category: 'entertainment',
    description: '',
    transaction_date: '2026-09-24',
  },
]

export default sampleTransactions
