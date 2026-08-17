import {
    authenticateWithPasskey,
    confirmWithPasskey,
    isPasskeySupported,
    PasskeyCancelled,
    registerPasskey,
    t,
} from '@my-eyes/core'
import { computed, defineComponent, h, onMounted, ref, type PropType, type VNode } from 'vue'
import { MeCheckbox, MeInput, MeUpload } from './forms.js'
import { MeAlert, MeAvatar, MeBadge, MeButton, MeCard, MeIcon, linkAsProp } from './primitives.js'
import { MeAuthLayout } from './shell.js'

/**
 * The authentication screens, as the Blade renderer publishes them.
 *
 * A screen never performs a request and never navigates: it emits `submit`
 * with a plain payload and the application does the rest. Passkeys are the one
 * exception — a WebAuthn ceremony is a round trip the screen has to make
 * itself — and even there the outcome is emitted rather than acted on.
 *
 * @see docs/features/auth-screens.md
 * @see docs/decisions/0003-vue-screens-emit-instead-of-submitting.md
 */

type Errors = Record<string, string>

const formProps = {
    /** Laravel's error bag, passed straight through from Inertia. */
    errors: { type: Object as PropType<Errors>, default: () => ({}) },
    processing: { type: Boolean, default: false },
    /** A flash message, where Blade would read session('status'). */
    status: { type: String as PropType<string | null>, default: null },
}

const layoutProps = {
    heading: { type: String as PropType<string | null>, default: null },
    subheading: { type: String as PropType<string | null>, default: null },
    brandName: { type: String as PropType<string | null>, default: null },
    ...linkAsProp,
}

function error(errors: Errors, key: string): string | null {
    return errors[key] ?? null
}

function frame(
    props: { heading: string | null; subheading: string | null; brandName: string | null; status: string | null; as: unknown },
    fallbackHeading: string,
    fallbackSubheading: string,
    body: unknown[],
    footer?: () => unknown,
): VNode {
    return h(
        MeAuthLayout,
        {
            heading: props.heading ?? fallbackHeading,
            subheading: props.subheading ?? fallbackSubheading,
            brandName: props.brandName,
            as: props.as,
        } as never,
        {
            ...(props.status ? { status: () => h(MeAlert, { variant: 'success' }, () => props.status) } : {}),
            default: () => body,
            ...(footer ? { footer } : {}),
        },
    )
}

/*
 * The passkey affordance, shared by sign-in and password confirmation.
 *
 * Rendered only once the browser has confirmed it can do WebAuthn, which is
 * why support is resolved on mount rather than during setup: a server-rendered
 * first paint has no navigator to ask.
 */
function usePasskey(run: () => Promise<Response>, emit: (event: 'passkey', response: Response) => void) {
    const supported = ref(false)
    const busy = ref(false)
    const failure = ref<string | null>(null)

    onMounted(() => {
        supported.value = isPasskeySupported()
    })

    async function start(): Promise<void> {
        failure.value = null
        busy.value = true

        try {
            emit('passkey', await run())
        } catch (thrown) {
            // A dismissed prompt leaves the screen exactly as it was.
            if (!(thrown instanceof PasskeyCancelled)) {
                failure.value = thrown instanceof Error ? thrown.message : t('passkey.failed')
            }
        } finally {
            busy.value = false
        }
    }

    return { supported, busy, failure, start }
}

function passkeyBlock(
    state: ReturnType<typeof usePasskey>,
    label: string,
): VNode | null {
    if (!state.supported.value) {
        return null
    }

    return h('div', { class: 'me-stack' }, [
        h('p', { class: 'me-auth__separator' }, t('auth.or')),

        h(
            MeButton,
            {
                variant: 'secondary',
                block: true,
                icon: 'key',
                loading: state.busy.value,
                disabled: state.busy.value,
                onClick: () => void state.start(),
            },
            () => label,
        ),

        state.failure.value ? h('p', { class: 'me-error' }, state.failure.value) : null,
    ])
}

