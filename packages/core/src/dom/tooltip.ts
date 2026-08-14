import { bind } from './helpers.js'

/*
 * Tooltip binding.
 *
 * One tooltip element is created for the whole page and moved between triggers.
 * Living at the end of <body> rather than beside the trigger is what keeps it
 * from being clipped by an `overflow: hidden` ancestor, which is the usual way
 * tooltips break inside tables and cards.
 *
 *   <button data-me-tooltip="Delete order" data-tooltip-placement="top">
 *
 * Shown on hover and on keyboard focus, and wired with aria-describedby so it
 * is announced rather than being decoration only.
 */

const seen = new WeakSet<Element>()

type Placement = 'top' | 'bottom' | 'start' | 'end'

const GAP = 8
const EDGE = 8
const OPEN_DELAY = 120

let tooltip: HTMLElement | null = null
let activeTrigger: HTMLElement | null = null
let openTimer: number | undefined

function element(): HTMLElement {
    if (tooltip) {
        return tooltip
    }

    tooltip = document.createElement('div')
    tooltip.className = 'me-tooltip'
    tooltip.id = 'me-tooltip'
    tooltip.setAttribute('role', 'tooltip')
    tooltip.dataset.open = 'false'
    document.body.append(tooltip)

    return tooltip
}

export function initTooltips(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-tooltip]', seen, (trigger) => {
        const show = (): void => {
            window.clearTimeout(openTimer)
            openTimer = window.setTimeout(() => open(trigger), OPEN_DELAY)
        }

        const hide = (): void => {
            window.clearTimeout(openTimer)
            close(trigger)
        }

        trigger.addEventListener('mouseenter', show)
        trigger.addEventListener('mouseleave', hide)

        /*
         * focusin/focusout rather than focus/blur: they bubble, so a wrapper
         * carrying the tooltip still reacts when the button inside it is
         * focused. Keyboard users get the tooltip without any hover.
         */
        trigger.addEventListener('focusin', () => open(trigger))
        trigger.addEventListener('focusout', hide)

        // Escape must dismiss it, same as any other transient overlay.
        trigger.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                hide()
            }
        })
    })
}

function open(trigger: HTMLElement): void {
    const text = trigger.dataset.meTooltip

    if (!text) {
        return
    }

    const node = element()
    node.textContent = text
    node.dataset.open = 'true'
    activeTrigger = trigger

    trigger.setAttribute('aria-describedby', node.id)

    position(node, trigger, readPlacement(trigger))
}

function close(trigger: HTMLElement): void {
    if (activeTrigger !== trigger) {
        return
    }

    const node = element()
    node.dataset.open = 'false'
    activeTrigger = null
    trigger.removeAttribute('aria-describedby')
}

function readPlacement(trigger: HTMLElement): Placement {
    const requested = trigger.dataset.tooltipPlacement

    return requested === 'bottom' || requested === 'start' || requested === 'end' ? requested : 'top'
}

/**
 * Places the tooltip, flipping to the opposite side when the preferred one does
 * not fit, and nudging it back inside the viewport if it would overhang. The
 * arrow is then pointed back at the trigger, so it still lines up after a nudge.
 */
function position(node: HTMLElement, trigger: HTMLElement, preferred: Placement): void {
    // Measure before positioning: the element must be laid out to have a size.
    node.dataset.placement = preferred

    const anchor = trigger.getBoundingClientRect()
    const size = node.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight

    let placement = preferred

    if (placement === 'top' && anchor.top - size.height - GAP < EDGE) {
        placement = 'bottom'
    } else if (placement === 'bottom' && anchor.bottom + size.height + GAP > viewportHeight - EDGE) {
        placement = 'top'
    } else if (placement === 'start' && anchor.left - size.width - GAP < EDGE) {
        placement = 'end'
    } else if (placement === 'end' && anchor.right + size.width + GAP > viewportWidth - EDGE) {
        placement = 'start'
    }

    node.dataset.placement = placement

    let left: number
    let top: number

    if (placement === 'top' || placement === 'bottom') {
        left = anchor.left + anchor.width / 2 - size.width / 2
        top = placement === 'top' ? anchor.top - size.height - GAP : anchor.bottom + GAP
    } else {
        left = placement === 'start' ? anchor.left - size.width - GAP : anchor.right + GAP
        top = anchor.top + anchor.height / 2 - size.height / 2
    }

    const clampedLeft = clamp(left, EDGE, viewportWidth - size.width - EDGE)
    const clampedTop = clamp(top, EDGE, viewportHeight - size.height - EDGE)

    node.style.transform = ''
    node.style.left = `${clampedLeft}px`
    node.style.top = `${clampedTop}px`

    // Keep the arrow on the trigger even when the body was clamped sideways.
    if (placement === 'top' || placement === 'bottom') {
        const arrow = anchor.left + anchor.width / 2 - clampedLeft
        node.style.setProperty('--me-tooltip-arrow', `${clamp(arrow, 10, size.width - 10)}px`)
    } else {
        const arrow = anchor.top + anchor.height / 2 - clampedTop
        node.style.setProperty('--me-tooltip-arrow', `${clamp(arrow, 10, size.height - 10)}px`)
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), Math.max(min, max))
}
