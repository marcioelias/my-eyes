import { icons, type IconName } from '@my-eyes/core'
import { computed, defineComponent, h, type Component, type PropType, type VNode } from 'vue'

/**
 * What a component renders when it links somewhere.
 *
 * Defaults to a plain `<a>`, which is right for Blade, for a Vue application
 * with no router, and for a link that genuinely leaves the app. Pass Inertia's
 * `Link`, or `RouterLink`, to keep client-side navigation:
 *
 *   <MeNavItem :as="Link" href="/domains">Domains</MeNavItem>
 *
 * The package deliberately does not detect the router in use. That would tie
 * it to one and break everyone on another.
 */
export type LinkAs = string | Component

export const linkAsProp = { as: { type: [String, Object, Function] as PropType<LinkAs>, default: 'a' } }

/**
 * Display primitives.
 *
 * Every one of these is markup and a class name. That is the whole point of
 * the design system living in CSS: a component here carries no styling
 * decision of its own, so a Vue button and a Blade button cannot drift apart.
 * The class names mirror the Blade components exactly — if one needs a new
 * visual, the class is added to `@my-eyes/core/css` first.
 *
 * @see docs/features/vue-package.md
 */

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

export const MeIcon = defineComponent({
    name: 'MeIcon',

    props: {
        name: { type: String as PropType<IconName>, required: true },
        stroke: { type: [Number, String], default: 1.75 },
    },

    setup(props, { attrs }) {
        return () =>
            h('svg', {
                ...attrs,
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': props.stroke,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'aria-hidden': 'true',
                // The icon set is a constant in this package, never user input.
                innerHTML: icons[props.name] ?? '',
            })
    },
})

export const MeButton = defineComponent({
    name: 'MeButton',

    props: {
        variant: { type: String as PropType<Variant>, default: 'secondary' },
        size: { type: String as PropType<Size>, default: 'md' },
        block: { type: Boolean, default: false },
        icon: { type: String as PropType<IconName | null>, default: null },
        /** Icon-only: drops the label spacing and squares the button. */
        iconOnly: { type: Boolean, default: false },
        loading: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
        /** Renders a link instead, for a button that navigates. */
        href: { type: String as PropType<string | null>, default: null },
        ...linkAsProp,
    },

    setup(props, { slots, attrs }) {
        const classes = computed(() => [
            'me-btn',
            `me-btn--${props.variant}`,
            `me-btn--${props.size}`,
            props.block ? 'me-btn--block' : '',
            props.iconOnly ? 'me-btn--icon' : '',
        ])

        return () => {
            const children = [
                props.icon ? h(MeIcon, { name: props.icon }) : null,
                slots.default?.(),
            ]

            if (props.href !== null) {
                return h(props.as, { ...attrs, href: props.href, class: classes.value }, () => children)
            }

            return h(
                'button',
                {
                    ...attrs,
                    type: props.type,
                    class: classes.value,
                    disabled: props.disabled || props.loading,
                    'data-loading': props.loading ? 'true' : undefined,
                },
                children,
            )
        }
    },
})

export const MeBadge = defineComponent({
    name: 'MeBadge',

    props: {
        variant: { type: String as PropType<Tone | null>, default: null },
        icon: { type: String as PropType<IconName | null>, default: null },
        dot: { type: Boolean, default: false },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h('span', { ...attrs, class: ['me-badge', props.variant ? `me-badge--${props.variant}` : ''] }, [
                props.dot
                    ? h('span', { class: ['me-dot', props.variant ? `me-dot--${props.variant}` : ''] })
                    : props.icon
                      ? h(MeIcon, { name: props.icon, style: { width: '0.875rem', height: '0.875rem' } })
                      : null,
                slots.default?.(),
            ])
    },
})

const ALERT_ICONS: Record<string, IconName> = {
    success: 'check-circle',
    danger: 'alert-circle',
    warning: 'alert-triangle',
}

