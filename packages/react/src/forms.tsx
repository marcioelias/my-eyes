'use client'

import { initNumericInputs, initPasswordToggles, initSelects, initUploads, t } from '@my-eyes/core'
import {
    forwardRef,
    useEffect,
    useRef,
    type InputHTMLAttributes,
    type ReactNode,
    type SelectHTMLAttributes,
    type TextareaHTMLAttributes,
} from 'react'
import { cx } from './cx.js'
import { MeField, MeIcon, type Size } from './primitives.js'

/**
 * Form controls.
 *
 * Each one wraps its control in MeField, so label, hint and error markup is
 * identical to the Blade components. All of them are controlled through `value`
 * and `onValueChange` — the React translation of Vue's `v-model` (BR-07).
 *
 * The four that carry real behaviour — the custom select, the numeric input,
 * the upload dropzone and the password reveal — delegate to the bindings in
 * `@my-eyes/core`, which is the same code the Blade, Livewire and Vue renderers
 * run. They render the markup, bind their own element on mount, and read the
 * value back from the `change` the binding already emits.
 *
 * @see docs/features/react-package.md
 */

export interface FieldProps {
    label?: string | null
    hint?: string | null
    error?: string | null
    required?: boolean
    id?: string | null
    name?: string | null
}

function Field({ label, hint, error, required, id, name, children }: FieldProps & { children: ReactNode }) {
    return (
        <MeField
            label={label ?? null}
            hint={hint ?? null}
            error={error ?? null}
            htmlFor={id ?? name ?? null}
            required={required ?? false}
        >
            {children}
        </MeField>
    )
}

const sizeClass = (size: Size | null | undefined): string => (size === 'sm' || size === 'lg' ? `me-input--${size}` : '')

/**
 * An addon, from either a string or a node.
 *
 * Vue has a prop and a slot for this; in React a string is already a node, so
 * one prop covers both — a string gets the addon wrapper, a node is trusted to
 * carry its own.
 */
function addon(value: ReactNode): ReactNode {
    if (value === null || value === undefined || value === false) {
        return null
    }

    return typeof value === 'string' ? <span className="me-input-addon">{value}</span> : value
}

export interface MeInputProps
    extends FieldProps,
        Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'id' | 'name' | 'required' | 'prefix' | 'size'> {
    value?: string | number | null
    onValueChange?: (value: string) => void
    type?: string
    size?: Size | null
    prefix?: ReactNode
    suffix?: ReactNode
}

export const MeInput = forwardRef<HTMLInputElement, MeInputProps>(function MeInput(
    {
        label = null,
        hint = null,
        error = null,
        required = false,
        id = null,
        name = null,
        value = '',
        onValueChange,
        type = 'text',
        size = null,
        prefix,
        suffix,
        className,
        onChange,
        ...rest
    },
    ref,
) {
    const group = useRef<HTMLDivElement | null>(null)
    const isPassword = type === 'password'

    // The reveal button is core behaviour, not a prop of this component.
    useEffect(() => {
        if (isPassword && group.current) {
            initPasswordToggles(group.current)
        }
    }, [isPassword])

    const input = (
        <input
            ref={ref}
            type={type}
            id={id ?? name ?? undefined}
            name={name ?? undefined}
            value={value ?? ''}
            required={required || undefined}
            aria-invalid={error ? 'true' : undefined}
            className={cx('me-input', sizeClass(size), className)}
            onChange={(event) => {
                onValueChange?.(event.target.value)
                onChange?.(event)
            }}
            {...rest}
        />
    )

    const grouped = Boolean(prefix) || Boolean(suffix) || isPassword

    return (
        <Field label={label} hint={hint} error={error} required={required} id={id} name={name}>
            {grouped ? (
                <div ref={group} className="me-input-group">
                    {addon(prefix)}
                    {input}
                    {isPassword ? (
                        <button
                            type="button"
                            className="me-input-addon me-input-addon--action"
                            data-me-password-toggle=""
                            data-label-show={t('password.show')}
                            data-label-hide={t('password.hide')}
                        >
                            <MeIcon name="eye" className="me-reveal-show" />
                            <MeIcon name="eye-off" className="me-reveal-hide" />
                        </button>
                    ) : null}
                    {addon(suffix)}
                </div>
            ) : (
                input
            )}
        </Field>
    )
})

export interface MeTextareaProps
    extends FieldProps,
        Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'id' | 'name' | 'required'> {
    value?: string
    onValueChange?: (value: string) => void
    rows?: number
}