export const MeLoginScreen = defineComponent({
    name: 'MeLoginScreen',

    props: {
        ...formProps,
        ...layoutProps,
        canRegister: { type: Boolean, default: false },
        registerUrl: { type: String, default: '/register' },
        canResetPassword: { type: Boolean, default: true },
        forgotUrl: { type: String, default: '/forgot-password' },
        /** Off when the application has not enabled Fortify's passkey feature. */
        passkeys: { type: Boolean, default: true },
        passkeyOptionsUrl: { type: String as PropType<string | null>, default: null },
        passkeyUrl: { type: String as PropType<string | null>, default: null },
    },

    emits: ['submit', 'passkey'],

    setup(props, { emit }) {
        const email = ref('')
        const password = ref('')
        const remember = ref(false)

        const passkey = usePasskey(
            () =>
                authenticateWithPasskey({
                    ...(props.passkeyOptionsUrl ? { optionsUrl: props.passkeyOptionsUrl } : {}),
                    ...(props.passkeyUrl ? { url: props.passkeyUrl } : {}),
                }),
            (event, response) => emit(event, response),
        )

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', { email: email.value, password: password.value, remember: remember.value })
        }

        return () =>
            frame(
                props,
                t('auth.signIn'),
                t('auth.signInSubheading'),
                [
                    h('form', { class: 'me-stack', onSubmit: submit }, [
                        h(MeInput, {
                            name: 'email',
                            type: 'email',
                            label: t('auth.email'),
                            autocomplete: 'username',
                            required: true,
                            error: error(props.errors, 'email'),
                            modelValue: email.value,
                            'onUpdate:modelValue': (value: string | number | null) => (email.value = String(value ?? '')),
                        }),

                        h(MeInput, {
                            name: 'password',
                            type: 'password',
                            label: t('auth.password'),
                            autocomplete: 'current-password',
                            required: true,
                            error: error(props.errors, 'password'),
                            modelValue: password.value,
                            'onUpdate:modelValue': (value: string | number | null) =>
                                (password.value = String(value ?? '')),
                        }),

                        h('div', { class: 'me-row me-row--between' }, [
                            h(MeCheckbox, {
                                name: 'remember',
                                label: t('auth.remember'),
                                modelValue: remember.value,
                                'onUpdate:modelValue': (value: boolean | string[]) =>
                                    (remember.value = value === true),
                            }),

                            props.canResetPassword
                                ? h(
                                      props.as,
                                      { href: props.forgotUrl, class: 'me-btn me-btn--link me-btn--sm' },
                                      () => t('auth.forgot'),
                                  )
                                : null,
                        ]),

                        h(
                            MeButton,
                            { type: 'submit', variant: 'primary', block: true, loading: props.processing },
                            () => t('auth.signIn'),
                        ),
                    ]),

                    props.passkeys ? passkeyBlock(passkey, t('auth.signInWithPasskey')) : null,
                ],
                props.canRegister
                    ? () => [
                          `${t('auth.noAccount')} `,
                          h(
                              props.as,
                              { href: props.registerUrl, class: 'me-btn me-btn--link me-btn--sm' },
                              () => t('auth.signUp'),
                          ),
                      ]
                    : undefined,
            )
    },
})

