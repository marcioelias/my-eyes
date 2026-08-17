'use client'

import { hasIcon, icon, type IconName } from '@my-eyes/core'
import {
    forwardRef,
    type AnchorHTMLAttributes,
    type ButtonHTMLAttributes,
    type CSSProperties,
    type ElementType,
    type HTMLAttributes,
    type ReactNode,
    type Ref,
    type SVGAttributes,
} from 'react'
import { cx } from './cx.js'

/**
 * Display primitives.
 *
 * Every one of these is markup and a class name. That is the whole point of the
 * design system living in CSS: a component here carries no styling decision of
 * its own, so a React button and a Blade button cannot drift apart. The class
 * names mirror the Blade components exactly — if one needs a new visual, the
 * class is added to `@my-eyes/core/css` first.
 *
 * @see docs/features/react-package.md
 */

/**
 * What a component renders when it links somewhere.
 *
 * Defaults to a plain `<a>`, which is right for a React application with no
 * router and for a link that genuinely leaves the app. Pass Inertia's `Link`,
 * or your router's, to keep client-side navigation:
 *
 *   <MeNavItem as={Link} href="/domains">Domains</MeNavItem>
 *
 * The package deliberately does not detect the router in use. That would tie it
 * to one and break everyone on another.
 */
export type LinkAs = ElementType

export type Variant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'ghost'
    | 'link'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-success'
    | 'outline-danger'
    | 'outline-warning'
    | 'outline-info'

export type Tone = 'primary' | 'success' | 'danger' | 'warning' | 'info'

export type Size = 'xs' | 'sm' | 'md' | 'lg'

/*
 * The wrapper every icon is drawn into.
 *
 * Kept in one place so an icon supplied through children inherits the same
 * grid, weight and terminals as a bundled one. Hand-copying these into an
 * application is what makes a custom icon drift the day the design system
 * changes them.
 */
const SVG_ATTRS = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
} as const

/*
 * Warned names, so a name in a render loop reports once rather than on every
 * frame. Warning rather than throwing: an unknown icon is a mistake, but not
 * one worth taking a page down for.
 */
const warned = new Set<string>()

export interface MeIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children' | 'stroke'> {
    /** A bundled name, or one added through `registerIcons()`. */
    name?: IconName | ''
    stroke?: number | string
    /** The escape hatch: the inner geometry of a 24x24 drawing. */
    children?: ReactNode
}

export const MeIcon = forwardRef<SVGSVGElement, MeIconProps>(function MeIcon(
    { name = '', stroke = 1.75, children, ...rest },
    ref,
) {
    /*
     * Children win, and suppress the lookup entirely: pass the geometry and it
     * comes out wearing the same wrapper as every other icon.
     *
     *   <MeIcon><path d="M4 20h16" /></MeIcon>
     */
    if (children !== undefined) {
        return (
            <svg ref={ref} {...SVG_ATTRS} strokeWidth={stroke} {...rest}>
                {children}
            </svg>
        )
    }

    const geometry = hasIcon(name) ? icon(name) : ''

    /*
     * A typo used to render an empty <svg> — an invisible button, not an error.
     * TypeScript catches a literal, but the name is often computed, and the
     * registry is open by design so the type cannot be closed either. This is
     * the only guard left.
     */
    if (geometry === '' && !warned.has(name)) {
        warned.add(name)
        console.warn(
            `[my-eyes] Unknown icon "${name}". Register it with registerIcons(), `
                + 'or pass the geometry as children.',
        )
    }

    return (
        <svg
            ref={ref}
            {...SVG_ATTRS}
            strokeWidth={stroke}
            {...rest}
            // Registry content, never user input.
            dangerouslySetInnerHTML={{ __html: geometry }}
        />
    )
})

export interface MeButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>, 'type' | 'href'> {
    variant?: Variant
    size?: Size
    block?: boolean
    icon?: IconName | null
    /** Icon-only: drops the label spacing and squares the button. */
    iconOnly?: boolean
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    /** Renders a link instead, for a button that navigates. */
    href?: string | null
    as?: LinkAs | undefined
}

export const MeButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, MeButtonProps>(function MeButton(
    {
        variant = 'secondary',
        size = 'md',
        block = false,
        icon: iconName = null,
        iconOnly = false,
        loading = false,
        disabled = false,
        type = 'button',
        href = null,
        as,
        className,
        children,
        ...rest
    },
    ref,
) {
    const classes = cx(
        'me-btn',
        `me-btn--${variant}`,
        `me-btn--${size}`,
        block && 'me-btn--block',
        iconOnly && 'me-btn--icon',
        className,
    )

    const content = (
        <>
            {iconName ? <MeIcon name={iconName} /> : null}
            {children}
        </>
    )

    if (href !== null) {
        const Component = as ?? 'a'

        return (
            <Component ref={ref as Ref<HTMLAnchorElement>} href={href} className={classes} {...rest}>
                {content}
            </Component>
        )
    }

    return (
        <button
            ref={ref as Ref<HTMLButtonElement>}
            type={type}
            className={classes}
            disabled={disabled || loading}
            data-loading={loading ? 'true' : undefined}
            {...rest}
        >
            {content}
        </button>
    )
})

