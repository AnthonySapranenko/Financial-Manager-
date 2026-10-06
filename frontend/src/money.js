// Formats "1200.00" as "$1,200.00". Number() is only used for display here;
// we never add or subtract amounts in the browser (the backend does, in cents).
const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatMoney(amount) {
  return dollars.format(Number(amount))
}

// Digits with up to 2 decimals ("12", "12.5", "12.34"), or just the decimals
// (".5", ".25"). Same rule as the backend, so we never send it something it
// would reject.
const AMOUNT_PATTERN = /^(\d+(\.\d{1,2})?|\.\d{1,2})$/

export const AMOUNT_ERROR =
  'Enter an amount greater than 0, with at most 2 decimals.'

// True for a typed amount the backend will accept. Checks the text's shape,
// then that it isn't zero ("0", "0.00", ".0"). No money math happens here.
export function isValidAmount(text) {
  return AMOUNT_PATTERN.test(text) && Number(text) > 0
}
