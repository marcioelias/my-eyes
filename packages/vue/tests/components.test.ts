import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
    MeAlert,
    MeAuthLayout,
    MeAvatar,
    MeErrorLayout,
    MePagination,
    MeBadge,
    MeButton,
    MeCard,
    MeCheckbox,
    MeDropdown,
    MeField,
    MeIcon,
    MeInput,
    MeModal,
    MeBrand,
    MeDropdownItem,
    MeNavItem,
    MeNavSubitem,
    MeNumeric,
    MeProgress,
    MeProgressRing,
    MeRadio,
    MeSelect,
    MeSelectField,
    MeSwitch,
    MeTextarea,
    MeTooltip,
    MeUpload,
    initials,
} from '../src/index.js'

/**
 * The class names these components emit are the contract with
 * `@my-eyes/core/css`. A test that only checked "it renders" would not catch
 * the one failure that matters — a class the stylesheet has never heard of.
 *
 * @see docs/features/vue-package.md BR-01
 */

describe('MeField', () => {
    it('emits the classes the stylesheet defines', () => {
        const wrapper = mount(MeField, {
            props: { label: 'Name', for: 'name', required: true, error: 'Required' },
            slots: { default: () => h('input') },
        })

        expect(wrapper.find('label').classes()).toEqual(['me-label', 'me-label--required'])
        expect(wrapper.find('label').attributes('for')).toBe('name')
        expect(wrapper.find('p').classes()).toEqual(['me-error'])
    })

    it('shows the hint only while there is no error', () => {
        const hint = mount(MeField, { props: { hint: 'Two words' } })
        expect(hint.find('.me-hint').exists()).toBe(true)

        const error = mount(MeField, { props: { hint: 'Two words', error: 'Required' } })
        expect(error.find('.me-hint').exists()).toBe(false)
        expect(error.find('.me-error').text()).toContain('Required')
    })

    it('carries the inline modifier', () => {
        expect(mount(MeField, { props: { inline: true } }).classes()).toContain('me-field--inline')
    })
})

describe('MeButton', () => {
    it('composes variant and size', () => {
        const wrapper = mount(MeButton, { props: { variant: 'danger', size: 'sm' } })

        expect(wrapper.classes()).toContain('me-btn')
        expect(wrapper.classes()).toContain('me-btn--danger')
        expect(wrapper.classes()).toContain('me-btn--sm')
    })

    it('renders an anchor when it navigates', () => {
        const wrapper = mount(MeButton, { props: { href: '/orders' } })

        expect(wrapper.element.tagName).toBe('A')
        expect(wrapper.attributes('href')).toBe('/orders')
    })

    it('disables itself while loading', () => {
        expect(mount(MeButton, { props: { loading: true } }).attributes('disabled')).toBeDefined()
    })
})

describe('MeIcon', () => {
    it('draws a known icon', () => {
        const wrapper = mount(MeIcon, { props: { name: 'check' } })

        expect(wrapper.element.tagName).toBe('svg')
        expect(wrapper.html()).toContain('<path')
    })

    it('renders nothing for a name it does not have, rather than breaking', () => {
        const wrapper = mount(MeIcon, { props: { name: 'nope' as never } })

        expect(wrapper.find('path').exists()).toBe(false)
    })
})

describe('MeAlert', () => {
    it('picks the icon that matches the variant', () => {
        expect(mount(MeAlert, { props: { variant: 'danger' } }).html()).toContain('me-alert__icon')
        expect(mount(MeAlert, { props: { variant: 'danger' } }).classes()).toContain('me-alert--danger')
    })

    it('drops the icon when told to', () => {
        expect(mount(MeAlert, { props: { icon: false } }).find('.me-alert__icon').exists()).toBe(false)
    })
})

describe('MeBadge', () => {
    it('renders a dot instead of an icon when asked', () => {
        const wrapper = mount(MeBadge, { props: { variant: 'success', dot: true } })

        expect(wrapper.find('.me-dot--success').exists()).toBe(true)
        expect(wrapper.find('svg').exists()).toBe(false)
    })
})

describe('MeAvatar', () => {
    it('builds initials from the first and last word', () => {
        expect(initials('Márcio Elias')).toBe('ME')
        expect(initials('Ana')).toBe('AN')
        expect(initials('')).toBe('')
    })

    it('wraps the avatar when it carries a status dot', () => {
        const wrapper = mount(MeAvatar, { props: { name: 'Ana Souza', status: 'online' } })

        expect(wrapper.classes()).toContain('me-avatar-wrap')
        expect(wrapper.find('.me-dot--online').exists()).toBe(true)
    })

    it('prefers an image over initials', () => {
        const wrapper = mount(MeAvatar, { props: { name: 'Ana', src: '/ana.png' } })

        expect(wrapper.find('img').attributes('src')).toBe('/ana.png')
    })
})