export const MeRegisterScreen = defineComponent({
    name: 'MeRegisterScreen',

    props: {
        ...formProps,
        ...layoutProps,
        loginUrl: { type: String, default: '/login' },
    },

    emits: ['submit'],

    setup(props, { emit }) {
        const name = ref('')
        const email = ref('')
        const password = ref('')
        const confirmation = ref('')

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', {
                name: name.value,
                email: email.value,
                password: password.value,
                password_confirmation: confirmation.value,
            })
        }

        return () =>
            frame(
                props,
                t('auth.registerHeading'),
                t('auth.registerSubheading'),
                [
                    h('form', { class: 'me-stack', onSubmit: submit }, [
                        h(MeInput, {
                            name: 'name',
                            label: t('auth.name'),
                            autocomplete: 'name',
                            required: true,
                            error: error(props.errors, 'name'),
                            modelValue: name.value,
                            'onUpdate:modelValue': (value: string | number | null) => (name.value = String(value ?? '')),
                        }),

                        h(MeInput, {
                            name: 'email',
                            type: 'email',
                            label: t('auth.email'),
                            autocomplete: 'username',
                            required: true,
                            error: error(props.errors, 'email'),
                            modelValue: email.value,
                            'onUpdate:modelValue': (value: string | number | null) => (email.value = String(value ?? '')),
                        }),

                        h(MeInput, {
                            name: 'password',
                            type: 'password',
                            label: t('auth.password'),
                            autocomplete: 'new-password',
                            required: true,
                            error: error(props.errors, 'password'),
                            modelValue: password.value,
                            'onUpdate:modelValue': (value: string | number | null) =>
                                (password.value = String(value ?? '')),
                        }),

                        h(MeInput, {
                            name: 'password_confirmation',
                            type: 'password',
                            label: t('auth.confirmPassword'),
                            autocomplete: 'new-password',
                            required: true,
                            error: error(props.errors, 'password_confirmation'),
                            modelValue: confirmation.value,
                            'onUpdate:modelValue': (value: string | number | null) =>
                                (confirmation.value = String(value ?? '')),
                        }),

                        h(
                            MeButton,
                            { type: 'submit', variant: 'primary', block: true, loading: props.processing },
                            () => t('auth.registerSubmit'),
                        ),
                    ]),
                ],
                () => [
                    `${t('auth.haveAccount')} `,
                    h(props.as, { href: props.loginUrl, class: 'me-btn me-btn--link me-btn--sm' }, () =>
                        t('auth.signIn'),
                    ),
                ],
            )
    },
})

export const MeForgotPasswordScreen = defineComponent({
    name: 'MeForgotPasswordScreen',

    props: {
        ...formProps,
        ...layoutProps,
        loginUrl: { type: String, default: '/login' },
    },

    emits: ['submit'],

    setup(props, { emit }) {
        const email = ref('')

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', { email: email.value })
        }

        return () =>
            frame(
                props,
                t('auth.forgotHeading'),
                t('auth.forgotSubheading'),
                [
                    h('form', { class: 'me-stack', onSubmit: submit }, [
                        h(MeInput, {
                            name: 'email',
                            type: 'email',
                            label: t('auth.email'),
                            autocomplete: 'username',
                            required: true,
                            error: error(props.errors, 'email'),
                            modelValue: email.value,
                            'onUpdate:modelValue': (value: string | number | null) => (email.value = String(value ?? '')),
                        }),

                        h(
                            MeButton,
                            { type: 'submit', variant: 'primary', block: true, loading: props.processing },
                            () => t('auth.forgotSubmit'),
                        ),
                    ]),
                ],
                () => [
                    h(props.as, { href: props.loginUrl, class: 'me-btn me-btn--link me-btn--sm' }, () =>
                        t('auth.backToSignIn'),
                    ),
                ],
            )
    },
})

