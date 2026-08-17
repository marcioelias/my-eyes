import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
    initials,
    MeAlert,
    MeAuthLayout,
    MeAvatar,
    MeBadge,
    MeBrand,
    MeButton,
    MeCard,
    MeCheckbox,
    MeDropdown,
    MeDropdownItem,
    MeErrorLayout,
    MeField,
    MeIcon,
    MeInput,
    MeModal,
    MeNavItem,
    MeProgress,
    MeSelect,
    MeSwitch,
    MeTextarea,
    MeUpload,
} from '../src/index.js'

/**
 * The React components against the classes the stylesheet actually defines.
 *
 * Asserting that a component "renders" is what let two broken Vue components
 * ship, so these check the class names and the wiring instead.
 *
 * @see docs/features/react-package.md
 */

describe('primitives', () => {
    it('builds the button classes from variant, size and shape', () => {
        const { container } = render(
            <MeButton variant="danger" size="lg" block iconOnly icon="trash">
                Delete
            </MeButton>,
        )

        const button = container.querySelector('button')

        expect(button?.className.split(' ')).toEqual(
            expect.arrayContaining(['me-btn', 'me-btn--danger', 'me-btn--lg', 'me-btn--block', 'me-btn--icon']),
        )
        expect(button?.querySelector('svg')).not.toBeNull()
    })

    it('renders a link when given an href, and keeps the classes', () => {
        const { container } = render(<MeButton href="/domains">Domains</MeButton>)

        const link = container.querySelector('a')

        expect(link?.getAttribute('href')).toBe('/domains')
        expect(link?.className).toContain('me-btn')
    })

    it('disables the button while loading, and marks it', () => {
        const { container } = render(<MeButton loading>Save</MeButton>)

        const button = container.querySelector('button')

        expect(button?.disabled).toBe(true)
        expect(button?.dataset.loading).toBe('true')
    })

    it('draws a bundled icon and warns once for an unknown name', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

        const { container } = render(<MeIcon name="trash" />)

        expect(container.querySelector('svg')?.innerHTML).not.toBe('')
        expect(warn).not.toHaveBeenCalled()

        render(<MeIcon name={'not-an-icon' as never} />)
        render(<MeIcon name={'not-an-icon' as never} />)

        expect(warn).toHaveBeenCalledTimes(1)

        warn.mockRestore()
    })

    it('takes the geometry as children, wrapper included', () => {
        const { container } = render(
            <MeIcon>
                <path d="M4 20h16" />
            </MeIcon>,
        )

        const svg = container.querySelector('svg')

        expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24')
        expect(svg?.querySelector('path')?.getAttribute('d')).toBe('M4 20h16')
    })

    it('picks the alert icon from the variant, and drops it on false', () => {
        const { container } = render(<MeAlert variant="danger">Boom</MeAlert>)
        expect(container.querySelector('.me-alert__icon')).not.toBeNull()

        const plain = render(<MeAlert icon={false}>Quiet</MeAlert>)
        expect(plain.container.querySelector('.me-alert__icon')).toBeNull()
    })

    it('reports dismissal through both callbacks', async () => {
        const onDismiss = vi.fn()
        const onVisibleChange = vi.fn()

        const { container } = render(
            <MeAlert dismissible onDismiss={onDismiss} onVisibleChange={onVisibleChange}>
                Gone
            </MeAlert>,
        )

        container.querySelector<HTMLButtonElement>('.me-alert__dismiss')?.click()

        expect(onDismiss).toHaveBeenCalledOnce()
        expect(onVisibleChange).toHaveBeenCalledWith(false)
    })

    it('renders the card header only when there is something in it', () => {
        const bare = render(<MeCard>body</MeCard>)
        expect(bare.container.querySelector('.me-card__header')).toBeNull()

        const titled = render(
            <MeCard title="Users" actions={<span>x</span>} footer={<span>f</span>}>
                body
            </MeCard>,
        )

        expect(titled.container.querySelector('.me-card__title')?.textContent).toBe('Users')
        expect(titled.container.querySelector('.me-card__header-actions')).not.toBeNull()
        expect(titled.container.querySelector('.me-card__footer')).not.toBeNull()
    })

    it('falls back to initials, and wraps for a status dot', () => {
        expect(initials('Márcio Elias')).toBe('ME')
        expect(initials('Ana')).toBe('AN')
        expect(initials('')).toBe('')

        const { container } = render(<MeAvatar name="Márcio Elias" status="success" />)

        expect(container.querySelector('.me-avatar-wrap')).not.toBeNull()
        expect(container.querySelector('.me-dot--success')).not.toBeNull()
        expect(container.querySelector('.me-avatar')?.textContent).toBe('ME')
    })

    it('renders an avatar image when given a source', () => {
        const { container } = render(<MeAvatar name="Ana" src="/a.png" />)

        expect(container.querySelector('img')?.getAttribute('src')).toBe('/a.png')
        expect(container.querySelector('img')?.getAttribute('alt')).toBe('Ana')
    })

    it('carries the progress value as a custom property', () => {
        const { container } = render(<MeProgress value={40} showValue label="Upload" />)

        const bar = container.querySelector<HTMLElement>('.me-progress')

        expect(bar?.style.getPropertyValue('--me-progress')).toBe('40%')
        expect(bar?.getAttribute('aria-valuenow')).toBe('40')
        expect(container.querySelector('.me-progress-field__value')?.textContent).toBe('40%')
    })

    it('marks progress indeterminate with no value', () => {
        const { container } = render(<MeProgress />)

        expect(container.querySelector('.me-progress--indeterminate')).not.toBeNull()
        expect(container.querySelector('.me-progress')?.getAttribute('aria-valuenow')).toBeNull()
    })

    it('renders the brand glyph, and the name unless told not to', () => {
        const { container } = render(<MeBrand name="Acme" />)
        expect(container.querySelector('svg')).not.toBeNull()
        expect(container.textContent).toContain('Acme')

        const quiet = render(<MeBrand name="Acme" showName={false} />)
        expect(quiet.container.textContent).not.toContain('Acme')
    })

    it('suppresses the hint while an error shows', () => {
        const { container } = render(<MeField label="Email" hint="We never share it." error="Required" />)

        expect(container.querySelector('.me-hint')).toBeNull()
        expect(container.querySelector('.me-error')?.textContent).toContain('Required')
        expect(container.querySelector('.me-label--required')).toBeNull()
    })
})