export interface MeBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: Tone | null
    icon?: IconName | null
    dot?: boolean
}

export function MeBadge({
    variant = null,
    icon: iconName = null,
    dot = false,
    className,
    children,
    ...rest
}: MeBadgeProps) {
    return (
        <span className={cx('me-badge', variant && `me-badge--${variant}`, className)} {...rest}>
            {dot ? (
                <span className={cx('me-dot', variant && `me-dot--${variant}`)} />
            ) : iconName ? (
                <MeIcon name={iconName} style={{ width: '0.875rem', height: '0.875rem' }} />
            ) : null}
            {children}
        </span>
    )
}

const ALERT_ICONS: Record<string, IconName> = {
    success: 'check-circle',
    danger: 'alert-circle',
    warning: 'alert-triangle',
}

export interface MeAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    variant?: Tone
    title?: string | null
    /** false removes the icon entirely, as in Blade. */
    icon?: IconName | false | null
    dismissible?: boolean
    dismissLabel?: string
    visible?: boolean
    onDismiss?: () => void
    /** The controlled counterpart of Vue's `v-model:visible`. */
    onVisibleChange?: (visible: boolean) => void
}

export function MeAlert({
    variant = 'info',
    title = null,
    icon: iconName = null,
    dismissible = false,
    dismissLabel = 'Dismiss',
    visible = true,
    onDismiss,
    onVisibleChange,
    className,
    children,
    ...rest
}: MeAlertProps) {
    if (!visible) {
        return null
    }

    const resolved = iconName === null ? (ALERT_ICONS[variant] ?? 'info') : iconName

    return (
        <div className={cx('me-alert', `me-alert--${variant}`, className)} role="alert" {...rest}>
            {resolved === false ? null : <MeIcon name={resolved} className="me-alert__icon" />}

            <div className="me-alert__body">
                {title ? <span className="me-alert__title">{title}</span> : null}
                <span className="me-alert__text">{children}</span>
            </div>

            {/*
             * Deliberately NOT data-me-dismiss. That binding removes the element
             * from the document, and this element belongs to React — tearing it
             * out from underneath corrupts the next render. React owns the
             * dismissal here, and the parent hears about it.
             */}
            {dismissible ? (
                <button
                    type="button"
                    className="me-alert__dismiss"
                    aria-label={dismissLabel}
                    onClick={() => {
                        onDismiss?.()
                        onVisibleChange?.(false)
                    }}
                >
                    <MeIcon name="x" />
                </button>
            ) : null}
        </div>
    )
}

export interface MeCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    title?: string | null
    description?: string | null
    /** Drops the body padding, for a card wrapping a table or a list. */
    flush?: boolean
    actions?: ReactNode
    footer?: ReactNode
}

export function MeCard({
    title = null,
    description = null,
    flush = false,
    actions,
    footer,
    className,
    children,
    ...rest
}: MeCardProps) {
    return (
        <div className={cx('me-card', className)} {...rest}>
            {title || description || actions ? (
                <div className="me-card__header">
                    <div>
                        {title ? <h2 className="me-card__title">{title}</h2> : null}
                        {description ? <p className="me-card__description">{description}</p> : null}
                    </div>
                    {actions ? <div className="me-card__header-actions">{actions}</div> : null}
                </div>
            ) : null}

            <div className="me-card__body" style={flush ? { padding: 0 } : undefined}>
                {children}
            </div>

            {footer ? <div className="me-card__footer me-card__footer--end">{footer}</div> : null}
        </div>
    )
}

export interface MeAvatarProps extends HTMLAttributes<HTMLSpanElement> {
    name?: string | null
    src?: string | null
    size?: string | null
    status?: string | null
}

export function MeAvatar({ name = null, src = null, size = null, status = null, className, ...rest }: MeAvatarProps) {
    const avatar = (
        <span
            className={cx('me-avatar', size && `me-avatar--${size}`, status ? undefined : className)}
            {...(status ? {} : rest)}
        >
            {src ? <img src={src} alt={name ?? ''} /> : initials(name ?? '')}
        </span>
    )

    if (!status) {
        return avatar
    }

    return (
        <span className={cx('me-avatar-wrap', className)} {...rest}>
            {avatar}
            <span className={cx('me-dot', `me-dot--${status}`)} />
        </span>
    )
}

/** First letter of the first and last word, so "Márcio Elias" becomes "ME". */
export function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean)

    if (words.length === 0) {
        return ''
    }

    if (words.length === 1) {
        return (words[0] ?? '').slice(0, 2).toUpperCase()
    }

    return ((words[0] ?? '').charAt(0) + (words[words.length - 1] ?? '').charAt(0)).toUpperCase()
}

