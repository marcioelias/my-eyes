/*
 * jsdom does not implement <dialog>: showModal(), close() and the open
 * property are all absent, so any binding that drives a real dialog throws the
 * moment a test clicks something.
 *
 * This fills in just enough of the element to let the modal binding run. It is
 * a limitation of the test environment, not a shim the browser needs — the
 * components use the native element as it is.
 */

const dialog = window.HTMLDialogElement?.prototype as
    | (HTMLDialogElement & { showModal?: () => void; close?: (returnValue?: string) => void })
    | undefined

if (dialog && typeof dialog.showModal !== 'function') {
    dialog.showModal = function showModal(this: HTMLDialogElement): void {
        this.setAttribute('open', '')
    }

    dialog.close = function close(this: HTMLDialogElement, returnValue?: string): void {
        this.removeAttribute('open')

        if (returnValue !== undefined) {
            this.returnValue = returnValue
        }

        this.dispatchEvent(new Event('close'))
    }
}