describe('form controls', () => {
    it('reports the typed value through onValueChange', () => {
        const onValueChange = vi.fn()

        render(<MeInput name="email" label="Email" value="" onValueChange={onValueChange} />)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.c' } })

        expect(onValueChange).toHaveBeenCalledWith('a@b.c')
    })

    it('groups a password input with its reveal button', () => {
        const { container } = render(<MeInput name="password" type="password" label="Password" />)

        expect(container.querySelector('.me-input-group')).not.toBeNull()
        expect(container.querySelector('[data-me-password-toggle]')).not.toBeNull()
    })

    it('wraps a string addon and trusts a node one', () => {
        const string = render(<MeInput name="price" prefix="R$" />)
        expect(string.container.querySelector('.me-input-addon')?.textContent).toBe('R$')

        const node = render(<MeInput name="price" prefix={<span className="custom">R$</span>} />)
        expect(node.container.querySelector('.custom')).not.toBeNull()
    })

    it('marks an invalid control for assistive technology', () => {
        const { container } = render(<MeInput name="email" error="Required" />)

        expect(container.querySelector('input')?.getAttribute('aria-invalid')).toBe('true')
    })

    it('builds select options from a map and reports the choice', () => {
        const onValueChange = vi.fn()

        const { container } = render(
            <MeSelect
                name="status"
                label="Status"
                options={{ active: 'Active', banned: 'Banned' }}
                value="banned"
                onValueChange={onValueChange}
            />,
        )

        const select = container.querySelector('select') as HTMLSelectElement

        expect(Array.from(select.options).map((option) => option.value)).toEqual(['active', 'banned'])
        expect(select.value).toBe('banned')

        fireEvent.change(select, { target: { value: 'active' } })

        expect(onValueChange).toHaveBeenCalledWith('active')
    })

    it('suffixes the select name for multiple selection', () => {
        const { container } = render(<MeSelect name="tags" multiple options={{ a: 'A' }} value={[]} />)

        expect(container.querySelector('select')?.getAttribute('name')).toBe('tags[]')
    })

    it('acts as one of a group when given an array', () => {
        const onValueChange = vi.fn()

        const { container } = render(
            <MeCheckbox name="roles" checkboxValue="admin" value={['editor']} onValueChange={onValueChange} />,
        )

        const box = container.querySelector('input') as HTMLInputElement

        expect(box.checked).toBe(false)

        box.click()

        expect(onValueChange).toHaveBeenCalledWith(['editor', 'admin'])
    })

    it('reports a switch as a boolean', () => {
        const onValueChange = vi.fn()

        const { container } = render(<MeSwitch name="notify" value={false} onValueChange={onValueChange} />)

        expect(container.querySelector('[role="switch"]')).not.toBeNull()

        container.querySelector<HTMLInputElement>('input')?.click()

        expect(onValueChange).toHaveBeenCalledWith(true)
    })

    it('renders a textarea with the design system classes', () => {
        const { container } = render(<MeTextarea name="notes" rows={6} value="hi" />)

        const textarea = container.querySelector('textarea')

        expect(textarea?.className).toContain('me-textarea')
        expect(textarea?.rows).toBe(6)
        expect(textarea?.value).toBe('hi')
    })

    it('renders the upload dropzone the binding expects', () => {
        const { container } = render(<MeUpload name="files" multiple accept="image/png" maxSize={1024} />)

        expect(container.querySelector('[data-me-upload]')).not.toBeNull()
        expect(container.querySelector('[data-me-upload-input]')?.getAttribute('name')).toBe('files[]')
        expect(container.querySelector('.me-upload__hint')?.textContent).toContain('image/png')
    })
})

