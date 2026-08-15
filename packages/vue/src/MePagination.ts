import { t, type TablePagination } from '@my-eyes/core'
import { defineComponent, h, type PropType, type VNode } from 'vue'

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
    },

    emits: {
        navigate: (_page: number) => true,
    },

    setup(props, { emit }) {
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
                h(
                    'button',
                    {
                        type: 'button',
                        class: 'me-pagination__item',
                        'aria-label': t('table.previous'),
                        disabled: page <= 1,
                        onClick: () => emit('navigate', page - 1),
                    },
                    [chevron(true)],
                ),
            ]

            let previous = 0

            pages.forEach((candidate) => {
                if (candidate - previous > 1) {
                    children.push(
                        h('span', { key: `gap-${candidate}`, class: 'me-pagination__gap', 'aria-hidden': 'true' }, '…'),
                    )
                }

                children.push(
                    h(
                        'button',
                        {
                            key: candidate,
                            type: 'button',
                            class: 'me-pagination__item me-pagination__item--number',
                            'aria-current': candidate === page ? 'page' : undefined,
                            onClick: () => emit('navigate', candidate),
                        },
                        String(candidate),
                    ),
                )

                previous = candidate
            })

            children.push(
                h(
                    'button',
                    {
                        type: 'button',
                        class: 'me-pagination__item',
                        'aria-label': t('table.next'),
                        disabled: page >= lastPage,
                        onClick: () => emit('navigate', page + 1),
                    },
                    [chevron(false)],
                ),
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
