/*
 * Open/close behaviour shared by dropdowns, the mobile sidebar and anything
 * else that closes on outside click or Escape.
 *
 * Deliberately not a floating-element engine: panels are positioned by CSS. The
 * only positioning done here is flipping a panel above its trigger when it
 * would overflow the viewport, which CSS cannot decide on its own.
 */

export interface DismissableOptions {
    trigger: HTMLElement
    panel: HTMLElement
    /** Receives the new state on every change — use it to sync data attributes. */
    onChange: (open: boolean) => void
    closeOnOutsideClick?: boolean
    closeOnEscape?: boolean
    /** Flip the panel above the trigger when it would overflow below. */
    flip?: boolean
    /**
     * Nudge the panel horizontally back inside the viewport when it overhangs.
     * The offset is written to --me-shift for the panel's transform to apply.
     */
    shift?: boolean
    /**
     * Close when focus leaves the panel — right for a menu, where tabbing past
     * the last item should dismiss.
     *
     * Off by default, and it must stay off for panels that re-render their
     * contents: replacing the focused element fires focusout with no
     * relatedTarget, which is indistinguishable from focus genuinely leaving.
     */
    closeOnFocusOut?: boolean
}

export interface Dismissable {
    readonly isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
    destroy: () => void
}

export function createDismissable(options: DismissableOptions): Dismissable {
    const { trigger, panel, onChange } = options
    const closeOnOutsideClick = options.closeOnOutsideClick ?? true
    const closeOnEscape = options.closeOnEscape ?? true
    const flip = options.flip ?? false
    const shift = options.shift ?? false
    const closeOnFocusOut = options.closeOnFocusOut ?? false

    let isOpen = false

    const setState = (next: boolean): void => {
        if (next === isOpen) {
            return
        }

        isOpen = next
        trigger.setAttribute('aria-expanded', String(next))
        onChange(next)

        if (next) {
            if (flip) {
                applyPlacement()
            }
            if (shift) {
                applyShift()
            }
            // Listen on the next frame, otherwise the click that opened the
            // panel immediately closes it again.
            requestAnimationFrame(() => {
                document.addEventListener('click', handleOutsideClick, true)
            })
        } else {
            document.removeEventListener('click', handleOutsideClick, true)
        }
    }

    const applyPlacement = (): void => {
        panel.removeAttribute('data-placement')

        const rect = panel.getBoundingClientRect()
        const triggerRect = trigger.getBoundingClientRect()
        const spaceBelow = window.innerHeight - triggerRect.bottom

        if (rect.height > spaceBelow && triggerRect.top > spaceBelow) {
            panel.setAttribute('data-placement', 'top')
        }
    }

    /**
     * Measures the panel and writes the correction needed to bring it back
     * inside the viewport.
     *
     * The shift is cleared before measuring, otherwise the previous correction
     * is baked into the rect and the offsets compound on every open.
     */
    const applyShift = (): void => {
        panel.style.setProperty('--me-shift', '0px')

        const rect = panel.getBoundingClientRect()
        const margin = 8
        const viewport = document.documentElement.clientWidth

        let offset = 0

        if (rect.left < margin) {
            offset = margin - rect.left
        } else if (rect.right > viewport - margin) {
            offset = viewport - margin - rect.right
        }

        panel.style.setProperty('--me-shift', `${Math.round(offset)}px`)
    }

    const handleOutsideClick = (event: MouseEvent): void => {
        if (!closeOnOutsideClick) {
            return
        }

        const target = event.target
        if (!(target instanceof Node)) {
            return
        }

        /*
         * An element that has left the document cannot be tested for
         * containment. This happens on every panel that re-renders from a
         * `change` handler: the select is replaced before its click arrives, so
         * the click looks like it came from outside. Ignoring detached targets
         * is what keeps such a panel from closing on its own controls.
         */
        if (!target.isConnected) {
            return
        }

        if (trigger.contains(target) || panel.contains(target)) {
            return
        }

        setState(false)
    }

    const handleKeydown = (event: KeyboardEvent): void => {
        if (!isOpen || !closeOnEscape || event.key !== 'Escape') {
            return
        }

        setState(false)
        // Escape should hand focus back to what opened the panel.
        trigger.focus()
    }

    const handleTriggerClick = (event: MouseEvent): void => {
        event.preventDefault()
        setState(!isOpen)
    }

    /*
     * Tabbing past the last item in the panel should close it. focusout fires
     * before the new element receives focus, so the target is read from the
     * event rather than document.activeElement.
     */
    const handleFocusOut = (event: FocusEvent): void => {
        if (!isOpen) {
            return
        }

        const next = event.relatedTarget

        /*
         * A null relatedTarget means focus went nowhere — which happens when
         * the focused element is removed by a re-render, not only when the user
         * leaves. Staying open is the safe reading.
         */
        if (next === null) {
            return
        }

        if (next instanceof Node && (panel.contains(next) || trigger.contains(next))) {
            return
        }

        setState(false)
    }

    trigger.addEventListener('click', handleTriggerClick)
    document.addEventListener('keydown', handleKeydown)

    if (closeOnFocusOut) {
        panel.addEventListener('focusout', handleFocusOut)
    }

    trigger.setAttribute('aria-expanded', 'false')

    return {
        get isOpen(): boolean {
            return isOpen
        },
        open: () => setState(true),
        close: () => setState(false),
        toggle: () => setState(!isOpen),
        destroy: () => {
            trigger.removeEventListener('click', handleTriggerClick)
            document.removeEventListener('keydown', handleKeydown)
            panel.removeEventListener('focusout', handleFocusOut)
            document.removeEventListener('click', handleOutsideClick, true)
        },
    }
}
