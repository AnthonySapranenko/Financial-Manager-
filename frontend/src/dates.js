// This month as "YYYY-MM", in the user's own time zone.
export function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// "2026-10" -> "October 2026"
export function monthName(month) {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
