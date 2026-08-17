'use client'

import { initShell, initThemeToggles, t } from '@my-eyes/core'
import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from './cx.js'
import { MeDropdown, MeDropdownHeader, MeDropdownItem } from './overlays.js'
import { MeAvatar, MeBadge, MeBrand, MeButton, MeCard, MeIcon, type LinkAs, type Size } from './primitives.js'

/**
 * The admin shell, the navigation, and the layouts.
 *
 * Mobile first, exactly as in Blade: the sidebar is a drawer below 1024px and a
 * permanent column above it, collapsible to an icon rail. All of that is CSS —
 * the binding only flips data attributes on `.me-shell`.
 *
 * Unlike the Blade layouts these render no document: a React application owns
 * its own `<html>`, and Inertia owns the page shell. This is the body content.
 *
 * @see docs/features/react-package.md
 */

export interface MeAdminLayoutProps {
    heading?: string | null
    subheading?: string | null
    /** Shows the rail-collapse control in the sidebar footer. */
    collapsible?: boolean
    footer?: ReactNode | boolean
    brandName?: string | null
    brandHref?: string
    brand?: ReactNode | undefined
    nav?: ReactNode | undefined
    topbar?: ReactNode | undefined
    user?: ReactNode | undefined
    actions?: ReactNode | undefined
    sidebarFooter?: ReactNode | undefined
    children?: ReactNode | undefined
}