describe('MeCard', () => {
    it('omits the header entirely when there is nothing to put in it', () => {
        expect(mount(MeCard).find('.me-card__header').exists()).toBe(false)
    })

    it('renders header, body and footer', () => {
        const wrapper = mount(MeCard, {
            props: { title: 'Orders', description: 'Recent' },
            slots: { default: () => 'body', footer: () => 'footer', actions: () => 'actions' },
        })

        expect(wrapper.find('.me-card__title').text()).toBe('Orders')
        expect(wrapper.find('.me-card__description').text()).toBe('Recent')
        expect(wrapper.find('.me-card__header-actions').text()).toBe('actions')
        expect(wrapper.find('.me-card__footer').text()).toBe('footer')
    })
})

describe('MeProgress', () => {
    it('reports the value to assistive technology', () => {
        const wrapper = mount(MeProgress, { props: { value: 40, max: 200, showValue: true, label: 'Uploading' } })
        const bar = wrapper.find('[role="progressbar"]')

        expect(bar.attributes('aria-valuenow')).toBe('40')
        expect(bar.attributes('aria-valuemax')).toBe('200')
        expect(wrapper.find('.me-progress-field__value').text()).toBe('20%')
    })

    it('goes indeterminate with no value, and claims no reading', () => {
        const wrapper = mount(MeProgress)

        expect(wrapper.find('.me-progress--indeterminate').exists()).toBe(true)
        expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBeUndefined()
    })

    it('clamps a value past the maximum', () => {
        const wrapper = mount(MeProgressRing, { props: { value: 500, max: 100 } })

        expect(wrapper.find('.me-progress-ring__value').text()).toBe('100%')
    })
})