export const MeResetPasswordScreen = defineComponent({
    name: 'MeResetPasswordScreen',

    props: {
        ...formProps,
        ...layoutProps,
        /** Both come from the reset link, and are echoed back untouched. */
        token: { type: String, default: '' },
        email: { type: String, default: '' },
    },

    emits: ['submit'],

    setup(props, { emit }) {
        const email = ref(props.email)
        const password = ref('')
        const confirmation = ref('')

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', {
                token: props.token,
                email: email.value,
                password: password.value,
                password_confirmation: confirmation.value,
            })
        }

        return () =>
            frame(props, t('auth.resetHeading'), t('auth.resetSubheading'), [
                h('form', { class: 'me-stack', onSubmit: submit }, [
                    h(MeInput, {
                        name: 'email',
                        type: 'email',
                        label: t('auth.email'),
                        autocomplete: 'username',
                        required: true,
                        error: error(props.errors, 'email'),
                        modelValue: email.value,
                        'onUpdate:modelValue': (value: string | number | null) => (email.value = String(value ?? '')),
                    }),

                    h(MeInput, {
                        name: 'password',
                        type: 'password',
                        label: t('auth.newPassword'),
                        autocomplete: 'new-password',
                        required: true,
                        error: error(props.errors, 'password'),
                        modelValue: password.value,
                        'onUpdate:modelValue': (value: string | number | null) => (password.value = String(value ?? '')),
                    }),

                    h(MeInput, {
                        name: 'password_confirmation',
                        type: 'password',
                        label: t('auth.confirmPassword'),
                        autocomplete: 'new-password',
                        required: true,
                        error: error(props.errors, 'password_confirmation'),
                        modelValue: confirmation.value,
                        'onUpdate:modelValue': (value: string | number | null) =>
                            (confirmation.value = String(value ?? '')),
                    }),

                    h(
                        MeButton,
                        { type: 'submit', variant: 'primary', block: true, loading: props.processing },
                        () => t('auth.resetSubmit'),
                    ),
                ]),
            ])
    },
})

export const MeConfirmPasswordScreen = defineComponent({
    name: 'MeConfirmPasswordScreen',

    props: {
        ...formProps,
        ...layoutProps,
        passkeys: { type: Boolean, default: true },
        passkeyOptionsUrl: { type: String as PropType<string | null>, default: null },
        passkeyUrl: { type: String as PropType<string | null>, default: null },
    },

    emits: ['submit', 'passkey'],

    setup(props, { emit }) {
        const password = ref('')

        const passkey = usePasskey(
            () =>
                confirmWithPasskey({
                    ...(props.passkeyOptionsUrl ? { optionsUrl: props.passkeyOptionsUrl } : {}),
                    ...(props.passkeyUrl ? { url: props.passkeyUrl } : {}),
                }),
            (event, response) => emit(event, response),
        )

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', { password: password.value })
        }

        return () =>
            frame(props, t('auth.confirmHeading'), t('auth.confirmSubheading'), [
                h('form', { class: 'me-stack', onSubmit: submit }, [
                    h(MeInput, {
                        name: 'password',
                        type: 'password',
                        label: t('auth.password'),
                        autocomplete: 'current-password',
                        required: true,
                        error: error(props.errors, 'password'),
                        modelValue: password.value,
                        'onUpdate:modelValue': (value: string | number | null) => (password.value = String(value ?? '')),
                    }),

                    h(
                        MeButton,
                        { type: 'submit', variant: 'primary', block: true, loading: props.processing },
                        () => t('auth.confirmSubmit'),
                    ),
                ]),

                props.passkeys ? passkeyBlock(passkey, t('auth.confirmWithPasskey')) : null,
            ])
    },
})

export const MeVerifyEmailScreen = defineComponent({
    name: 'MeVerifyEmailScreen',

    props: {
        ...formProps,
        ...layoutProps,
        /** True right after Fortify flashes "verification-link-sent". */
        sent: { type: Boolean, default: false },
    },

    emits: ['resend', 'sign-out'],

    setup(props, { emit }) {
        return () =>
            frame(props, t('auth.verifyHeading'), t('auth.verifySubheading'), [
                h('div', { class: 'me-stack' }, [
                    props.sent ? h(MeAlert, { variant: 'success' }, () => props.status ?? '') : null,

                    h('p', { class: 'me-hint' }, t('auth.verifyText')),

                    h(
                        MeButton,
                        {
                            variant: 'primary',
                            block: true,
                            loading: props.processing,
                            onClick: () => emit('resend'),
                        },
                        () => t('auth.verifyResend'),
                    ),

                    h(MeButton, { variant: 'ghost', block: true, onClick: () => emit('sign-out') }, () =>
                        t('auth.signOut'),
                    ),
                ]),
            ])
    },
})

