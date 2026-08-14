import { createDismissable } from '../headless/dismissable.js'
import { bind } from './helpers.js'

/*
 * Dropdown binding.
 *
 * Markup contract:
 *   <div class="me-dropdown" data-me-dropdown>
 *     <button data-me-dropdown-trigger>...</button>
 *     <div class="me-dropdown__panel" data-me-dropdown-panel role="menu">...</div>
 *   </div>
 */

const seen = new WeakSet<Element>()

export function initDropdowns(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-dropdown]', seen, setup)
}

function setup(container: HTMLElement): void {
    const trigger = container.querySelector<HTMLElement>('[data-me-dropdown-trigger]')
    const panel = container.querySelector<HTMLElement>('[data-me-dropdown-panel]')

    if (!trigger || !panel) {
        return
    }

    const dismissable = createDismissable({
        trigger,
        panel,
        flip: true,
        // A menu is a list of links and buttons: tabbing out of it should close.
        closeOnFocusOut: true,
        onChange: (open) => {
            container.dataset.open = String(open)

            if (open) {
                // Move focus into the menu so arrow keys and Tab work from here.
                panel.querySelector<HTMLElement>('[role="menuitem"], a, button')?.focus()
            }
        },
    })

    trigger.setAttribute('aria-haspopup', 'menu')
    container.dataset.open = 'false'

    /*
     * Choosing an item closes the menu. Items that only toggle something
     * (a theme switch, a checkbox row) can opt out with data-me-keep-open.
     */
    panel.addEventListener('click', (event: MouseEvent) => {
        const target = event.target
        if (!(target instanceof Element)) {
            return
        }

        const item = target.closest<HTMLElement>('.me-dropdown__item')
        if (item && item.dataset.meKeepOpen === undefined) {
            dismissable.close()
        }
    })

    // Roving focus between items, as expected of a menu.
    panel.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
            return
        }

        event.preventDefault()

        const items = Array.from(panel.querySelectorAll<HTMLElement>('.me-dropdown__item:not([aria-disabled="true"])'))
        if (items.length === 0) {
            return
        }

        const current = items.findIndex((item) => item === document.activeElement)
        const offset = event.key === 'ArrowDown' ? 1 : -1
        const next = items[(current + offset + items.length) % items.length]

        next?.focus()
    })
}
