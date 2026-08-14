/*
 * Selection and filtering logic for the custom select.
 *
 * DOM-free, so the Blade binding and the future Vue and React components share
 * one definition of what "selected" means and how searching behaves.
 */

export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
    /** Secondary line under the label. */
    description?: string
    /** Options carrying the same group are rendered under one heading. */
    group?: string
}

/**
 * Case- and accent-insensitive match, so searching "sao" finds "São Paulo".
 * Without the normalise step a Portuguese list is nearly unsearchable.
 */
export function matchesQuery(option: SelectOption, query: string): boolean {
    if (query === '') {
        return true
    }

    const needle = normalise(query)

    return normalise(option.label).includes(needle) || normalise(option.description ?? '').includes(needle)
}

export function normalise(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        // Strip combining marks that NFD split off (the accents themselves).
        .replace(/[\u0300-\u036f]/g, '')
}

export function filterOptions(options: SelectOption[], query: string): SelectOption[] {
    return options.filter((option) => matchesQuery(option, query))
}

/**
 * Adds or removes a value. Single-select replaces; multiple toggles.
 * Disabled options are ignored, whatever the caller asks for.
 */
export function toggleValue(
    selected: string[],
    option: SelectOption,
    multiple: boolean,
): string[] {
    if (option.disabled) {
        return selected
    }

    if (!multiple) {
        return [option.value]
    }

    return selected.includes(option.value)
        ? selected.filter((value) => value !== option.value)
        : [...selected, option.value]
}

/**
 * Next option the keyboard should land on, skipping disabled ones and wrapping
 * at both ends. Returns -1 when there is nothing selectable.
 */
export function nextEnabledIndex(options: SelectOption[], from: number, step: 1 | -1): number {
    if (options.length === 0) {
        return -1
    }

    const length = options.length

    for (let offset = 1; offset <= length; offset++) {
        // Double modulo so stepping backwards past zero wraps to the end.
        const index = (((from + step * offset) % length) + length) % length

        if (!options[index]?.disabled) {
            return index
        }
    }

    return -1
}

/**
 * What the trigger shows: the label for one selection, a count beyond that.
 * Listing every label would overflow the control on a narrow screen.
 */
export function summarise(
    options: SelectOption[],
    selected: string[],
    placeholder: string,
    countTemplate: string,
): string {
    if (selected.length === 0) {
        return placeholder
    }

    if (selected.length === 1) {
        return options.find((option) => option.value === selected[0])?.label ?? placeholder
    }

    return countTemplate.replaceAll(':count', String(selected.length))
}
