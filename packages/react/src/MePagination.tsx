'use client'

import { t, type TablePagination } from '@my-eyes/core'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import type { LinkAs } from './primitives.js'

/**
 * Pagination for a table payload.
 *
 * Buttons rather than links: there is no URL to follow — the client fetches the
 * page — and a link that does not navigate is a lie to assistive technology.
 * The window keeps the control a fixed width however many pages there are.
 */
export interface MePaginationProps {
    pagination: TablePagination
    window?: number
    /**
     * Builds an href for a page, turning the items into real links.
     *
     * Without it the items are buttons, which is the honest default: they fetch
     * a page rather than navigating. Supply it when the pages do have addresses
     * — the table already mirrors its state into the URL — and middle-click and
     * "open in new tab" start working. A plain click still fetches, without a
     * reload.
     */
    hrefFor?: (page: number) => string
    as?: LinkAs | undefined
    onNavigate?: (page: number) => void
}

export function MePagination({ pagination, window: gap = 1, hrefFor, as, onNavigate }: MePaginationProps) {
    const { page, lastPage } = pagination

    if (lastPage <= 1) {
        return null
    }

    /*
     * One item, rendered as a link when the consumer can name an address for the
     * page and as a button otherwise. A modified click — new tab, new window, a
     * chosen download — is left to the browser; a plain one fetches without
     * reloading.
     */
    const item = (
        target: number,
        options: {
            className: string
            label?: string
            disabled?: boolean
            current?: boolean
            children: ReactNode
            key: string | number
        },
    ): ReactNode => {
        const shared = {
            className: options.className,
            'aria-label': options.label,
            'aria-current': options.current ? ('page' as const) : undefined,
        }

        if (hrefFor === undefined || options.disabled) {
            return (
                <button
                    key={options.key}
                    type="button"
                    disabled={options.disabled}
                    onClick={() => onNavigate?.(target)}
                    {...shared}
                >
                    {options.children}
                </button>
            )
        }

        const Component = as ?? 'a'

        return (
            <Component
                key={options.key}
                href={hrefFor(target)}
                onClick={(event: MouseEvent) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                        return
                    }

                    event.preventDefault()
                    onNavigate?.(target)
                }}
                {...shared}
            >
                {options.children}
            </Component>
        )
    }

    const pages = range(1, lastPage).filter(
        (candidate) => candidate === 1 || candidate === lastPage || Math.abs(candidate - page) <= gap,
    )

    const children: ReactNode[] = [
        item(page - 1, {
            key: 'previous',
            className: 'me-pagination__item',
            label: t('table.previous'),
            disabled: page <= 1,
            children: <Chevron flipped />,
        }),
    ]

    let previous = 0

    pages.forEach((candidate) => {
        if (candidate - previous > 1) {
            children.push(
                <span key={`gap-${candidate}`} className="me-pagination__gap" aria-hidden="true">
                    …
                </span>,
            )
        }

        children.push(
            item(candidate, {
                key: candidate,
                className: 'me-pagination__item me-pagination__item--number',
                current: candidate === page,
                children: String(candidate),
            }),
        )

        previous = candidate
    })

    children.push(
        item(page + 1, {
            key: 'next',
            className: 'me-pagination__item',
            label: t('table.next'),
            disabled: page >= lastPage,
            children: <Chevron />,
        }),
    )

    return (
        <nav className="me-pagination" role="navigation" aria-label={t('pagination.label')}>
            {children}
        </nav>
    )
}

function range(from: number, to: number): number[] {
    return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

function Chevron({ flipped = false }: { flipped?: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
            style={flipped ? ({ transform: 'scaleX(-1)' } as CSSProperties) : undefined}
        >
            <path d="m9 6 6 6-6 6" />
        </svg>
    )
}