export function MeAdminLayout({
    heading = null,
    subheading = null,
    collapsible = true,
    footer = true,
    brandName = null,
    brandHref = '/',
    brand,
    nav,
    topbar,
    user,
    actions,
    sidebarFooter,
    children,
}: MeAdminLayoutProps) {
    const host = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (host.current) {
            initShell(host.current)
            initThemeToggles(host.current)
        }
    }, [])

    const showFooter = footer !== false

    return (
        <div ref={host}>
            <a href="#me-main" className="me-skip-link">
                {t('layout.skip')}
            </a>

            <div
                className="me-shell"
                data-me-shell=""
                data-sidebar-open="false"
                data-sidebar-collapsed="false"
            >
                <aside className="me-sidebar" data-me-sidebar="">
                    <div className="me-sidebar__header">
                        {brand ?? <MeBrand name={brandName} href={brandHref} />}

                        <button
                            type="button"
                            className="me-btn me-btn--ghost me-btn--sm me-btn--icon me-sidebar__close"
                            data-me-sidebar-close=""
                            aria-label={t('layout.closeMenu')}
                        >
                            <MeIcon name="x" />
                        </button>
                    </div>

                    <nav className="me-sidebar__body me-nav" aria-label={t('layout.mainNav')}>
                        {nav}
                    </nav>

                    {sidebarFooter || collapsible ? (
                        <div className="me-sidebar__footer">
                            {sidebarFooter}

                            {collapsible ? (
                                <button type="button" className="me-nav__item" data-me-sidebar-collapse="">
                                    <MeIcon name="panel-left" />
                                    <span className="me-hide-collapsed">{t('layout.collapse')}</span>
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                </aside>

                <div className="me-shell__overlay" data-me-sidebar-close="" aria-hidden="true" />

                <div className="me-shell__main">
                    <header className="me-topbar">
                        <button
                            type="button"
                            className="me-btn me-btn--ghost me-btn--sm me-btn--icon me-shell__toggle"
                            data-me-sidebar-toggle=""
                            aria-label={t('layout.openMenu')}
                        >
                            <MeIcon name="menu" />
                        </button>

                        {heading ? <span className="me-topbar__title me-hide-mobile">{heading}</span> : null}

                        <div className="me-topbar__spacer" />

                        {topbar}
                        <MeThemeToggle size="sm" />
                        {user}
                    </header>

                    <main className="me-content" id="me-main">
                        {heading || actions ? (
                            <div className="me-content__header">
                                <div>
                                    {heading ? <h1 className="me-content__heading">{heading}</h1> : null}
                                    {subheading ? <p className="me-content__subheading">{subheading}</p> : null}
                                </div>
                                {actions ? <div className="me-content__actions">{actions}</div> : null}
                            </div>
                        ) : null}

                        {children}
                    </main>

                    {showFooter ? (
                        <footer className="me-footer">
                            <div className="me-footer__inner">{footer === true ? null : footer}</div>
                        </footer>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export function MeNavSection({ title = null, children }: { title?: string | null; children?: ReactNode }) {
    return (
        <div className="me-nav__section">
            {title ? <p className="me-nav__section-title me-hide-collapsed">{title}</p> : null}
            {children}
        </div>
    )
}

/**
 * Collapsible nav section. The binding opens it automatically when a child
 * carries aria-current, so the tree reflects the current page on load.
 */
export function MeNavGroup({
    label = null,
    icon: iconName = null,
    open = false,
    children,
}: {
    label?: string | null
    icon?: string | null
    open?: boolean
    children?: ReactNode | undefined
}) {
    return (
        <div className="me-nav__group" data-me-nav-group="" data-open={String(open)}>
            <button type="button" className="me-nav__item" data-me-nav-trigger="">
                {iconName ? <MeIcon name={iconName} /> : null}
                <span className="me-hide-collapsed">{label ?? ''}</span>
                <MeIcon name="chevron-right" className="me-nav__chevron" />
            </button>

            <div className="me-nav__submenu-wrapper">
                <div className="me-nav__submenu">
                    <ul className="me-nav__submenu-inner">{children}</ul>
                </div>
            </div>
        </div>
    )
}

export interface MeNavItemProps {
    href?: string
    icon?: string | null
    /**
     * Explicit, unlike Blade — a React application knows its current route and
     * this component has no business guessing it from the URL.
     */
    active?: boolean
    badge?: string | number | null
    as?: LinkAs | undefined
    children?: ReactNode | undefined
}

export function MeNavItem({ href = '#', icon: iconName = null, active = false, badge = null, as, children }: MeNavItemProps) {
    const Component = as ?? 'a'

    return (
        <Component href={href} className="me-nav__item" aria-current={active ? 'page' : undefined}>
            {iconName ? <MeIcon name={iconName} /> : null}
            <span className="me-hide-collapsed">{children}</span>
            {badge !== null ? (
                <span className="me-hide-collapsed">
                    <MeBadge variant="primary">{String(badge)}</MeBadge>
                </span>
            ) : null}
        </Component>
    )
}

export function MeNavSubitem({
    href = '#',
    active = false,
    as,
    children,
}: {
    href?: string
    active?: boolean
    as?: LinkAs | undefined
    children?: ReactNode | undefined
}) {
    const Component = as ?? 'a'

    return (
        <li>
            <Component href={href} className="me-nav__subitem" aria-current={active ? 'page' : undefined}>
                {children}
            </Component>
        </li>
    )
}

/** Cycles the three colour modes: system → light → dark → system. */
export function MeThemeToggle({ size = 'md' }: { size?: Size }) {
    const host = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        if (host.current) {
            initThemeToggles(host.current.parentElement ?? document)
        }
    }, [])

    return (
        <button
            ref={host}
            type="button"
            className={cx('me-btn', 'me-btn--ghost', 'me-btn--icon', `me-btn--${size}`)}
            data-me-theme=""
            aria-label={t('layout.toggleTheme')}
        >
            {/* Which one shows is decided by CSS from data-theme, not here. */}
            <MeIcon name="monitor" className="me-theme-icon-system" />
            <MeIcon name="sun" className="me-theme-icon-light" />
            <MeIcon name="moon" className="me-theme-icon-dark" />
        </button>
    )
}

/** An explicit three-option picker, for a settings screen. */
export function MeThemeMenu({ align = 'end' }: { align?: 'start' | 'end' }) {
    const host = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (host.current) {
            initThemeToggles(host.current)
        }
    }, [])

    return (
        <div ref={host}>
            <MeDropdown
                align={align}
                trigger={
                    <button type="button" className="me-btn me-btn--secondary me-btn--sm">
                        <MeIcon name="monitor" className="me-theme-icon-system" />
                        <MeIcon name="sun" className="me-theme-icon-light" />
                        <MeIcon name="moon" className="me-theme-icon-dark" />
                        <span>{t('layout.theme')}</span>
                    </button>
                }
            >
                <ThemeItem mode="system" icon="monitor" label={t('layout.system')} />
                <ThemeItem mode="light" icon="sun" label={t('layout.light')} />
                <ThemeItem mode="dark" icon="moon" label={t('layout.dark')} />
            </MeDropdown>
        </div>
    )
}

function ThemeItem({ mode, icon: iconName, label }: { mode: string; icon: string; label: string }) {
    return (
        <button type="button" className="me-dropdown__item" data-me-theme={mode} data-me-keep-open="">
            <MeIcon name={iconName} />
            {label}
        </button>
    )
}

/** Topbar account menu. Pass items as children. */
export function MeUserMenu({
    name = null,
    email = null,
    avatar = null,
    showName = true,
    children,
}: {
    name?: string | null
    email?: string | null
    avatar?: string | null
    showName?: boolean
    children?: ReactNode | undefined
}) {
    return (
        <MeDropdown
            align="end"
            trigger={
                <button type="button" className="me-user-button" aria-label={t('layout.accountMenu')}>
                    <MeAvatar name={name} src={avatar} />
                    {showName && name ? <span className="me-user-button__name me-hide-mobile">{name}</span> : null}
                </button>
            }
        >
            <MeDropdownHeader title={name} meta={email} />
            {children}
        </MeDropdown>
    )
}

export { MeDropdownItem }

export interface MeAuthLayoutProps {
    heading?: string | null
    subheading?: string | null
    brandName?: string | null
    brandHref?: string
    /** False for the single centred column. */
    split?: boolean
    image?: string | null
    tagline?: string | null
    /** Puts the visual half on the left; the form stays first in the DOM. */
    reverse?: boolean
    as?: LinkAs | undefined
    brand?: ReactNode | undefined
    status?: ReactNode | undefined
    footer?: ReactNode | undefined
    aside?: ReactNode | undefined
    children?: ReactNode | undefined
}

/**
 * Layout for login, registration and password screens: two halves on a wide
 * screen, one column below 64rem.
 *
 * `image` puts a photograph on the visual half; without one it is a gradient
 * built from the role tokens. `aside` replaces the content over it, and
 * `split={false}` gives the single centred column.
 */
export function MeAuthLayout({
    heading = null,
    subheading = null,
    brandName = null,
    brandHref = '/',
    split = true,
    image = null,
    tagline = null,
    reverse = false,
    as,
    brand,
    status,
    footer,
    aside,
    children,
}: MeAuthLayoutProps) {
    return (
        <div className={cx('me-auth', split && 'me-auth--split', split && reverse && 'me-auth--reverse')}>
            <div className="me-auth__main">
                <div className="me-auth__panel">
                    {brand ?? (
                        <MeBrand className="me-auth__brand" name={brandName} href={brandHref} as={as} />
                    )}

                    <div>
                        {heading ? <h1 className="me-auth__heading">{heading}</h1> : null}
                        {subheading ? <p className="me-auth__subheading">{subheading}</p> : null}
                    </div>

                    {/*
                     * Where Blade reads session('status'), a React application
                     * passes whatever its own flash mechanism produced.
                     */}
                    {status}

                    <MeCard className="me-auth__card">{children}</MeCard>

                    {footer ? <p className="me-auth__footer">{footer}</p> : null}
                </div>
            </div>

            {split ? (
                <aside className="me-auth__aside">
                    {/* Decorative: the screen says everything it does. */}
                    {image ? <img className="me-auth__image" src={image} alt="" /> : null}

                    <div className="me-auth__aside-content">
                        {aside ?? <p className="me-auth__tagline">{tagline ?? brandName ?? ''}</p>}
                    </div>
                </aside>
            ) : null}
        </div>
    )
}

export interface MeErrorLayoutProps {
    status?: number | string | null
    title?: string | null
    icon?: string | null
    severity?: 'info' | 'warning' | 'danger' | null
    home?: boolean
    homeHref?: string
    back?: boolean
    as?: LinkAs | undefined
    children?: ReactNode | undefined
}

/**
 * Shared frame for the 4xx/5xx pages.
 *
 * Severity picks the role colour: 4xx reads as a warning — you asked for
 * something that is not there — and 5xx as a danger, because we broke. It falls
 * back to the status code, so a page only has to pass the number.
 */
export function MeErrorLayout({
    status = null,
    title = null,
    icon: iconName = null,
    severity = null,
    home = true,
    homeHref = '/',
    back = true,
    as,
    children,
}: MeErrorLayoutProps) {
    const code = Number(status)
    const resolved = severity ?? (code >= 500 ? 'danger' : code >= 400 ? 'warning' : 'info')

    return (
        <div className={cx('me-error-page', `me-error-page--${resolved}`)}>
            <div className="me-error-page__panel">
                {iconName ? (
                    <span className="me-error-page__badge">
                        <MeIcon name={iconName} />
                    </span>
                ) : null}

                {status !== null ? <p className="me-error-page__status">{String(status)}</p> : null}
                {title ? <h1 className="me-error-page__title">{title}</h1> : null}

                <p className="me-error-page__text">{children}</p>

                <div className="me-error-page__actions">
                    {back ? (
                        <MeButton variant="secondary" icon="arrow-left" onClick={() => window.history.back()}>
                            {t('errors.goBack')}
                        </MeButton>
                    ) : null}

                    {home ? (
                        <MeButton variant="primary" href={homeHref} as={as}>
                            {t('errors.backHome')}
                        </MeButton>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
