'use client'

import { initFilterPanels, initFilters, t, type FilterCondition, type FilterFieldSchema } from '@my-eyes/core'
import { useEffect, useRef } from 'react'

/**
 * The advanced filter builder.
 *
 * The panel's rows are built by the core DOM binding — the same code the Blade,
 * Livewire and Vue builders run — so a condition row exists in exactly one
 * place across all four renderers. React therefore renders an empty host and
 * stays out of it: letting the reconciler diff children it did not create would
 * wipe them on the next render.
 *
 * Communication is one way and explicit, as it is under Livewire: the panel
 * announces its condition set, this component reports it.
 *
 * @see docs/features/react-package.md
 */
export interface MeFiltersProps {
    schema: FilterFieldSchema[]
    conditions?: FilterCondition[]
    conjunction?: 'and' | 'or'
    onApply?: (conditions: FilterCondition[], conjunction: 'and' | 'or') => void
}

export function MeFilters({ schema, conditions = [], conjunction = 'and', onApply }: MeFiltersProps) {
    const host = useRef<HTMLDivElement | null>(null)
    const notify = useRef(onApply)
    notify.current = onApply

    /*
     * Built once, on mount, from the props as they were then. Rebuilding on
     * every payload would throw away a set the user is halfway through editing —
     * which is why the schema and the initial conditions are read through a ref
     * rather than being effect dependencies.
     */
    const initial = useRef({ schema, conditions, conjunction })

    useEffect(() => {
        const element = host.current

        if (!element) {
            return
        }

        element.innerHTML = panelMarkup(
            initial.current.schema,
            initial.current.conditions,
            initial.current.conjunction,
        )

        initFilters(element)
        initFilterPanels(element)

        const onPanelApply = (event: Event): void => {
            const detail = (event as CustomEvent<{ conditions: FilterCondition[]; conjunction: string }>).detail

            notify.current?.(detail.conditions, detail.conjunction === 'or' ? 'or' : 'and')
        }

        element.addEventListener('me-filters-apply', onPanelApply)

        return () => element.removeEventListener('me-filters-apply', onPanelApply)
    }, [])

    // Only the badge follows the server, for the same reason.
    useEffect(() => {
        const badge = host.current?.querySelector('[data-me-filters-count]')

        if (!badge) {
            return
        }

        const count = conditions.length

        badge.textContent = count > 0 ? String(count) : ''
        badge.classList.toggle('me-badge', count > 0)
        badge.classList.toggle('me-badge--primary', count > 0)
    }, [conditions.length])

    return <div ref={host} className="me-filters-host" />
}

function panelMarkup(schema: FilterFieldSchema[], conditions: FilterCondition[], conjunction: string): string {
    const json = (value: unknown): string => escapeAttribute(JSON.stringify(value))

    return `
<div class="me-filters-wrap" data-me-filters-wrap data-open="false">
    <button type="button" class="me-btn me-btn--secondary me-btn--sm" data-me-filters-trigger>
        <span>${escapeText(t('filters.title'))}</span>
        <span data-me-filters-count class="${conditions.length > 0 ? 'me-badge me-badge--primary' : ''}">${
            conditions.length > 0 ? conditions.length : ''
        }</span>
    </button>

    <div class="me-filters-panel" data-me-filters-panel>
        <div class="me-filters-panel__body">
            <div
                class="me-filters"
                data-me-filters
                data-schema="${json(schema)}"
                data-conditions="${json(conditions)}"
                data-conjunction="${escapeAttribute(conjunction)}"
            >
                <div class="me-filters__rows" data-me-filter-rows></div>

                <p class="me-filters__empty" data-me-filter-empty>${escapeText(t('filters.empty'))}</p>

                <div class="me-filters__actions">
                    <button type="button" class="me-btn me-btn--outline-primary me-btn--sm" data-me-filter-add>
                        ${escapeText(t('filters.add'))}
                    </button>

                    <div class="me-filters__actions-end">
                        <button type="button" class="me-btn me-btn--ghost me-btn--sm" data-me-filter-clear>
                            ${escapeText(t('filters.clear'))}
                        </button>

                        <button type="button" class="me-btn me-btn--primary me-btn--sm" data-me-filter-apply>
                            ${escapeText(t('filters.apply'))}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`
}

/*
 * The schema and the labels come from the server and from the message
 * dictionary, but this markup is assembled as a string, so both are escaped
 * rather than trusted to be attribute-safe.
 */
function escapeAttribute(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function escapeText(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