describe('form controls', () => {
    it('MeInput binds v-model and reports invalidity', async () => {
        const wrapper = mount(MeInput, { props: { modelValue: 'ana', error: 'Taken', name: 'user' } })

        expect(wrapper.find('input').classes()).toContain('me-input')
        expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')

        await wrapper.find('input').setValue('bruno')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['bruno'])
    })

    it('MeInput groups the control when something sits beside it', () => {
        expect(mount(MeInput, { props: { prefix: 'R$' } }).find('.me-input-group').exists()).toBe(true)
        expect(mount(MeInput).find('.me-input-group').exists()).toBe(false)
    })

    it('MeInput adds the reveal button for a password', () => {
        const wrapper = mount(MeInput, { props: { type: 'password' } })

        expect(wrapper.find('[data-me-password-toggle]').exists()).toBe(true)
    })

    it('MeTextarea binds v-model', async () => {
        const wrapper = mount(MeTextarea, { props: { modelValue: 'hello', rows: 6 } })

        expect(wrapper.find('textarea').attributes('rows')).toBe('6')
        await wrapper.find('textarea').setValue('bye')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['bye'])
    })

    it('MeSelect accepts a map of options and marks the selected one', () => {
        const wrapper = mount(MeSelect, {
            props: { options: { active: 'Active', banned: 'Banned' }, modelValue: 'banned' },
        })

        const options = wrapper.findAll('option')
        expect(options.map((option) => option.text())).toEqual(['Active', 'Banned'])
        expect((options[1]?.element as HTMLOptionElement).selected).toBe(true)
    })

    it('MeSelect emits an array when multiple', async () => {
        const wrapper = mount(MeSelect, {
            props: { options: { a: 'A', b: 'B' }, multiple: true, modelValue: [], name: 'tags' },
        })

        expect(wrapper.find('select').attributes('name')).toBe('tags[]')

        const options = wrapper.findAll('option')
        ;(options[0]?.element as HTMLOptionElement).selected = true
        await wrapper.find('select').trigger('change')

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a']])
    })

    it('MeCheckbox toggles a boolean', async () => {
        const wrapper = mount(MeCheckbox, { props: { modelValue: false, label: 'Agree' } })

        expect(wrapper.find('input').classes()).toContain('me-check')
        expect(wrapper.find('.me-choice__label').text()).toBe('Agree')

        await wrapper.find('input').setValue(true)
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('MeCheckbox adds to and removes from a group', async () => {
        const wrapper = mount(MeCheckbox, { props: { modelValue: ['a'], value: 'b' } })

        await wrapper.find('input').setValue(true)
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])

        const inGroup = mount(MeCheckbox, { props: { modelValue: ['a', 'b'], value: 'b' } })
        expect((inGroup.find('input').element as HTMLInputElement).checked).toBe(true)

        await inGroup.find('input').setValue(false)
        expect(inGroup.emitted('update:modelValue')?.[0]).toEqual([['a']])
    })

    it('MeRadio derives an id from the name and value', async () => {
        const wrapper = mount(MeRadio, { props: { name: 'plan', value: 'pro', modelValue: 'pro' } })

        expect(wrapper.find('input').attributes('id')).toBe('plan_pro')
        expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)

        await wrapper.find('input').trigger('change')
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['pro'])
    })

    it('MeSwitch keeps a real checkbox behind the track', async () => {
        const wrapper = mount(MeSwitch, { props: { modelValue: true, size: 'lg' } })

        expect(wrapper.find('label').classes()).toContain('me-switch--lg')
        expect(wrapper.find('input').attributes('role')).toBe('switch')
        expect(wrapper.find('.me-switch__thumb').exists()).toBe(true)

        await wrapper.find('input').setValue(false)
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('MeSelectField hands the core binding its options and selection', () => {
        const wrapper = mount(MeSelectField, {
            props: {
                name: 'tags',
                multiple: true,
                modelValue: ['php'],
                options: [
                    { value: 'php', label: 'PHP' },
                    { value: 'go', label: 'Go', disabled: true },
                ],
            },
        })

        const host = wrapper.find('[data-me-select]')
        expect(JSON.parse(host.attributes('data-options') ?? '[]')).toHaveLength(2)
        expect(JSON.parse(host.attributes('data-selected') ?? '[]')).toEqual(['php'])
        expect(host.attributes('data-multiple')).toBe('true')
        expect(host.attributes('data-name')).toBe('tags')
    })

    it('MeNumeric keeps the raw value in a hidden input', () => {
        const wrapper = mount(MeNumeric, { props: { name: 'amount', modelValue: '1234.56', decimals: 2 } })

        const hidden = wrapper.find('input[type="hidden"]')
        expect(hidden.attributes('value')).toBe('1234.56')
        expect(hidden.attributes('name')).toBe('amount')
        expect(wrapper.find('[data-me-numeric]').attributes('data-decimals')).toBe('2')
        expect(wrapper.find('[data-me-step-up]').exists()).toBe(true)
    })

    it('MeUpload describes its limits to the binding', () => {
        const wrapper = mount(MeUpload, { props: { name: 'files', multiple: true, maxSize: 1048576, accept: 'image/*' } })

        expect(wrapper.find('input[type="file"]').attributes('name')).toBe('files[]')
        expect(wrapper.find('[data-me-upload]').attributes('data-max-size')).toBe('1048576')
        // Formatted the way MyEyes\Support\FileSize formats it.
        expect(wrapper.find('.me-upload__hint').text()).toContain('1 MB')
    })
})

describe('overlays', () => {
    it('MeDropdown renders a trigger and a panel', () => {
        const wrapper = mount(MeDropdown, {
            props: { align: 'start' },
            slots: { trigger: () => 'open', default: () => 'items' },
        })

        expect(wrapper.attributes('data-me-dropdown')).toBeDefined()
        expect(wrapper.find('[data-me-dropdown-trigger]').text()).toBe('open')
        expect(wrapper.find('.me-dropdown__panel--start').exists()).toBe(true)
        expect(wrapper.find('[role="menu"]').text()).toBe('items')
    })

    it('MeModal is a dialog whose confirm follows the variant', async () => {
        const wrapper = mount(MeModal, {
            props: { id: 'delete-user', variant: 'danger', title: 'Delete?', confirm: 'Delete', cancel: 'Cancel' },
        })

        expect(wrapper.element.tagName).toBe('DIALOG')
        expect(wrapper.classes()).toContain('me-modal--danger')
        expect(wrapper.attributes('aria-labelledby')).toBe('delete-user-title')

        const buttons = wrapper.findAll('.me-modal__actions button')
        expect(buttons[1]?.classes()).toContain('me-btn--danger')

        await buttons[1]?.trigger('click')
        expect(wrapper.emitted('confirm')).toHaveLength(1)
    })

    it('MeTooltip carries the text and placement the binding reads', () => {
        const wrapper = mount(MeTooltip, { props: { text: 'Delete order', placement: 'end' } })

        expect(wrapper.attributes('data-me-tooltip')).toBe('Delete order')
        expect(wrapper.attributes('data-tooltip-placement')).toBe('end')
    })
})