export const MeTextarea = forwardRef<HTMLTextAreaElement, MeTextareaProps>(function MeTextarea(
    {
        label = null,
        hint = null,
        error = null,
        required = false,
        id = null,
        name = null,
        value = '',
        onValueChange,
        rows = 4,
        className,
        onChange,
        ...rest
    },
    ref,
) {
    return (
        <Field label={label} hint={hint} error={error} required={required} id={id} name={name}>
            <textarea
                ref={ref}
                rows={rows}
                id={id ?? name ?? undefined}
                name={name ?? undefined}
                value={value}
                required={required || undefined}
                aria-invalid={error ? 'true' : undefined}
                className={cx('me-input', 'me-textarea', className)}
                onChange={(event) => {
                    onValueChange?.(event.target.value)
                    onChange?.(event)
                }}
                {...rest}
            />
        </Field>
    )
})

/** An option list, accepted either as a map or as a list of pairs. */
export type Options = Record<string | number, string> | Array<{ value: string; label: string }>

function toPairs(options: Options): Array<{ value: string; label: string }> {
    return Array.isArray(options) ? options : Object.entries(options).map(([value, label]) => ({ value, label }))
}

export interface MeSelectProps
    extends FieldProps,
        Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'id' | 'name' | 'required' | 'multiple' | 'size'> {
    value?: string | number | string[] | null
    onValueChange?: (value: string | string[]) => void
    options?: Options
    placeholder?: string | null
    size?: Size | null
    multiple?: boolean
    children?: ReactNode
}

export const MeSelect = forwardRef<HTMLSelectElement, MeSelectProps>(function MeSelect(
    {
        label = null,
        hint = null,
        error = null,
        required = false,
        id = null,
        name = null,
        value = '',
        onValueChange,
        options = {},
        placeholder = null,
        size = null,
        multiple = false,
        className,
        children,
        onChange,
        ...rest
    },
    ref,
) {
    const pairs = toPairs(options)

    /*
     * React drives the selection from the element, not from `selected` on each
     * option — that is the one place a native select differs between the two
     * renderers, and it is React's rule rather than a design decision.
     */
    const selected = multiple
        ? (Array.isArray(value) ? value : value === null || value === '' ? [] : [value]).map(String)
        : String(value ?? '')

    return (
        <Field label={label} hint={hint} error={error} required={required} id={id} name={name}>
            <select
                ref={ref}
                id={id ?? name ?? undefined}
                name={name ? `${name}${multiple ? '[]' : ''}` : undefined}
                multiple={multiple || undefined}
                required={required || undefined}
                aria-invalid={error ? 'true' : undefined}
                className={cx('me-input', 'me-select', sizeClass(size), className)}
                value={selected}
                onChange={(event) => {
                    onValueChange?.(
                        multiple
                            ? Array.from(event.target.selectedOptions).map((option) => option.value)
                            : event.target.value,
                    )
                    onChange?.(event)
                }}
                {...rest}
            >
                {placeholder ? <option value="">{placeholder}</option> : null}

                {/* An options list wins; otherwise children supply the markup. */}
                {pairs.length > 0
                    ? pairs.map((option) => (
                          <option key={option.value} value={option.value}>
                              {option.label}
                          </option>
                      ))
                    : children}
            </select>
        </Field>
    )
})

export interface MeCheckboxProps
    extends FieldProps,
        Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'id' | 'name' | 'required' | 'type' | 'checked'> {
    /** A boolean on its own, or an array to act as one of a group. */
    value?: boolean | string[]
    onValueChange?: (value: boolean | string[]) => void
    /** The value this box contributes when it belongs to a group. */
    checkboxValue?: string
    /** Renders the choice as a selectable card rather than a plain row. */
    card?: boolean
    children?: ReactNode
}

export const MeCheckbox = forwardRef<HTMLInputElement, MeCheckboxProps>(function MeCheckbox(
    {
        label = null,
        hint = null,
        error = null,
        id = null,
        name = null,
        value = false,
        onValueChange,
        checkboxValue = '1',
        card = false,
        className,
        children,
        onChange,
        ...rest
    },
    ref,
) {
    const grouped = Array.isArray(value)
    const checked = grouped ? value.includes(checkboxValue) : Boolean(value)

    return (
        <div className="me-field">
            <label className={cx('me-choice', card && 'me-choice--card')} htmlFor={id ?? name ?? undefined}>
                <input
                    ref={ref}
                    type="checkbox"
                    className={cx('me-check', className)}
                    value={checkboxValue}
                    id={id ?? name ?? undefined}
                    name={name ?? undefined}
                    checked={checked}
                    aria-invalid={error ? 'true' : undefined}
                    onChange={(event) => {
                        const isChecked = event.target.checked

                        if (!grouped) {
                            onValueChange?.(isChecked)
                        } else {
                            onValueChange?.(
                                isChecked
                                    ? [...value, checkboxValue]
                                    : value.filter((entry) => entry !== checkboxValue),
                            )
                        }

                        onChange?.(event)
                    }}
                    {...rest}
                />

                <ChoiceBody label={label} hint={hint}>
                    {children}
                </ChoiceBody>
            </label>

            {error ? <ErrorLine error={error} /> : null}
        </div>
    )
})

