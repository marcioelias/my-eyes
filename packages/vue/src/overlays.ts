import {
    initDropdowns,
    initModals,
    initToasts,
    initTooltips,
    openModal,
    t,
    toast,
    type ToastOptions,
} from '@my-eyes/core'
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import { MeIcon, linkAsProp, type Tone } from './primitives.js'

/**
 * Overlays.
 *
 * All four carry real behaviour — anchoring, dismissal, focus handling, the
 * escape key — and none of it is reimplemented here. Each component renders
 * the markup the Blade equivalent renders and binds its own element through
 * `@my-eyes/core`, so a dropdown behaves identically in all four renderers.
 *
 * @see docs/features/vue-package.md
 */

export const MeDropdown = defineComponent({
    name: 'MeDropdown',

    props: {
        align: { type: String as PropType<'start' | 'end'>, default: 'end' },
        /** Pins the panel to the bottom of the viewport on phones. */
        sheet: { type: Boolean, default: true },
    },

    /**
     * Read-only, deliberately. The trigger lives inside this component, so a
     * menu is opened by the user rather than by the application — but knowing
     * that it opened is occasionally useful (loading its contents lazily).
     */
    emits: { 'update:open': (_open: boolean) => true },

    setup(props, { slots, emit, attrs }) {
        const host = ref<HTMLElement | null>(null)
        let observer: MutationObserver | null = null

        onMounted(() => {
            if (!host.value) {
                return
            }

            initDropdowns(host.value)

            // The binding records the state in data-open; watching the
            // attribute avoids duplicating the dismissal logic here.
            observer = new MutationObserver(() => {
                emit('update:open', host.value?.dataset.open === 'true')
            })

            observer.observe(host.value, { attributes: true, attributeFilter: ['data-open'] })
        })

        onBeforeUnmount(() => observer?.disconnect())

        return () =>
            h('div', { ...attrs, ref: host, class: 'me-dropdown', 'data-me-dropdown': '', 'data-open': 'false' }, [
                h('div', { 'data-me-dropdown-trigger': '' }, slots.trigger?.()),

                h(
                    'div',
                    {
                        class: [
                            'me-dropdown__panel',
                            props.align === 'start' ? 'me-dropdown__panel--start' : '',
                            props.sheet ? 'me-dropdown__panel--sheet' : '',
                        ],
                        'data-me-dropdown-panel': '',
                        role: 'menu',
                    },
                    slots.default?.(),
                ),
            ])
    },
})

export const MeDropdownItem = defineComponent({
    name: 'MeDropdownItem',

    props: {
        href: { type: String as PropType<string | null>, default: null },
        icon: { type: String as PropType<string | null>, default: null },
        variant: { type: String as PropType<string | null>, default: null },
        /** Leaves the menu open after activation — a theme switcher wants this. */
        keepOpen: { type: Boolean, default: false },
        type: { type: String as PropType<'button' | 'submit'>, default: 'button' },
        ...linkAsProp,
    },

    setup(props, { slots, attrs }) {
        return () => {
            const children = [
                props.icon ? h(MeIcon, { name: props.icon as never }) : null,
                slots.default?.(),
            ]

            const shared = {
                ...attrs,
                class: ['me-dropdown__item', props.variant ? `me-dropdown__item--${props.variant}` : ''],
                role: 'menuitem',
                'data-me-keep-open': props.keepOpen ? '' : undefined,
            }

            return props.href !== null
                ? h(props.as, { ...shared, href: props.href }, () => children)
                : h('button', { ...shared, type: props.type }, children)
        }
    },
})

export const MeDropdownHeader = defineComponent({
    name: 'MeDropdownHeader',

    props: {
        title: { type: String as PropType<string | null>, default: null },
        meta: { type: String as PropType<string | null>, default: null },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h('div', { ...attrs, class: 'me-dropdown__header' }, [
                props.title ? h('p', { class: 'me-dropdown__header-title' }, props.title) : null,
                props.meta ? h('p', { class: 'me-dropdown__header-meta' }, props.meta) : null,
                slots.default?.(),
            ])
    },
})

export const MeDropdownDivider = defineComponent({
    name: 'MeDropdownDivider',
    setup: (_props, { attrs }) => () => h('hr', { ...attrs, class: 'me-dropdown__divider' }),
})

const MODAL_ICONS: Record<string, string> = {
    danger: 'alert-triangle',
    warning: 'alert-triangle',
    success: 'check-circle',
}

/**
 * Confirmation modal, on the native `<dialog>` element.
 *
 * Driven either way: bind `v-model:open`, or open it from anywhere with
 * `data-me-modal-open="<id>"` exactly as in Blade. Dismissal is reported
 * through `close` and `update:open` however it happened, so a parent's boolean
 * cannot be left stuck on true.
 *
 * Confirming emits `confirm`. There is no form and no CSRF token here, because
 * a Vue application submits through its own client rather than a browser form
 * post.
 */
