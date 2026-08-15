import { defineComponent, h, type PropType } from 'vue'

/**
 * The primitives the table leans on, and the ones an application reaches for
 * first.
 *
 * Every one of these is a class name and a slot. That is the whole point of
 * the design system living in CSS: a component here carries no styling
 * decisions, so a Vue button and a Blade button cannot drift apart.
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

export type Size = 'xs' | 'sm' | 'md' | 'lg'

export const MeButton = defineComponent({
    name: 'MeButton',

    props: {
        variant: { type: String as PropType<Variant>, default: 'secondary' },
        size: { type: String as PropType<Size>, default: 'md' },
        block: { type: Boolean, default: false },
        icon: { type: Boolean, default: false },
        type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h(
                'button',
                {
                    ...attrs,
                    type: props.type,
                    class: [
                        'me-btn',
                        `me-btn--${props.variant}`,
                        `me-btn--${props.size}`,
                        props.block ? 'me-btn--block' : '',
                        props.icon ? 'me-btn--icon' : '',
                    ],
                },
                slots.default?.(),
            )
    },
})

export const MeBadge = defineComponent({
    name: 'MeBadge',

    props: {
        variant: { type: String as PropType<'primary' | 'success' | 'danger' | 'warning' | 'info'>, default: 'primary' },
        solid: { type: Boolean, default: false },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h(
                'span',
                {
                    ...attrs,
                    class: ['me-badge', `me-badge--${props.variant}`, props.solid ? 'me-badge--solid' : ''],
                },
                slots.default?.(),
            )
    },
})

export const MeAlert = defineComponent({
    name: 'MeAlert',

    props: {
        variant: {
            type: String as PropType<'primary' | 'success' | 'danger' | 'warning' | 'info'>,
            default: 'info',
        },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h(
                'div',
                { ...attrs, class: ['me-alert', `me-alert--${props.variant}`], role: 'alert' },
                slots.default?.(),
            )
    },
})

export const MeInput = defineComponent({
    name: 'MeInput',

    props: {
        modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
        size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
        invalid: { type: Boolean, default: false },
    },

    emits: {
        'update:modelValue': (_value: string) => true,
    },

    setup(props, { emit, attrs }) {
        return () =>
            h('input', {
                ...attrs,
                value: props.modelValue,
                'aria-invalid': props.invalid ? 'true' : undefined,
                class: ['me-input', props.size === 'md' ? '' : `me-input--${props.size}`],
                onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
            })
    },
})

/**
 * Label, control and message, wired together — the id and aria-describedby
 * that make an error announceable are easy to forget by hand.
 */
export const MeField = defineComponent({
    name: 'MeField',

    props: {
        label: { type: String, default: '' },
        for: { type: String, default: '' },
        error: { type: String, default: '' },
        hint: { type: String, default: '' },
        required: { type: Boolean, default: false },
    },

    setup(props, { slots }) {
        return () => {
            const describedBy = props.for === '' ? undefined : `${props.for}-message`

            return h('div', { class: ['me-field', props.error !== '' ? 'me-field--invalid' : ''] }, [
                props.label === ''
                    ? null
                    : h('label', { class: 'me-field__label', for: props.for || undefined }, [
                          props.label,
                          props.required ? h('span', { class: 'me-field__required', 'aria-hidden': 'true' }, '*') : null,
                      ]),

                slots.default?.({ describedBy }),

                props.error !== ''
                    ? h('p', { class: 'me-field__error', id: describedBy, role: 'alert' }, props.error)
                    : props.hint !== ''
                      ? h('p', { class: 'me-field__hint', id: describedBy }, props.hint)
                      : null,
            ])
        }
    },
})
