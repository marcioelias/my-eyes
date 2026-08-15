import {
    initNumericInputs,
    initPasswordToggles,
    initSelects,
    initUploads,
    t,
} from '@my-eyes/core'
import { defineComponent, h, onBeforeUnmount, onMounted, ref, type PropType, type VNode } from 'vue'
import { MeField, MeIcon, type Size } from './primitives.js'

/**
 * Form controls.
 *
 * Each one wraps its control in MeField, so label, hint and error markup is
 * identical to the Blade components. All of them support `v-model`.
 *
 * The four that carry real behaviour — the custom select, the numeric input,
 * the upload dropzone and the password reveal — delegate to the bindings in
 * `@my-eyes/core`, which is the same code the Blade and Livewire renderers
 * run. They render the markup, bind their own element on mount, and read the
 * value back from the `change` the binding already emits.
 *
 * @see docs/features/vue-package.md
 */

type FieldProps = {
    label: string | null
    hint: string | null
    error: string | null
    required: boolean
    id: string | null
    name: string | null
}

const fieldProps = {
    label: { type: String as PropType<string | null>, default: null },
    hint: { type: String as PropType<string | null>, default: null },
    error: { type: String as PropType<string | null>, default: null },
    required: { type: Boolean, default: false },
    id: { type: String as PropType<string | null>, default: null },
    name: { type: String as PropType<string | null>, default: null },
}

const field = (props: FieldProps, control: VNode | VNode[]): VNode =>
    h(
        MeField,
        {
            label: props.label,
            hint: props.hint,
            error: props.error,
            for: props.id ?? props.name,
            required: props.required,
        },
        () => control,
    )

const sizeClass = (size: Size | null): string => (size === 'sm' || size === 'lg' ? `me-input--${size}` : '')

export const MeInput = defineComponent({
    name: 'MeInput',

    props: {
        ...fieldProps,
        modelValue: { type: [String, Number] as PropType<string | number | null>, default: '' },
        type: { type: String, default: 'text' },
        size: { type: String as PropType<Size | null>, default: null },
        prefix: { type: String as PropType<string | null>, default: null },
        suffix: { type: String as PropType<string | null>, default: null },
    },

    emits: { 'update:modelValue': (_value: string) => true },

    setup(props, { emit, attrs, slots }) {
        const root = ref<HTMLElement | null>(null)

        // The reveal button is core behaviour, not a prop of this component.
        onMounted(() => {
            if (props.type === 'password' && root.value) {
                initPasswordToggles(root.value)
            }
        })

        return () => {
            const isPassword = props.type === 'password'
            const grouped = Boolean(props.prefix) || Boolean(props.suffix) || isPassword || Boolean(slots.prefix) || Boolean(slots.suffix)

            const input = h('input', {
                ...attrs,
                type: props.type,
                id: props.id ?? props.name ?? undefined,
                name: props.name ?? undefined,
                value: props.modelValue,
                required: props.required || undefined,
                'aria-invalid': props.error ? 'true' : undefined,
                class: ['me-input', sizeClass(props.size)],
                onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
            })

            if (!grouped) {
                return field(props, input)
            }

            return field(
                props,
                h('div', { ref: root, class: 'me-input-group' }, [
                    slots.prefix?.() ?? (props.prefix ? h('span', { class: 'me-input-addon' }, props.prefix) : null),
                    input,
                    isPassword
                        ? h(
                              'button',
                              {
                                  type: 'button',
                                  class: 'me-input-addon me-input-addon--action',
                                  'data-me-password-toggle': '',
                                  'data-label-show': t('password.show'),
                                  'data-label-hide': t('password.hide'),
                              },
                              [
                                  h(MeIcon, { name: 'eye', class: 'me-reveal-show' }),
                                  h(MeIcon, { name: 'eye-off', class: 'me-reveal-hide' }),
                              ],
                          )
                        : null,
                    slots.suffix?.() ?? (props.suffix ? h('span', { class: 'me-input-addon' }, props.suffix) : null),
                ]),
            )
        }
    },
})

export const MeTextarea = defineComponent({
    name: 'MeTextarea',

    props: {
        ...fieldProps,
        modelValue: { type: String, default: '' },
        rows: { type: Number, default: 4 },
    },

    emits: { 'update:modelValue': (_value: string) => true },

    setup(props, { emit, attrs }) {
        return () =>
            field(
                props,
                h('textarea', {
                    ...attrs,
                    rows: props.rows,
                    id: props.id ?? props.name ?? undefined,
                    name: props.name ?? undefined,
                    value: props.modelValue,
                    required: props.required || undefined,
                    'aria-invalid': props.error ? 'true' : undefined,
                    class: 'me-input me-textarea',
                    onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value),
                }),
            )
    },
})

