// Every call to the backend goes through this file. Paths start with /api,
// which the Vite dev server forwards to FastAPI (see vite.config.js).

async function request(path, options) {
  let response
  try {
    response = await fetch(`/api${path}`, options)
  } catch {
    // fetch only throws when there's no response at all (server unreachable).
    throw new Error("Can't reach the server. Is the backend running?")
  }

  if (response.status === 422) {
    const body = await response.json()
    // Our own rules send plain text: { detail: "Salary is income, ..." }
    if (typeof body.detail === 'string') {
      throw new Error(body.detail)
    }
    // FastAPI's validation errors: { detail: [{ loc: [..., "amount"], msg: "..." }] }
    const messages = body.detail.map((problem) => `${problem.loc.at(-1)}: ${problem.msg}`)
    throw new Error(messages.join(' '))
  }

  // Our own "not found" has a plain-text reason too, e.g. editing a
  // transaction that was deleted in another tab.
  // (.catch: a 404 from somewhere else may not be JSON at all.)
  if (response.status === 404) {
    const body = await response.json().catch(() => ({}))
    if (typeof body.detail === 'string') {
      throw new Error(body.detail)
    }
  }

  if (!response.ok) {
    throw new Error(
      `The server had a problem (error ${response.status}). Is the backend running?`,
    )
  }

  // 204 means "done, nothing to send back" (e.g. after a DELETE).
  if (response.status === 204) {
    return null
  }
  return response.json()
}

export function getTransactions() {
  return request('/transactions')
}

// month is "YYYY-MM" everywhere below. getSummary() with no month gives the
// totals across all transactions.
export function getSummary(month) {
  return request(month ? `/summary?month=${month}` : '/summary')
}

export function getCategorySpending(month) {
  return request(`/summary/categories?month=${month}`)
}

export function getBudgets(month) {
  return request(`/budgets?month=${month}`)
}

export function createTransaction(transaction) {
  return request('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  })
}

// Sends every field, like createTransaction; the backend replaces them all.
export function updateTransaction(id, transaction) {
  return request(`/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  })
}

export function deleteTransaction(id) {
  return request(`/transactions/${id}`, { method: 'DELETE' })
}

export function setBudget(category, amount) {
  return request(`/budgets/${category}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  })
}

export function clearBudget(category) {
  return request(`/budgets/${category}`, { method: 'DELETE' })
}
