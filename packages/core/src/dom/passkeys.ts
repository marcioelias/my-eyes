import { t } from '../headless/i18n.js'
import {
    authenticateWithPasskey,
    confirmWithPasskey,
    isPasskeySupported,
    PasskeyCancelled,
    registerPasskey,
    type PasskeyEndpoints,
} from '../headless/passkeys.js'
import { bind, readString } from './helpers.js'

/*
 * The server-rendered side of passkeys.
 *
 * A Blade page cannot feature-detect WebAuthn, so it renders the button and
 * this binding removes it where it cannot work (BR-11). Everything else is the
 * same ceremony Vue calls directly.
 */

const seen = new WeakSet<Element>()

export function initPasskeys(root: ParentNode = document): void {
    const supported = isPasskeySupported()

    root.querySelectorAll<HTMLElement>('[data-me-passkey], [data-me-passkey-only]').forEach((element) => {
        element.hidden = !supported
    })

    if (!supported) {
        return
    }

    bind<HTMLButtonElement>(root, 'button[data-me-passkey]', seen, (button) => {
        button.addEventListener('click', () => {
            void run(button)
        })
    })
}

async function run(button: HTMLButtonElement): Promise<void> {
    const flow = readString(button, 'mePasskey') ?? 'login'
    const target = errorTarget(button)

    showError(target, '')

    const name = nameFor(button)

    if (flow === 'register' && name === '') {
        showError(target, t('passkey.nameRequired'))

        return
    }

    const endpoints: PasskeyEndpoints = {
        ...optional('optionsUrl', readString(button, 'optionsUrl')),
        ...optional('url', readString(button, 'url')),
        ...(flow === 'register' ? { name } : {}),
    }

    button.disabled = true
    button.dataset.loading = 'true'

    try {
        const response =
            flow === 'register'
                ? await registerPasskey(endpoints)
                : flow === 'confirm'
                  ? await confirmWithPasskey(endpoints)
                  : await authenticateWithPasskey(endpoints)

        await goOnward(button, response)
    } catch (error) {
        // A dismissed prompt leaves the page exactly as it was (BR-12).
        if (!(error instanceof PasskeyCancelled)) {
            showError(target, error instanceof Error ? error.message : t('passkey.failed'))
        }
    } finally {
        button.disabled = false
        delete button.dataset.loading
    }
}

/**
 * Where to go once the credential is accepted: whatever the server said, then
 * the button's own hint, then a reload — which lands on the redirect Laravel
 * issues for a now-authenticated session.
 */
async function goOnward(button: HTMLButtonElement, response: Response): Promise<void> {
    const explicit = readString(button, 'redirect')

    try {
        const body = (await response.clone().json()) as { redirect?: unknown }

        if (typeof body.redirect === 'string' && body.redirect !== '') {
            window.location.href = body.redirect

            return
        }
    } catch {
        // No JSON body. The hint or a reload decides.
    }

    if (explicit) {
        window.location.href = explicit

        return
    }

    window.location.reload()
}

function nameFor(button: HTMLButtonElement): string {
    const selector = readString(button, 'nameFrom')

    if (!selector) {
        return readString(button, 'passkeyName') ?? ''
    }

    return document.querySelector<HTMLInputElement>(selector)?.value.trim() ?? ''
}

function errorTarget(button: HTMLButtonElement): HTMLElement | null {
    const scope = button.closest('form, .me-card, .me-auth__panel') ?? document

    return scope.querySelector<HTMLElement>('[data-me-passkey-error]')
}

function showError(target: HTMLElement | null, message: string): void {
    if (!target) {
        return
    }

    target.textContent = message
    target.hidden = message === ''
}

/** Keeps an absent data attribute absent, rather than an explicit undefined. */
function optional(key: 'optionsUrl' | 'url', value: string | undefined): Partial<PasskeyEndpoints> {
    return value === undefined ? {} : { [key]: value }
}
