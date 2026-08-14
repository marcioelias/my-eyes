import { bind } from './helpers.js'

/*
 * Admin shell behaviour: the mobile drawer, the desktop collapsed rail and the
 * expanding nav groups.
 *
 * All state is expressed as data attributes on .me-shell, which is what the CSS
 * reads. The collapsed preference is persisted; the drawer state is not, since
 * a drawer that is open on arrival would cover the page.
 */

const COLLAPSE_KEY = 'my-eyes:sidebar-collapsed'

const shellSeen = new WeakSet<Element>()
const groupSeen = new WeakSet<Element>()

export function initShell(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-shell]', shellSeen, setupShell)
    bind<HTMLElement>(root, '[data-me-nav-group]', groupSeen, setupNavGroup)
}

function setupShell(shell: HTMLElement): void {
    const sidebar = shell.querySelector<HTMLElement>('[data-me-sidebar]')

    const setDrawer = (open: boolean): void => {
        shell.dataset.sidebarOpen = String(open)

        // The page behind a drawer must not scroll.
        document.body.style.overflow = open ? 'hidden' : ''

        shell.querySelectorAll<HTMLElement>('[data-me-sidebar-toggle]').forEach((toggle) => {
            toggle.setAttribute('aria-expanded', String(open))
        })

        if (open) {
            sidebar?.querySelector<HTMLElement>('a, button')?.focus()
        }
    }

    const setCollapsed = (collapsed: boolean): void => {
        shell.dataset.sidebarCollapsed = String(collapsed)

        try {
            localStorage.setItem(COLLAPSE_KEY, String(collapsed))
        } catch {
            // Preference does not persist; the toggle still works this session.
        }
    }

    shell.querySelectorAll<HTMLElement>('[data-me-sidebar-toggle]').forEach((toggle) => {
        toggle.addEventListener('click', () => {
            setDrawer(shell.dataset.sidebarOpen !== 'true')
        })
    })

    shell.querySelectorAll<HTMLElement>('[data-me-sidebar-close]').forEach((element) => {
        element.addEventListener('click', () => setDrawer(false))
    })

    shell.querySelectorAll<HTMLElement>('[data-me-sidebar-collapse]').forEach((toggle) => {
        toggle.addEventListener('click', () => {
            setCollapsed(shell.dataset.sidebarCollapsed !== 'true')
        })
    })

    document.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape' && shell.dataset.sidebarOpen === 'true') {
            setDrawer(false)
        }
    })

    // Following a link inside the drawer should close it.
    sidebar?.addEventListener('click', (event: MouseEvent) => {
        const target = event.target
        if (target instanceof Element && target.closest('a') && shell.dataset.sidebarOpen === 'true') {
            setDrawer(false)
        }
    })

    /*
     * Leaving mobile width with the drawer open would otherwise strand
     * body overflow: hidden on a desktop layout.
     */
    const desktop = window.matchMedia('(min-width: 1024px)')
    desktop.addEventListener('change', (event) => {
        if (event.matches && shell.dataset.sidebarOpen === 'true') {
            setDrawer(false)
        }
    })

    try {
        if (localStorage.getItem(COLLAPSE_KEY) === 'true') {
            shell.dataset.sidebarCollapsed = 'true'
        }
    } catch {
        // No stored preference available; start expanded.
    }

    shell.dataset.sidebarOpen ??= 'false'
    shell.dataset.sidebarCollapsed ??= 'false'
}

function setupNavGroup(group: HTMLElement): void {
    const trigger = group.querySelector<HTMLElement>('[data-me-nav-trigger]')

    if (!trigger) {
        return
    }

    // A group containing the current page starts open.
    const open = group.dataset.open === 'true' || group.querySelector('[aria-current]') !== null

    group.dataset.open = String(open)
    trigger.setAttribute('aria-expanded', String(open))

    trigger.addEventListener('click', () => {
        const next = group.dataset.open !== 'true'
        group.dataset.open = String(next)
        trigger.setAttribute('aria-expanded', String(next))
    })
}