export const MeTwoFactorChallengeScreen = defineComponent({
    name: 'MeTwoFactorChallengeScreen',

    props: { ...formProps, ...layoutProps },

    emits: ['submit'],

    setup(props, { emit }) {
        const recovery = ref(false)
        const code = ref('')
        const recoveryCode = ref('')

        /*
         * Fortify tells the two apart by field name, so only the field in play
         * is ever sent — and switching clears the other one rather than
         * leaving a stale value behind (BR-07).
         */
        function toggle(): void {
            recovery.value = !recovery.value
            code.value = ''
            recoveryCode.value = ''
        }

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', recovery.value ? { recovery_code: recoveryCode.value } : { code: code.value })
        }

        return () =>
            frame(
                props,
                t('auth.challengeHeading'),
                t('auth.challengeSubheading'),
                [
                    h('form', { class: 'me-stack', onSubmit: submit }, [
                        recovery.value
                            ? h(MeInput, {
                                  name: 'recovery_code',
                                  label: t('auth.recoveryCode'),
                                  autocomplete: 'one-time-code',
                                  required: true,
                                  error: error(props.errors, 'recovery_code'),
                                  modelValue: recoveryCode.value,
                                  'onUpdate:modelValue': (value: string | number | null) =>
                                      (recoveryCode.value = String(value ?? '')),
                              })
                            : h(MeInput, {
                                  name: 'code',
                                  label: t('auth.code'),
                                  inputmode: 'numeric',
                                  autocomplete: 'one-time-code',
                                  required: true,
                                  error: error(props.errors, 'code'),
                                  modelValue: code.value,
                                  'onUpdate:modelValue': (value: string | number | null) =>
                                      (code.value = String(value ?? '')),
                              }),

                        h(
                            MeButton,
                            { type: 'submit', variant: 'primary', block: true, loading: props.processing },
                            () => t('auth.confirmSubmit'),
                        ),
                    ]),
                ],
                () => [
                    h('button', { type: 'button', class: 'me-btn me-btn--link me-btn--sm', onClick: toggle }, [
                        recovery.value ? t('auth.useAuthCode') : t('auth.useRecoveryCode'),
                    ]),
                ],
            )
    },
})

/*
 * The profile cards. Each one is the Vue counterpart of a published Blade
 * partial, and each emits its own payload rather than knowing a route.
 */

export const MeProfileInformationCard = defineComponent({
    name: 'MeProfileInformationCard',

    props: {
        ...formProps,
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        avatarUrl: { type: String as PropType<string | null>, default: null },
        /** False shows the "unverified" notice and its resend action. */
        verified: { type: Boolean, default: true },
    },

    emits: ['submit', 'resend-verification'],

    setup(props, { emit }) {
        const name = ref(props.name)
        const email = ref(props.email)
        const avatar = ref<File | null>(null)

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', { name: name.value, email: email.value, avatar: avatar.value })
        }

        return () =>
            h(
                MeCard,
                { title: t('auth.profileInformation'), description: t('auth.profileInformationText') },
                {
                    default: () =>
                        h('form', { class: 'me-stack', onSubmit: submit }, [
                            h('div', { class: 'me-avatar-field' }, [
                                h(MeAvatar, { name: name.value, src: props.avatarUrl, size: 'xl' }),

                                h('div', { class: 'me-avatar-field__control' }, [
                                    h(MeUpload, {
                                        name: 'avatar',
                                        accept: 'image/png,image/jpeg,image/webp',
                                        label: t('auth.avatar'),
                                        hint: t('auth.avatarText'),
                                        error: error(props.errors, 'avatar'),
                                        'onUpdate:modelValue': (files: File[]) => (avatar.value = files[0] ?? null),
                                    }),
                                ]),
                            ]),

                            h(MeInput, {
                                name: 'name',
                                label: t('auth.name'),
                                autocomplete: 'name',
                                required: true,
                                error: error(props.errors, 'name'),
                                modelValue: name.value,
                                'onUpdate:modelValue': (value: string | number | null) =>
                                    (name.value = String(value ?? '')),
                            }),

                            h(MeInput, {
                                name: 'email',
                                type: 'email',
                                label: t('auth.email'),
                                autocomplete: 'username',
                                required: true,
                                error: error(props.errors, 'email'),
                                modelValue: email.value,
                                'onUpdate:modelValue': (value: string | number | null) =>
                                    (email.value = String(value ?? '')),
                            }),

                            props.verified
                                ? null
                                : h(MeAlert, { variant: 'warning' }, () => [
                                      `${t('auth.unverified')} `,
                                      h(
                                          'button',
                                          {
                                              type: 'button',
                                              class: 'me-btn me-btn--link me-btn--sm',
                                              onClick: () => emit('resend-verification'),
                                          },
                                          t('auth.resendVerification'),
                                      ),
                                  ]),

                            h('div', { class: 'me-row me-row--end' }, [
                                h(
                                    MeButton,
                                    { type: 'submit', variant: 'primary', loading: props.processing },
                                    () => t('auth.save'),
                                ),
                            ]),
                        ]),
                },
            )
    },
})

