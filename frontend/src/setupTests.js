// Runs before every test file.
import '@testing-library/jest-dom/vitest' // adds matchers like toBeInTheDocument()
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Remove whatever the previous test rendered, so tests can't affect each other.
afterEach(() => cleanup())