/** An option list, accepted either as a map or as a list of pairs. */
export type Options = Record<string | number, string> | Array<{ value: string; label: string }>

function toPairs(options: Options): Array<{ value: string; label: string }> {
    return Array.isArray(options)
        ? options
        : Object.entries(options).map(([value, label]) => ({ value, label }))
}

export const MeSelect = defineComponent({
    name: 'MeSelect',

    props: {
        ...fieldProps,
        modelValue: { type: [String, Number, Array] as PropType<string | number | string[] | null>, default: '' },
        options: { type: [Object, Array] as PropType<Options>, default: () => ({}) },
        placeholder: { type: String as PropType<string | null>, default: null },
        size: { type: String as PropType<Size | null>, default: null },
        multiple: { type: Boolean, default: false },
    },

    emits: { 'update:modelValue': (_value: string | string[]) => true },

    setup(props, { emit, attrs, slots }) {
        const selectedValues = (): string[] => {
            const current = props.modelValue

            return (Array.isArray(current) ? current : [current]).filter((v) => v !== null).map(String)
        }

        return () => {
            const chosen = selectedValues()

            return field(
                props,
                h(
                    'select',
                    {
                        ...attrs,
                        id: props.id ?? props.name ?? undefined,
                        name: props.name ? `${props.name}${props.multiple ? '[]' : ''}` : undefined,
                        multiple: props.multiple || undefined,
                        required: props.required || undefined,
                        'aria-invalid': props.error ? 'true' : undefined,
                        class: ['me-input', 'me-select', sizeClass(props.size)],
                        onChange: (event: Event) => {
                            const element = event.target as HTMLSelectElement

                            emit(
                                'update:modelValue',
                                props.multiple
                                    ? Array.from(element.selectedOptions).map((option) => option.value)
                                    : element.value,
                            )
                        },
                    },
                    [
                        props.placeholder
                            ? h('option', { value: '', selected: chosen.filter(Boolean).length === 0 }, props.placeholder)
                            : null,

                        // An options list wins; otherwise the slot supplies the markup.
                        ...(toPairs(props.options).length > 0
                            ? toPairs(props.options).map((option) =>
                                  h(
                                      'option',
                                      { key: option.value, value: option.value, selected: chosen.includes(option.value) },
                                      option.label,
                                  ),
                              )
                            : [slots.default?.()]),
                    ],
                ),
            )
        }
    },
})

export const MeCheckbox = defineComponent({
    name: 'MeCheckbox',

    props: {
        ...fieldProps,
        modelValue: { type: [Boolean, Array] as PropType<boolean | string[]>, default: false },
        value: { type: String, default: '1' },
        /** Renders the choice as a selectable card rather than a plain row. */
        card: { type: Boolean, default: false },
    },

    emits: { 'update:modelValue': (_value: boolean | string[]) => true },

    setup(props, { emit, attrs, slots }) {
        return () => {
            const grouped = Array.isArray(props.modelValue)
            const checked = grouped ? (props.modelValue as string[]).includes(props.value) : Boolean(props.modelValue)

            return h('div', { class: 'me-field' }, [
                h('label', { class: ['me-choice', props.card ? 'me-choice--card' : ''], for: props.id ?? props.name ?? undefined }, [
                    h('input', {
                        ...attrs,
                        type: 'checkbox',
                        class: 'me-check',
                        value: props.value,
                        id: props.id ?? props.name ?? undefined,
                        name: props.name ?? undefined,
                        checked,
                        'aria-invalid': props.error ? 'true' : undefined,
                        onChange: (event: Event) => {
                            const isChecked = (event.target as HTMLInputElement).checked

                            if (!grouped) {
                                emit('update:modelValue', isChecked)

                                return
                            }

                            const current = props.modelValue as string[]

                            emit(
                                'update:modelValue',
                                isChecked
                                    ? [...current, props.value]
                                    : current.filter((entry) => entry !== props.value),
                            )
                        },
                    }),

                    choiceBody(props.label, props.hint, slots.default?.()),
                ]),

                props.error ? errorLine(props.error) : null,
            ])
        }
    },
})

