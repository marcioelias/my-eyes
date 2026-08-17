'use client'

import { getStoredScheme, resolvedScheme, setScheme, type ColorScheme } from '@my-eyes/core'
import { useCallback, useEffect, useState } from 'react'

/**
 * The colour scheme, as React state.
 *
 * `MeThemeToggle` and `MeThemeMenu` already switch the theme on their own; this
 * is for the application that needs to *read* it — a chart library that wants
 * its own palette, a canvas, an embedded map.
 *
 * `scheme` is what was chosen, including `system`. `resolved` is what is
 * actually on screen, with `system` answered against the OS setting.
 *
 * @see docs/features/react-package.md
 */
export interface UseTheme {
    scheme: ColorScheme
    resolved: 'light' | 'dark'
    setScheme: (scheme: ColorScheme) => void
}

export function useTheme(): UseTheme {
    // 'system' and 'light' until mounted: the server has no localStorage, and
    // guessing on the server is what produces a hydration mismatch.
    const [scheme, setSchemeState] = useState<ColorScheme>('system')
    const [resolved, setResolved] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        const read = (): void => {
            setSchemeState(getStoredScheme())
            setResolved(resolvedScheme())
        }

        read()

        // The core dispatches this whenever the scheme is set, from any control
        // on the page — including one this hook knows nothing about.
        document.addEventListener('my-eyes:theme-change', read)

        /*
         * While the choice is "system", the resolved value can change without
         * anything on the page happening at all — the operating system
         * switching to dark in the evening.
         */
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        media.addEventListener('change', read)

        return () => {
            document.removeEventListener('my-eyes:theme-change', read)
            media.removeEventListener('change', read)
        }
    }, [])

    return {
        scheme,
        resolved,
        setScheme: useCallback((next: ColorScheme) => setScheme(next), []),
    }
}