export const MeUpdatePasswordCard = defineComponent({
    name: 'MeUpdatePasswordCard',

    props: formProps,

    emits: ['submit'],

    setup(props, { emit }) {
        const current = ref('')
        const password = ref('')
        const confirmation = ref('')

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', {
                current_password: current.value,
                password: password.value,
                password_confirmation: confirmation.value,
            })
        }

        return () =>
            h(
                MeCard,
                { title: t('auth.updatePassword'), description: t('auth.updatePasswordText') },
                {
                    default: () =>
                        h('form', { class: 'me-stack', onSubmit: submit }, [
                            h(MeInput, {
                                name: 'current_password',
                                type: 'password',
                                label: t('auth.currentPassword'),
                                autocomplete: 'current-password',
                                error: error(props.errors, 'current_password'),
                                modelValue: current.value,
                                'onUpdate:modelValue': (value: string | number | null) =>
                                    (current.value = String(value ?? '')),
                            }),

                            h(MeInput, {
                                name: 'password',
                                type: 'password',
                                label: t('auth.newPassword'),
                                autocomplete: 'new-password',
                                error: error(props.errors, 'password'),
                                modelValue: password.value,
                                'onUpdate:modelValue': (value: string | number | null) =>
                                    (password.value = String(value ?? '')),
                            }),

                            h(MeInput, {
                                name: 'password_confirmation',
                                type: 'password',
                                label: t('auth.confirmPassword'),
                                autocomplete: 'new-password',
                                error: error(props.errors, 'password_confirmation'),
                                modelValue: confirmation.value,
                                'onUpdate:modelValue': (value: string | number | null) =>
                                    (confirmation.value = String(value ?? '')),
                            }),

                            h('div', { class: 'me-row me-row--end' }, [
                                h(
                                    MeButton,
                                    { type: 'submit', variant: 'primary', loading: props.processing },
                                    () => t('auth.save'),
                                ),
                            ]),
                        ]),
                },
            )
    },
})

