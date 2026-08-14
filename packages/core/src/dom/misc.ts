import { t } from '../headless/i18n.js'
import { getStoredScheme, setScheme, type ColorScheme } from '../headless/theme.js'
import { bind, readString } from './helpers.js'

/*
 * The small bindings: dismissible alerts, password reveal and theme switching.
 */

const dismissSeen = new WeakSet<Element>()
const passwordSeen = new WeakSet<Element>()
const themeSeen = new WeakSet<Element>()
const navigateSeen = new WeakSet<Element>()

export function initDismissables(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-dismiss]', dismissSeen, (button) => {
        button.addEventListener('click', () => {
            const selector = readString(button, 'meDismiss')
            const target = selector ? document.querySelector(selector) : button.closest('.me-alert')

            target?.remove()
        })
    })
}

export function initPasswordToggles(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-password-toggle]', passwordSeen, (button) => {
        const group = button.closest('.me-input-group')
        const input = group?.querySelector<HTMLInputElement>('input')

        if (!input) {
            return
        }

        const showLabel = readString(button, 'labelShow') ?? t('password.show')
        const hideLabel = readString(button, 'labelHide') ?? t('password.hide')

        button.setAttribute('aria-label', showLabel)

        button.addEventListener('click', () => {
            const revealed = input.type === 'text'

            input.type = revealed ? 'password' : 'text'
            button.dataset.revealed = String(!revealed)
            button.setAttribute('aria-label', revealed ? showLabel : hideLabel)

            // Keep the caret where the user left it.
            input.focus()
            const end = input.value.length
            input.setSelectionRange(end, end)
        })
    })
}

/*
 * A select whose options are URLs — the page-size picker. Changing it navigates,
 * so no separate "go" button is needed. It sits inside a form, so it still works
 * (via submit) when scripting is off.
 */
export function initNavigateSelects(root: ParentNode = document): void {
    bind<HTMLSelectElement>(root, 'select[data-me-navigate]', navigateSeen, (select) => {
        select.addEventListener('change', () => {
            if (select.value !== '') {
                window.location.href = select.value
            }
        })
    })
}

export function initThemeToggles(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-theme]', themeSeen, (element) => {
        const target = readString(element, 'meTheme')

        element.addEventListener('click', () => {
            // An explicit value sets that scheme; no value cycles all three.
            if (target === 'light' || target === 'dark' || target === 'system') {
                setScheme(target)

                return
            }

            setScheme(resolveNext(getStoredScheme()))
        })

        syncPressedState(element)
        document.addEventListener('my-eyes:theme-change', () => syncPressedState(element))
    })
}

/*
 * system -> light -> dark -> system.
 *
 * System is in the cycle rather than being an escape hatch buried in settings:
 * it is the default, and a user who has picked light or dark needs a way back
 * to "follow my OS" without clearing site data.
 */
function resolveNext(current: ColorScheme): ColorScheme {
    return current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system'
}

function syncPressedState(element: HTMLElement): void {
    const target = readString(element, 'meTheme')

    if (target === undefined) {
        return
    }

    element.setAttribute('aria-pressed', String(getStoredScheme() === target))
}
