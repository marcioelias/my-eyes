'use client'

import {
    authenticateWithPasskey,
    confirmWithPasskey,
    isPasskeySupported,
    PasskeyCancelled,
    registerPasskey,
    t,
} from '@my-eyes/core'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MeCheckbox, MeInput, MeUpload } from './forms.js'
import { MeAlert, MeAvatar, MeBadge, MeButton, MeCard, MeIcon, type LinkAs } from './primitives.js'
import { MeAuthLayout } from './shell.js'

/**
 * The authentication screens, as the Blade renderer publishes them.
 *
 * A screen never performs a request and never navigates: `onSubmit` receives a
 * plain payload and the application does the rest. Passkeys are the one
 * exception — a WebAuthn ceremony is a round trip the screen has to make itself
 * — and even there the outcome is handed back rather than acted on.
 *
 * @see docs/features/react-package.md
 * @see docs/decisions/0003-vue-screens-emit-instead-of-submitting.md
 */

export type Errors = Record<string, string>

export interface ScreenProps {
    /** Laravel's error bag, passed straight through from Inertia. */
    errors?: Errors
    processing?: boolean
    /** A flash message, where Blade would read session('status'). */
    status?: string | null
}

export interface AuthScreenProps extends ScreenProps {
    heading?: string | null
    subheading?: string | null
    brandName?: string | null
    split?: boolean
    image?: string | null
    tagline?: string | null
    reverse?: boolean
    as?: LinkAs | undefined
    aside?: ReactNode
}

function error(errors: Errors | undefined, key: string): string | null {
    return errors?.[key] ?? null
}

function Frame({
    screen,
    fallbackHeading,
    fallbackSubheading,
    footer,
    children,
}: {
    screen: AuthScreenProps
    fallbackHeading: string
    fallbackSubheading: string
    footer?: ReactNode
    children: ReactNode
}) {
    return (
        <MeAuthLayout
            heading={screen.heading ?? fallbackHeading}
            subheading={screen.subheading ?? fallbackSubheading}
            brandName={screen.brandName ?? null}
            split={screen.split ?? true}
            image={screen.image ?? null}
            tagline={screen.tagline ?? null}
            reverse={screen.reverse ?? false}
            as={screen.as}
            status={screen.status ? <MeAlert variant="success">{screen.status}</MeAlert> : undefined}
            footer={footer}
            aside={screen.aside}
        >
            {children}
        </MeAuthLayout>
    )
}

/*
 * The passkey affordance, shared by sign-in and password confirmation.
 *
 * Support is resolved after mount rather than during render: a server-rendered
 * first paint has no navigator to ask, and guessing would produce a hydration
 * mismatch.
 */
function usePasskey(run: () => Promise<Response>, onDone: ((response: Response) => void) | undefined) {
    const [supported, setSupported] = useState(false)
    const [busy, setBusy] = useState(false)
    const [failure, setFailure] = useState<string | null>(null)

    const done = useRef(onDone)
    done.current = onDone

    useEffect(() => {
        setSupported(isPasskeySupported())
    }, [])

    const start = async (): Promise<void> => {
        setFailure(null)
        setBusy(true)

        try {
            done.current?.(await run())
        } catch (thrown) {
            // A dismissed prompt leaves the screen exactly as it was.
            if (!(thrown instanceof PasskeyCancelled)) {
                setFailure(thrown instanceof Error ? thrown.message : t('passkey.failed'))
            }
        } finally {
            setBusy(false)
        }
    }

    return { supported, busy, failure, start }
}

function PasskeyBlock({ state, label }: { state: ReturnType<typeof usePasskey>; label: string }) {
    if (!state.supported) {
        return null
    }

    return (
        <div className="me-stack">
            <p className="me-auth__separator">{t('auth.or')}</p>

            <MeButton
                variant="secondary"
                block
                icon="key"
                loading={state.busy}
                disabled={state.busy}
                onClick={() => void state.start()}
            >
                {label}
            </MeButton>

            {state.failure ? <p className="me-error">{state.failure}</p> : null}
        </div>
    )
}

