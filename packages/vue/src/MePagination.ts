import { t, type TablePagination } from '@my-eyes/core'
import { defineComponent, h, type PropType, type VNode } from 'vue'
import { linkAsProp } from './primitives.js'

/**
 * Pagination for a table payload.
 *
 * Buttons rather than links: there is no URL to follow — the client fetches the
 * page — and a link that does not navigate is a lie to assistive technology.
 * The window keeps the control a fixed width however many pages there are.
 */
export const MePagination = defineComponent({
    name: 'MePagination',

    props: {
        pagination: { type: Object as PropType<TablePagination>, required: true },
        window: { type: Number, default: 1 },
        /**
         * Builds an href for a page, turning the items into real links.
         *
         * Without it the items are buttons, which is the honest default: they
         * fetch a page rather than navigating, and a link that does not
         * navigate misleads assistive technology. Supply it when the pages do
         * have addresses — the table already mirrors its state into the URL —
         * and middle-click and "open in new tab" start working. A plain click
         * still fetches, without a reload.
         */
        hrefFor: { type: Function as PropType<(page: number) => string>, required: false },
        ...linkAsProp,
    },

    emits: {
        navigate: (_page: number) => true,
    },

    setup(props, { emit }) {
        /*
         * One item, rendered as a link when the consumer can name an address
         * for the page and as a button otherwise. A modified click — new tab,
         * new window, a chosen download — is left to the browser; a plain one
         * fetches without reloading.
         */
        const item = (target: number, options: { class: string; label?: string; disabled?: boolean; current?: boolean; children: VNode[] | string; key?: string | number }): VNode => {
            const onActivate = (event: MouseEvent): void => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                    return
                }

                event.preventDefault()
                emit('navigate', target)
            }

            const shared = {
                key: options.key ?? target,
                class: options.class,
                'aria-label': options.label,
                'aria-current': options.current ? ('page' as const) : undefined,
            }

            if (props.hrefFor === undefined || options.disabled) {
                return h(
                    'button',
                    { ...shared, type: 'button', disabled: options.disabled, onClick: () => emit('navigate', target) },
                    options.children,
                )
            }

            return h(props.as, { ...shared, href: props.hrefFor(target), onClick: onActivate }, () => options.children)
        }

        return () => {
            const { page, lastPage } = props.pagination

            if (lastPage <= 1) {
                return null
            }

            const pages = range(1, lastPage).filter(
                (candidate) =>
                    candidate === 1 || candidate === lastPage || Math.abs(candidate - page) <= props.window,
            )

            const children: VNode[] = [
                item(page - 1, {
                    key: 'previous',
                    class: 'me-pagination__item',
                    label: t('table.previous'),
                    disabled: page <= 1,
                    children: [chevron(true)],
                }),
            ]

            let previous = 0

            pages.forEach((candidate) => {
                if (candidate - previous > 1) {
                    children.push(
                        h('span', { key: `gap-${candidate}`, class: 'me-pagination__gap', 'aria-hidden': 'true' }, '…'),
                    )
                }

                children.push(
                    item(candidate, {
                        class: 'me-pagination__item me-pagination__item--number',
                        current: candidate === page,
                        children: String(candidate),
                    }),
                )

                previous = candidate
            })

            children.push(
                item(page + 1, {
                    key: 'next',
                    class: 'me-pagination__item',
                    label: t('table.next'),
                    disabled: page >= lastPage,
                    children: [chevron(false)],
                }),
            )

            return h(
                'nav',
                { class: 'me-pagination', role: 'navigation', 'aria-label': t('pagination.label') },
                children,
            )
        }
    },
})

function range(from: number, to: number): number[] {
    return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

function chevron(flipped: boolean): VNode {
    return h(
        'svg',
        {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '1.75',
            'stroke-linecap': 'round',
            'aria-hidden': 'true',
            style: flipped ? { transform: 'scaleX(-1)' } : undefined,
        },
        [h('path', { d: 'm9 6 6 6-6 6' })],
    )
}
