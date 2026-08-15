import { createDismissable } from '../headless/dismissable.js'
import {
    blankCondition,
    findField,
    findOperator,
    fitValues,
    retargetCondition,
    type FilterCondition,
    type FilterFieldSchema,
} from '../headless/filters.js'
import { t } from '../headless/i18n.js'
import { bind } from './helpers.js'

/*
 * Advanced filter builder binding.
 *
 * Rows are rendered here rather than server-side so the markup for a row exists
 * in exactly one place — a row added by the user and a row restored from the
 * URL go through the same code.
 *
 * The panel lives inside a plain GET form: applying filters is a normal submit,
 * which keeps the result linkable and survives the back button. Without
 * JavaScript the builder is not available, but filters already in the URL are
 * still applied — the server never trusts the client for that.
 */

const seen = new WeakSet<Element>()

interface Labels {
    where: string
    and: string
    or: string
    remove: string
    value: string
    rangeSeparator: string
    commaHint: string
    yes: string
    no: string
}

export function initFilters(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-filters]', seen, setup)
}

function setup(container: HTMLElement): void {
    const rowsHost = container.querySelector<HTMLElement>('[data-me-filter-rows]')
    const addButton = container.querySelector<HTMLElement>('[data-me-filter-add]')
    const emptyState = container.querySelector<HTMLElement>('[data-me-filter-empty]')

    if (!rowsHost || !addButton) {
        return
    }

    const schema = parseJson<FilterFieldSchema[]>(container.dataset.schema, [])
    const labels = parseJson<Labels>(container.dataset.labels, {
        where: t('filters.where'),
        and: t('filters.and'),
        or: t('filters.or'),
        remove: t('filters.remove'),
        value: t('filters.value'),
        rangeSeparator: t('filters.rangeSeparator'),
        commaHint: t('filters.commaHint'),
        yes: t('common.yes'),
        no: t('common.no'),
    })

    if (schema.length === 0) {
        return
    }

    let conditions = parseJson<FilterCondition[]>(container.dataset.conditions, [])
    let conjunction = container.dataset.conjunction === 'or' ? 'or' : 'and'

    /*
     * Changing a field or operator rebuilds the row, which destroys the control
     * the user was interacting with. Remembering which one it was and restoring
     * focus afterwards keeps the panel usable from the keyboard — without this,
     * every change drops you back to the top of the document.
     */
    const focusedControl = (): { row: string; role: string } | null => {
        const active = document.activeElement

        if (!(active instanceof HTMLElement) || !active.dataset.role) {
            return null
        }

        const row = active.closest<HTMLElement>('.me-filters__row')?.dataset.row

        return row === undefined ? null : { row, role: active.dataset.role }
    }

    const render = (): void => {
        const restore = focusedControl()

        rowsHost.replaceChildren()

        conditions.forEach((condition, index) => {
            rowsHost.append(renderRow(condition, index))
        })

        if (restore) {
            rowsHost
                .querySelector<HTMLElement>(`[data-row="${restore.row}"] [data-role="${restore.role}"]`)
                ?.focus()
        }

        if (emptyState) {
            emptyState.hidden = conditions.length > 0
        }

        container.dataset.count = String(conditions.length)
    }

    const update = (index: number, next: FilterCondition): void => {
        conditions = conditions.map((condition, position) => (position === index ? next : condition))
        render()
    }

    /*
     * Row 0 reads "Where". Row 1 carries the only control — one conjunction
     * applies to the whole set, because mixing and/or in a flat list is
     * ambiguous without visible parentheses. Rows after that echo the choice as
     * text, so the sentence still reads top to bottom.
     */
    const renderConjunction = (index: number): HTMLElement => {
        // Always the same cell element, whatever it holds — the grid column and
        // the stacked mobile layout position it, and they should not need to
        // know whether this row carries a word or a control.
        const cell = document.createElement('span')
        cell.className = 'me-filters__conjunction'

        if (index === 0) {
            cell.textContent = labels.where

            return cell
        }

        if (index > 1) {
            cell.textContent = conjunction === 'or' ? labels.or : labels.and

            return cell
        }

        const select = createSelect(
            'conjunction',
            [
                ['and', labels.and],
                ['or', labels.or],
            ],
            conjunction,
        )
        select.classList.add('me-filters__conjunction-select')
        select.dataset.role = 'conjunction'
        select.addEventListener('change', () => {
            conjunction = select.value === 'or' ? 'or' : 'and'
            render()
        })

        cell.append(select)

        return cell
    }

    const renderRow = (condition: FilterCondition, index: number): HTMLElement => {
        const row = document.createElement('div')
        row.className = 'me-filters__row'
        row.dataset.row = String(index)

        row.append(renderConjunction(index))

        const field = findField(schema, condition.field) ?? schema[0]

        if (!field) {
            return row
        }

        // Field
        const fieldSelect = createSelect(
            `filters[${index}][field]`,
            schema.map((entry) => [entry.key, entry.label]),
            field.key,
        )
        fieldSelect.dataset.role = 'field'
        fieldSelect.addEventListener('change', () => {
            const nextField = findField(schema, fieldSelect.value)
            if (nextField) {
                update(index, retargetCondition(condition, nextField))
            }
        })
        row.append(fieldSelect)

        // Operator
        const operatorSelect = createSelect(
            `filters[${index}][operator]`,
            field.operators.map((operator) => [operator.value, operator.label]),
            condition.operator,
        )
        operatorSelect.dataset.role = 'operator'
        operatorSelect.addEventListener('change', () => {
            const operator = findOperator(field, operatorSelect.value)
            update(index, {
                ...condition,
                operator: operatorSelect.value,
                values: fitValues(condition.values, operator?.values ?? 1),
            })
        })
        row.append(operatorSelect)

        // Values
        const operator = findOperator(field, condition.operator)
        const valueCount = operator?.values ?? 1

        const values = document.createElement('div')
        values.className = 'me-filters__values'
        values.hidden = valueCount === 0

        for (let position = 0; position < valueCount; position++) {
            if (position > 0) {
                const separator = document.createElement('span')
                separator.className = 'me-filters__range-sep'
                separator.textContent = labels.rangeSeparator
                values.append(separator)
            }

            const valueInput = createValueInput(field, condition, index, position, operator?.value ?? '', labels)
            valueInput.dataset.role = `value-${position}`
            values.append(valueInput)
        }

        row.append(values)

        // Remove
        const remove = document.createElement('button')
        remove.type = 'button'
        remove.className = 'me-btn me-btn--ghost me-btn--sm me-btn--icon me-filters__remove'
        remove.setAttribute('aria-label', labels.remove)
        remove.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
        remove.addEventListener('click', () => {
            conditions = conditions.filter((_, position) => position !== index)
            render()
        })
        row.append(remove)

        return row
    }

    /*
     * The rows' current values, read from the DOM.
     *
     * Typed values deliberately do not round-trip through `conditions` — that
     * would re-render on every keystroke and lose the caret — so the DOM is the
     * authority at the moment the set is handed over.
     */
    const collect = (): { conditions: FilterCondition[]; conjunction: string } => {
        const collected: FilterCondition[] = []

        rowsHost.querySelectorAll<HTMLElement>('.me-filters__row').forEach((row) => {
            const field = row.querySelector<HTMLSelectElement>('[data-role="field"]')?.value
            const operator = row.querySelector<HTMLSelectElement>('[data-role="operator"]')?.value

            if (!field || !operator) {
                return
            }

            collected.push({
                field,
                operator,
                values: Array.from(
                    row.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-role^="value-"]'),
                ).map((input) => input.value),
            })
        })

        return { conditions: collected, conjunction }
    }

    /*
     * Blade applies filters by submitting the surrounding GET form. Livewire has
     * no form to submit, so the panel announces the set instead and the
     * component pushes it to the server. Both drive the same builder, and in
     * Blade the event simply has no listener.
     */
    const announce = (): void => {
        container.dispatchEvent(new CustomEvent('me-filters-apply', { detail: collect(), bubbles: true }))
    }

    container.querySelector('[data-me-filter-apply]')?.addEventListener('click', announce)

    addButton.addEventListener('click', () => {
        const field = schema[0]
        if (field) {
            conditions = [...conditions, blankCondition(field)]
            render()

            // Focus the row just added, so keyboard users are not left behind.
            rowsHost.querySelector<HTMLElement>('.me-filters__row:last-child select')?.focus()
        }
    })

    container.querySelector('[data-me-filter-clear]')?.addEventListener('click', () => {
        conditions = []
        render()
        announce()
    })

    render()
}