export const MeRadio = defineComponent({
    name: 'MeRadio',

    props: {
        ...fieldProps,
        modelValue: { type: [String, Number, null] as PropType<string | number | null>, default: null },
        value: { type: [String, Number], default: null },
        card: { type: Boolean, default: false },
    },

    emits: { 'update:modelValue': (_value: string | number) => true },

    setup(props, { emit, attrs, slots }) {
        return () => {
            const id = props.id ?? (props.name && props.value !== null ? `${props.name}_${props.value}` : props.name)

            return h('label', { class: ['me-choice', props.card ? 'me-choice--card' : ''], for: id ?? undefined }, [
                h('input', {
                    ...attrs,
                    type: 'radio',
                    class: 'me-radio',
                    value: props.value ?? undefined,
                    id: id ?? undefined,
                    name: props.name ?? undefined,
                    checked: String(props.modelValue) === String(props.value),
                    onChange: () => emit('update:modelValue', props.value),
                }),

                choiceBody(props.label, props.hint, slots.default?.()),
            ])
        }
    },
})

export const MeSwitch = defineComponent({
    name: 'MeSwitch',

    props: {
        ...fieldProps,
        modelValue: { type: Boolean, default: false },
        value: { type: String, default: '1' },
        size: { type: String as PropType<'md' | 'lg'>, default: 'md' },
    },

    emits: { 'update:modelValue': (_value: boolean) => true },

    setup(props, { emit, attrs, slots }) {
        return () =>
            h('div', { class: 'me-field' }, [
                h('label', { class: ['me-switch', props.size === 'lg' ? 'me-switch--lg' : ''], for: props.id ?? props.name ?? undefined }, [
                    // A visually hidden checkbox drives the track, so keyboard
                    // toggling and the label association stay native.
                    h('input', {
                        ...attrs,
                        type: 'checkbox',
                        role: 'switch',
                        class: 'me-switch__input',
                        value: props.value,
                        id: props.id ?? props.name ?? undefined,
                        name: props.name ?? undefined,
                        checked: props.modelValue,
                        onChange: (event: Event) =>
                            emit('update:modelValue', (event.target as HTMLInputElement).checked),
                    }),

                    h('span', { class: 'me-switch__track', 'aria-hidden': 'true' }, [
                        h('span', { class: 'me-switch__thumb' }),
                    ]),

                    choiceBody(props.label, props.hint, slots.default?.()),
                ]),

                props.error ? errorLine(props.error) : null,
            ])
    },
})

function choiceBody(label: string | null, hint: string | null, slot: unknown): VNode | null {
    if (!label && !hint && !slot) {
        return null
    }

    return h('span', { class: 'me-choice__body' }, [
        label ? h('span', { class: 'me-choice__label' }, label) : null,
        hint ? h('span', { class: 'me-choice__hint' }, hint) : null,
        slot as VNode,
    ])
}

function errorLine(error: string): VNode {
    return h('p', { class: 'me-error' }, [h(MeIcon, { name: 'alert-circle' }), h('span', error)])
}

export interface SelectFieldOption {
    value: string
    label: string
    disabled?: boolean
    description?: string
    group?: string
}

/**
 * The custom select — searching, multiple selection, option descriptions and
 * groups. For a plain list of values prefer MeSelect: the native element gets
 * the platform picker on mobile and costs nothing.
 */
