/*
 * Passkeys — the WebAuthn ceremony, written once for every renderer.
 *
 * A passkey flow is always the same three steps: ask the server for options,
 * hand them to the browser, post back what the browser produced. Only the two
 * URLs change, so Blade, Livewire and Vue call the functions below instead of
 * each carrying their own copy of the ceremony.
 *
 * The defaults are Fortify's paths. Nothing here knows what a route name is.
 *
 * @see docs/features/auth-screens.md
 * @see docs/decisions/0002-passkeys-without-a-webauthn-library.md
 */

export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>

export interface PasskeyEndpoints {
    /** Where the WebAuthn options JSON comes from. */
    optionsUrl?: string
    /** Where the finished credential is posted. */
    url?: string
    /** Label stored alongside a newly registered passkey. */
    name?: string
    /** Passed to navigator.credentials.get — 'conditional' drives autofill. */
    mediation?: CredentialMediationRequirement
    signal?: AbortSignal
    fetcher?: Fetcher
}

/** The person dismissed the browser's prompt. Not an error worth showing. */
export class PasskeyCancelled extends Error {
    constructor() {
        super('The passkey prompt was dismissed.')
        this.name = 'PasskeyCancelled'
    }
}

export class PasskeyError extends Error {
    readonly response: Response | undefined

    constructor(message: string, response?: Response) {
        super(message)
        this.name = 'PasskeyError'
        this.response = response
    }
}

const ENDPOINTS = {
    login: { optionsUrl: '/passkeys/login/options', url: '/passkeys/login' },
    register: { optionsUrl: '/user/passkeys/options', url: '/user/passkeys' },
    confirm: { optionsUrl: '/passkeys/confirm/options', url: '/passkeys/confirm' },
} as const

/**
 * Whether this browser can do WebAuthn at all.
 *
 * Callers use it to decide whether to render a passkey button — an affordance
 * that cannot work must not be shown (BR-11).
 */
export function isPasskeySupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.PublicKeyCredential !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        typeof navigator.credentials?.create === 'function'
    )
}

/** Whether passkey autofill (conditional mediation) is available. */
export async function isPasskeyAutofillSupported(): Promise<boolean> {
    if (!isPasskeySupported()) {
        return false
    }

    const check = (window.PublicKeyCredential as unknown as ConditionalMediationCheck)
        .isConditionalMediationAvailable

    if (typeof check !== 'function') {
        return false
    }

    try {
        return await check.call(window.PublicKeyCredential)
    } catch {
        return false
    }
}

/** Registers a new passkey for the signed-in user. */
export async function registerPasskey(options: PasskeyEndpoints = {}): Promise<Response> {
    const optionsUrl = options.optionsUrl ?? ENDPOINTS.register.optionsUrl
    const url = options.url ?? ENDPOINTS.register.url
    const fetcher = options.fetcher ?? window.fetch.bind(window)

    const json = await requestOptions(optionsUrl, fetcher)
    const credential = await ceremony(() =>
        navigator.credentials.create({
            publicKey: toCreationOptions(json),
            ...(options.signal ? { signal: options.signal } : {}),
        }),
    )

    return await postCredential(url, credential, fetcher, options.name)
}

/** Signs a user in with a passkey. No password, no identifier. */
export async function authenticateWithPasskey(options: PasskeyEndpoints = {}): Promise<Response> {
    return await assertion(ENDPOINTS.login, options)
}

/** Re-authenticates for a password-confirmation wall, using a passkey. */
export async function confirmWithPasskey(options: PasskeyEndpoints = {}): Promise<Response> {
    return await assertion(ENDPOINTS.confirm, options)
}

async function assertion(
    defaults: { optionsUrl: string; url: string },
    options: PasskeyEndpoints,
): Promise<Response> {
    const optionsUrl = options.optionsUrl ?? defaults.optionsUrl
    const url = options.url ?? defaults.url
    const fetcher = options.fetcher ?? window.fetch.bind(window)

    const json = await requestOptions(optionsUrl, fetcher)
    const credential = await ceremony(() =>
        navigator.credentials.get({
            publicKey: toRequestOptions(json),
            ...(options.mediation ? { mediation: options.mediation } : {}),
            ...(options.signal ? { signal: options.signal } : {}),
        }),
    )

    return await postCredential(url, credential, fetcher)
}

/*
 * A dismissed prompt and a broken ceremony are different events, and only one
 * of them is worth telling the user about. Both arrive as a DOMException, so
 * they are separated here rather than at every call site.
 */
async function ceremony(run: () => Promise<Credential | null>): Promise<Credential> {
    let credential: Credential | null

    try {
        credential = await run()
    } catch (error) {
        if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
            throw new PasskeyCancelled()
        }

        throw new PasskeyError(error instanceof Error ? error.message : 'The passkey ceremony failed.')
    }

    if (credential === null) {
        throw new PasskeyCancelled()
    }

    return credential
}

async function requestOptions(url: string, fetcher: Fetcher): Promise<JsonObject> {
    const response = await fetcher(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })

    if (!response.ok) {
        throw new PasskeyError(`The server refused to start the passkey ceremony (${response.status}).`, response)
    }

    return unwrapOptions((await response.json()) as JsonObject)
}