export interface MeProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Omit for the indeterminate form — work whose length is unknown. */
    value?: number | null
    max?: number
    variant?: Tone | null
    size?: string | null
    label?: string | null
    showValue?: boolean
}

export function MeProgress({
    value = null,
    max = 100,
    variant = null,
    size = null,
    label = null,
    showValue = false,
    className,
    ...rest
}: MeProgressProps) {
    const indeterminate = value === null
    const percent = indeterminate ? 0 : clampPercent(value ?? 0, max)
    const hasHeader = Boolean(label) || (showValue && !indeterminate)

    return (
        <div className="me-progress-field">
            {hasHeader ? (
                <div className="me-progress-field__header">
                    <span className="me-progress-field__label">{label ?? ''}</span>
                    {showValue && !indeterminate ? (
                        <span className="me-progress-field__value">{`${Math.round(percent)}%`}</span>
                    ) : null}
                </div>
            ) : null}

            <div
                className={cx(
                    'me-progress',
                    variant && `me-progress--${variant}`,
                    size && `me-progress--${size}`,
                    indeterminate && 'me-progress--indeterminate',
                    className,
                )}
                role="progressbar"
                aria-valuenow={indeterminate ? undefined : (value ?? undefined)}
                aria-valuemin={indeterminate ? undefined : 0}
                aria-valuemax={indeterminate ? undefined : max}
                aria-label={label ?? undefined}
                style={{ '--me-progress': `${percent}%` } as CSSProperties}
                {...rest}
            >
                <span className="me-progress__bar" />
            </div>
        </div>
    )
}

export function MeProgressRing({
    value = null,
    max = 100,
    variant = null,
    size = null,
    label = null,
    showValue = true,
    className,
    ...rest
}: MeProgressProps) {
    const indeterminate = value === null
    // 25% is what the spinner animation rotates; it is not a reading.
    const percent = indeterminate ? 25 : clampPercent(value ?? 0, max)

    return (
        <div
            className={cx(
                'me-progress-ring',
                variant && `me-progress-ring--${variant}`,
                size && `me-progress-ring--${size}`,
                indeterminate && 'me-progress-ring--indeterminate',
                className,
            )}
            role="progressbar"
            aria-valuenow={indeterminate ? undefined : (value ?? undefined)}
            aria-valuemin={indeterminate ? undefined : 0}
            aria-valuemax={indeterminate ? undefined : max}
            aria-label={label ?? undefined}
            style={{ '--me-progress': `${percent}%` } as CSSProperties}
            {...rest}
        >
            {showValue && !indeterminate ? (
                <span className="me-progress-ring__value">{`${Math.round(percent)}%`}</span>
            ) : null}
        </div>
    )
}

function clampPercent(value: number, max: number): number {
    return Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100))
}

export interface MeBrandProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
    href?: string
    name?: string | null
    showName?: boolean
    as?: LinkAs | undefined
    children?: ReactNode
}

export function MeBrand({ href = '/', name = null, showName = true, as, className, children, ...rest }: MeBrandProps) {
    const Component = as ?? 'a'

    return (
        <Component href={href} className={cx('me-sidebar__brand', className)} {...rest}>
            {children ?? <DefaultGlyph />}
            {showName ? <span className="me-hide-collapsed">{name ?? ''}</span> : null}
        </Component>
    )
}

function DefaultGlyph() {
    return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--color-primary-600)" />
            <path
                d="M6 16c0-3 4.5-6 10-6s10 3 10 6-4.5 6-10 6-10-3-10-6z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="3" fill="#fff" />
        </svg>
    )
}

export interface MeFieldProps extends HTMLAttributes<HTMLDivElement> {
    label?: string | null
    hint?: string | null
    error?: string | null
    htmlFor?: string | null
    required?: boolean
    inline?: boolean
}

/**
 * Label, control, hint and error, wired together.
 *
 * The classes are `me-label`, `me-hint` and `me-error` — the same ones
 * `<x-me::field>` emits. They are not BEM children of `me-field`, and writing
 * them as if they were leaves the field unstyled.
 */
export function MeField({
    label = null,
    hint = null,
    error = null,
    htmlFor = null,
    required = false,
    inline = false,
    className,
    children,
    ...rest
}: MeFieldProps) {
    return (
        <div className={cx('me-field', inline && 'me-field--inline', className)} {...rest}>
            {label ? (
                <label htmlFor={htmlFor ?? undefined} className={cx('me-label', required && 'me-label--required')}>
                    {label}
                </label>
            ) : null}

            {children}

            {/*
             * A hint is suppressed while an error is showing, exactly as in
             * Blade: two messages under one control is one too many.
             */}
            {hint && !error ? <p className="me-hint">{hint}</p> : null}

            {error ? (
                <p className="me-error">
                    <MeIcon name="alert-circle" />
                    <span>{error}</span>
                </p>
            ) : null}
        </div>
    )
}