describe('overlays and shell', () => {
    it('renders the dropdown markup the binding drives', () => {
        const { container } = render(
            <MeDropdown trigger={<button type="button">Open</button>}>
                <MeDropdownItem href="/profile" icon="user">
                    Profile
                </MeDropdownItem>
            </MeDropdown>,
        )

        expect(container.querySelector('[data-me-dropdown]')?.getAttribute('data-open')).toBe('false')
        expect(container.querySelector('[data-me-dropdown-trigger]')?.textContent).toBe('Open')
        expect(container.querySelector('.me-dropdown__item')?.getAttribute('role')).toBe('menuitem')
    })

    it('keeps a dropdown item open when asked', () => {
        const { container } = render(<MeDropdownItem keepOpen>Theme</MeDropdownItem>)

        expect(container.querySelector('[data-me-keep-open]')).not.toBeNull()
    })

    it('colours the modal confirm button after the variant', () => {
        const onConfirm = vi.fn()

        const { container } = render(
            <MeModal id="delete" variant="danger" title="Delete?" confirm="Delete" cancel="Cancel" onConfirm={onConfirm}>
                This cannot be undone.
            </MeModal>,
        )

        expect(container.querySelector('.me-modal--danger')).not.toBeNull()
        expect(container.querySelector('.me-btn--danger')).not.toBeNull()

        container.querySelector<HTMLButtonElement>('[data-me-modal-initial]')?.click()

        expect(onConfirm).toHaveBeenCalledOnce()
    })

    it('marks the current nav item for assistive technology', () => {
        const { container } = render(
            <MeNavItem href="/domains" icon="server" active badge={3}>
                Domains
            </MeNavItem>,
        )

        expect(container.querySelector('a')?.getAttribute('aria-current')).toBe('page')
        expect(container.querySelector('.me-badge')?.textContent).toBe('3')
    })

    it('renders no document from the layouts', () => {
        const { container } = render(<MeAuthLayout heading="Sign in">form</MeAuthLayout>)

        expect(container.querySelector('html')).toBeNull()
        expect(container.querySelector('.me-auth__heading')?.textContent).toBe('Sign in')
        expect(container.querySelector('.me-card__body')?.textContent).toBe('form')
    })

    it('splits the auth layout in two halves by default', () => {
        const { container } = render(<MeAuthLayout brandName="Acme">form</MeAuthLayout>)

        expect(container.querySelector('.me-auth')?.className).toContain('me-auth--split')
        expect(container.querySelector('.me-auth__aside')).not.toBeNull()
        expect(container.querySelector('.me-auth__tagline')?.textContent).toBe('Acme')
    })

    it('takes a photograph, marked decorative', () => {
        const { container } = render(
            <MeAuthLayout image="/img/login.jpg" tagline="One place">
                form
            </MeAuthLayout>,
        )

        const image = container.querySelector('.me-auth__image')

        expect(image?.getAttribute('src')).toBe('/img/login.jpg')
        expect(image?.getAttribute('alt')).toBe('')
    })

    it('flips the halves without moving the form in the DOM', () => {
        const { container } = render(<MeAuthLayout reverse>form</MeAuthLayout>)

        const auth = container.querySelector('.me-auth') as HTMLElement

        expect(auth.className).toContain('me-auth--reverse')
        expect(auth.children[0]?.className).toContain('me-auth__main')
        expect(auth.children[1]?.className).toContain('me-auth__aside')
    })

    it('gives the single centred column back when asked', () => {
        const { container } = render(
            <MeAuthLayout split={false} reverse>
                form
            </MeAuthLayout>,
        )

        const auth = container.querySelector('.me-auth') as HTMLElement

        expect(auth.className).not.toContain('me-auth--split')
        expect(auth.className).not.toContain('me-auth--reverse')
        expect(container.querySelector('.me-auth__aside')).toBeNull()
    })

    it('replaces the visual half through the aside prop', () => {
        const { container } = render(<MeAuthLayout aside="Trusted by teams">form</MeAuthLayout>)

        expect(container.querySelector('.me-auth__aside-content')?.textContent).toBe('Trusted by teams')
        expect(container.querySelector('.me-auth__tagline')).toBeNull()
    })

    it('colours error pages by severity, falling back to the status', () => {
        const missing = render(<MeErrorLayout status={404} title="Not found" />)
        expect(missing.container.querySelector('.me-error-page--warning')).not.toBeNull()

        const broken = render(<MeErrorLayout status={500} title="Boom" />)
        expect(broken.container.querySelector('.me-error-page--danger')).not.toBeNull()
    })
})
