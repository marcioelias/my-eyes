'use client'

import { initDropdowns, initModals, initToasts, initTooltips, openModal, t, toast, type ToastOptions } from '@my-eyes/core'
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from './cx.js'
import { MeIcon, type LinkAs, type Tone } from './primitives.js'

/**
 * Overlays.
 *
 * All four carry real behaviour — anchoring, dismissal, focus handling, the
 * escape key — and none of it is reimplemented here. Each component renders the
 * markup the Blade equivalent renders and binds its own element through
 * `@my-eyes/core`, so a dropdown behaves identically in all four renderers.
 *
 * @see docs/features/react-package.md
 */

export interface MeDropdownProps extends HTMLAttributes<HTMLDivElement> {
    align?: 'start' | 'end'
    /** Pins the panel to the bottom of the viewport on phones. */
    sheet?: boolean
    trigger?: ReactNode
    /**
     * Read-only, deliberately. The trigger lives inside this component, so a
     * menu is opened by the user rather than by the application — but knowing
     * that it opened is occasionally useful (loading its contents lazily).
     */
    onOpenChange?: (open: boolean) => void
}

export function MeDropdown({
    align = 'end',
    sheet = true,
    trigger,
    onOpenChange,
    className,
    children,
    ...rest
}: MeDropdownProps) {
    const host = useRef<HTMLDivElement | null>(null)
    const notify = useRef(onOpenChange)
    notify.current = onOpenChange

    useEffect(() => {
        const element = host.current

        if (!element) {
            return
        }

        initDropdowns(element)

        // The binding records the state in data-open; watching the attribute
        // avoids duplicating the dismissal logic here.
        const observer = new MutationObserver(() => {
            notify.current?.(element.dataset.open === 'true')
        })

        observer.observe(element, { attributes: true, attributeFilter: ['data-open'] })

        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={host}
            className={cx('me-dropdown', className)}
            data-me-dropdown=""
            data-open="false"
            {...rest}
        >
            <div data-me-dropdown-trigger="">{trigger}</div>

            <div
                className={cx(
                    'me-dropdown__panel',
                    align === 'start' && 'me-dropdown__panel--start',
                    sheet && 'me-dropdown__panel--sheet',
                )}
                data-me-dropdown-panel=""
                role="menu"
            >
                {children}
            </div>
        </div>
    )
}

export interface MeDropdownItemProps extends Omit<HTMLAttributes<HTMLElement>, 'type'> {
    href?: string | null
    icon?: string | null
    variant?: string | null
    /** Leaves the menu open after activation — a theme switcher wants this. */
    keepOpen?: boolean
    type?: 'button' | 'submit'
    as?: LinkAs | undefined
}

export function MeDropdownItem({
    href = null,
    icon: iconName = null,
    variant = null,
    keepOpen = false,
    type = 'button',
    as,
    className,
    children,
    ...rest
}: MeDropdownItemProps) {
    const shared = {
        className: cx('me-dropdown__item', variant && `me-dropdown__item--${variant}`, className),
        role: 'menuitem',
        'data-me-keep-open': keepOpen ? '' : undefined,
    }

    const content = (
        <>
            {iconName ? <MeIcon name={iconName} /> : null}
            {children}
        </>
    )

    if (href !== null) {
        const Component = as ?? 'a'

        return (
            <Component href={href} {...shared} {...rest}>
                {content}
            </Component>
        )
    }

    return (
        <button type={type} {...shared} {...rest}>
            {content}
        </button>
    )
}

export interface MeDropdownHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    title?: string | null
    meta?: string | null
}

export function MeDropdownHeader({ title = null, meta = null, className, children, ...rest }: MeDropdownHeaderProps) {
    return (
        <div className={cx('me-dropdown__header', className)} {...rest}>
            {title ? <p className="me-dropdown__header-title">{title}</p> : null}
            {meta ? <p className="me-dropdown__header-meta">{meta}</p> : null}
            {children}
        </div>
    )
}

export function MeDropdownDivider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
    return <hr className={cx('me-dropdown__divider', className)} {...rest} />
}

const MODAL_ICONS: Record<string, string> = {
    danger: 'alert-triangle',
    warning: 'alert-triangle',
    success: 'check-circle',
}

export interface MeModalProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title' | 'onClose'> {
    id: string
    variant?: Tone
    icon?: string | false | null
    title?: string | null
    confirm?: string | null
    cancel?: string | null
    align?: 'center' | 'start'
    size?: string | null
    /** Refuses to close on a backdrop click or Escape. Always pair with a cancel. */
    static?: boolean
    /**
     * Controlled openness.
     *
     * Leave it out to drive the dialog the Blade way instead, with
     * `data-me-modal-open="<id>"` on any element. Both work; a React application
     * usually already holds the boolean.
     */
    open?: boolean
    onConfirm?: () => void
    onClose?: () => void
    onOpenChange?: (open: boolean) => void
}

/**
 * Confirmation modal, on the native `<dialog>` element.
 *
 * Dismissal is reported through `onClose` and `onOpenChange` however it
 * happened, so a parent's boolean cannot be left stuck on true.
 *
 * Confirming calls `onConfirm`. There is no form and no CSRF token here, because
 * a React application submits through its own client rather than a browser form
 * post.
 */
