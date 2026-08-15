import { initShell, initThemeToggles, t } from '@my-eyes/core'
import { defineComponent, h, onMounted, ref, type PropType } from 'vue'
import { MeDropdown, MeDropdownHeader, MeDropdownItem } from './overlays.js'
import { MeAvatar, MeBadge, MeBrand, MeIcon, type Size } from './primitives.js'

/**
 * The admin shell and its navigation.
 *
 * Mobile first, exactly as in Blade: the sidebar is a drawer below 1024px and
 * a permanent column above it, collapsible to an icon rail. All of that is
 * CSS — the binding only flips data attributes on `.me-shell`.
 *
 * Unlike the Blade layout this renders no document: a Vue application owns its
 * own `<html>`, and Inertia owns the page shell. This is the body content.
 *
 * @see docs/features/vue-package.md
 */
export const MeAdminLayout = defineComponent({
    name: 'MeAdminLayout',

    props: {
        heading: { type: String as PropType<string | null>, default: null },
        subheading: { type: String as PropType<string | null>, default: null },
        /** Shows the rail-collapse control in the sidebar footer. */
        collapsible: { type: Boolean, default: true },
        footer: { type: Boolean, default: true },
        brandName: { type: String as PropType<string | null>, default: null },
        brandHref: { type: String, default: '/' },
    },

    setup(props, { slots }) {
        const host = ref<HTMLElement | null>(null)

        onMounted(() => {
            if (host.value) {
                initShell(host.value)
                initThemeToggles(host.value)
            }
        })

        return () =>
            h('div', { ref: host }, [
                h('a', { href: '#me-main', class: 'me-skip-link' }, t('layout.skip')),

                h(
                    'div',
                    {
                        class: 'me-shell',
                        'data-me-shell': '',
                        'data-sidebar-open': 'false',
                        'data-sidebar-collapsed': 'false',
                    },
                    [
                        h('aside', { class: 'me-sidebar', 'data-me-sidebar': '' }, [
                            h('div', { class: 'me-sidebar__header' }, [
                                slots.brand?.() ??
                                    h(MeBrand, { name: props.brandName, href: props.brandHref }),

                                h(
                                    'button',
                                    {
                                        type: 'button',
                                        class: 'me-btn me-btn--ghost me-btn--sm me-btn--icon me-sidebar__close',
                                        'data-me-sidebar-close': '',
                                        'aria-label': t('layout.closeMenu'),
                                    },
                                    [h(MeIcon, { name: 'x' })],
                                ),
                            ]),

                            h(
                                'nav',
                                { class: 'me-sidebar__body me-nav', 'aria-label': t('layout.mainNav') },
                                slots.nav?.(),
                            ),

                            slots.sidebarFooter || props.collapsible
                                ? h('div', { class: 'me-sidebar__footer' }, [
                                      slots.sidebarFooter?.(),

                                      props.collapsible
                                          ? h(
                                                'button',
                                                { type: 'button', class: 'me-nav__item', 'data-me-sidebar-collapse': '' },
                                                [
                                                    h(MeIcon, { name: 'panel-left' }),
                                                    h('span', { class: 'me-hide-collapsed' }, t('layout.collapse')),
                                                ],
                                            )
                                          : null,
                                  ])
                                : null,
                        ]),

                        h('div', { class: 'me-shell__overlay', 'data-me-sidebar-close': '', 'aria-hidden': 'true' }),

                        h('div', { class: 'me-shell__main' }, [
                            h('header', { class: 'me-topbar' }, [
                                h(
                                    'button',
                                    {
                                        type: 'button',
                                        class: 'me-btn me-btn--ghost me-btn--sm me-btn--icon me-shell__toggle',
                                        'data-me-sidebar-toggle': '',
                                        'aria-label': t('layout.openMenu'),
                                    },
                                    [h(MeIcon, { name: 'menu' })],
                                ),

                                props.heading
                                    ? h('span', { class: 'me-topbar__title me-hide-mobile' }, props.heading)
                                    : null,

                                h('div', { class: 'me-topbar__spacer' }),

                                slots.topbar?.(),
                                h(MeThemeToggle, { size: 'sm' }),
                                slots.user?.(),
                            ]),

                            h('main', { class: 'me-content', id: 'me-main' }, [
                                props.heading || slots.actions
                                    ? h('div', { class: 'me-content__header' }, [
                                          h('div', [
                                              props.heading
                                                  ? h('h1', { class: 'me-content__heading' }, props.heading)
                                                  : null,
                                              props.subheading
                                                  ? h('p', { class: 'me-content__subheading' }, props.subheading)
                                                  : null,
                                          ]),
                                          slots.actions
                                              ? h('div', { class: 'me-content__actions' }, slots.actions())
                                              : null,
                                      ])
                                    : null,

                                slots.default?.(),
                            ]),

                            props.footer
                                ? h('footer', { class: 'me-footer' }, [
                                      h('div', { class: 'me-footer__inner' }, slots.footer?.()),
                                  ])
                                : null,
                        ]),
                    ],
                ),
            ])
    },
})