describe('MeNavItem', () => {
    it('marks the current page explicitly', () => {
        expect(mount(MeNavItem, { props: { href: '/x', active: true } }).attributes('aria-current')).toBe('page')
        expect(mount(MeNavItem, { props: { href: '/x' } }).attributes('aria-current')).toBeUndefined()
    })

    it('hides the label and badge when the rail is collapsed', () => {
        const wrapper = mount(MeNavItem, { props: { href: '/x', badge: 3 }, slots: { default: () => 'Users' } })

        // me-hide-collapsed is what the stylesheet keys the icon rail off.
        expect(wrapper.findAll('.me-hide-collapsed')).toHaveLength(2)
    })
})

describe('link rendering', () => {
    // A stand-in for Inertia's Link or vue-router's RouterLink: it renders an
    // anchor but would, in a real app, navigate client-side.
    const Link = defineComponent({
        name: 'Link',
        props: { href: { type: String, default: '' } },
        setup: (props, { slots }) => () => h('a', { 'data-link': '', href: props.href }, slots.default?.()),
    })

    it('renders a plain anchor by default', () => {
        const wrapper = mount(MeNavItem, { props: { href: '/domains' }, slots: { default: () => 'Domains' } })

        expect(wrapper.element.tagName).toBe('A')
        expect(wrapper.attributes('data-link')).toBeUndefined()
    })

    it.each([
        ['MeNavItem', MeNavItem],
        ['MeNavSubitem', MeNavSubitem],
        ['MeDropdownItem', MeDropdownItem],
        ['MeBrand', MeBrand],
    ])('%s renders through the component given to "as"', (_name, component) => {
        const wrapper = mount(component, {
            props: { as: Link, href: '/domains' },
            slots: { default: () => 'Domains' },
        })

        expect(wrapper.find('[data-link]').exists()).toBe(true)
        expect(wrapper.find('[data-link]').attributes('href')).toBe('/domains')
    })

    it('MeButton uses "as" only when it links somewhere', () => {
        const linking = mount(MeButton, { props: { as: Link, href: '/x' }, slots: { default: () => 'Go' } })
        expect(linking.find('[data-link]').exists()).toBe(true)

        const plain = mount(MeButton, { props: { as: Link }, slots: { default: () => 'Go' } })
        expect(plain.element.tagName).toBe('BUTTON')
    })

    it('keeps the my-eyes classes on the substituted component', () => {
        const wrapper = mount(MeNavItem, { props: { as: Link, href: '/x', active: true } })

        expect(wrapper.find('[data-link]').classes()).toContain('me-nav__item')
        expect(wrapper.find('[data-link]').attributes('aria-current')).toBe('page')
    })
})

describe('MeModal reactive control', () => {
    it('opens and closes from v-model:open', async () => {
        const wrapper = mount(MeModal, { props: { id: 'm', open: false, cancel: 'Cancel' }, attachTo: document.body })

        expect((wrapper.element as HTMLDialogElement).open).toBe(false)

        await wrapper.setProps({ open: true })
        expect((wrapper.element as HTMLDialogElement).open).toBe(true)

        await wrapper.setProps({ open: false })
        expect((wrapper.element as HTMLDialogElement).open).toBe(false)

        wrapper.unmount()
    })

    it('reports a dismissal so the parent boolean cannot stick on true', async () => {
        const wrapper = mount(MeModal, { props: { id: 'm2', open: true }, attachTo: document.body })

        ;(wrapper.element as HTMLDialogElement).close()
        await nextTick()

        expect(wrapper.emitted('close')).toHaveLength(1)
        expect(wrapper.emitted('update:open')?.[0]).toEqual([false])

        wrapper.unmount()
    })

    it('stays DOM-driven when open is never passed', () => {
        const wrapper = mount(MeModal, { props: { id: 'm3' }, attachTo: document.body })

        expect((wrapper.element as HTMLDialogElement).open).toBe(false)
        expect(wrapper.emitted('update:open')).toBeUndefined()

        wrapper.unmount()
    })
})

