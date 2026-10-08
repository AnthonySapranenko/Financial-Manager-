import { useEffect, useState } from 'react'

// Today as "YYYY-MM-DD" in the user's own time zone. (new Date().toISOString()
// uses UTC, which is already tomorrow on a US evening.)
function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// A custom hook: today's date that keeps up with the clock. A page left open
// past midnight would otherwise keep yesterday's date (and, on the 1st, last
// month). It checks once a minute, and right away when the page comes back
// into view (a phone switching back to the browser tab), because browsers
// pause timers in hidden tabs. Setting the same string again is free: React
// skips the re-render when the value didn't change.
export function useToday() {
  // today without (): React calls it for the first value only, not every render.
  const [day, setDay] = useState(today)

  useEffect(() => {
    const update = () => setDay(today())
    const timer = setInterval(update, 60_000)
    document.addEventListener('visibilitychange', update)
    // Cleanup: stop the timer and the listener when the component goes away.
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return day
}

// "2026-10" -> "October 2026"
export function monthName(month) {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