export const MeModal = defineComponent({
    name: 'MeModal',

    props: {
        id: { type: String, required: true },
        variant: { type: String as PropType<Tone>, default: 'primary' },
        icon: { type: [String, Boolean] as PropType<string | false | null>, default: null },
        title: { type: String as PropType<string | null>, default: null },
        confirm: { type: String as PropType<string | null>, default: null },
        cancel: { type: String as PropType<string | null>, default: null },
        align: { type: String as PropType<'center' | 'start'>, default: 'center' },
        size: { type: String as PropType<string | null>, default: null },
        /** Refuses to close on a backdrop click or Escape. Always pair with a cancel. */
        static: { type: Boolean, default: false },
        /**
         * Two-way, through `v-model:open`.
         *
         * Leave it out to drive the dialog the Blade way instead, with
         * `data-me-modal-open="<id>"` on any element. Both work; a Vue
         * application usually already holds the boolean.
         */
        open: { type: Boolean, default: undefined },
    },

    emits: {
        confirm: () => true,
        close: () => true,
        'update:open': (_open: boolean) => true,
    },

    setup(props, { slots, emit, attrs }) {
        const host = ref<HTMLDialogElement | null>(null)

        /*
         * <dialog> fires `close` however it was dismissed — Escape, a click on
         * the backdrop, or a cancel button. Forwarding it is what keeps a
         * parent's boolean from being left stuck on true.
         */
        const onNativeClose = (): void => {
            emit('close')
            emit('update:open', false)
        }

        onMounted(() => {
            if (!host.value) {
                return
            }

            initModals(host.value.parentElement ?? document)
            host.value.addEventListener('close', onNativeClose)

            if (props.open) {
                openModal(host.value)
            }
        })

        onBeforeUnmount(() => host.value?.removeEventListener('close', onNativeClose))

        watch(
            () => props.open,
            (open) => {
                const dialog = host.value

                if (!dialog || open === undefined) {
                    return
                }

                if (open && !dialog.open) {
                    openModal(dialog)
                } else if (!open && dialog.open) {
                    dialog.close()
                }
            },
        )

        return () => {
            const icon = props.icon === null ? (MODAL_ICONS[props.variant] ?? 'info') : props.icon
            // The confirm button follows the modal's role, so a destructive
            // confirmation cannot end up with a friendly blue button.
            const confirmVariant = props.variant === 'primary' ? 'primary' : props.variant

            return h(
                'dialog',
                {
                    ...attrs,
                    ref: host,
                    id: props.id,
                    class: [
                        'me-modal',
                        props.variant !== 'primary' ? `me-modal--${props.variant}` : '',
                        props.align === 'start' ? 'me-modal--start' : '',
                        props.size ? `me-modal--${props.size}` : '',
                    ],
                    'aria-labelledby': `${props.id}-title`,
                    'data-me-modal-static': props.static ? 'true' : undefined,
                },
                [
                    h('div', { class: 'me-modal__panel' }, [
                        icon === false
                            ? null
                            : h('span', { class: 'me-modal__icon' }, [h(MeIcon, { name: icon as never })]),

                        props.title
                            ? h('h2', { class: 'me-modal__title', id: `${props.id}-title` }, props.title)
                            : null,

                        slots.default ? h('p', { class: 'me-modal__text' }, slots.default()) : null,

                        h('div', { class: 'me-modal__actions' }, [
                            props.cancel
                                ? h(
                                      'button',
                                      {
                                          type: 'button',
                                          class: 'me-btn me-btn--secondary me-btn--md',
                                          'data-me-modal-close': '',
                                      },
                                      props.cancel,
                                  )
                                : null,

                            h(
                                'button',
                                {
                                    type: 'button',
                                    class: ['me-btn', `me-btn--${confirmVariant}`, 'me-btn--md'],
                                    'data-me-modal-initial': '',
                                    'data-me-modal-close': '',
                                    onClick: () => emit('confirm'),
                                },
                                props.confirm ?? 'OK',
                            ),
                        ]),
                    ]),
                ],
            )
        }
    },
})

/**
 * Wraps anything in a tooltip. On an element you already control, skip the
 * wrapper and put `data-me-tooltip` on it directly.
 */
export const MeTooltip = defineComponent({
    name: 'MeTooltip',

    props: {
        text: { type: String, required: true },
        placement: { type: String as PropType<'top' | 'bottom' | 'start' | 'end'>, default: 'top' },
    },

    setup(props, { slots, attrs }) {
        const host = ref<HTMLElement | null>(null)

        onMounted(() => {
            if (host.value) {
                initTooltips(host.value.parentElement ?? document)
            }
        })

        return () =>
            h(
                'span',
                {
                    ...attrs,
                    ref: host,
                    class: 'me-tooltip-trigger',
                    'data-me-tooltip': props.text,
                    'data-tooltip-placement': props.placement,
                },
                slots.default?.(),
            )
    },
})

/**
 * The toast container. Place it once in the layout; raise toasts from anywhere
 * with `useToasts()`.
 */
export const MeToasts = defineComponent({
    name: 'MeToasts',

    props: {
        position: { type: String, default: 'top-end' },
    },

    setup(props) {
        const host = ref<HTMLElement | null>(null)

        onMounted(() => {
            if (host.value) {
                initToasts(host.value.parentElement ?? document)
            }
        })

        return () =>
            h('div', {
                ref: host,
                class: 'me-toasts',
                'data-position': props.position,
                role: 'status',
                'aria-live': 'polite',
            })
    },
})

/**
 * Programmatic toasts.
 *
 * A thin pass-through to the core API, so a component does not have to import
 * from two packages to raise one.
 */
export function useToasts(): {
    toast: (options: ToastOptions) => void
    success: (text: string, title?: string) => void
    danger: (text: string, title?: string) => void
    warning: (text: string, title?: string) => void
    info: (text: string, title?: string) => void
} {
    const raise = (variant: NonNullable<ToastOptions['variant']>) => (text: string, title?: string) => {
        toast(title === undefined ? { text, variant } : { text, variant, title })
    }

    return {
        toast: (options) => void toast(options),
        success: raise('success'),
        danger: raise('danger'),
        warning: raise('warning'),
        info: raise('info'),
    }
}

/** Re-exported so a translated close label reaches the toast markup. */
export const toastCloseLabel = (): string => t('toast.close')
