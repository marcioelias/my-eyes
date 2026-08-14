import { bind } from './helpers.js'

/*
 * Modal binding.
 *
 * Deliberately thin: <dialog>.showModal() already gives us the backdrop, focus
 * trapping, Escape-to-close and page inertness. All that is left is wiring
 * triggers to targets and letting a click on the backdrop close the dialog,
 * which the element does not do on its own.
 *
 *   <button data-me-modal-open="delete-user">Delete</button>
 *   <dialog id="delete-user" class="me-modal">...</dialog>
 */

const triggerSeen = new WeakSet<Element>()
const dialogSeen = new WeakSet<Element>()

export function initModals(root: ParentNode = document): void {
    bind<HTMLElement>(root, '[data-me-modal-open]', triggerSeen, (trigger) => {
        trigger.addEventListener('click', (event) => {
            const id = trigger.dataset.meModalOpen

            if (!id) {
                return
            }

            const dialog = document.getElementById(id)

            if (dialog instanceof HTMLDialogElement) {
                event.preventDefault()
                openModal(dialog)
            }
        })
    })

    bind<HTMLDialogElement>(root, 'dialog.me-modal', dialogSeen, (dialog) => {
        dialog.querySelectorAll<HTMLElement>('[data-me-modal-close]').forEach((close) => {
            close.addEventListener('click', (event) => {
                event.preventDefault()
                dialog.close('cancel')
            })
        })

        /*
         * data-me-modal-static: the dialog can only be left through its own
         * buttons. For a decision that must be made, where dismissing by
         * accident would leave the user unsure what happened.
         */
        if (dialog.dataset.meModalStatic === 'true') {
            // <dialog> fires `cancel` for Escape; preventing it keeps it open.
            dialog.addEventListener('cancel', (event) => event.preventDefault())

            return
        }

        /*
         * A click on the dialog element itself — rather than on the panel
         * inside it — is a click on the backdrop area, so it dismisses.
         */
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                dialog.close('cancel')
            }
        })
    })
}

export function openModal(dialog: HTMLDialogElement): void {
    dialog.showModal()

    /*
     * Focus the cancel action when there is one, so an accidental Enter
     * dismisses rather than confirms. Checked in that order explicitly, not by
     * relying on which appears first in the markup.
     */
    const initial =
        dialog.querySelector<HTMLElement>('[data-me-modal-close]') ??
        dialog.querySelector<HTMLElement>('[data-me-modal-initial]')

    initial?.focus()
}
