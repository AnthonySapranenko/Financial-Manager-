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
    // FastAPI's validation errors: { detail: [{ loc: [..., "amount"], msg: "..." }] }
    const body = await response.json()
    const messages = body.detail.map((problem) => `${problem.loc.at(-1)}: ${problem.msg}`)
    throw new Error(messages.join(' '))
  }

  if (!response.ok) {
    throw new Error(
      `The server had a problem (error ${response.status}). Is the backend running?`,
    )
  }

  return response.json()
}

export function getTransactions() {
  return request('/transactions')
}

export function getSummary() {
  return request('/summary')
}

export function createTransaction(transaction) {
  return request('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  })
}
