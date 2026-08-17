import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    authenticateWithPasskey,
    base64UrlToBuffer,
    bufferToBase64Url,
    credentialToJson,
    isPasskeySupported,
    PasskeyCancelled,
    PasskeyError,
    registerPasskey,
    toCreationOptions,
    toRequestOptions,
} from '../src/headless/passkeys.js'

/*
 * The manual conversions are what these tests exist for.
 *
 * In a current browser they never run — the native JSON parsers do the work —
 * which is exactly why they are exercised directly here. Testing them through
 * the ceremony would quietly stop covering them the day jsdom grows the native
 * methods.
 *
 * @see docs/decisions/0002-passkeys-without-a-webauthn-library.md
 */

const CHALLENGE = 'AQIDBAU'

function bytesOf(buffer: ArrayBuffer | ArrayBufferLike): number[] {
    return Array.from(new Uint8Array(buffer as ArrayBuffer))
}

describe('base64url', () => {
    it('decodes without padding', () => {
        expect(bytesOf(base64UrlToBuffer(CHALLENGE))).toEqual([1, 2, 3, 4, 5])
    })

    it('round-trips every byte value', () => {
        const source = new Uint8Array(256).map((_, index) => index)

        expect(bytesOf(base64UrlToBuffer(bufferToBase64Url(source.buffer)))).toEqual(Array.from(source))
    })

    it('produces url-safe output', () => {
        // 0xFB 0xFF encodes to "+/8" in standard base64.
        const encoded = bufferToBase64Url(new Uint8Array([0xfb, 0xff, 0xbf]).buffer)

        expect(encoded).not.toContain('+')
        expect(encoded).not.toContain('/')
        expect(encoded).not.toContain('=')
    })
})

describe('option conversion', () => {
    it('decodes the fields WebAuthn needs as buffers', () => {
        // AC-03
        const options = toCreationOptions({
            challenge: CHALLENGE,
            rp: { name: 'my-eyes' },
            user: { id: CHALLENGE, name: 'marcio', displayName: 'Márcio' },
            excludeCredentials: [{ id: CHALLENGE, type: 'public-key' }],
        })

        expect(bytesOf(options.challenge)).toEqual([1, 2, 3, 4, 5])
        expect(bytesOf(options.user.id)).toEqual([1, 2, 3, 4, 5])
        expect(bytesOf(options.excludeCredentials?.[0]?.id as ArrayBuffer)).toEqual([1, 2, 3, 4, 5])
        expect(options.user.name).toBe('marcio')
    })

    it('decodes the assertion options too', () => {
        const options = toRequestOptions({
            challenge: CHALLENGE,
            allowCredentials: [{ id: CHALLENGE, type: 'public-key' }],
            userVerification: 'preferred',
        })

        expect(bytesOf(options.challenge)).toEqual([1, 2, 3, 4, 5])
        expect(options.userVerification).toBe('preferred')
    })

    it('encodes a credential back to base64url', () => {
        const buffer = new Uint8Array([1, 2, 3, 4, 5]).buffer

        const json = credentialToJson({
            id: 'credential-id',
            type: 'public-key',
            rawId: buffer,
            getClientExtensionResults: () => ({}),
            response: {
                clientDataJSON: buffer,
                authenticatorData: buffer,
                signature: buffer,
                userHandle: null,
            },
        } as unknown as Credential)

        expect(json.rawId).toBe(CHALLENGE)
        expect(json.response).toMatchObject({
            clientDataJSON: CHALLENGE,
            signature: CHALLENGE,
            userHandle: null,
        })
    })
})

describe('the ceremony', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        document.head.innerHTML = '<meta name="csrf-token" content="token-value">'
    })

    function optionsResponse(): Response {
        return new Response(JSON.stringify({ publicKey: { challenge: CHALLENGE } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    function fakeCredential(): Credential {
        const buffer = new Uint8Array([1, 2, 3, 4, 5]).buffer

        return {
            id: 'credential-id',
            type: 'public-key',
            rawId: buffer,
            getClientExtensionResults: () => ({}),
            response: { clientDataJSON: buffer, attestationObject: buffer },
        } as unknown as Credential
    }

    it('reports support from what the browser actually has', () => {
        expect(isPasskeySupported()).toBe(typeof window.PublicKeyCredential !== 'undefined')
    })

    it('posts the credential as a JSON string, with the CSRF token', async () => {
        vi.stubGlobal('navigator', {
            ...navigator,
            credentials: { create: vi.fn(async () => fakeCredential()) },
        })

        const fetcher = vi
            .fn()
            .mockResolvedValueOnce(optionsResponse())
            .mockResolvedValueOnce(new Response('{}', { status: 200 }))

        await registerPasskey({ name: 'Work laptop', fetcher })

        const [url, init] = fetcher.mock.calls[1] as [string, RequestInit]
        const body = JSON.parse(String(init.body)) as { credential_response: string; name: string }

        expect(url).toBe('/user/passkeys')
        expect(body.name).toBe('Work laptop')
        expect(typeof body.credential_response).toBe('string')
        expect(JSON.parse(body.credential_response)).toMatchObject({ id: 'credential-id' })
        expect((init.headers as Record<string, string>)['X-CSRF-TOKEN']).toBe('token-value')
    })

    it('turns a dismissed prompt into PasskeyCancelled', async () => {
        // AC-02
        vi.stubGlobal('navigator', {
            ...navigator,
            credentials: {
                create: vi.fn(),
                get: vi.fn(async () => {
                    throw new DOMException('The operation either timed out or was not allowed.', 'NotAllowedError')
                }),
            },
        })

        const fetcher = vi.fn().mockResolvedValue(optionsResponse())

        await expect(authenticateWithPasskey({ fetcher })).rejects.toBeInstanceOf(PasskeyCancelled)
    })

    it('reports the server message when the credential is refused', async () => {
        vi.stubGlobal('navigator', {
            ...navigator,
            credentials: { create: vi.fn(async () => fakeCredential()) },
        })

        const fetcher = vi
            .fn()
            .mockResolvedValueOnce(optionsResponse())
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ message: 'That passkey is already registered.' }), { status: 422 }),
            )

        const thrown = await registerPasskey({ name: 'Laptop', fetcher }).catch((error: unknown) => error)

        expect(thrown).toBeInstanceOf(PasskeyError)
        expect((thrown as PasskeyError).message).toBe('That passkey is already registered.')
        expect((thrown as PasskeyError).response?.status).toBe(422)
    })
})
