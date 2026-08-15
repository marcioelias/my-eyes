/*
 * @my-eyes/vue
 *
 * The my-eyes design system for Vue 3. The look comes from
 * `@my-eyes/core/css`, which the host application imports once; these
 * components only emit the markup that stylesheet expects, and delegate every
 * behaviour to `@my-eyes/core` rather than restating it.
 *
 * @see docs/features/vue-package.md
 */

export { MeTable } from './MeTable.js'
export { MeFilters } from './MeFilters.js'
export { MePagination } from './MePagination.js'
export { useTable, type UseTable } from './useTable.js'
export { useTheme, type UseTheme } from './useTheme.js'

export {
    MeAlert,
    MeAvatar,
    MeBadge,
    MeBrand,
    MeButton,
    MeCard,
    MeField,
    MeIcon,
    MeProgress,
    MeProgressRing,
    initials,
    linkAsProp,
    type LinkAs,
    type Size,
    type Tone,
    type Variant,
} from './primitives.js'

export {
    MeCheckbox,
    MeInput,
    MeNumeric,
    MeRadio,
    MeSelect,
    MeSelectField,
    MeSwitch,
    MeTextarea,
    MeUpload,
    type Options,
    type SelectFieldOption,
} from './forms.js'

export {
    MeDropdown,
    MeDropdownDivider,
    MeDropdownHeader,
    MeDropdownItem,
    MeModal,
    MeToasts,
    MeTooltip,
    useToasts,
} from './overlays.js'

export {
    MeAdminLayout,
    MeNavGroup,
    MeNavItem,
    MeNavSection,
    MeNavSubitem,
    MeThemeMenu,
    MeThemeToggle,
    MeUserMenu,
} from './shell.js'