export interface MeRadioProps
    extends FieldProps,
        Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'id' | 'name' | 'type' | 'checked'> {
    value?: string | number | null
    onValueChange?: (value: string | number) => void
    /** The value this option carries. */
    radioValue?: string | number | null
    card?: boolean
    children?: ReactNode
}

export const MeRadio = forwardRef<HTMLInputElement, MeRadioProps>(function MeRadio(
    {
        label = null,
        hint = null,
        id = null,
        name = null,
        value = null,
        onValueChange,
        radioValue = null,
        card = false,
        className,
        children,
        onChange,
        ...rest
    },
    ref,
) {
    const resolvedId = id ?? (name && radioValue !== null ? `${name}_${radioValue}` : name)

    return (
        <label className={cx('me-choice', card && 'me-choice--card')} htmlFor={resolvedId ?? undefined}>
            <input
                ref={ref}
                type="radio"
                className={cx('me-radio', className)}
                value={radioValue ?? undefined}
                id={resolvedId ?? undefined}
                name={name ?? undefined}
                checked={String(value) === String(radioValue)}
                onChange={(event) => {
                    if (radioValue !== null) {
                        onValueChange?.(radioValue)
                    }

                    onChange?.(event)
                }}
                {...rest}
            />

            <ChoiceBody label={label} hint={hint}>
                {children}
            </ChoiceBody>
        </label>
    )
})

export interface MeSwitchProps
    extends FieldProps,
        Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'id' | 'name' | 'type' | 'checked' | 'size'> {
    value?: boolean
    onValueChange?: (value: boolean) => void
    switchValue?: string
    size?: 'md' | 'lg'
    children?: ReactNode
}

export const MeSwitch = forwardRef<HTMLInputElement, MeSwitchProps>(function MeSwitch(
    {
        label = null,
        hint = null,
        error = null,
        id = null,
        name = null,
        value = false,
        onValueChange,
        switchValue = '1',
        size = 'md',
        className,
        children,
        onChange,
        ...rest
    },
    ref,
) {
    return (
        <div className="me-field">
            <label className={cx('me-switch', size === 'lg' && 'me-switch--lg')} htmlFor={id ?? name ?? undefined}>
                {/*
                 * A visually hidden checkbox drives the track, so keyboard
                 * toggling and the label association stay native.
                 */}
                <input
                    ref={ref}
                    type="checkbox"
                    role="switch"
                    className={cx('me-switch__input', className)}
                    value={switchValue}
                    id={id ?? name ?? undefined}
                    name={name ?? undefined}
                    checked={value}
                    onChange={(event) => {
                        onValueChange?.(event.target.checked)
                        onChange?.(event)
                    }}
                    {...rest}
                />

                <span className="me-switch__track" aria-hidden="true">
                    <span className="me-switch__thumb" />
                </span>

                <ChoiceBody label={label} hint={hint}>
                    {children}
                </ChoiceBody>
            </label>

            {error ? <ErrorLine error={error} /> : null}
        </div>
    )
})

function ChoiceBody({ label, hint, children }: { label?: string | null; hint?: string | null; children?: ReactNode }) {
    if (!label && !hint && !children) {
        return null
    }

    return (
        <span className="me-choice__body">
            {label ? <span className="me-choice__label">{label}</span> : null}
            {hint ? <span className="me-choice__hint">{hint}</span> : null}
            {children}
        </span>
    )
}

function ErrorLine({ error }: { error: string }) {
    return (
        <p className="me-error">
            <MeIcon name="alert-circle" />
            <span>{error}</span>
        </p>
    )
}

export interface SelectFieldOption {
    value: string
    label: string
    disabled?: boolean
    description?: string
    group?: string
}

export interface MeSelectFieldProps extends FieldProps {
    value?: string | string[] | null
    onValueChange?: (value: string | string[]) => void
    options?: SelectFieldOption[]
    placeholder?: string | null
    multiple?: boolean
    searchable?: boolean
    clearable?: boolean
}

/**
 * The custom select — searching, multiple selection, option descriptions and
 * groups. For a plain list of values prefer MeSelect: the native element gets
 * the platform picker on mobile and costs nothing.
 */
