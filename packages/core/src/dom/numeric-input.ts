import {
    clampNumeric,
    formatNumeric,
    parseNumeric,
    stepNumeric,
    type NumericOptions,
} from '../headless/numeric.js'
import { bind, documentLocale, emitInput, readBoolean, readNumber, readString, setNativeValue } from './helpers.js'

/*
 * Numeric input binding.
 *
 * Two inputs are involved, and the split matters:
 *
 *   - the visible one is formatted for humans ("1.234,56") and carries no name
 *   - the hidden one carries the field name and a raw value ("1234.56")
 *
 * The server therefore never has to parse a localised string, and the raw value
 * is already correct on first render — so a form still submits the initial
 * value if JavaScript never runs.
 */

const seen = new WeakSet<Element>()

export function initNumericInputs(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-numeric]', seen, setup)
}

function setup(container: HTMLElement): void {
    const display = container.querySelector<HTMLInputElement>('[data-me-numeric-display]')
    const hidden = container.querySelector<HTMLInputElement>('[data-me-numeric-value]')

    if (!display || !hidden) {
        return
    }

    const options: NumericOptions = {
        locale: readString(container, 'locale') ?? documentLocale(),
        step: readNumber(container, 'step') ?? 1,
        grouping: readBoolean(container, 'grouping', true),
    }

    const decimals = readNumber(container, 'decimals')
    const min = readNumber(container, 'min')
    const max = readNumber(container, 'max')
    const prefix = readString(container, 'prefix')
    const suffix = readString(container, 'suffix')

    if (decimals !== undefined) options.decimals = decimals
    if (min !== undefined) options.min = min
    if (max !== undefined) options.max = max
    if (prefix !== undefined) options.prefix = prefix
    if (suffix !== undefined) options.suffix = suffix

    const currentValue = (): number | null => parseNumeric(hidden.value, 'en')

    const commit = (value: number | null, formatDisplay: boolean): void => {
        if (value === null) {
            setNativeValue(hidden, '')
            if (formatDisplay) {
                display.value = ''
            }
            emitInput(hidden)
            updateStepperState(null)

            return
        }

        const clamped = clampNumeric(value, options.min, options.max)
        const rounded = options.decimals === undefined ? clamped : Number(clamped.toFixed(options.decimals))

        setNativeValue(hidden, String(rounded))

        if (formatDisplay) {
            display.value = formatNumeric(rounded, options)
        }

        emitInput(hidden)
        updateStepperState(rounded)
    }

    const updateStepperState = (value: number | null): void => {
        const up = container.querySelector<HTMLButtonElement>('[data-me-step-up]')
        const down = container.querySelector<HTMLButtonElement>('[data-me-step-down]')

        if (up) {
            up.disabled = value !== null && options.max !== undefined && value >= options.max
        }

        if (down) {
            down.disabled = value !== null && options.min !== undefined && value <= options.min
        }
    }

    /*
     * While typing, the raw value is kept in sync but the display is left
     * alone — reformatting mid-entry moves the caret and fights the user.
     * Formatting happens on blur.
     */
    display.addEventListener('input', () => {
        const parsed = parseNumeric(display.value, options.locale)
        commit(parsed, false)
    })

    display.addEventListener('blur', () => {
        const parsed = parseNumeric(display.value, options.locale)
        commit(parsed, true)
    })

    display.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            return
        }

        event.preventDefault()
        commit(stepNumeric(currentValue(), event.key === 'ArrowUp' ? 1 : -1, options), true)
    })

    container.querySelector('[data-me-step-up]')?.addEventListener('click', () => {
        commit(stepNumeric(currentValue(), 1, options), true)
        display.focus()
    })

    container.querySelector('[data-me-step-down]')?.addEventListener('click', () => {
        commit(stepNumeric(currentValue(), -1, options), true)
        display.focus()
    })

    // Format whatever the server rendered, without firing change events.
    const initial = currentValue()
    if (initial !== null) {
        display.value = formatNumeric(initial, options)
    }
    updateStepperState(initial)
}