export const MeAlert = defineComponent({
    name: 'MeAlert',

    props: {
        variant: { type: String as PropType<Tone>, default: 'info' },
        title: { type: String as PropType<string | null>, default: null },
        /** false removes the icon entirely, as in Blade. */
        icon: { type: [String, Boolean] as PropType<IconName | false | null>, default: null },
        dismissible: { type: Boolean, default: false },
        dismissLabel: { type: String, default: 'Dismiss' },
        /** Two-way, through `v-model:visible`. */
        visible: { type: Boolean, default: true },
    },

    emits: {
        dismiss: () => true,
        'update:visible': (_visible: boolean) => true,
    },

    setup(props, { slots, emit, attrs }) {
        return () => {
            if (!props.visible) {
                return null
            }

            const icon = props.icon === null ? (ALERT_ICONS[props.variant] ?? 'info') : props.icon

            return h('div', { ...attrs, class: ['me-alert', `me-alert--${props.variant}`], role: 'alert' }, [
                icon === false ? null : h(MeIcon, { name: icon, class: 'me-alert__icon' }),

                h('div', { class: 'me-alert__body' }, [
                    props.title ? h('span', { class: 'me-alert__title' }, props.title) : null,
                    h('span', { class: 'me-alert__text' }, slots.default?.()),
                ]),

                /*
                 * Deliberately NOT data-me-dismiss. That binding removes the
                 * element from the document, and this element belongs to Vue —
                 * tearing it out from underneath corrupts the next patch. Vue
                 * owns the dismissal here, and the parent hears about it.
                 */
                props.dismissible
                    ? h(
                          'button',
                          {
                              type: 'button',
                              class: 'me-alert__dismiss',
                              'aria-label': props.dismissLabel,
                              onClick: () => {
                                  emit('dismiss')
                                  emit('update:visible', false)
                              },
                          },
                          [h(MeIcon, { name: 'x' })],
                      )
                    : null,
            ])
        }
    },
})

export const MeCard = defineComponent({
    name: 'MeCard',

    props: {
        title: { type: String as PropType<string | null>, default: null },
        description: { type: String as PropType<string | null>, default: null },
        /** Drops the body padding, for a card wrapping a table or a list. */
        flush: { type: Boolean, default: false },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h('div', { ...attrs, class: 'me-card' }, [
                props.title || props.description || slots.actions
                    ? h('div', { class: 'me-card__header' }, [
                          h('div', [
                              props.title ? h('h2', { class: 'me-card__title' }, props.title) : null,
                              props.description ? h('p', { class: 'me-card__description' }, props.description) : null,
                          ]),
                          slots.actions ? h('div', { class: 'me-card__header-actions' }, slots.actions()) : null,
                      ])
                    : null,

                h('div', { class: 'me-card__body', style: props.flush ? { padding: 0 } : undefined }, slots.default?.()),

                slots.footer
                    ? h('div', { class: 'me-card__footer me-card__footer--end' }, slots.footer())
                    : null,
            ])
    },
})

export const MeAvatar = defineComponent({
    name: 'MeAvatar',

    props: {
        name: { type: String as PropType<string | null>, default: null },
        src: { type: String as PropType<string | null>, default: null },
        size: { type: String as PropType<string | null>, default: null },
        status: { type: String as PropType<string | null>, default: null },
    },

    setup(props, { attrs }) {
        return () => {
            const avatar = h(
                'span',
                { ...(props.status ? {} : attrs), class: ['me-avatar', props.size ? `me-avatar--${props.size}` : ''] },
                props.src
                    ? [h('img', { src: props.src, alt: props.name ?? '' })]
                    : initials(props.name ?? ''),
            )

            if (!props.status) {
                return avatar
            }

            return h('span', { ...attrs, class: 'me-avatar-wrap' }, [
                avatar,
                h('span', { class: ['me-dot', `me-dot--${props.status}`] }),
            ])
        }
    },
})

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

export const MeProgress = defineComponent({
    name: 'MeProgress',

    props: {
        /** Omit for the indeterminate form — work whose length is unknown. */
        value: { type: Number as PropType<number | null>, default: null },
        max: { type: Number, default: 100 },
        variant: { type: String as PropType<Tone | null>, default: null },
        size: { type: String as PropType<string | null>, default: null },
        label: { type: String as PropType<string | null>, default: null },
        showValue: { type: Boolean, default: false },
    },

    setup(props, { attrs }) {
        return () => {
            const indeterminate = props.value === null
            const percent = indeterminate ? 0 : clampPercent(props.value ?? 0, props.max)
            const hasHeader = Boolean(props.label) || (props.showValue && !indeterminate)

            return h('div', { class: 'me-progress-field' }, [
                hasHeader
                    ? h('div', { class: 'me-progress-field__header' }, [
                          h('span', { class: 'me-progress-field__label' }, props.label ?? ''),
                          props.showValue && !indeterminate
                              ? h('span', { class: 'me-progress-field__value' }, `${Math.round(percent)}%`)
                              : null,
                      ])
                    : null,

                h(
                    'div',
                    {
                        ...attrs,
                        class: [
                            'me-progress',
                            props.variant ? `me-progress--${props.variant}` : '',
                            props.size ? `me-progress--${props.size}` : '',
                            indeterminate ? 'me-progress--indeterminate' : '',
                        ],
                        role: 'progressbar',
                        'aria-valuenow': indeterminate ? undefined : props.value,
                        'aria-valuemin': indeterminate ? undefined : 0,
                        'aria-valuemax': indeterminate ? undefined : props.max,
                        'aria-label': props.label ?? undefined,
                        style: { '--me-progress': `${percent}%` },
                    },
                    [h('span', { class: 'me-progress__bar' })],
                ),
            ])
        }
    },
})

