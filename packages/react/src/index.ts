/*
 * @my-eyes/react
 *
 * The my-eyes design system for React 19. The look comes from
 * `@my-eyes/core/css`, which the host application imports once; these
 * components only emit the markup that stylesheet expects, and delegate every
 * behaviour to `@my-eyes/core` rather than restating it.
 *
 * @see docs/features/react-package.md
 */

export { MeTable, type MeTableProps } from './MeTable.js'
export { MeFilters, type MeFiltersProps } from './MeFilters.js'
export { MePagination, type MePaginationProps } from './MePagination.js'
export { useTable, type UseTable } from './useTable.js'
export { useTheme, type UseTheme } from './useTheme.js'

/*
 * The authentication screens — whole pages rather than components, and the
 * counterpart of what `my-eyes-pages` publishes for Blade. They are exported
 * from their own module so the parity test can count them against the pages
 * instead of against the components.
 */
export {
    MeConfirmPasswordScreen,
    MeDeleteAccountCard,
    MeForgotPasswordScreen,
    MeLoginScreen,
    MePasskeysCard,
    MeProfileInformationCard,
    MeRegisterScreen,
    MeResetPasswordScreen,
    MeTwoFactorCard,
    MeTwoFactorChallengeScreen,
    MeUpdatePasswordCard,
    MeVerifyEmailScreen,
    type Errors,
    type Passkey,
} from './screens.js'

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
    MeAuthLayout,
    MeErrorLayout,
    MeNavGroup,
    MeNavItem,
    MeNavSection,
    MeNavSubitem,
    MeThemeMenu,
    MeThemeToggle,
    MeUserMenu,
} from './shell.js'