export function MeSelectField({
    label = null,
    hint = null,
    error = null,
    required = false,
    id = null,
    name = null,
    value = null,
    onValueChange,
    options = [],
    placeholder = null,
    multiple = false,
    searchable = true,
    clearable = true,
}: MeSelectFieldProps) {
    const host = useRef<HTMLDivElement | null>(null)
    const notify = useRef(onValueChange)
    notify.current = onValueChange

    useEffect(() => {
        const element = host.current

        if (!element) {
            return
        }

        initSelects(element)

        const onChange = (): void => {
            const values = Array.from(element.querySelectorAll<HTMLInputElement>('[data-me-select-inputs] input'))
                .map((input) => input.value)
                .filter((entry) => entry !== '')

            notify.current?.(multiple ? values : (values[0] ?? ''))
        }

        element.addEventListener('change', onChange)

        return () => element.removeEventListener('change', onChange)
    }, [multiple])

    const resolvedPlaceholder = placeholder ?? t('select.placeholder')
    const selected =
        value === null ? [] : (Array.isArray(value) ? value : [value]).map(String).filter(Boolean)

    return (
        <Field label={label} hint={hint} error={error} required={required} id={id} name={name}>
            <div
                ref={host}
                className="me-select-field"
                data-me-select=""
                id={id ?? name ?? undefined}
                data-name={name ?? ''}
                data-multiple={String(multiple)}
                data-placeholder={resolvedPlaceholder}
                data-options={JSON.stringify(options)}
                data-selected={JSON.stringify(selected)}
                data-empty={String(selected.length === 0)}
                data-open="false"
            >
                <button
                    type="button"
                    className="me-select-trigger"
                    data-me-select-trigger=""
                    aria-invalid={error ? 'true' : undefined}
                >
                    <span className="me-select-trigger__value" data-me-select-value="">
                        {resolvedPlaceholder}
                    </span>

                    {clearable ? (
                        <span
                            className="me-select-clear"
                            data-me-select-clear=""
                            role="button"
                            tabIndex={-1}
                            aria-label={t('select.clear')}
                        >
                            <MeIcon name="x" />
                        </span>
                    ) : null}

                    <MeIcon name="chevron-down" className="me-select-trigger__chevron" />
                </button>

                <div className="me-select-panel" data-me-select-panel="">
                    {searchable ? (
                        <div className="me-select-search">
                            <input
                                type="text"
                                className="me-input me-input--sm"
                                data-me-select-search=""
                                placeholder={t('select.search')}
                                aria-label={t('select.search')}
                                autoComplete="off"
                            />
                        </div>
                    ) : null}

                    <ul className="me-select-list" role="listbox" data-me-select-list="" />

                    <p className="me-select__empty" data-me-select-empty="" hidden>
                        {t('select.empty')}
                    </p>
                </div>

                <div data-me-select-inputs="" />
            </div>
        </Field>
    )
}

export interface MeNumericProps extends FieldProps {
    value?: string | number | null
    onValueChange?: (value: string) => void
    decimals?: number | null
    min?: number | null
    max?: number | null
    step?: number
    prefix?: string | null
    suffix?: string | null
    grouping?: boolean
    locale?: string | null
    stepper?: boolean
}

/**
 * Numeric input.
 *
 * Two inputs, as in Blade: a visible one formatted for the locale and a hidden
 * one carrying the raw value. `onValueChange` reports the raw one, so the
 * component never hands a localised string to the application.
 */
