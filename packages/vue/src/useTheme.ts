import { getStoredScheme, resolvedScheme, setScheme, type ColorScheme } from '@my-eyes/core'
import { onBeforeUnmount, onMounted, readonly, ref, type DeepReadonly, type Ref } from 'vue'

/**
 * The colour scheme, as reactive state.
 *
 * `MeThemeToggle` and `MeThemeMenu` already switch the theme on their own; this
 * is for the application that needs to *read* it — a chart library that wants
 * its own palette, a canvas, an embedded map.
 *
 * `scheme` is what was chosen, including `system`. `resolved` is what is
 * actually on screen, with `system` answered against the OS setting.
 *
 * @see docs/features/vue-package.md
 */
export interface UseTheme {
    scheme: DeepReadonly<Ref<ColorScheme>>
    resolved: DeepReadonly<Ref<'light' | 'dark'>>
    setScheme: (scheme: ColorScheme) => void
}

export function useTheme(): UseTheme {
    const scheme = ref<ColorScheme>('system')
    const resolved = ref<'light' | 'dark'>('light')

    const read = (): void => {
        scheme.value = getStoredScheme()
        resolved.value = resolvedScheme()
    }

    // The core dispatches this whenever the scheme is set, from any control on
    // the page — including one this composable knows nothing about.
    const onSchemeChange = (): void => read()

    let media: MediaQueryList | null = null

    onMounted(() => {
        read()

        document.addEventListener('my-eyes:theme-change', onSchemeChange)

        /*
         * While the choice is "system", the resolved value can change without
         * anything on the page happening at all — the operating system
         * switching to dark in the evening.
         */
        media = window.matchMedia('(prefers-color-scheme: dark)')
        media.addEventListener('change', onSchemeChange)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('my-eyes:theme-change', onSchemeChange)
        media?.removeEventListener('change', onSchemeChange)
    })

    return {
        scheme: readonly(scheme),
        resolved: readonly(resolved),
        setScheme: (next: ColorScheme) => setScheme(next),
    }
}