export const MeTwoFactorCard = defineComponent({
    name: 'MeTwoFactorCard',

    props: {
        ...formProps,
        /** Fortify's three states, and the only three this card renders. */
        state: { type: String as PropType<'off' | 'pending' | 'on'>, default: 'off' },
        /** The SVG string from GET /user/two-factor-qr-code (BR-06). */
        qrCode: { type: String as PropType<string | null>, default: null },
        secretKey: { type: String as PropType<string | null>, default: null },
        recoveryCodes: { type: Array as PropType<string[]>, default: () => [] },
    },

    emits: ['enable', 'disable', 'confirm', 'regenerate'],

    setup(props, { emit }) {
        const code = ref('')

        const badge = computed(() =>
            props.state === 'on'
                ? { variant: 'success' as const, label: t('auth.twoFactorOn') }
                : props.state === 'pending'
                  ? { variant: 'warning' as const, label: t('auth.twoFactorPending') }
                  : { variant: null, label: t('auth.twoFactorOff') },
        )

        function confirm(event: Event): void {
            event.preventDefault()

            emit('confirm', { code: code.value })
            code.value = ''
        }

        return () =>
            h(
                MeCard,
                { title: t('auth.twoFactor'), description: t('auth.twoFactorText') },
                {
                    actions: () => h(MeBadge, { variant: badge.value.variant }, () => badge.value.label),

                    default: () =>
                        h('div', { class: 'me-stack' }, [
                            props.state === 'off'
                                ? h(
                                      MeButton,
                                      {
                                          variant: 'primary',
                                          icon: 'shield',
                                          loading: props.processing,
                                          onClick: () => emit('enable'),
                                      },
                                      () => t('auth.enable'),
                                  )
                                : null,

                            props.state === 'pending'
                                ? h('div', { class: 'me-stack' }, [
                                      h('p', { class: 'me-hint' }, t('auth.scanText')),

                                      // The QR code is markup by nature. It comes
                                      // from the application's own Fortify
                                      // endpoint and nowhere else (BR-06).
                                      props.qrCode
                                          ? h('div', { class: 'me-qr', innerHTML: props.qrCode })
                                          : null,

                                      props.secretKey
                                          ? h('p', { class: 'me-secret' }, [
                                                h('span', { class: 'me-secret__value' }, props.secretKey),
                                            ])
                                          : null,

                                      h('form', { class: 'me-stack', onSubmit: confirm }, [
                                          h(MeInput, {
                                              name: 'code',
                                              label: t('auth.code'),
                                              inputmode: 'numeric',
                                              autocomplete: 'one-time-code',
                                              required: true,
                                              error: error(props.errors, 'code'),
                                              modelValue: code.value,
                                              'onUpdate:modelValue': (value: string | number | null) =>
                                                  (code.value = String(value ?? '')),
                                          }),

                                          h('div', { class: 'me-row me-row--end' }, [
                                              h(
                                                  MeButton,
                                                  { type: 'submit', variant: 'primary', loading: props.processing },
                                                  () => t('auth.confirmCode'),
                                              ),
                                          ]),
                                      ]),
                                  ])
                                : null,

                            props.state === 'on'
                                ? h('div', { class: 'me-stack' }, [
                                      h('p', { class: 'me-label' }, t('auth.recoveryCodes')),
                                      h('p', { class: 'me-hint' }, t('auth.recoveryCodesText')),

                                      props.recoveryCodes.length > 0
                                          ? h(
                                                'div',
                                                { class: 'me-recovery-codes' },
                                                props.recoveryCodes.map((value) => h('span', value)),
                                            )
                                          : null,
                                  ])
                                : null,

                            props.state === 'off'
                                ? null
                                : h('div', { class: 'me-row' }, [
                                      props.state === 'on'
                                          ? h(
                                                MeButton,
                                                { variant: 'secondary', icon: 'refresh', onClick: () => emit('regenerate') },
                                                () => t('auth.regenerate'),
                                            )
                                          : null,

                                      h(
                                          MeButton,
                                          { variant: 'outline-danger', icon: 'shield-off', onClick: () => emit('disable') },
                                          () => t('auth.disable'),
                                      ),
                                  ]),
                        ]),
                },
            )
    },
})

export interface Passkey {
    id: string | number
    name: string
    /** Already formatted by the application — this card does no dates. */
    lastUsed?: string | null
}

