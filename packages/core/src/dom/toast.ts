import { t } from '../headless/i18n.js'
import { bind } from './helpers.js'

/*
 * Toast notifications.
 *
 * One container per screen position, created on demand. The countdown is a CSS
 * animation rather than a JS timer, and the close is scheduled from that
 * animation's `animationend` — so pausing the bar on hover pauses the dismissal
 * too, and the bar can never disagree with when the toast actually goes away.
 *
 *   myEyes.toast({ variant: 'success', title: 'Saved', text: '...' })
 *   myEyes.toast({ text: 'Upload failed', variant: 'danger', duration: 0 })
 */

export type ToastVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'

export type ToastPosition =
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end'

export interface ToastOptions {
    text: string
    title?: string
    variant?: ToastVariant
    position?: ToastPosition
    /** Milliseconds on screen. 0 (or less) keeps it until dismissed. */
    duration?: number
    /** Show the close button. Forced on for toasts that never expire. */
    dismissible?: boolean
}

export interface Toast {
    element: HTMLElement
    close: () => void
}

const DEFAULT_DURATION = 5000
const DEFAULT_POSITION: ToastPosition = 'top-end'

const ICONS: Record<ToastVariant, string> = {
    success: '<path d="m4 10 4 4 8-8"/>',
    danger: '<path d="M10 5v6"/><path d="M10 14h.01"/>',
    warning: '<path d="M10 5v6"/><path d="M10 14h.01"/>',
    info: '<path d="M10 9v6"/><path d="M10 5h.01"/>',
    primary: '<path d="M10 9v6"/><path d="M10 5h.01"/>',
    neutral: '<path d="M10 9v6"/><path d="M10 5h.01"/>',
}

function container(position: ToastPosition): HTMLElement {
    const existing = document.querySelector<HTMLElement>(`.me-toasts[data-position="${position}"]`)

    if (existing) {
        return existing
    }

    const element = document.createElement('div')
    element.className = 'me-toasts'
    element.dataset.position = position

    // Announced politely: a toast should not interrupt what is being read.
    element.setAttribute('role', 'status')
    element.setAttribute('aria-live', 'polite')

    document.body.append(element)

    return element
}

export function toast(options: ToastOptions): Toast {
    const variant = options.variant ?? 'neutral'
    const duration = options.duration ?? DEFAULT_DURATION
    const persistent = duration <= 0
    const dismissible = options.dismissible ?? true

    const element = document.createElement('div')
    element.className = `me-toast${variant === 'neutral' ? '' : ` me-toast--${variant}`}`

    const icon = document.createElement('span')
    icon.className = 'me-toast__icon'
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[variant]}</svg>`
    element.append(icon)

    const body = document.createElement('div')
    body.className = 'me-toast__body'

    if (options.title) {
        const title = document.createElement('p')
        title.className = 'me-toast__title'
        title.textContent = options.title
        body.append(title)
    }

    const text = document.createElement('p')
    text.className = 'me-toast__text'
    text.textContent = options.text
    body.append(text)

    element.append(body)

    const close = (): void => {
        if (element.dataset.closing === 'true') {
            return
        }

        element.dataset.closing = 'true'
        element.addEventListener('animationend', () => element.remove(), { once: true })
    }

    // A toast that never expires must always offer a way out.
    if (dismissible || persistent) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'me-toast__close'
        button.setAttribute('aria-label', t('toast.close'))
        button.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>'
        button.addEventListener('click', close)
        element.append(button)
    }

    if (!persistent) {
        const progress = document.createElement('span')
        progress.className = 'me-toast__progress'
        progress.style.setProperty('--me-toast-duration', `${duration}ms`)

        /*
         * The bar finishing IS the timeout. Using a separate setTimeout would
         * drift apart from the animation as soon as hovering paused one but not
         * the other.
         */
        progress.addEventListener('animationend', close)
        element.append(progress)
    }

    container(options.position ?? DEFAULT_POSITION).append(element)

    return { element, close }
}

/*
 * Server-rendered toasts. The Blade component drops a script-free payload into
 * the page and this picks it up, so a flashed session message and a client-side
 * call produce exactly the same toast.
 */
const seen = new WeakSet<Element>()

export function initToasts(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-toast]', seen, (node) => {
        const duration = Number(node.dataset.duration ?? DEFAULT_DURATION)

        toast({
            text: node.dataset.text ?? node.textContent?.trim() ?? '',
            ...(node.dataset.title ? { title: node.dataset.title } : {}),
            variant: (node.dataset.variant as ToastVariant | undefined) ?? 'neutral',
            position: (node.dataset.position as ToastPosition | undefined) ?? DEFAULT_POSITION,
            duration: Number.isFinite(duration) ? duration : DEFAULT_DURATION,
            dismissible: node.dataset.dismissible !== 'false',
        })

        // The payload is data, not content — remove it once consumed.
        node.remove()
    })
}
