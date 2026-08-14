import { loadMessagesFromDocument } from './headless/i18n.js'
import { initDropdowns } from './dom/dropdown.js'
import { initFilterPanels, initFilters } from './dom/filters.js'
import { initDismissables, initNavigateSelects, initPasswordToggles, initThemeToggles } from './dom/misc.js'
import { initModals } from './dom/modal.js'
import { initNumericInputs } from './dom/numeric-input.js'
import { initSelects } from './dom/select.js'
import { initShell } from './dom/shell.js'
import { initToasts } from './dom/toast.js'
import { initTooltips } from './dom/tooltip.js'
import { initUploads } from './dom/upload.js'

export * from './headless/dismissable.js'
export * from './headless/filters.js'
export * from './headless/i18n.js'
export * from './headless/numeric.js'
export * from './headless/select.js'
export * from './headless/theme.js'
export * from './headless/upload.js'
export { toast, type Toast, type ToastOptions, type ToastPosition, type ToastVariant } from './dom/toast.js'

/**
 * Wires every my-eyes behaviour inside `root`.
 *
 * Safe to call as often as you like: each binding skips elements it has
 * already initialised, so re-running it after a partial DOM update only picks
 * up what is new.
 */
export function initMyEyes(root: ParentNode = document): void {
    // Before any binding renders text of its own.
    loadMessagesFromDocument(root)

    initShell(root)
    initDropdowns(root)
    initNumericInputs(root)
    initUploads(root)
    initDismissables(root)
    initPasswordToggles(root)
    initThemeToggles(root)
    initNavigateSelects(root)
    initFilters(root)
    initFilterPanels(root)
    initModals(root)
    initSelects(root)
    initTooltips(root)
    initToasts(root)
}

/**
 * Runs initMyEyes now (or on DOMContentLoaded) and re-runs it after Livewire
 * or Turbo swap DOM, which is what makes the same components work unchanged
 * across Blade, Livewire and Turbo pages.
 */
export function startMyEyes(): void {
    const run = (): void => initMyEyes(document)

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true })
    } else {
        run()
    }

    document.addEventListener('livewire:navigated', run)
    document.addEventListener('turbo:load', run)

    /*
     * Re-run after a Livewire re-render. The hook name differs between
     * Livewire 3 and 4, so both are attempted and an unknown one is ignored —
     * the bindings are idempotent, so registering twice is harmless while
     * registering none would leave a swapped-in component unwired.
     */
    document.addEventListener('livewire:initialized', () => {
        const livewire = (window as { Livewire?: { hook: (name: string, callback: () => void) => void } }).Livewire

        for (const hook of ['morph.updated', 'morphed', 'commit']) {
            try {
                livewire?.hook(hook, run)
            } catch {
                // Not a hook this Livewire version knows; the others cover it.
            }
        }
    })
}
