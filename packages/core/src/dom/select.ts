import { createDismissable, type Dismissable } from '../headless/dismissable.js'
import { t } from '../headless/i18n.js'
import {
    filterOptions,
    nextEnabledIndex,
    summarise,
    toggleValue,
    type SelectOption,
} from '../headless/select.js'
import { bind, emitInput } from './helpers.js'

/*
 * Custom select.
 *
 * Renders its own list rather than using <select>, which is what makes option
 * descriptions, groups and multi-select checkboxes possible. The trade-off is
 * that everything the platform gave us for free has to be rebuilt: keyboard
 * navigation, the listbox ARIA contract, and form submission.
 *
 * Form values are carried by hidden inputs kept in sync with the selection, so
 * the control submits like any other field and needs no JS on the server side.
 *
 * Use <x-me::select> (the native element) when you just need a list of values —
 * it gets the platform picker on mobile and is the better choice. Reach for this
 * one when you need multi-select, search, descriptions or disabled options.
 */

const seen = new WeakSet<Element>()

export function initSelects(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-select]', seen, setup)
}

function setup(container: HTMLElement): void {
    const trigger = container.querySelector<HTMLElement>('[data-me-select-trigger]')
    const panel = container.querySelector<HTMLElement>('[data-me-select-panel]')
    const list = container.querySelector<HTMLElement>('[data-me-select-list]')
    const valueLabel = container.querySelector<HTMLElement>('[data-me-select-value]')
    const inputs = container.querySelector<HTMLElement>('[data-me-select-inputs]')
    const search = container.querySelector<HTMLInputElement>('[data-me-select-search]')
    const emptyState = container.querySelector<HTMLElement>('[data-me-select-empty]')

    if (!trigger || !panel || !list || !valueLabel || !inputs) {
        return
    }

    const options = parseJson<SelectOption[]>(container.dataset.options, [])
    const multiple = container.dataset.multiple === 'true'
    const name = container.dataset.name ?? ''
    const placeholder = container.dataset.placeholder || t('select.placeholder')

    let selected = parseJson<string[]>(container.dataset.selected, [])
    let visible: SelectOption[] = options
    let activeIndex = -1

    const dismissable: Dismissable = createDismissable({
        trigger,
        panel,
        flip: true,
        shift: true,
        onChange: (open) => {
            container.dataset.open = String(open)

            if (open) {
                // Start the highlight on the first selected option, so arrows
                // continue from where the user left off.
                activeIndex = visible.findIndex((option) => selected.includes(option.value))
                renderList()
                search?.focus()
            } else if (search) {
                search.value = ''
                visible = options
                renderList()
            }
        },
    })

    const renderValue = (): void => {
        valueLabel.textContent = summarise(options, selected, placeholder, t('select.selected'))
        container.dataset.empty = String(selected.length === 0)
    }

    const renderInputs = (): void => {
        inputs.replaceChildren()

        if (name === '') {
            return
        }

        /*
         * An empty hidden input for a multi-select that has been cleared:
         * without it the field is absent from the request and the server sees
         * "not submitted" rather than "emptied".
         */
        if (multiple && selected.length === 0) {
            inputs.append(hiddenInput(`${name}[]`, ''))

            return
        }

        selected.forEach((value) => {
            inputs.append(hiddenInput(multiple ? `${name}[]` : name, value))
        })
    }

    const renderList = (): void => {
        list.replaceChildren()

        visible.forEach((option, index) => {
            const previous = visible[index - 1]

            if (option.group && option.group !== previous?.group) {
                const heading = document.createElement('li')
                heading.className = 'me-select__group'
                heading.setAttribute('role', 'presentation')
                heading.textContent = option.group
                list.append(heading)
            }

            list.append(renderOption(option, index))
        })

        if (emptyState) {
            emptyState.hidden = visible.length > 0
        }
    }

    const renderOption = (option: SelectOption, index: number): HTMLElement => {
        const item = document.createElement('li')
        item.className = 'me-select__option'
        item.id = `${container.id || 'me-select'}-option-${index}`
        item.setAttribute('role', 'option')
        item.setAttribute('aria-selected', String(selected.includes(option.value)))

        if (option.disabled) {
            item.setAttribute('aria-disabled', 'true')
        }

        if (index === activeIndex) {
            item.dataset.active = 'true'
        }

        const mark = document.createElement('span')
        mark.className = multiple ? 'me-select__check' : 'me-select__tick'
        mark.setAttribute('aria-hidden', 'true')
        item.append(mark)

        const body = document.createElement('span')
        body.className = 'me-select__option-body'

        const label = document.createElement('span')
        label.className = 'me-select__label'
        label.textContent = option.label
        body.append(label)

        if (option.description) {
            const description = document.createElement('span')
            description.className = 'me-select__description'
            description.textContent = option.description
            body.append(description)
        }

        item.append(body)

        if (!option.disabled) {
            // pointerdown, not click: it fires before the search input loses
            // focus, which would otherwise close the panel first.
            item.addEventListener('pointerdown', (event) => {
                event.preventDefault()
                choose(option)
            })
        }

        return item
    }

    const choose = (option: SelectOption): void => {
        selected = toggleValue(selected, option, multiple)

        renderValue()
        renderInputs()
        renderList()
        emitInput(container)

        if (!multiple) {
            dismissable.close()
            trigger.focus()
        }
    }

    const moveActive = (step: 1 | -1): void => {
        activeIndex = nextEnabledIndex(visible, activeIndex, step)
        renderList()

        const active = list.querySelector<HTMLElement>('[data-active="true"]')
        active?.scrollIntoView({ block: 'nearest' })
        trigger.setAttribute('aria-activedescendant', active?.id ?? '')
    }

    search?.addEventListener('input', () => {
        visible = filterOptions(options, search.value)
        activeIndex = visible.length > 0 ? nextEnabledIndex(visible, -1, 1) : -1
        renderList()
    })

    const handleKeys = (event: KeyboardEvent): void => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()

            if (!dismissable.isOpen) {
                dismissable.open()

                return
            }

            moveActive(event.key === 'ArrowDown' ? 1 : -1)

            return
        }

        if (event.key === 'Enter' && dismissable.isOpen) {
            const option = visible[activeIndex]

            if (option) {
                event.preventDefault()
                choose(option)
            }

            return
        }

        if (event.key === 'Home' || event.key === 'End') {
            if (!dismissable.isOpen) {
                return
            }

            event.preventDefault()
            activeIndex = nextEnabledIndex(visible, event.key === 'Home' ? -1 : 0, event.key === 'Home' ? 1 : -1)
            renderList()
        }
    }

    trigger.addEventListener('keydown', handleKeys)
    search?.addEventListener('keydown', handleKeys)

    container.querySelector('[data-me-select-clear]')?.addEventListener('click', (event) => {
        event.stopPropagation()
        selected = []
        renderValue()
        renderInputs()
        renderList()
        emitInput(container)
    })

    trigger.setAttribute('aria-haspopup', 'listbox')
    list.setAttribute('aria-multiselectable', String(multiple))

    renderValue()
    renderInputs()
    renderList()
}

function hiddenInput(name: string, value: string): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value

    return input
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
