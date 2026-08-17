import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/*
 * Testing Library unmounts automatically only when the test framework's globals
 * are on. They are off here, so every render is torn down explicitly — a leaked
 * tree keeps its effects, and the theme and dropdown bindings listen on
 * `document`.
 */
afterEach(() => cleanup())