function createValueInput(
    field: FilterFieldSchema,
    condition: FilterCondition,
    index: number,
    position: number,
    operator: string,
    labels: Labels,
): HTMLElement {
    const name = `filters[${index}][values][${position}]`
    const current = condition.values[position] ?? ''

    // "is one of" takes a comma separated list, so it stays a text field even
    // when the column is a select.
    const isList = operator === 'in'

    if (field.type === 'boolean') {
        return createSelect(
            name,
            [
                ['1', labels.yes],
                ['0', labels.no],
            ],
            current,
        )
    }

    if (field.type === 'select' && !isList && Object.keys(field.options).length > 0) {
        return createSelect(name, Object.entries(field.options), current)
    }

    const input = document.createElement('input')
    input.className = 'me-input me-input--sm'
    input.type = isList ? 'text' : field.inputType
    input.name = name
    input.value = current
    input.setAttribute('aria-label', labels.value)

    // Typed values are read back from the DOM on submit, so there is no need to
    // re-render (and lose the caret) on every keystroke.

    if (isList) {
        input.placeholder = labels.commaHint
    }

    return input
}

function createSelect(name: string, options: Array<[string, string]>, selected: string): HTMLSelectElement {
    const select = document.createElement('select')
    select.className = 'me-input me-select me-input--sm'
    select.name = name

    options.forEach(([value, label]) => {
        const option = document.createElement('option')
        option.value = value
        option.textContent = label
        option.selected = value === selected
        select.append(option)
    })

    return select
}

function parseJson<T>(raw: string | undefined, fallback: T): T {
    if (!raw) {
        return fallback
    }

    try {
        return JSON.parse(raw) as T
    } catch {
        return fallback
    }
}

/* Opens and closes the filter panel. */
const panelSeen = new WeakSet<Element>()

export function initFilterPanels(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-filters-wrap]', panelSeen, (wrap) => {
        const trigger = wrap.querySelector<HTMLElement>('[data-me-filters-trigger]')
        const panel = wrap.querySelector<HTMLElement>('[data-me-filters-panel]')

        if (!trigger || !panel) {
            return
        }

        createDismissable({
            trigger,
            panel,
            // Clicking inside the builder (selects, inputs) must not close it,
            // and neither should the browser's native select popup.
            closeOnOutsideClick: true,
            // The panel is wide; keep it on screen wherever the button sits.
            shift: true,
            onChange: (open) => {
                wrap.dataset.open = String(open)
            },
        })

        wrap.dataset.open = 'false'
    })
}