export interface MeLoginScreenProps extends AuthScreenProps {
    canRegister?: boolean
    registerUrl?: string
    canResetPassword?: boolean
    forgotUrl?: string
    /** Off when the application has not enabled Fortify's passkey feature. */
    passkeys?: boolean
    passkeyOptionsUrl?: string | null
    passkeyUrl?: string | null
    onSubmit?: (payload: { email: string; password: string; remember: boolean }) => void
    onPasskey?: (response: Response) => void
}

export function MeLoginScreen(props: MeLoginScreenProps) {
    const {
        canRegister = false,
        registerUrl = '/register',
        canResetPassword = true,
        forgotUrl = '/forgot-password',
        passkeys = true,
        passkeyOptionsUrl = null,
        passkeyUrl = null,
        onSubmit,
        onPasskey,
    } = props

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)

    const passkey = usePasskey(
        () =>
            authenticateWithPasskey({
                ...(passkeyOptionsUrl ? { optionsUrl: passkeyOptionsUrl } : {}),
                ...(passkeyUrl ? { url: passkeyUrl } : {}),
            }),
        onPasskey,
    )

    const Link = props.as ?? 'a'

    return (
        <Frame
            screen={props}
            fallbackHeading={t('auth.signIn')}
            fallbackSubheading={t('auth.signInSubheading')}
            footer={
                canRegister ? (
                    <>
                        {`${t('auth.noAccount')} `}
                        <Link href={registerUrl} className="me-btn me-btn--link me-btn--sm">
                            {t('auth.signUp')}
                        </Link>
                    </>
                ) : undefined
            }
        >
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.({ email, password, remember })
                }}
            >
                <MeInput
                    name="email"
                    type="email"
                    label={t('auth.email')}
                    autoComplete="username"
                    required
                    error={error(props.errors, 'email')}
                    value={email}
                    onValueChange={setEmail}
                />

                <MeInput
                    name="password"
                    type="password"
                    label={t('auth.password')}
                    autoComplete="current-password"
                    required
                    error={error(props.errors, 'password')}
                    value={password}
                    onValueChange={setPassword}
                />

                <div className="me-row me-row--between">
                    <MeCheckbox
                        name="remember"
                        label={t('auth.remember')}
                        value={remember}
                        onValueChange={(next) => setRemember(next === true)}
                    />

                    {canResetPassword ? (
                        <Link href={forgotUrl} className="me-btn me-btn--link me-btn--sm">
                            {t('auth.forgot')}
                        </Link>
                    ) : null}
                </div>

                <MeButton type="submit" variant="primary" block loading={props.processing ?? false}>
                    {t('auth.signIn')}
                </MeButton>
            </form>

            {passkeys ? <PasskeyBlock state={passkey} label={t('auth.signInWithPasskey')} /> : null}
        </Frame>
    )
}

export interface MeRegisterScreenProps extends AuthScreenProps {
    loginUrl?: string
    onSubmit?: (payload: {
        name: string
        email: string
        password: string
        password_confirmation: string
    }) => void
}

