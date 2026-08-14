/*
 * Locale-aware numeric parsing and formatting.
 *
 * Kept free of any DOM reference so the Blade, Vue and React numeric inputs can
 * share one implementation — the binding layer supplies the element.
 */

export interface NumericOptions {
    /** BCP 47 tag. Defaults to the document language at binding time. */
    locale: string
    /** Fixed number of decimal places. Omit to allow whatever the user types. */
    decimals?: number
    min?: number
    max?: number
    step: number
    /** Rendered before the value, e.g. "R$". */
    prefix?: string
    /** Rendered after the value, e.g. "%". */
    suffix?: string
    /** Group thousands using the locale separator. */
    grouping: boolean
}

export interface NumericSeparators {
    decimal: string
    group: string
}

const separatorCache = new Map<string, NumericSeparators>()

/**
 * Resolves the decimal and grouping characters for a locale. Reading them from
 * Intl rather than hardcoding "," and "." is what makes pt-BR, en-US and
 * de-DE all work from the same code path.
 */
export function separatorsFor(locale: string): NumericSeparators {
    const cached = separatorCache.get(locale)
    if (cached) {
        return cached
    }

    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6)
    const separators: NumericSeparators = {
        decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
        group: parts.find((part) => part.type === 'group')?.value ?? ',',
    }

    separatorCache.set(locale, separators)

    return separators
}

/**
 * Turns user input into a number. Returns null for anything that is not a
 * usable value, so callers can distinguish "empty" from "zero".
 */
export function parseNumeric(raw: string, locale: string): number | null {
    if (raw.trim() === '') {
        return null
    }

    const { decimal, group } = separatorsFor(locale)

    let cleaned = raw.trim()

    // Strip everything that cannot be part of a number: currency symbols,
    // units, whitespace (including the narrow no-break space fr-FR groups with).
    cleaned = cleaned.replace(new RegExp(`[^0-9\\-+${escapeForClass(decimal)}${escapeForClass(group)}]`, 'g'), '')

    cleaned = cleaned.split(group).join('')

    if (decimal !== '.') {
        cleaned = cleaned.split(decimal).join('.')
    }

    // A lone sign, or a stray separator, is not a number yet.
    if (cleaned === '' || cleaned === '-' || cleaned === '+' || cleaned === '.') {
        return null
    }

    const parsed = Number(cleaned)

    return Number.isFinite(parsed) ? parsed : null
}

export function formatNumeric(value: number, options: NumericOptions): string {
    const format: Intl.NumberFormatOptions = {
        useGrouping: options.grouping,
    }

    if (options.decimals !== undefined) {
        format.minimumFractionDigits = options.decimals
        format.maximumFractionDigits = options.decimals
    } else {
        format.maximumFractionDigits = 20
    }

    const body = new Intl.NumberFormat(options.locale, format).format(value)

    return `${options.prefix ?? ''}${body}${options.suffix ?? ''}`
}

export function clampNumeric(value: number, min?: number, max?: number): number {
    if (min !== undefined && value < min) {
        return min
    }

    if (max !== undefined && value > max) {
        return max
    }

    return value
}

/**
 * Steps a value up or down, snapping to the step grid relative to min so that
 * stepping from an off-grid value lands on a round number.
 */
export function stepNumeric(value: number | null, direction: 1 | -1, options: NumericOptions): number {
    const { step, min, max } = options
    const base = min ?? 0

    if (value === null) {
        return clampNumeric(min ?? 0, min, max)
    }

    const steps = (value - base) / step
    // Nudge off exact boundaries so repeated clicks always move.
    const target = direction === 1 ? Math.floor(steps + 1e-9) + 1 : Math.ceil(steps - 1e-9) - 1

    return clampNumeric(roundFloat(base + target * step), min, max)
}

/**
 * Floating point cleanup: 0.1 + 0.2 must display as 0.3, not 0.30000000000000004.
 */
export function roundFloat(value: number): number {
    return Number(value.toPrecision(15))
}

function escapeForClass(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\\-]/g, '\\$&')
}