export function MeNumeric({
    label = null,
    hint = null,
    error = null,
    required = false,
    id = null,
    name = null,
    value = null,
    onValueChange,
    decimals = null,
    min = null,
    max = null,
    step = 1,
    prefix = null,
    suffix = null,
    grouping = true,
    locale = null,
    stepper = true,
}: MeNumericProps) {
    const host = useRef<HTMLDivElement | null>(null)
    const notify = useRef(onValueChange)
    notify.current = onValueChange

    useEffect(() => {
        const element = host.current

        if (!element) {
            return
        }

        initNumericInputs(element)

        const onChange = (event: Event): void => {
            const target = event.target as HTMLElement

            if (target.hasAttribute('data-me-numeric-value')) {
                notify.current?.((target as HTMLInputElement).value)
            }
        }

        element.addEventListener('change', onChange)

        return () => element.removeEventListener('change', onChange)
    }, [])

    return (
        <Field label={label} hint={hint} error={error} required={required} id={id} name={name}>
            <div
                ref={host}
                className="me-input-group"
                data-me-numeric=""
                data-locale={locale ?? undefined}
                data-step={String(step)}
                data-grouping={String(grouping)}
                data-decimals={decimals ?? undefined}
                data-min={min ?? undefined}
                data-max={max ?? undefined}
            >
                {prefix ? <span className="me-input-addon me-input-addon--bordered">{prefix}</span> : null}

                <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="me-input me-input--numeric"
                    data-me-numeric-display=""
                    id={id ?? name ?? undefined}
                    required={required || undefined}
                    aria-invalid={error ? 'true' : undefined}
                />

                {suffix ? <span className="me-input-addon me-input-addon--bordered">{suffix}</span> : null}

                {stepper ? (
                    <div className="me-stepper">
                        <button type="button" data-me-step-up="" tabIndex={-1}>
                            <MeIcon name="plus" stroke={2.5} />
                        </button>
                        <button type="button" data-me-step-down="" tabIndex={-1}>
                            <MeIcon name="minus" stroke={2.5} />
                        </button>
                    </div>
                ) : null}

                {/*
                 * The binding writes the raw value here and dispatches change.
                 * readOnly keeps React from warning about a value with no
                 * handler — the handler is the listener above, on the container.
                 */}
                <input
                    type="hidden"
                    data-me-numeric-value=""
                    name={name ?? undefined}
                    value={value ?? ''}
                    readOnly
                />
            </div>
        </Field>
    )
}

export interface MeUploadProps extends FieldProps {
    onValueChange?: (files: File[]) => void
    accept?: string | null
    multiple?: boolean
    /** In bytes. */
    maxSize?: number | null
    maxFiles?: number | null
    disabled?: boolean
}

/**
 * Upload dropzone.
 *
 * The zone is a label wrapping a real file input, so click and keyboard
 * activation work before any JavaScript. Drag-and-drop, the file list and the
 * size and type checks come from the core binding.
 */
export function MeUpload({
    label = null,
    hint = null,
    error = null,
    required = false,
    id = null,
    name = null,
    onValueChange,
    accept = null,
    multiple = false,
    maxSize = null,
    maxFiles = null,
    disabled = false,
}: MeUploadProps) {
    const host = useRef<HTMLDivElement | null>(null)
    const notify = useRef(onValueChange)
    notify.current = onValueChange

    useEffect(() => {
        const element = host.current

        if (!element) {
            return
        }

        initUploads(element)

        const onChange = (event: Event): void => {
            const target = event.target as HTMLInputElement

            if (!target.hasAttribute('data-me-upload-input')) {
                return
            }

            notify.current?.(Array.from(target.files ?? []))
        }

        element.addEventListener('change', onChange)

        return () => element.removeEventListener('change', onChange)
    }, [])

    return (
        <Field label={label} hint={hint} error={error} required={required} id={id} name={name}>
            <div
                ref={host}
                className="me-upload"
                data-me-upload=""
                data-max-size={maxSize ?? undefined}
                data-max-files={maxFiles ?? undefined}
                data-msg-too-large={t('upload.tooLarge')}
                data-msg-wrong-type={t('upload.wrongType')}
                data-msg-too-many={t('upload.tooMany')}
                data-msg-remove={t('upload.remove')}
            >
                <label className="me-upload__zone" data-me-upload-zone="" data-disabled={disabled ? 'true' : undefined}>
                    <input
                        type="file"
                        className="me-upload__input"
                        data-me-upload-input=""
                        id={id ?? name ?? undefined}
                        name={name ? `${name}${multiple ? '[]' : ''}` : undefined}
                        accept={accept ?? undefined}
                        multiple={multiple || undefined}
                        required={required || undefined}
                        disabled={disabled || undefined}
                    />

                    <MeIcon name="upload-cloud" className="me-upload__icon" />

                    {/*
                     * ":browse" is emphasised, as in Blade — assembled from
                     * elements rather than innerHTML, so the translated string is
                     * never treated as markup.
                     */}
                    <span className="me-upload__title">
                        <DropLabel />
                    </span>

                    {accept || maxSize ? (
                        <span className="me-upload__hint">
                            {[accept, maxSize ? t('upload.upTo', { size: formatBytes(maxSize) }) : null]
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                    ) : null}
                </label>

                <ul className="me-upload__list" data-me-upload-list="" />
            </div>
        </Field>
    )
}

/** "Drop files here or <em>browse</em>", assembled without innerHTML. */
function DropLabel() {
    const [before = '', after = ''] = t('upload.drop').split(':browse')

    return (
        <>
            {before}
            <em>{t('upload.browse')}</em>
            {after}
        </>
    )
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