export function MeRegisterScreen(props: MeRegisterScreenProps) {
    const { loginUrl = '/login', onSubmit } = props

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')

    const Link = props.as ?? 'a'

    return (
        <Frame
            screen={props}
            fallbackHeading={t('auth.registerHeading')}
            fallbackSubheading={t('auth.registerSubheading')}
            footer={
                <>
                    {`${t('auth.haveAccount')} `}
                    <Link href={loginUrl} className="me-btn me-btn--link me-btn--sm">
                        {t('auth.signIn')}
                    </Link>
                </>
            }
        >
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.({ name, email, password, password_confirmation: confirmation })
                }}
            >
                <MeInput
                    name="name"
                    label={t('auth.name')}
                    autoComplete="name"
                    required
                    error={error(props.errors, 'name')}
                    value={name}
                    onValueChange={setName}
                />

                <MeInput
                    name="email"
                    type="email"
                    label={t('auth.email')}
                    autoComplete="username"
                    required
                    error={error(props.errors, 'email')}
                    value={email}
                    onValueChange={setEmail}
                />

                <MeInput
                    name="password"
                    type="password"
                    label={t('auth.password')}
                    autoComplete="new-password"
                    required
                    error={error(props.errors, 'password')}
                    value={password}
                    onValueChange={setPassword}
                />

                <MeInput
                    name="password_confirmation"
                    type="password"
                    label={t('auth.confirmPassword')}
                    autoComplete="new-password"
                    required
                    error={error(props.errors, 'password_confirmation')}
                    value={confirmation}
                    onValueChange={setConfirmation}
                />

                <MeButton type="submit" variant="primary" block loading={props.processing ?? false}>
                    {t('auth.registerSubmit')}
                </MeButton>
            </form>
        </Frame>
    )
}

export interface MeForgotPasswordScreenProps extends AuthScreenProps {
    loginUrl?: string
    onSubmit?: (payload: { email: string }) => void
}

export function MeForgotPasswordScreen(props: MeForgotPasswordScreenProps) {
    const { loginUrl = '/login', onSubmit } = props
    const [email, setEmail] = useState('')

    const Link = props.as ?? 'a'

    return (
        <Frame
            screen={props}
            fallbackHeading={t('auth.forgotHeading')}
            fallbackSubheading={t('auth.forgotSubheading')}
            footer={
                <Link href={loginUrl} className="me-btn me-btn--link me-btn--sm">
                    {t('auth.backToSignIn')}
                </Link>
            }
        >
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.({ email })
                }}
            >
                <MeInput
                    name="email"
                    type="email"
                    label={t('auth.email')}
                    autoComplete="username"
                    required
                    error={error(props.errors, 'email')}
                    value={email}
                    onValueChange={setEmail}
                />

                <MeButton type="submit" variant="primary" block loading={props.processing ?? false}>
                    {t('auth.forgotSubmit')}
                </MeButton>
            </form>
        </Frame>
    )
}

export interface MeResetPasswordScreenProps extends AuthScreenProps {
    /** Both come from the reset link, and are echoed back untouched. */
    token?: string
    email?: string
    onSubmit?: (payload: {
        token: string
        email: string
        password: string
        password_confirmation: string
    }) => void
}

export function MeResetPasswordScreen(props: MeResetPasswordScreenProps) {
    const { token = '', onSubmit } = props

    const [email, setEmail] = useState(props.email ?? '')
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')

    return (
        <Frame
            screen={props}
            fallbackHeading={t('auth.resetHeading')}
            fallbackSubheading={t('auth.resetSubheading')}
        >
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.({ token, email, password, password_confirmation: confirmation })
                }}
            >
                <MeInput
                    name="email"
                    type="email"
                    label={t('auth.email')}
                    autoComplete="username"
                    required
                    error={error(props.errors, 'email')}
                    value={email}
                    onValueChange={setEmail}
                />

                <MeInput
                    name="password"
                    type="password"
                    label={t('auth.newPassword')}
                    autoComplete="new-password"
                    required
                    error={error(props.errors, 'password')}
                    value={password}
                    onValueChange={setPassword}
                />

                <MeInput
                    name="password_confirmation"
                    type="password"
                    label={t('auth.confirmPassword')}
                    autoComplete="new-password"
                    required
                    error={error(props.errors, 'password_confirmation')}
                    value={confirmation}
                    onValueChange={setConfirmation}
                />

                <MeButton type="submit" variant="primary" block loading={props.processing ?? false}>
                    {t('auth.resetSubmit')}
                </MeButton>
            </form>
        </Frame>
    )
}

export interface MeConfirmPasswordScreenProps extends AuthScreenProps {
    passkeys?: boolean
    passkeyOptionsUrl?: string | null
    passkeyUrl?: string | null
    onSubmit?: (payload: { password: string }) => void
    onPasskey?: (response: Response) => void
}

