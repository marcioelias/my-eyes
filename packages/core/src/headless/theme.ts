/*
 * Colour scheme selection.
 *
 * The CSS resolves light/dark from the `color-scheme` property, so switching
 * themes is only a matter of putting (or removing) data-theme on <html>.
 * "system" means: remove the attribute and let the OS decide.
 */

export type ColorScheme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'my-eyes:theme'

export function isColorScheme(value: unknown): value is ColorScheme {
    return value === 'light' || value === 'dark' || value === 'system'
}

export function getStoredScheme(): ColorScheme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        return isColorScheme(stored) ? stored : 'system'
    } catch {
        // Private mode or blocked storage — fall back to following the OS.
        return 'system'
    }
}

export function applyScheme(scheme: ColorScheme, root: HTMLElement = document.documentElement): void {
    if (scheme === 'system') {
        root.removeAttribute('data-theme')
    } else {
        root.setAttribute('data-theme', scheme)
    }
}

export function setScheme(scheme: ColorScheme, root?: HTMLElement): void {
    applyScheme(scheme, root)

    try {
        localStorage.setItem(STORAGE_KEY, scheme)
    } catch {
        // Preference simply does not persist; the page still switches.
    }

    document.dispatchEvent(new CustomEvent<ColorScheme>('my-eyes:theme-change', { detail: scheme }))
}

/** The scheme actually in effect, resolving "system" against the OS setting. */
export function resolvedScheme(): Exclude<ColorScheme, 'system'> {
    const scheme = getStoredScheme()

    if (scheme !== 'system') {
        return scheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Inline this in <head> to apply the stored theme before first paint.
 * Anything later than that and the page flashes the wrong colours.
 */
export const themeBootScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`