export function MeModal({
    id,
    variant = 'primary',
    icon: iconName = null,
    title = null,
    confirm = null,
    cancel = null,
    align = 'center',
    size = null,
    static: isStatic = false,
    open,
    onConfirm,
    onClose,
    onOpenChange,
    className,
    children,
    ...rest
}: MeModalProps) {
    const host = useRef<HTMLDialogElement | null>(null)
    const handlers = useRef({ onClose, onOpenChange })
    handlers.current = { onClose, onOpenChange }

    useEffect(() => {
        const dialog = host.current

        if (!dialog) {
            return
        }

        initModals(dialog.parentElement ?? document)

        /*
         * <dialog> fires `close` however it was dismissed — Escape, a click on
         * the backdrop, or a cancel button. Forwarding it is what keeps a
         * parent's boolean from being left stuck on true.
         */
        const onNativeClose = (): void => {
            handlers.current.onClose?.()
            handlers.current.onOpenChange?.(false)
        }

        dialog.addEventListener('close', onNativeClose)

        return () => dialog.removeEventListener('close', onNativeClose)
    }, [])

    useEffect(() => {
        const dialog = host.current

        if (!dialog || open === undefined) {
            return
        }

        if (open && !dialog.open) {
            openModal(dialog)
        } else if (!open && dialog.open) {
            dialog.close()
        }
    }, [open])

    const resolvedIcon = iconName === null ? (MODAL_ICONS[variant] ?? 'info') : iconName
    // The confirm button follows the modal's role, so a destructive
    // confirmation cannot end up with a friendly blue button.
    const confirmVariant = variant === 'primary' ? 'primary' : variant

    return (
        <dialog
            ref={host}
            id={id}
            className={cx(
                'me-modal',
                variant !== 'primary' && `me-modal--${variant}`,
                align === 'start' && 'me-modal--start',
                size && `me-modal--${size}`,
                className,
            )}
            aria-labelledby={`${id}-title`}
            data-me-modal-static={isStatic ? 'true' : undefined}
            {...rest}
        >
            <div className="me-modal__panel">
                {resolvedIcon === false ? null : (
                    <span className="me-modal__icon">
                        <MeIcon name={resolvedIcon} />
                    </span>
                )}

                {title ? (
                    <h2 className="me-modal__title" id={`${id}-title`}>
                        {title}
                    </h2>
                ) : null}

                {children ? <p className="me-modal__text">{children}</p> : null}

                <div className="me-modal__actions">
                    {cancel ? (
                        <button type="button" className="me-btn me-btn--secondary me-btn--md" data-me-modal-close="">
                            {cancel}
                        </button>
                    ) : null}

                    <button
                        type="button"
                        className={cx('me-btn', `me-btn--${confirmVariant}`, 'me-btn--md')}
                        data-me-modal-initial=""
                        data-me-modal-close=""
                        onClick={() => onConfirm?.()}
                    >
                        {confirm ?? 'OK'}
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export interface MeTooltipProps extends HTMLAttributes<HTMLSpanElement> {
    text: string
    placement?: 'top' | 'bottom' | 'start' | 'end'
}

/**
 * Wraps anything in a tooltip. On an element you already control, skip the
 * wrapper and put `data-me-tooltip` on it directly.
 */
export function MeTooltip({ text, placement = 'top', className, children, ...rest }: MeTooltipProps) {
    const host = useRef<HTMLSpanElement | null>(null)

    useEffect(() => {
        if (host.current) {
            initTooltips(host.current.parentElement ?? document)
        }
    }, [])

    return (
        <span
            ref={host}
            className={cx('me-tooltip-trigger', className)}
            data-me-tooltip={text}
            data-tooltip-placement={placement}
            {...rest}
        >
            {children}
        </span>
    )
}

/**
 * The toast container. Place it once in the layout; raise toasts from anywhere
 * with `useToasts()`.
 */
export function MeToasts({ position = 'top-end' }: { position?: string }) {
    const host = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (host.current) {
            initToasts(host.current.parentElement ?? document)
        }
    }, [])

    return (
        <div ref={host} className="me-toasts" data-position={position} role="status" aria-live="polite" />
    )
}

/**
 * Programmatic toasts.
 *
 * A thin pass-through to the core API, so a component does not have to import
 * from two packages to raise one.
 */
export function useToasts(): {
    toast: (options: ToastOptions) => void
    success: (text: string, title?: string) => void
    danger: (text: string, title?: string) => void
    warning: (text: string, title?: string) => void
    info: (text: string, title?: string) => void
} {
    const raise = (variant: NonNullable<ToastOptions['variant']>) => (text: string, title?: string) => {
        toast(title === undefined ? { text, variant } : { text, variant, title })
    }

    return {
        toast: (options) => void toast(options),
        success: raise('success'),
        danger: raise('danger'),
        warning: raise('warning'),
        info: raise('info'),
    }
}

/** Re-exported so a translated close label reaches the toast markup. */
export const toastCloseLabel = (): string => t('toast.close')