export function MeConfirmPasswordScreen(props: MeConfirmPasswordScreenProps) {
    const { passkeys = true, passkeyOptionsUrl = null, passkeyUrl = null, onSubmit, onPasskey } = props

    const [password, setPassword] = useState('')

    const passkey = usePasskey(
        () =>
            confirmWithPasskey({
                ...(passkeyOptionsUrl ? { optionsUrl: passkeyOptionsUrl } : {}),
                ...(passkeyUrl ? { url: passkeyUrl } : {}),
            }),
        onPasskey,
    )

    return (
        <Frame
            screen={props}
            fallbackHeading={t('auth.confirmHeading')}
            fallbackSubheading={t('auth.confirmSubheading')}
        >
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.({ password })
                }}
            >
                <MeInput
                    name="password"
                    type="password"
                    label={t('auth.password')}
                    autoComplete="current-password"
                    required
                    error={error(props.errors, 'password')}
                    value={password}
                    onValueChange={setPassword}
                />

                <MeButton type="submit" variant="primary" block loading={props.processing ?? false}>
                    {t('auth.confirmSubmit')}
                </MeButton>
            </form>

            {passkeys ? <PasskeyBlock state={passkey} label={t('auth.confirmWithPasskey')} /> : null}
        </Frame>
    )
}

export interface MeVerifyEmailScreenProps extends AuthScreenProps {
    /** True right after Fortify flashes "verification-link-sent". */
    sent?: boolean
    onResend?: () => void
    onSignOut?: () => void
}

export function MeVerifyEmailScreen(props: MeVerifyEmailScreenProps) {
    const { sent = false, onResend, onSignOut } = props

    return (
        <Frame
            screen={props}
            fallbackHeading={t('auth.verifyHeading')}
            fallbackSubheading={t('auth.verifySubheading')}
        >
            <div className="me-stack">
                {sent ? <MeAlert variant="success">{props.status ?? ''}</MeAlert> : null}

                <p className="me-hint">{t('auth.verifyText')}</p>

                <MeButton variant="primary" block loading={props.processing ?? false} onClick={() => onResend?.()}>
                    {t('auth.verifyResend')}
                </MeButton>

                <MeButton variant="ghost" block onClick={() => onSignOut?.()}>
                    {t('auth.signOut')}
                </MeButton>
            </div>
        </Frame>
    )
}

export interface MeTwoFactorChallengeScreenProps extends AuthScreenProps {
    onSubmit?: (payload: { code: string } | { recovery_code: string }) => void
}

export function MeTwoFactorChallengeScreen(props: MeTwoFactorChallengeScreenProps) {
    const { onSubmit } = props

    const [recovery, setRecovery] = useState(false)
    const [code, setCode] = useState('')
    const [recoveryCode, setRecoveryCode] = useState('')

    /*
     * Fortify tells the two apart by field name, so only the field in play is
     * ever sent — and switching clears the other one rather than leaving a stale
     * value behind (BR-07 of auth-screens.md).
     */
    const toggle = (): void => {
        setRecovery(!recovery)
        setCode('')
        setRecoveryCode('')
    }

    return (
        <Frame
            screen={props}
            fallbackHeading={t('auth.challengeHeading')}
            fallbackSubheading={t('auth.challengeSubheading')}
            footer={
                <button type="button" className="me-btn me-btn--link me-btn--sm" onClick={toggle}>
                    {recovery ? t('auth.useAuthCode') : t('auth.useRecoveryCode')}
                </button>
            }
        >
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.(recovery ? { recovery_code: recoveryCode } : { code })
                }}
            >
                {recovery ? (
                    <MeInput
                        name="recovery_code"
                        label={t('auth.recoveryCode')}
                        autoComplete="one-time-code"
                        required
                        error={error(props.errors, 'recovery_code')}
                        value={recoveryCode}
                        onValueChange={setRecoveryCode}
                    />
                ) : (
                    <MeInput
                        name="code"
                        label={t('auth.code')}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        error={error(props.errors, 'code')}
                        value={code}
                        onValueChange={setCode}
                    />
                )}

                <MeButton type="submit" variant="primary" block loading={props.processing ?? false}>
                    {t('auth.confirmSubmit')}
                </MeButton>
            </form>
        </Frame>
    )
}