export const MeProgressRing = defineComponent({
    name: 'MeProgressRing',

    props: {
        value: { type: Number as PropType<number | null>, default: null },
        max: { type: Number, default: 100 },
        variant: { type: String as PropType<Tone | null>, default: null },
        size: { type: String as PropType<string | null>, default: null },
        label: { type: String as PropType<string | null>, default: null },
        showValue: { type: Boolean, default: true },
    },

    setup(props, { attrs }) {
        return () => {
            const indeterminate = props.value === null
            // 25% is what the spinner animation rotates; it is not a reading.
            const percent = indeterminate ? 25 : clampPercent(props.value ?? 0, props.max)

            return h(
                'div',
                {
                    ...attrs,
                    class: [
                        'me-progress-ring',
                        props.variant ? `me-progress-ring--${props.variant}` : '',
                        props.size ? `me-progress-ring--${props.size}` : '',
                        indeterminate ? 'me-progress-ring--indeterminate' : '',
                    ],
                    role: 'progressbar',
                    'aria-valuenow': indeterminate ? undefined : props.value,
                    'aria-valuemin': indeterminate ? undefined : 0,
                    'aria-valuemax': indeterminate ? undefined : props.max,
                    'aria-label': props.label ?? undefined,
                    style: { '--me-progress': `${percent}%` },
                },
                props.showValue && !indeterminate
                    ? [h('span', { class: 'me-progress-ring__value' }, `${Math.round(percent)}%`)]
                    : [],
            )
        }
    },
})

function clampPercent(value: number, max: number): number {
    return Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100))
}

export const MeBrand = defineComponent({
    name: 'MeBrand',

    props: {
        href: { type: String, default: '/' },
        name: { type: String as PropType<string | null>, default: null },
        showName: { type: Boolean, default: true },
        ...linkAsProp,
    },

    setup(props, { slots, attrs }) {
        return () =>
            h(props.as, { ...attrs, href: props.href, class: 'me-sidebar__brand' }, () => [
                slots.default?.() ?? defaultGlyph(),
                props.showName ? h('span', { class: 'me-hide-collapsed' }, props.name ?? '') : null,
            ])
    },
})

function defaultGlyph(): VNode {
    return h('svg', { viewBox: '0 0 32 32', fill: 'none', 'aria-hidden': 'true' }, [
        h('rect', { width: '32', height: '32', rx: '8', fill: 'var(--color-primary-600)' }),
        h('path', {
            d: 'M6 16c0-3 4.5-6 10-6s10 3 10 6-4.5 6-10 6-10-3-10-6z',
            stroke: '#fff',
            'stroke-width': '2',
            'stroke-linejoin': 'round',
        }),
        h('circle', { cx: '16', cy: '16', r: '3', fill: '#fff' }),
    ])
}

/**
 * Label, control, hint and error, wired together.
 *
 * The classes are `me-label`, `me-hint` and `me-error` — the same ones
 * `<x-me::field>` emits. They are not BEM children of `me-field`, and writing
 * them as if they were leaves the field unstyled.
 */
export const MeField = defineComponent({
    name: 'MeField',

    props: {
        label: { type: String as PropType<string | null>, default: null },
        hint: { type: String as PropType<string | null>, default: null },
        error: { type: String as PropType<string | null>, default: null },
        for: { type: String as PropType<string | null>, default: null },
        required: { type: Boolean, default: false },
        inline: { type: Boolean, default: false },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h('div', { ...attrs, class: ['me-field', props.inline ? 'me-field--inline' : ''] }, [
                props.label
                    ? h(
                          'label',
                          {
                              for: props.for ?? undefined,
                              class: ['me-label', props.required ? 'me-label--required' : ''],
                          },
                          props.label,
                      )
                    : null,

                slots.default?.(),

                // A hint is suppressed while an error is showing, exactly as in
                // Blade: two messages under one control is one too many.
                props.hint && !props.error ? h('p', { class: 'me-hint' }, props.hint) : null,

                props.error
                    ? h('p', { class: 'me-error' }, [
                          h(MeIcon, { name: 'alert-circle' }),
                          h('span', props.error),
                      ])
                    : null,
            ])
    },
})
