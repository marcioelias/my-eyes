import {
    initFilterPanels,
    initFilters,
    t,
    type FilterCondition,
    type FilterFieldSchema,
} from '@my-eyes/core'
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'

/**
 * The advanced filter builder.
 *
 * The panel's rows are built by the core DOM binding — the same code the Blade
 * and Livewire builders run — so a condition row exists in exactly one place
 * across all four renderers. Vue therefore renders an empty host and stays out
 * of it: letting the virtual DOM diff children it did not create would wipe
 * them on the next render.
 *
 * Communication is one way and explicit, as it is under Livewire: the panel
 * announces its condition set, this component emits it.
 *
 * @see docs/features/vue-package.md
 */
export const MeFilters = defineComponent({
    name: 'MeFilters',

    props: {
        schema: { type: Array as PropType<FilterFieldSchema[]>, required: true },
        conditions: { type: Array as PropType<FilterCondition[]>, default: () => [] },
        conjunction: { type: String as PropType<'and' | 'or'>, default: 'and' },
    },

    emits: {
        apply: (_conditions: FilterCondition[], _conjunction: 'and' | 'or') => true,
    },

    setup(props, { emit }) {
        const host = ref<HTMLElement | null>(null)

        const onApply = (event: Event): void => {
            const detail = (event as CustomEvent<{ conditions: FilterCondition[]; conjunction: string }>).detail

            emit('apply', detail.conditions, detail.conjunction === 'or' ? 'or' : 'and')
        }

        onMounted(() => {
            if (!host.value) {
                return
            }

            host.value.innerHTML = panelMarkup(props.schema, props.conditions, props.conjunction)

            initFilters(host.value)
            initFilterPanels(host.value)
            host.value.addEventListener('me-filters-apply', onApply)
        })

        onBeforeUnmount(() => host.value?.removeEventListener('me-filters-apply', onApply))

        /*
         * Only the badge follows the server. Rebuilding the panel on every
         * payload would throw away a set the user is halfway through editing.
         */
        watch(
            () => props.conditions.length,
            (count) => {
                const badge = host.value?.querySelector('[data-me-filters-count]')

                if (badge) {
                    badge.textContent = count > 0 ? String(count) : ''
                    badge.classList.toggle('me-badge', count > 0)
                    badge.classList.toggle('me-badge--primary', count > 0)
                }
            },
        )

        return () => h('div', { ref: host, class: 'me-filters-host' })
    },
})

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