async function postCredential(
    url: string,
    credential: Credential,
    fetcher: Fetcher,
    name?: string,
): Promise<Response> {
    const response = await fetcher(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...csrfHeader(),
        },
        /*
         * Sent as a JSON string rather than a nested object: Fortify validates
         * `credential_response` with the `json` rule, which a decoded array
         * fails.
         */
        body: JSON.stringify({
            credential_response: JSON.stringify(credentialToJson(credential)),
            ...(name === undefined ? {} : { name }),
        }),
    })

    if (!response.ok) {
        throw new PasskeyError(await failureMessage(response), response)
    }

    return response
}

async function failureMessage(response: Response): Promise<string> {
    try {
        const body = (await response.clone().json()) as { message?: unknown }

        if (typeof body.message === 'string' && body.message !== '') {
            return body.message
        }
    } catch {
        // Not JSON, or no body at all. The status is all we have.
    }

    return `The server rejected the passkey (${response.status}).`
}

/**
 * Laravel accepts either header. The meta tag is what a Blade layout renders;
 * the cookie is what an SPA has, and Laravel writes it on every response.
 */
function csrfHeader(): Record<string, string> {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content

    if (meta) {
        return { 'X-CSRF-TOKEN': meta }
    }

    const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith('XSRF-TOKEN='))
        ?.slice('XSRF-TOKEN='.length)

    return cookie ? { 'X-XSRF-TOKEN': decodeURIComponent(cookie) } : {}
}

/*
 * Servers wrap the options differently — bare, under `publicKey`, or under
 * `options`. All three are accepted rather than requiring one, because the
 * shape belongs to the application's backend and not to this package.
 */
function unwrapOptions(body: JsonObject): JsonObject {
    if (isObject(body.publicKey)) {
        return body.publicKey
    }

    if (isObject(body.options)) {
        return body.options
    }

    return body
}

/*
 * The conversions.
 *
 * A browser with the native JSON parsers does all of this itself, and that is
 * the path virtually every visitor takes. The manual fallback below exists for
 * the ones that do not, and is tested directly — otherwise it would be dead
 * code that only breaks in the browsers least able to report it.
 */

export function toCreationOptions(json: JsonObject): PublicKeyCredentialCreationOptions {
    const parse = nativeParser('parseCreationOptionsFromJSON')

    if (parse) {
        return parse(json) as PublicKeyCredentialCreationOptions
    }

    const user = isObject(json.user) ? json.user : {}

    return {
        ...json,
        challenge: base64UrlToBuffer(asString(json.challenge)),
        user: { ...user, id: base64UrlToBuffer(asString(user.id)) },
        excludeCredentials: descriptors(json.excludeCredentials),
    } as unknown as PublicKeyCredentialCreationOptions
}

export function toRequestOptions(json: JsonObject): PublicKeyCredentialRequestOptions {
    const parse = nativeParser('parseRequestOptionsFromJSON')

    if (parse) {
        return parse(json) as PublicKeyCredentialRequestOptions
    }

    return {
        ...json,
        challenge: base64UrlToBuffer(asString(json.challenge)),
        allowCredentials: descriptors(json.allowCredentials),
    } as unknown as PublicKeyCredentialRequestOptions
}

export function credentialToJson(credential: Credential): JsonObject {
    const native = (credential as unknown as { toJSON?: () => JsonObject }).toJSON

    if (typeof native === 'function') {
        return native.call(credential)
    }

    const assertible = credential as PublicKeyCredential
    const response = assertible.response as AuthenticatorAttestationResponse & AuthenticatorAssertionResponse

    const json: JsonObject = {
        id: assertible.id,
        rawId: bufferToBase64Url(assertible.rawId),
        type: assertible.type,
        clientExtensionResults: assertible.getClientExtensionResults(),
        response: {
            clientDataJSON: bufferToBase64Url(response.clientDataJSON),
        },
    }

    const encoded = json.response as JsonObject

    if (response.attestationObject) {
        encoded.attestationObject = bufferToBase64Url(response.attestationObject)

        if (typeof response.getTransports === 'function') {
            encoded.transports = response.getTransports()
        }
    }

    if (response.authenticatorData && response.signature) {
        encoded.authenticatorData = bufferToBase64Url(response.authenticatorData)
        encoded.signature = bufferToBase64Url(response.signature)
        encoded.userHandle = response.userHandle ? bufferToBase64Url(response.userHandle) : null
    }

    return json
}

export function base64UrlToBuffer(value: string): ArrayBuffer {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
    const bytes = new Uint8Array(binary.length)

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index)
    }

    return bytes.buffer
}

export function bufferToBase64Url(value: ArrayBuffer): string {
    const bytes = new Uint8Array(value)
    let binary = ''

    for (const byte of bytes) {
        binary += String.fromCharCode(byte)
    }

    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

type JsonObject = Record<string, unknown>

interface ConditionalMediationCheck {
    isConditionalMediationAvailable?: () => Promise<boolean>
}

function nativeParser(method: 'parseCreationOptionsFromJSON' | 'parseRequestOptionsFromJSON'):
    | ((json: JsonObject) => unknown)
    | undefined {
    const holder = window.PublicKeyCredential as unknown as Record<string, unknown> | undefined
    const parse = holder?.[method]

    return typeof parse === 'function' ? (parse as (json: JsonObject) => unknown).bind(holder) : undefined
}

function descriptors(value: unknown): PublicKeyCredentialDescriptor[] {
    if (!Array.isArray(value)) {
        return []
    }

    return value.filter(isObject).map((descriptor) => ({
        ...descriptor,
        id: base64UrlToBuffer(asString(descriptor.id)),
        type: 'public-key',
    })) as unknown as PublicKeyCredentialDescriptor[]
}

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string {
    return typeof value === 'string' ? value : ''
}