/*
 * The profile cards. Each one is the React counterpart of a published Blade
 * partial, and each hands back its own payload rather than knowing a route.
 */

export interface MeProfileInformationCardProps extends ScreenProps {
    name?: string
    email?: string
    avatarUrl?: string | null
    /** False shows the "unverified" notice and its resend action. */
    verified?: boolean
    onSubmit?: (payload: { name: string; email: string; avatar: File | null }) => void
    onResendVerification?: () => void
}

export function MeProfileInformationCard({
    errors,
    processing = false,
    name: initialName = '',
    email: initialEmail = '',
    avatarUrl = null,
    verified = true,
    onSubmit,
    onResendVerification,
}: MeProfileInformationCardProps) {
    const [name, setName] = useState(initialName)
    const [email, setEmail] = useState(initialEmail)
    const [avatar, setAvatar] = useState<File | null>(null)

    return (
        <MeCard title={t('auth.profileInformation')} description={t('auth.profileInformationText')}>
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.({ name, email, avatar })
                }}
            >
                <div className="me-avatar-field">
                    <MeAvatar name={name} src={avatarUrl} size="xl" />

                    <div className="me-avatar-field__control">
                        <MeUpload
                            name="avatar"
                            accept="image/png,image/jpeg,image/webp"
                            label={t('auth.avatar')}
                            hint={t('auth.avatarText')}
                            error={error(errors, 'avatar')}
                            onValueChange={(files) => setAvatar(files[0] ?? null)}
                        />
                    </div>
                </div>

                <MeInput
                    name="name"
                    label={t('auth.name')}
                    autoComplete="name"
                    required
                    error={error(errors, 'name')}
                    value={name}
                    onValueChange={setName}
                />

                <MeInput
                    name="email"
                    type="email"
                    label={t('auth.email')}
                    autoComplete="username"
                    required
                    error={error(errors, 'email')}
                    value={email}
                    onValueChange={setEmail}
                />

                {verified ? null : (
                    <MeAlert variant="warning">
                        {`${t('auth.unverified')} `}
                        <button
                            type="button"
                            className="me-btn me-btn--link me-btn--sm"
                            onClick={() => onResendVerification?.()}
                        >
                            {t('auth.resendVerification')}
                        </button>
                    </MeAlert>
                )}

                <div className="me-row me-row--end">
                    <MeButton type="submit" variant="primary" loading={processing}>
                        {t('auth.save')}
                    </MeButton>
                </div>
            </form>
        </MeCard>
    )
}

export interface MeUpdatePasswordCardProps extends ScreenProps {
    onSubmit?: (payload: {
        current_password: string
        password: string
        password_confirmation: string
    }) => void
}

export function MeUpdatePasswordCard({ errors, processing = false, onSubmit }: MeUpdatePasswordCardProps) {
    const [current, setCurrent] = useState('')
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')

    return (
        <MeCard title={t('auth.updatePassword')} description={t('auth.updatePasswordText')}>
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.({
                        current_password: current,
                        password,
                        password_confirmation: confirmation,
                    })
                }}
            >
                <MeInput
                    name="current_password"
                    type="password"
                    label={t('auth.currentPassword')}
                    autoComplete="current-password"
                    error={error(errors, 'current_password')}
                    value={current}
                    onValueChange={setCurrent}
                />

                <MeInput
                    name="password"
                    type="password"
                    label={t('auth.newPassword')}
                    autoComplete="new-password"
                    error={error(errors, 'password')}
                    value={password}
                    onValueChange={setPassword}
                />

                <MeInput
                    name="password_confirmation"
                    type="password"
                    label={t('auth.confirmPassword')}
                    autoComplete="new-password"
                    error={error(errors, 'password_confirmation')}
                    value={confirmation}
                    onValueChange={setConfirmation}
                />

                <div className="me-row me-row--end">
                    <MeButton type="submit" variant="primary" loading={processing}>
                        {t('auth.save')}
                    </MeButton>
                </div>
            </form>
        </MeCard>
    )
}

