import { render } from '@testing-library/react'
import { mount } from '@vue/test-utils'
import { beforeEach, expect, it } from 'vitest'
import { MeTable as VueTable } from '../../vue/src/MeTable.js'
import { respondWith, settle, tablePayload } from '../../core/tests/fixtures.js'
import { MeTable as ReactTable } from '../src/MeTable.js'

/**
 * AC-02: the two renderers produce equivalent markup for the same payload.
 *
 * Structure rather than a string comparison — Vue and React each leave their own
 * fingerprints on attribute order and whitespace, and neither is what parity
 * means. What is compared is what the stylesheet and a screen reader see: the
 * classes, the cells, the sort affordances and the summary.
 */

const fetcher = async (): Promise<Response> => respondWith(tablePayload())

/** The parts of a rendered table that carry meaning. */
function shapeOf(root: ParentNode): unknown {
    const text = (element: Element | null): string => (element?.textContent ?? '').replace(/\s+/g, ' ').trim()

    return {
        headers: Array.from(root.querySelectorAll('thead th')).map((th) => ({
            label: text(th),
            className: th.className,
            sortable: th.querySelector('.me-table__sort') !== null,
            ariaSort: th.getAttribute('aria-sort'),
        })),
        rows: Array.from(root.querySelectorAll('tbody tr')).map((tr) =>
            Array.from(tr.querySelectorAll('td')).map((td) => ({ value: text(td), className: td.className })),
        ),
        tableClasses: root.querySelector('table')?.className,
        summary: text(root.querySelector('.me-table-footer__count')),
        perPage: Array.from(root.querySelectorAll('.me-table-footer select option')).map((option) => text(option)),
        searchable: root.querySelector('input[type="search"]') !== null,
    }
}

beforeEach(() => {
    window.history.replaceState({}, '', '/records')
})

it('renders the same shape in Vue and in React', async () => {
    const vue = mount(VueTable, { props: { endpoint: '/table', fetcher, syncUrl: false } })
    await settle()

    const react = render(<ReactTable endpoint="/table" fetcher={fetcher} syncUrl={false} />)
    await settle()

    const vueShape = shapeOf(vue.element as unknown as ParentNode)
    const reactShape = shapeOf(react.container)

    expect(reactShape).toEqual(vueShape)

    // And it is a real table, not two empty ones agreeing with each other.
    expect(vueShape).toMatchObject({
        rows: [
            [{ value: 'Ana Souza', className: '' }, { value: 'active', className: 'me-table__cell--end' }],
            [{ value: 'Bruno Lima', className: '' }, { value: 'banned', className: 'me-table__cell--end' }],
        ],
        summary: 'Showing 1–2 of 2',
    })

    vue.unmount()
})