export const MeSelectField = defineComponent({
    name: 'MeSelectField',

    props: {
        ...fieldProps,
        modelValue: { type: [String, Array] as PropType<string | string[] | null>, default: null },
        options: { type: Array as PropType<SelectFieldOption[]>, default: () => [] },
        placeholder: { type: String as PropType<string | null>, default: null },
        multiple: { type: Boolean, default: false },
        searchable: { type: Boolean, default: true },
        clearable: { type: Boolean, default: true },
    },

    emits: { 'update:modelValue': (_value: string | string[]) => true },

    setup(props, { emit, attrs }) {
        const host = ref<HTMLElement | null>(null)

        const onChange = (): void => {
            const values = Array.from(
                host.value?.querySelectorAll<HTMLInputElement>('[data-me-select-inputs] input') ?? [],
            )
                .map((input) => input.value)
                .filter((value) => value !== '')

            emit('update:modelValue', props.multiple ? values : (values[0] ?? ''))
        }

        onMounted(() => {
            if (!host.value) {
                return
            }

            initSelects(host.value)
            host.value.addEventListener('change', onChange)
        })

        onBeforeUnmount(() => host.value?.removeEventListener('change', onChange))

        return () => {
            const placeholder = props.placeholder ?? t('select.placeholder')
            const selected = props.modelValue === null
                ? []
                : (Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]).map(String).filter(Boolean)

            return field(
                props,
                h(
                    'div',
                    {
                        ref: host,
                        class: 'me-select-field',
                        'data-me-select': '',
                        id: props.id ?? props.name ?? undefined,
                        'data-name': props.name ?? '',
                        'data-multiple': String(props.multiple),
                        'data-placeholder': placeholder,
                        'data-options': JSON.stringify(props.options),
                        'data-selected': JSON.stringify(selected),
                        'data-empty': String(selected.length === 0),
                        'data-open': 'false',
                    },
                    [
                        h(
                            'button',
                            {
                                ...attrs,
                                type: 'button',
                                class: 'me-select-trigger',
                                'data-me-select-trigger': '',
                                'aria-invalid': props.error ? 'true' : undefined,
                            },
                            [
                                h('span', { class: 'me-select-trigger__value', 'data-me-select-value': '' }, placeholder),

                                props.clearable
                                    ? h(
                                          'span',
                                          {
                                              class: 'me-select-clear',
                                              'data-me-select-clear': '',
                                              role: 'button',
                                              tabindex: '-1',
                                              'aria-label': t('select.clear'),
                                          },
                                          [h(MeIcon, { name: 'x' })],
                                      )
                                    : null,

                                h(MeIcon, { name: 'chevron-down', class: 'me-select-trigger__chevron' }),
                            ],
                        ),

                        h('div', { class: 'me-select-panel', 'data-me-select-panel': '' }, [
                            props.searchable
                                ? h('div', { class: 'me-select-search' }, [
                                      h('input', {
                                          type: 'text',
                                          class: 'me-input me-input--sm',
                                          'data-me-select-search': '',
                                          placeholder: t('select.search'),
                                          'aria-label': t('select.search'),
                                          autocomplete: 'off',
                                      }),
                                  ])
                                : null,

                            h('ul', { class: 'me-select-list', role: 'listbox', 'data-me-select-list': '' }),

                            h('p', { class: 'me-select__empty', 'data-me-select-empty': '', hidden: true }, t('select.empty')),
                        ]),

                        h('div', { 'data-me-select-inputs': '' }),
                    ],
                ),
            )
        }
    },
})

/**
 * Numeric input.
 *
 * Two inputs, as in Blade: a visible one formatted for the locale and a hidden
 * one carrying the raw value. v-model reads the raw one, so the component
 * never hands a localised string to the application.
 */
export const MeNumeric = defineComponent({
    name: 'MeNumeric',

    props: {
        ...fieldProps,
        modelValue: { type: [String, Number] as PropType<string | number | null>, default: null },
        decimals: { type: Number as PropType<number | null>, default: null },
        min: { type: Number as PropType<number | null>, default: null },
        max: { type: Number as PropType<number | null>, default: null },
        step: { type: Number, default: 1 },
        prefix: { type: String as PropType<string | null>, default: null },
        suffix: { type: String as PropType<string | null>, default: null },
        grouping: { type: Boolean, default: true },
        locale: { type: String as PropType<string | null>, default: null },
        stepper: { type: Boolean, default: true },
    },

    emits: { 'update:modelValue': (_value: string) => true },

    setup(props, { emit, attrs }) {
        const host = ref<HTMLElement | null>(null)

        const onChange = (event: Event): void => {
            const target = event.target as HTMLElement

            if (target.hasAttribute('data-me-numeric-value')) {
                emit('update:modelValue', (target as HTMLInputElement).value)
            }
        }

        onMounted(() => {
            if (!host.value) {
                return
            }

            initNumericInputs(host.value)
            host.value.addEventListener('change', onChange)
        })

        onBeforeUnmount(() => host.value?.removeEventListener('change', onChange))

        return () =>
            field(
                props,
                h(
                    'div',
                    {
                        ref: host,
                        class: 'me-input-group',
                        'data-me-numeric': '',
                        'data-locale': props.locale ?? undefined,
                        'data-step': String(props.step),
                        'data-grouping': String(props.grouping),
                        'data-decimals': props.decimals ?? undefined,
                        'data-min': props.min ?? undefined,
                        'data-max': props.max ?? undefined,
                    },
                    [
                        props.prefix
                            ? h('span', { class: 'me-input-addon me-input-addon--bordered' }, props.prefix)
                            : null,

                        h('input', {
                            ...attrs,
                            type: 'text',
                            inputmode: 'decimal',
                            autocomplete: 'off',
                            class: 'me-input me-input--numeric',
                            'data-me-numeric-display': '',
                            id: props.id ?? props.name ?? undefined,
                            required: props.required || undefined,
                            'aria-invalid': props.error ? 'true' : undefined,
                        }),

                        props.suffix
                            ? h('span', { class: 'me-input-addon me-input-addon--bordered' }, props.suffix)
                            : null,

                        props.stepper
                            ? h('div', { class: 'me-stepper' }, [
                                  h('button', { type: 'button', 'data-me-step-up': '', tabindex: '-1' }, [
                                      h(MeIcon, { name: 'plus', stroke: 2.5 }),
                                  ]),
                                  h('button', { type: 'button', 'data-me-step-down': '', tabindex: '-1' }, [
                                      h(MeIcon, { name: 'minus', stroke: 2.5 }),
                                  ]),
                              ])
                            : null,

                        h('input', {
                            type: 'hidden',
                            'data-me-numeric-value': '',
                            name: props.name ?? undefined,
                            value: props.modelValue ?? '',
                        }),
                    ],
                ),
            )
    },
})