describe('MeAlert dismissal', () => {
    it('does not use the binding that rips the node out of the document', () => {
        // data-me-dismiss calls target.remove(); this element belongs to Vue.
        const wrapper = mount(MeAlert, { props: { dismissible: true } })

        expect(wrapper.find('[data-me-dismiss]').exists()).toBe(false)
        expect(wrapper.find('.me-alert__dismiss').exists()).toBe(true)
    })

    it('reports the dismissal and hides on v-model:visible', async () => {
        const wrapper = mount(MeAlert, { props: { dismissible: true, visible: true } })

        await wrapper.find('.me-alert__dismiss').trigger('click')

        expect(wrapper.emitted('dismiss')).toHaveLength(1)
        expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])

        await wrapper.setProps({ visible: false })
        expect(wrapper.find('.me-alert').exists()).toBe(false)
    })
})

describe('layouts', () => {
    it('MeAuthLayout renders body content, not a document', () => {
        const wrapper = mount(MeAuthLayout, {
            props: { heading: 'Sign in', subheading: 'Welcome back' },
            slots: { default: () => 'form', footer: () => 'No account?' },
        })

        expect(wrapper.find('html').exists()).toBe(false)
        expect(wrapper.classes()).toContain('me-auth')
        expect(wrapper.find('.me-auth__heading').text()).toBe('Sign in')
        expect(wrapper.find('.me-auth__subheading').text()).toBe('Welcome back')
        expect(wrapper.find('.me-card__body').text()).toBe('form')
        expect(wrapper.find('.me-auth__footer').text()).toBe('No account?')
    })

    it('MeErrorLayout derives severity from the status code', () => {
        expect(mount(MeErrorLayout, { props: { status: 404 } }).classes()).toContain('me-error-page--warning')
        expect(mount(MeErrorLayout, { props: { status: 500 } }).classes()).toContain('me-error-page--danger')
        expect(mount(MeErrorLayout, { props: { status: 200 } }).classes()).toContain('me-error-page--info')
    })

    it('MeErrorLayout lets severity be overridden', () => {
        const wrapper = mount(MeErrorLayout, { props: { status: 404, severity: 'danger', title: 'Gone' } })

        expect(wrapper.classes()).toContain('me-error-page--danger')
        expect(wrapper.find('.me-error-page__status').text()).toBe('404')
        expect(wrapper.find('.me-error-page__title').text()).toBe('Gone')
    })

    it('MeErrorLayout drops the actions it was told to hide', () => {
        const both = mount(MeErrorLayout, { props: { status: 404 } })
        expect(both.findAll('.me-error-page__actions .me-btn')).toHaveLength(2)

        const neither = mount(MeErrorLayout, { props: { status: 404, home: false, back: false } })
        expect(neither.findAll('.me-error-page__actions .me-btn')).toHaveLength(0)
    })
})

describe('MePagination links', () => {
    const pagination = { page: 2, perPage: 25, total: 100, lastPage: 4, from: 26, to: 50 }

    it('renders buttons when no address is given', () => {
        const wrapper = mount(MePagination, { props: { pagination } })

        expect(wrapper.findAll('a')).toHaveLength(0)
        expect(wrapper.findAll('button').length).toBeGreaterThan(0)
    })

    it('renders links when the consumer can name an address', () => {
        const wrapper = mount(MePagination, {
            props: { pagination, hrefFor: (page: number) => `/users?page=${page}` },
        })

        const links = wrapper.findAll('a')
        expect(links.length).toBeGreaterThan(0)
        expect(links.some((link) => link.attributes('href') === '/users?page=4')).toBe(true)
    })

    it('fetches on a plain click instead of navigating', async () => {
        const wrapper = mount(MePagination, {
            props: { pagination, hrefFor: (page: number) => `/users?page=${page}` },
        })

        await wrapper.findAll('.me-pagination__item--number')[0]?.trigger('click', { button: 0 })

        expect(wrapper.emitted('navigate')?.[0]).toEqual([1])
    })

    it('leaves a modified click to the browser', async () => {
        const wrapper = mount(MePagination, {
            props: { pagination, hrefFor: (page: number) => `/users?page=${page}` },
        })

        await wrapper.findAll('.me-pagination__item--number')[0]?.trigger('click', { button: 0, metaKey: true })

        expect(wrapper.emitted('navigate')).toBeUndefined()
    })

    it('keeps a disabled edge as a button, never a dead link', () => {
        const wrapper = mount(MePagination, {
            props: { pagination: { ...pagination, page: 1 }, hrefFor: (page: number) => `/users?page=${page}` },
        })

        const previous = wrapper.findAll('.me-pagination__item')[0]
        expect(previous?.element.tagName).toBe('BUTTON')
        expect(previous?.attributes('disabled')).toBeDefined()
    })
})