export interface MeTwoFactorCardProps extends ScreenProps {
    /** Fortify's three states, and the only three this card renders. */
    state?: 'off' | 'pending' | 'on'
    /** The SVG string from GET /user/two-factor-qr-code. */
    qrCode?: string | null
    secretKey?: string | null
    recoveryCodes?: string[]
    onEnable?: () => void
    onDisable?: () => void
    onConfirm?: (payload: { code: string }) => void
    onRegenerate?: () => void
}

export function MeTwoFactorCard({
    errors,
    processing = false,
    state = 'off',
    qrCode = null,
    secretKey = null,
    recoveryCodes = [],
    onEnable,
    onDisable,
    onConfirm,
    onRegenerate,
}: MeTwoFactorCardProps) {
    const [code, setCode] = useState('')

    const badge =
        state === 'on'
            ? { variant: 'success' as const, label: t('auth.twoFactorOn') }
            : state === 'pending'
              ? { variant: 'warning' as const, label: t('auth.twoFactorPending') }
              : { variant: null, label: t('auth.twoFactorOff') }

    return (
        <MeCard
            title={t('auth.twoFactor')}
            description={t('auth.twoFactorText')}
            actions={<MeBadge variant={badge.variant}>{badge.label}</MeBadge>}
        >
            <div className="me-stack">
                {state === 'off' ? (
                    <MeButton variant="primary" icon="shield" loading={processing} onClick={() => onEnable?.()}>
                        {t('auth.enable')}
                    </MeButton>
                ) : null}

                {state === 'pending' ? (
                    <div className="me-stack">
                        <p className="me-hint">{t('auth.scanText')}</p>

                        {/*
                         * The QR code is markup by nature. It comes from the
                         * application's own Fortify endpoint and nowhere else.
                         */}
                        {qrCode ? <div className="me-qr" dangerouslySetInnerHTML={{ __html: qrCode }} /> : null}

                        {secretKey ? (
                            <p className="me-secret">
                                <span className="me-secret__value">{secretKey}</span>
                            </p>
                        ) : null}

                        <form
                            className="me-stack"
                            onSubmit={(event) => {
                                event.preventDefault()
                                onConfirm?.({ code })
                                setCode('')
                            }}
                        >
                            <MeInput
                                name="code"
                                label={t('auth.code')}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                required
                                error={error(errors, 'code')}
                                value={code}
                                onValueChange={setCode}
                            />

                            <div className="me-row me-row--end">
                                <MeButton type="submit" variant="primary" loading={processing}>
                                    {t('auth.confirmCode')}
                                </MeButton>
                            </div>
                        </form>
                    </div>
                ) : null}

                {state === 'on' ? (
                    <div className="me-stack">
                        <p className="me-label">{t('auth.recoveryCodes')}</p>
                        <p className="me-hint">{t('auth.recoveryCodesText')}</p>

                        {recoveryCodes.length > 0 ? (
                            <div className="me-recovery-codes">
                                {recoveryCodes.map((value) => (
                                    <span key={value}>{value}</span>
                                ))}
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {state === 'off' ? null : (
                    <div className="me-row">
                        {state === 'on' ? (
                            <MeButton variant="secondary" icon="refresh" onClick={() => onRegenerate?.()}>
                                {t('auth.regenerate')}
                            </MeButton>
                        ) : null}

                        <MeButton variant="outline-danger" icon="shield-off" onClick={() => onDisable?.()}>
                            {t('auth.disable')}
                        </MeButton>
                    </div>
                )}
            </div>
        </MeCard>
    )
}

export interface Passkey {
    id: string | number
    name: string
    /** Already formatted by the application — this card does no dates. */
    lastUsed?: string | null
}

export interface MePasskeysCardProps {
    passkeys?: Passkey[]
    optionsUrl?: string | null
    url?: string | null
    onRegistered?: (response: Response) => void
    onRemove?: (passkey: Passkey) => void
}

export function MePasskeysCard({
    passkeys = [],
    optionsUrl = null,
    url = null,
    onRegistered,
    onRemove,
}: MePasskeysCardProps) {
    const [name, setName] = useState('')
    const [supported, setSupported] = useState(false)
    const [busy, setBusy] = useState(false)
    const [failure, setFailure] = useState<string | null>(null)

    useEffect(() => {
        setSupported(isPasskeySupported())
    }, [])

    const add = async (): Promise<void> => {
        setFailure(null)

        if (name.trim() === '') {
            setFailure(t('passkey.nameRequired'))

            return
        }

        setBusy(true)

        try {
            const response = await registerPasskey({
                name: name.trim(),
                ...(optionsUrl ? { optionsUrl } : {}),
                ...(url ? { url } : {}),
            })

            setName('')
            onRegistered?.(response)
        } catch (thrown) {
            if (!(thrown instanceof PasskeyCancelled)) {
                setFailure(thrown instanceof Error ? thrown.message : t('passkey.failed'))
            }
        } finally {
            setBusy(false)
        }
    }

    // An affordance that cannot work is not shown at all.
    if (!supported) {
        return null
    }

    return (
        <MeCard title={t('auth.passkeys')} description={t('auth.passkeysText')}>
            <div className="me-stack">
                {passkeys.length > 0 ? (
                    <div className="me-credential-list">
                        {passkeys.map((passkey) => (
                            <div className="me-credential" key={passkey.id}>
                                <span className="me-credential__icon">
                                    <MeIcon name="key" />
                                </span>

                                <div className="me-credential__body">
                                    <p className="me-credential__name">{passkey.name}</p>
                                    <p className="me-credential__meta">
                                        {t('auth.lastUsed', { when: passkey.lastUsed ?? t('auth.never') })}
                                    </p>
                                </div>

                                <MeButton
                                    variant="ghost"
                                    size="sm"
                                    icon="trash"
                                    iconOnly
                                    aria-label={t('auth.remove')}
                                    onClick={() => onRemove?.(passkey)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="me-hint">{t('auth.noPasskeys')}</p>
                )}

                <MeInput
                    name="passkey_name"
                    label={t('auth.passkeyName')}
                    autoComplete="off"
                    value={name}
                    onValueChange={setName}
                />

                <div className="me-row">
                    <MeButton
                        variant="secondary"
                        icon="plus"
                        loading={busy}
                        disabled={busy}
                        onClick={() => void add()}
                    >
                        {t('auth.addPasskey')}
                    </MeButton>
                </div>

                {failure ? <p className="me-error">{failure}</p> : null}
            </div>
        </MeCard>
    )
}

export interface MeDeleteAccountCardProps extends ScreenProps {
    onSubmit?: (payload: { password: string }) => void
}

export function MeDeleteAccountCard({ errors, processing = false, onSubmit }: MeDeleteAccountCardProps) {
    const [password, setPassword] = useState('')

    return (
        <MeCard title={t('auth.deleteAccount')} description={t('auth.deleteAccountText')}>
            <form
                className="me-stack"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit?.({ password })
                }}
            >
                <MeInput
                    name="password"
                    type="password"
                    label={t('auth.deleteConfirm')}
                    autoComplete="current-password"
                    error={error(errors, 'password')}
                    value={password}
                    onValueChange={setPassword}
                />

                <div className="me-row me-row--end">
                    <MeButton type="submit" variant="danger" loading={processing}>
                        {t('auth.deleteAccount')}
                    </MeButton>
                </div>
            </form>
        </MeCard>
    )
}
