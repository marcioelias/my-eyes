import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    MeLoginScreen,
    MePasskeysCard,
    MeProfileInformationCard,
    MeTwoFactorCard,
    MeTwoFactorChallengeScreen,
} from '../src/index.js'

/**
 * The screens hand back a payload; they never navigate and never post. That is
 * the property worth protecting here, because it is the one an accidental
 * convenience would quietly break.
 *
 * @see docs/decisions/0003-vue-screens-emit-instead-of-submitting.md
 */

/** jsdom has no WebAuthn, which is the unsupported case by default. */
function withWebAuthn(): void {
    vi.stubGlobal('PublicKeyCredential', class {})
    vi.stubGlobal('navigator', { ...navigator, credentials: { create: vi.fn(), get: vi.fn() } })
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('MeLoginScreen', () => {
    it('hands back the payload instead of submitting anything', () => {
        const onSubmit = vi.fn()

        const { container } = render(<MeLoginScreen onSubmit={onSubmit} />)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'marcio@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } })
        fireEvent.submit(container.querySelector('form') as HTMLFormElement)

        // AC-07
        expect(onSubmit).toHaveBeenCalledWith({
            email: 'marcio@example.com',
            password: 'secret',
            remember: false,
        })
    })

    it('shows no passkey button when the browser cannot do WebAuthn', () => {
        const { container } = render(<MeLoginScreen />)

        // AC-01
        expect(container.textContent).not.toContain('Sign in with a passkey')
    })

    it('offers the passkey button once WebAuthn is available', () => {
        withWebAuthn()

        const { container } = render(<MeLoginScreen />)

        expect(container.textContent).toContain('Sign in with a passkey')
    })

    it('renders the errors it is given', () => {
        const { container } = render(
            <MeLoginScreen errors={{ email: 'These credentials do not match our records.' }} />,
        )

        expect(container.textContent).toContain('These credentials do not match our records.')
    })

    it('forwards the layout props and the aside node', () => {
        const { container } = render(
            <MeLoginScreen image="/img/login.jpg" tagline="One place" reverse />,
        )

        expect(container.querySelector('.me-auth')?.className).toContain('me-auth--reverse')
        expect(container.querySelector('.me-auth__image')?.getAttribute('src')).toBe('/img/login.jpg')
        expect(container.querySelector('.me-auth__tagline')?.textContent).toBe('One place')

        const custom = render(<MeLoginScreen aside="Trusted by teams" />)

        expect(custom.container.querySelector('.me-auth__aside-content')?.textContent).toBe('Trusted by teams')
    })
})

describe('MeTwoFactorChallengeScreen', () => {
    it('sends only the authentication code', () => {
        const onSubmit = vi.fn()

        const { container } = render(<MeTwoFactorChallengeScreen onSubmit={onSubmit} />)

        fireEvent.change(screen.getByLabelText('Authentication code'), { target: { value: '123456' } })
        fireEvent.submit(container.querySelector('form') as HTMLFormElement)

        expect(onSubmit).toHaveBeenCalledWith({ code: '123456' })
    })

    it('clears the code when switching to a recovery code', () => {
        const onSubmit = vi.fn()

        const { container } = render(<MeTwoFactorChallengeScreen onSubmit={onSubmit} />)

        fireEvent.change(screen.getByLabelText('Authentication code'), { target: { value: '123456' } })
        fireEvent.click(container.querySelector('button.me-btn--link') as HTMLButtonElement)

        // AC-06
        expect(container.querySelector('input[name="code"]')).toBeNull()

        fireEvent.change(screen.getByLabelText('Recovery code'), { target: { value: 'aaaa-bbbb' } })
        fireEvent.submit(container.querySelector('form') as HTMLFormElement)

        expect(onSubmit).toHaveBeenCalledWith({ recovery_code: 'aaaa-bbbb' })
    })
})

describe('MeTwoFactorCard', () => {
    it('offers to enable while two-factor is off', () => {
        const { container } = render(<MeTwoFactorCard state="off" />)

        expect(container.textContent).toContain('Enable')
        expect(container.querySelector('.me-qr')).toBeNull()
    })

    it('shows the QR code and the confirmation field while pending', () => {
        const onConfirm = vi.fn()

        const { container } = render(
            <MeTwoFactorCard
                state="pending"
                qrCode="<svg data-qr></svg>"
                secretKey="JBSWY3DPEHPK3PXP"
                recoveryCodes={['aaaa-bbbb']}
                onConfirm={onConfirm}
            />,
        )

        // AC-04
        expect(container.querySelector('.me-qr')?.innerHTML).toContain('data-qr')
        expect(container.textContent).toContain('JBSWY3DPEHPK3PXP')
        expect(container.textContent).not.toContain('aaaa-bbbb')

        fireEvent.change(screen.getByLabelText('Authentication code'), { target: { value: '123456' } })
        fireEvent.submit(container.querySelector('form') as HTMLFormElement)

        expect(onConfirm).toHaveBeenCalledWith({ code: '123456' })
    })

    it('shows the recovery codes once confirmed', () => {
        const { container } = render(
            <MeTwoFactorCard state="on" qrCode="<svg data-qr></svg>" recoveryCodes={['aaaa-bbbb', 'cccc-dddd']} />,
        )

        // AC-05
        expect(container.textContent).toContain('aaaa-bbbb')
        expect(container.querySelector('.me-qr')).toBeNull()
    })
})

describe('MePasskeysCard', () => {
    it('renders nothing without WebAuthn', () => {
        const { container } = render(<MePasskeysCard passkeys={[{ id: 1, name: 'Work laptop' }]} />)

        expect(container.textContent).toBe('')
    })

    it('lists the passkeys and reports removal', () => {
        withWebAuthn()

        const onRemove = vi.fn()

        const { container } = render(
            <MePasskeysCard
                passkeys={[{ id: 1, name: 'Work laptop', lastUsed: 'yesterday' }]}
                onRemove={onRemove}
            />,
        )

        expect(container.textContent).toContain('Work laptop')
        expect(container.textContent).toContain('Last used yesterday')

        container.querySelector<HTMLButtonElement>('.me-credential button')?.click()

        expect(onRemove).toHaveBeenCalledWith({ id: 1, name: 'Work laptop', lastUsed: 'yesterday' })
    })

    it('refuses to register a passkey with no name', () => {
        withWebAuthn()

        const { container } = render(<MePasskeysCard />)

        fireEvent.click(container.querySelector('.me-row button') as HTMLButtonElement)

        expect(container.textContent).toContain('Give this passkey a name first.')
    })
})

describe('MeProfileInformationCard', () => {
    it('shows the avatar and carries the file in the payload', () => {
        const onSubmit = vi.fn()

        const { container } = render(
            <MeProfileInformationCard
                name="Márcio Elias"
                email="marcio@example.com"
                avatarUrl="/storage/avatar.png"
                onSubmit={onSubmit}
            />,
        )

        // AC-09
        expect(container.querySelector('.me-avatar img')?.getAttribute('src')).toBe('/storage/avatar.png')

        fireEvent.submit(container.querySelector('form') as HTMLFormElement)

        expect(onSubmit).toHaveBeenCalledWith({
            name: 'Márcio Elias',
            email: 'marcio@example.com',
            avatar: null,
        })
    })

    it('offers to resend the verification email when the address is unverified', () => {
        const onResendVerification = vi.fn()

        const { container } = render(
            <MeProfileInformationCard verified={false} onResendVerification={onResendVerification} />,
        )

        expect(container.textContent).toContain('Your email address is unverified.')

        container.querySelector<HTMLButtonElement>('.me-alert button')?.click()

        expect(onResendVerification).toHaveBeenCalledOnce()
    })
})