export const MeNavSection = defineComponent({
    name: 'MeNavSection',

    props: { title: { type: String as PropType<string | null>, default: null } },

    setup(props, { slots, attrs }) {
        return () =>
            h('div', { ...attrs, class: 'me-nav__section' }, [
                props.title ? h('p', { class: 'me-nav__section-title me-hide-collapsed' }, props.title) : null,
                slots.default?.(),
            ])
    },
})

/**
 * Collapsible nav section. The binding opens it automatically when a child
 * carries aria-current, so the tree reflects the current page on load.
 */
export const MeNavGroup = defineComponent({
    name: 'MeNavGroup',

    props: {
        label: { type: String as PropType<string | null>, default: null },
        icon: { type: String as PropType<string | null>, default: null },
        open: { type: Boolean, default: false },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h(
                'div',
                { ...attrs, class: 'me-nav__group', 'data-me-nav-group': '', 'data-open': String(props.open) },
                [
                    h('button', { type: 'button', class: 'me-nav__item', 'data-me-nav-trigger': '' }, [
                        props.icon ? h(MeIcon, { name: props.icon as never }) : null,
                        h('span', { class: 'me-hide-collapsed' }, props.label ?? ''),
                        h(MeIcon, { name: 'chevron-right', class: 'me-nav__chevron' }),
                    ]),

                    h('div', { class: 'me-nav__submenu-wrapper' }, [
                        h('div', { class: 'me-nav__submenu' }, [
                            h('ul', { class: 'me-nav__submenu-inner' }, slots.default?.()),
                        ]),
                    ]),
                ],
            )
    },
})

export const MeNavItem = defineComponent({
    name: 'MeNavItem',

    props: {
        href: { type: String, default: '#' },
        icon: { type: String as PropType<string | null>, default: null },
        /**
         * Explicit, unlike Blade — a Vue application knows its current route
         * and this component has no business guessing it from the URL.
         */
        active: { type: Boolean, default: false },
        badge: { type: [String, Number] as PropType<string | number | null>, default: null },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h(
                'a',
                {
                    ...attrs,
                    href: props.href,
                    class: 'me-nav__item',
                    'aria-current': props.active ? 'page' : undefined,
                },
                [
                    props.icon ? h(MeIcon, { name: props.icon as never }) : null,
                    h('span', { class: 'me-hide-collapsed' }, slots.default?.()),
                    props.badge !== null
                        ? h('span', { class: 'me-hide-collapsed' }, [
                              h(MeBadge, { variant: 'primary' }, () => String(props.badge)),
                          ])
                        : null,
                ],
            )
    },
})

