/*
 * Shared plumbing for the DOM bindings.
 *
 * Every binding must be safe to run repeatedly: Livewire and Turbo replace
 * chunks of DOM and then re-run initialisation, so `bind` keeps a per-binding
 * WeakSet of elements it has already wired. A WeakSet (rather than a marker
 * attribute) means replaced elements are collected instead of leaking, and a
 * genuinely new element with the same markup is still initialised.
 */

export function bind<T extends HTMLElement>(
    root: ParentNode,
    selector: string,
    seen: WeakSet<Element>,
    setup: (element: T) => void,
): void {
    root.querySelectorAll<T>(selector).forEach((element) => {
        if (seen.has(element)) {
            return
        }

        seen.add(element)
        setup(element)
    })
}

export function readNumber(element: HTMLElement, attribute: string): number | undefined {
    const raw = element.dataset[attribute]

    if (raw === undefined || raw === '') {
        return undefined
    }

    const parsed = Number(raw)

    return Number.isFinite(parsed) ? parsed : undefined
}

export function readBoolean(element: HTMLElement, attribute: string, fallback: boolean): boolean {
    const raw = element.dataset[attribute]

    if (raw === undefined) {
        return fallback
    }

    return raw !== 'false' && raw !== '0'
}

export function readString(element: HTMLElement, attribute: string): string | undefined {
    const raw = element.dataset[attribute]

    return raw === undefined || raw === '' ? undefined : raw
}

/** Falls back to the document language, which Laravel already sets on <html>. */
export function documentLocale(): string {
    return document.documentElement.lang || 'en'
}

/**
 * Assigns to a native input/textarea/select through the prototype setter, so
 * frameworks that patch the value property (React, and Livewire's morphdom in
 * some cases) still see the change.
 */
export function setNativeValue(element: HTMLInputElement, value: string): void {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set

    if (setter) {
        setter.call(element, value)
    } else {
        element.value = value
    }
}

/** Notifies listeners (Livewire's wire:model, validation) that a value changed. */
export function emitInput(element: HTMLElement): void {
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
}