/**
 * Upload dropzone.
 *
 * The zone is a label wrapping a real file input, so click and keyboard
 * activation work before any JavaScript. Drag-and-drop, the file list and the
 * size and type checks come from the core binding.
 */
export const MeUpload = defineComponent({
    name: 'MeUpload',

    props: {
        ...fieldProps,
        accept: { type: String as PropType<string | null>, default: null },
        multiple: { type: Boolean, default: false },
        /** In bytes. */
        maxSize: { type: Number as PropType<number | null>, default: null },
        maxFiles: { type: Number as PropType<number | null>, default: null },
        disabled: { type: Boolean, default: false },
    },

    emits: { 'update:modelValue': (_files: File[]) => true, change: (_files: File[]) => true },

    setup(props, { emit, attrs }) {
        const host = ref<HTMLElement | null>(null)

        const onChange = (event: Event): void => {
            const target = event.target as HTMLInputElement

            if (!target.hasAttribute('data-me-upload-input')) {
                return
            }

            const files = Array.from(target.files ?? [])

            emit('update:modelValue', files)
            emit('change', files)
        }

        onMounted(() => {
            if (!host.value) {
                return
            }

            initUploads(host.value)
            host.value.addEventListener('change', onChange)
        })

        onBeforeUnmount(() => host.value?.removeEventListener('change', onChange))

        return () =>
            field(
                props,
                h(
                    'div',
                    {
                        ref: host,
                        class: 'me-upload',
                        'data-me-upload': '',
                        'data-max-size': props.maxSize ?? undefined,
                        'data-max-files': props.maxFiles ?? undefined,
                        'data-msg-too-large': t('upload.tooLarge'),
                        'data-msg-wrong-type': t('upload.wrongType'),
                        'data-msg-too-many': t('upload.tooMany'),
                        'data-msg-remove': t('upload.remove'),
                    },
                    [
                        h(
                            'label',
                            {
                                class: 'me-upload__zone',
                                'data-me-upload-zone': '',
                                'data-disabled': props.disabled ? 'true' : undefined,
                            },
                            [
                                h('input', {
                                    ...attrs,
                                    type: 'file',
                                    class: 'me-upload__input',
                                    'data-me-upload-input': '',
                                    id: props.id ?? props.name ?? undefined,
                                    name: props.name ? `${props.name}${props.multiple ? '[]' : ''}` : undefined,
                                    accept: props.accept ?? undefined,
                                    multiple: props.multiple || undefined,
                                    required: props.required || undefined,
                                    disabled: props.disabled || undefined,
                                }),

                                h(MeIcon, { name: 'upload-cloud', class: 'me-upload__icon' }),

                                // ":browse" is emphasised, as in Blade — built
                                // from vnodes rather than innerHTML so the
                                // translated string is never treated as markup.
                                h('span', { class: 'me-upload__title' }, dropLabel()),

                                props.accept || props.maxSize
                                    ? h(
                                          'span',
                                          { class: 'me-upload__hint' },
                                          [props.accept, props.maxSize ? t('upload.upTo', { size: formatBytes(props.maxSize) }) : null]
                                              .filter(Boolean)
                                              .join(' · '),
                                      )
                                    : null,
                            ],
                        ),

                        h('ul', { class: 'me-upload__list', 'data-me-upload-list': '' }),
                    ],
                ),
            )
    },
})

/** "Drop files here or <em>browse</em>", assembled without innerHTML. */
function dropLabel(): (VNode | string)[] {
    const [before = '', after = ''] = t('upload.drop').split(':browse')

    return [before, h('em', t('upload.browse')), after]
}

/**
 * Byte sizes as a person reads them. Mirrors MyEyes\Support\FileSize so the
 * hint reads the same whichever renderer drew it.
 */
function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']

    if (bytes <= 0) {
        return '0 B'
    }

    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
    const value = bytes / 1024 ** exponent

    // Whole bytes never need a decimal, and a trailing ".0" is noise.
    const decimals = exponent === 0 || value % 1 === 0 ? 0 : 1

    return `${value.toFixed(decimals)} ${units[exponent]}`
}
