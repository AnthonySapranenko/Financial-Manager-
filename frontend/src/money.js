// Formats "1200.00" as "$1,200.00". Number() is only used for display here;
// we never add or subtract amounts in the browser (the backend does, in cents).
const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatMoney(amount) {
  return dollars.format(Number(amount))
}