export const MeNavSubitem = defineComponent({
    name: 'MeNavSubitem',

    props: {
        href: { type: String, default: '#' },
        active: { type: Boolean, default: false },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h('li', [
                h(
                    'a',
                    {
                        ...attrs,
                        href: props.href,
                        class: 'me-nav__subitem',
                        'aria-current': props.active ? 'page' : undefined,
                    },
                    slots.default?.(),
                ),
            ])
    },
})

/** Cycles the three colour modes: system → light → dark → system. */
export const MeThemeToggle = defineComponent({
    name: 'MeThemeToggle',

    props: { size: { type: String as PropType<Size>, default: 'md' } },

    setup(props, { attrs }) {
        const host = ref<HTMLElement | null>(null)

        onMounted(() => {
            if (host.value) {
                initThemeToggles(host.value.parentElement ?? document)
            }
        })

        return () =>
            h(
                'button',
                {
                    ...attrs,
                    ref: host,
                    type: 'button',
                    class: ['me-btn', 'me-btn--ghost', 'me-btn--icon', `me-btn--${props.size}`],
                    'data-me-theme': '',
                    'aria-label': t('layout.toggleTheme'),
                },
                [
                    // Which one shows is decided by CSS from data-theme, not here.
                    h(MeIcon, { name: 'monitor', class: 'me-theme-icon-system' }),
                    h(MeIcon, { name: 'sun', class: 'me-theme-icon-light' }),
                    h(MeIcon, { name: 'moon', class: 'me-theme-icon-dark' }),
                ],
            )
    },
})

/** An explicit three-option picker, for a settings screen. */
export const MeThemeMenu = defineComponent({
    name: 'MeThemeMenu',

    props: { align: { type: String as PropType<'start' | 'end'>, default: 'end' } },

    setup(props, { attrs }) {
        const host = ref<HTMLElement | null>(null)

        onMounted(() => {
            if (host.value) {
                initThemeToggles(host.value)
            }
        })

        return () =>
            h('div', { ref: host }, [
                h(
                    MeDropdown,
                    { ...attrs, align: props.align },
                    {
                        trigger: () =>
                            h('button', { type: 'button', class: 'me-btn me-btn--secondary me-btn--sm' }, [
                                h(MeIcon, { name: 'monitor', class: 'me-theme-icon-system' }),
                                h(MeIcon, { name: 'sun', class: 'me-theme-icon-light' }),
                                h(MeIcon, { name: 'moon', class: 'me-theme-icon-dark' }),
                                h('span', t('layout.theme')),
                            ]),
                        default: () => [
                            themeItem('system', 'monitor', t('layout.system')),
                            themeItem('light', 'sun', t('layout.light')),
                            themeItem('dark', 'moon', t('layout.dark')),
                        ],
                    },
                ),
            ])
    },
})

function themeItem(mode: string, icon: string, label: string): ReturnType<typeof h> {
    return h(
        'button',
        { type: 'button', class: 'me-dropdown__item', 'data-me-theme': mode, 'data-me-keep-open': '' },
        [h(MeIcon, { name: icon as never }), label],
    )
}

/** Topbar account menu. Pass items as the default slot. */
export const MeUserMenu = defineComponent({
    name: 'MeUserMenu',

    props: {
        name: { type: String as PropType<string | null>, default: null },
        email: { type: String as PropType<string | null>, default: null },
        avatar: { type: String as PropType<string | null>, default: null },
        showName: { type: Boolean, default: true },
    },

    setup(props, { slots, attrs }) {
        return () =>
            h(
                MeDropdown,
                { ...attrs, align: 'end' },
                {
                    trigger: () =>
                        h('button', { type: 'button', class: 'me-user-button', 'aria-label': t('layout.accountMenu') }, [
                            h(MeAvatar, { name: props.name, src: props.avatar }),
                            props.showName && props.name
                                ? h('span', { class: 'me-user-button__name me-hide-mobile' }, props.name)
                                : null,
                        ]),
                    default: () => [
                        h(MeDropdownHeader, { title: props.name, meta: props.email }),
                        slots.default?.(),
                    ],
                },
            )
    },
})

export { MeDropdownItem }
