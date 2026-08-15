/*
 * Messages used by the JavaScript layer.
 *
 * Anything the bindings render themselves — the toast close button, upload
 * validation, the filter builder's labels — reads from here instead of holding
 * a literal. English is the built-in fallback; a host application replaces any
 * subset of it.
 *
 * In Laravel the <x-me::translations /> component emits the current locale's
 * strings and they are applied automatically. In Vue, React or Inertia, call
 * configureMessages() once at boot with whatever your i18n layer resolves:
 *
 *   import { configureMessages } from '@my-eyes/core'
 *   configureMessages({ 'toast.close': 'Fechar', 'upload.browse': 'procurar' })
 */

export type MessageKey =
    | 'toast.close'
    | 'password.show'
    | 'password.hide'
    | 'upload.remove'
    | 'upload.tooLarge'
    | 'upload.wrongType'
    | 'upload.tooMany'
    | 'upload.drop'
    | 'upload.browse'
    | 'upload.upTo'
    | 'filters.where'
    | 'filters.and'
    | 'filters.or'
    | 'filters.remove'
    | 'filters.value'
    | 'filters.rangeSeparator'
    | 'filters.commaHint'
    | 'common.yes'
    | 'common.no'
    | 'select.search'
    | 'select.empty'
    | 'select.placeholder'
    | 'select.selected'
    | 'select.clear'
    | 'filters.title'
    | 'filters.add'
    | 'filters.apply'
    | 'filters.clear'
    | 'filters.empty'
    | 'table.search'
    | 'table.perPage'
    | 'table.showing'
    | 'table.empty'
    | 'table.emptyFiltered'
    | 'table.previous'
    | 'table.next'
    | 'table.retry'
    | 'pagination.label'
    | 'layout.skip'
    | 'layout.openMenu'
    | 'layout.closeMenu'
    | 'layout.mainNav'
    | 'layout.collapse'
    | 'layout.toggleTheme'
    | 'layout.accountMenu'
    | 'layout.theme'
    | 'layout.system'
    | 'layout.light'
    | 'layout.dark'

export type Messages = Record<MessageKey, string>

const defaults: Messages = {
    'toast.close': 'Close',
    'password.show': 'Show password',
    'password.hide': 'Hide password',
    'upload.remove': 'Remove',
    'upload.tooLarge': ':name is larger than :limit',
    'upload.wrongType': ':name is not an accepted file type',
    'upload.tooMany': 'At most :limit files',
    'upload.drop': 'Drop files here or :browse',
    'upload.browse': 'browse',
    'upload.upTo': 'up to :size',
    'filters.where': 'Where',
    'filters.and': 'and',
    'filters.or': 'or',
    'filters.remove': 'Remove condition',
    'filters.value': 'Value',
    'filters.rangeSeparator': '–',
    'filters.commaHint': 'Separate values with commas',
    'common.yes': 'Yes',
    'common.no': 'No',
    'select.search': 'Search options',
    'select.empty': 'No options match',
    'select.placeholder': 'Select an option',
    'select.selected': ':count selected',
    'select.clear': 'Clear selection',
    // Rendered by the Vue and React tables. Blade and Livewire render these
    // server-side, so they only appear here.
    'filters.title': 'Filters',
    'filters.add': 'Add condition',
    'filters.apply': 'Apply',
    'filters.clear': 'Clear all',
    'filters.empty': 'No conditions yet. Add one to narrow the results.',
    'table.search': 'Search',
    'table.perPage': 'Per page',
    'table.showing': 'Showing :first–:last of :total',
    'table.empty': 'No records found',
    'table.emptyFiltered': 'No records match these filters',
    'table.previous': 'Previous',
    'table.next': 'Next',
    'table.retry': 'Retry',
    'pagination.label': 'Pagination',
    // The admin shell. Blade renders these server-side; they reach the screen
    // only through the Vue shell.
    'layout.skip': 'Skip to content',
    'layout.openMenu': 'Open menu',
    'layout.closeMenu': 'Close menu',
    'layout.mainNav': 'Main navigation',
    'layout.collapse': 'Collapse',
    'layout.toggleTheme': 'Toggle theme',
    'layout.accountMenu': 'Account menu',
    'layout.theme': 'Theme',
    'layout.system': 'System',
    'layout.light': 'Light',
    'layout.dark': 'Dark',
}

let messages: Messages = { ...defaults }

/**
 * Replaces any subset of the messages. Unknown keys are ignored, so a host
 * sending its whole translation file cannot corrupt the dictionary.
 */
export function configureMessages(next: Partial<Record<string, string>>): void {
    Object.entries(next).forEach(([key, value]) => {
        if (typeof value === 'string' && key in defaults) {
            messages[key as MessageKey] = value
        }
    })
}

export function resetMessages(): void {
    messages = { ...defaults }
}

/**
 * Resolves a message, substituting `:name`-style placeholders — the same
 * convention Laravel uses, so a translation string can be moved between the
 * PHP and JS sides unchanged.
 */
export function t(key: MessageKey, replacements: Record<string, string> = {}): string {
    return Object.entries(replacements).reduce(
        (text, [name, value]) => text.replaceAll(`:${name}`, value),
        messages[key],
    )
}

/**
 * Reads messages from a <script type="application/json" data-me-messages> tag.
 * JSON in a script tag rather than executable code, so no relaxed CSP is needed.
 */
export function loadMessagesFromDocument(root: ParentNode = document): void {
    const node = root.querySelector('script[data-me-messages]')

    if (!node?.textContent) {
        return
    }

    try {
        configureMessages(JSON.parse(node.textContent) as Record<string, string>)
    } catch {
        // Malformed payload: keep the English defaults rather than breaking.
    }
}
