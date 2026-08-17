import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import {
    MeLoginScreen,
    MePasskeysCard,
    MeProfileInformationCard,
    MeTwoFactorCard,
    MeTwoFactorChallengeScreen,
} from '../src/index.js'

/*
 * The screens emit; they never navigate and never post. That is the property
 * worth protecting here, because it is the one an accidental convenience would
 * quietly break.
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
    it('emits the payload instead of submitting anything', async () => {
        // AC-07
        const wrapper = mount(MeLoginScreen)

        await wrapper.find('input[name="email"]').setValue('marcio@example.com')
        await wrapper.find('input[name="password"]').setValue('secret')
        await wrapper.find('form').trigger('submit')

        expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
            email: 'marcio@example.com',
            password: 'secret',
            remember: false,
        })
    })

    it('shows no passkey button when the browser cannot do WebAuthn', () => {
        // AC-01
        const wrapper = mount(MeLoginScreen)

        expect(wrapper.text()).not.toContain('Sign in with a passkey')
    })

    it('offers the passkey button once WebAuthn is available', async () => {
        withWebAuthn()

        const wrapper = mount(MeLoginScreen)
        await nextTick()

        expect(wrapper.text()).toContain('Sign in with a passkey')
    })

    it('forwards the layout props and the aside slot', () => {
        const wrapper = mount(MeLoginScreen, {
            props: { image: '/img/login.jpg', tagline: 'One place', reverse: true },
        })

        expect(wrapper.find('.me-auth').classes()).toContain('me-auth--reverse')
        expect(wrapper.find('.me-auth__image').attributes('src')).toBe('/img/login.jpg')
        expect(wrapper.find('.me-auth__tagline').text()).toBe('One place')

        const custom = mount(MeLoginScreen, { slots: { aside: () => 'Trusted by teams' } })

        expect(custom.find('.me-auth__aside-content').text()).toBe('Trusted by teams')
    })

    it('renders the errors it is given', () => {
        const wrapper = mount(MeLoginScreen, {
            props: { errors: { email: 'These credentials do not match our records.' } },
        })

        expect(wrapper.text()).toContain('These credentials do not match our records.')
    })
})

describe('MeTwoFactorChallengeScreen', () => {
    it('sends only the authentication code', async () => {
        const wrapper = mount(MeTwoFactorChallengeScreen)

        await wrapper.find('input[name="code"]').setValue('123456')
        await wrapper.find('form').trigger('submit')

        expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({ code: '123456' })
    })

    it('clears the code when switching to a recovery code', async () => {
        // AC-06
        const wrapper = mount(MeTwoFactorChallengeScreen)

        await wrapper.find('input[name="code"]').setValue('123456')
        await wrapper.find('button.me-btn--link').trigger('click')

        expect(wrapper.find('input[name="code"]').exists()).toBe(false)

        await wrapper.find('input[name="recovery_code"]').setValue('aaaa-bbbb')
        await wrapper.find('form').trigger('submit')

        expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({ recovery_code: 'aaaa-bbbb' })
    })
})

describe('MeTwoFactorCard', () => {
    it('offers to enable while two-factor is off', () => {
        const wrapper = mount(MeTwoFactorCard, { props: { state: 'off' } })

        expect(wrapper.text()).toContain('Enable')
        expect(wrapper.find('.me-qr').exists()).toBe(false)
    })

    it('shows the QR code and the confirmation field while pending', async () => {
        // AC-04
        const wrapper = mount(MeTwoFactorCard, {
            props: {
                state: 'pending',
                qrCode: '<svg data-qr></svg>',
                secretKey: 'JBSWY3DPEHPK3PXP',
                recoveryCodes: ['aaaa-bbbb'],
            },
        })

        expect(wrapper.find('.me-qr').html()).toContain('data-qr')
        expect(wrapper.text()).toContain('JBSWY3DPEHPK3PXP')
        expect(wrapper.text()).not.toContain('aaaa-bbbb')

        await wrapper.find('input[name="code"]').setValue('123456')
        await wrapper.find('form').trigger('submit')

        expect(wrapper.emitted('confirm')?.[0]?.[0]).toEqual({ code: '123456' })
    })

    it('shows the recovery codes once confirmed', () => {
        // AC-05
        const wrapper = mount(MeTwoFactorCard, {
            props: { state: 'on', qrCode: '<svg data-qr></svg>', recoveryCodes: ['aaaa-bbbb', 'cccc-dddd'] },
        })

        expect(wrapper.text()).toContain('aaaa-bbbb')
        expect(wrapper.find('.me-qr').exists()).toBe(false)
    })
})

describe('MePasskeysCard', () => {
    it('renders nothing without WebAuthn', () => {
        const wrapper = mount(MePasskeysCard, { props: { passkeys: [{ id: 1, name: 'Work laptop' }] } })

        expect(wrapper.text()).toBe('')
    })

    it('lists the passkeys and emits removal', async () => {
        withWebAuthn()

        const wrapper = mount(MePasskeysCard, {
            props: { passkeys: [{ id: 1, name: 'Work laptop', lastUsed: 'yesterday' }] },
        })
        await nextTick()

        expect(wrapper.text()).toContain('Work laptop')
        expect(wrapper.text()).toContain('Last used yesterday')

        await wrapper.find('.me-credential button').trigger('click')

        expect(wrapper.emitted('remove')?.[0]?.[0]).toMatchObject({ id: 1 })
    })

    it('refuses to register a passkey with no name', async () => {
        withWebAuthn()

        const wrapper = mount(MePasskeysCard)
        await nextTick()

        await wrapper.find('.me-row button').trigger('click')
        await nextTick()

        expect(wrapper.text()).toContain('Give this passkey a name first.')
    })
})

describe('MeProfileInformationCard', () => {
    it('shows the avatar and carries the file in the payload', async () => {
        // AC-09
        const wrapper = mount(MeProfileInformationCard, {
            props: { name: 'Márcio Elias', email: 'marcio@example.com', avatarUrl: '/storage/avatar.png' },
        })

        expect(wrapper.find('.me-avatar img').attributes('src')).toBe('/storage/avatar.png')

        await wrapper.find('form').trigger('submit')

        expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
            name: 'Márcio Elias',
            email: 'marcio@example.com',
            avatar: null,
        })
    })

    it('offers to resend the verification email when the address is unverified', async () => {
        const wrapper = mount(MeProfileInformationCard, { props: { verified: false } })

        expect(wrapper.text()).toContain('Your email address is unverified.')

        await wrapper.find('.me-alert button').trigger('click')

        expect(wrapper.emitted('resend-verification')).toHaveLength(1)
    })
})