export const MePasskeysCard = defineComponent({
    name: 'MePasskeysCard',

    props: {
        passkeys: { type: Array as PropType<Passkey[]>, default: () => [] },
        optionsUrl: { type: String as PropType<string | null>, default: null },
        url: { type: String as PropType<string | null>, default: null },
    },

    emits: ['registered', 'remove'],

    setup(props, { emit }) {
        const name = ref('')
        const supported = ref(false)
        const busy = ref(false)
        const failure = ref<string | null>(null)

        onMounted(() => {
            supported.value = isPasskeySupported()
        })

        async function add(): Promise<void> {
            failure.value = null

            if (name.value.trim() === '') {
                failure.value = t('passkey.nameRequired')

                return
            }

            busy.value = true

            try {
                const response = await registerPasskey({
                    name: name.value.trim(),
                    ...(props.optionsUrl ? { optionsUrl: props.optionsUrl } : {}),
                    ...(props.url ? { url: props.url } : {}),
                })

                name.value = ''
                emit('registered', response)
            } catch (thrown) {
                if (!(thrown instanceof PasskeyCancelled)) {
                    failure.value = thrown instanceof Error ? thrown.message : t('passkey.failed')
                }
            } finally {
                busy.value = false
            }
        }

        return () => {
            // An affordance that cannot work is not shown at all (BR-11).
            if (!supported.value) {
                return null
            }

            return h(
                MeCard,
                { title: t('auth.passkeys'), description: t('auth.passkeysText') },
                {
                    default: () =>
                        h('div', { class: 'me-stack' }, [
                            props.passkeys.length > 0
                                ? h(
                                      'div',
                                      { class: 'me-credential-list' },
                                      props.passkeys.map((passkey) =>
                                          h('div', { class: 'me-credential', key: passkey.id }, [
                                              h('span', { class: 'me-credential__icon' }, [h(MeIcon, { name: 'key' })]),

                                              h('div', { class: 'me-credential__body' }, [
                                                  h('p', { class: 'me-credential__name' }, passkey.name),
                                                  h(
                                                      'p',
                                                      { class: 'me-credential__meta' },
                                                      t('auth.lastUsed', { when: passkey.lastUsed ?? t('auth.never') }),
                                                  ),
                                              ]),

                                              h(MeButton, {
                                                  variant: 'ghost',
                                                  size: 'sm',
                                                  icon: 'trash',
                                                  iconOnly: true,
                                                  'aria-label': t('auth.remove'),
                                                  onClick: () => emit('remove', passkey),
                                              }),
                                          ]),
                                      ),
                                  )
                                : h('p', { class: 'me-hint' }, t('auth.noPasskeys')),

                            h(MeInput, {
                                name: 'passkey_name',
                                label: t('auth.passkeyName'),
                                autocomplete: 'off',
                                modelValue: name.value,
                                'onUpdate:modelValue': (value: string | number | null) =>
                                    (name.value = String(value ?? '')),
                            }),

                            h('div', { class: 'me-row' }, [
                                h(
                                    MeButton,
                                    {
                                        variant: 'secondary',
                                        icon: 'plus',
                                        loading: busy.value,
                                        disabled: busy.value,
                                        onClick: () => void add(),
                                    },
                                    () => t('auth.addPasskey'),
                                ),
                            ]),

                            failure.value ? h('p', { class: 'me-error' }, failure.value) : null,
                        ]),
                },
            )
        }
    },
})

export const MeDeleteAccountCard = defineComponent({
    name: 'MeDeleteAccountCard',

    props: formProps,

    emits: ['submit'],

    setup(props, { emit }) {
        const password = ref('')

        function submit(event: Event): void {
            event.preventDefault()

            emit('submit', { password: password.value })
        }

        return () =>
            h(
                MeCard,
                { title: t('auth.deleteAccount'), description: t('auth.deleteAccountText') },
                {
                    default: () =>
                        h('form', { class: 'me-stack', onSubmit: submit }, [
                            h(MeInput, {
                                name: 'password',
                                type: 'password',
                                label: t('auth.deleteConfirm'),
                                autocomplete: 'current-password',
                                error: error(props.errors, 'password'),
                                modelValue: password.value,
                                'onUpdate:modelValue': (value: string | number | null) =>
                                    (password.value = String(value ?? '')),
                            }),

                            h('div', { class: 'me-row me-row--end' }, [
                                h(
                                    MeButton,
                                    { type: 'submit', variant: 'danger', loading: props.processing },
                                    () => t('auth.deleteAccount'),
                                ),
                            ]),
                        ]),
                },
            )
    },
})
