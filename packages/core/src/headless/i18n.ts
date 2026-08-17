/*
 * Messages used by the JavaScript layer.
 *
 * Anything the bindings render themselves — the toast close button, upload
 * validation, the filter builder's labels — reads from here instead of holding
 * a literal. English is the built-in fallback; a host application replaces any
 * subset of it.
 *
 * In Laravel the <x-me::translations /> component emits the current locale's
 * strings and they are applied automatically. In Vue, React or Inertia, call
 * configureMessages() once at boot with whatever your i18n layer resolves:
 *
 *   import { configureMessages } from '@my-eyes/core'
 *   configureMessages({ 'toast.close': 'Fechar', 'upload.browse': 'procurar' })
 */

export type MessageKey =
    | 'toast.close'
    | 'password.show'
    | 'password.hide'
    | 'upload.remove'
    | 'upload.tooLarge'
    | 'upload.wrongType'
    | 'upload.tooMany'
    | 'upload.drop'
    | 'upload.browse'
    | 'upload.upTo'
    | 'filters.where'
    | 'filters.and'
    | 'filters.or'
    | 'filters.remove'
    | 'filters.value'
    | 'filters.rangeSeparator'
    | 'filters.commaHint'
    | 'common.yes'
    | 'common.no'
    | 'select.search'
    | 'select.empty'
    | 'select.placeholder'
    | 'select.selected'
    | 'select.clear'
    | 'filters.title'
    | 'filters.add'
    | 'filters.apply'
    | 'filters.clear'
    | 'filters.empty'
    | 'table.search'
    | 'table.perPage'
    | 'table.showing'
    | 'table.empty'
    | 'table.emptyFiltered'
    | 'table.previous'
    | 'table.next'
    | 'table.retry'
    | 'pagination.label'
    | 'layout.skip'
    | 'layout.openMenu'
    | 'layout.closeMenu'
    | 'layout.mainNav'
    | 'layout.collapse'
    | 'layout.toggleTheme'
    | 'layout.accountMenu'
    | 'layout.theme'
    | 'layout.system'
    | 'layout.light'
    | 'layout.dark'
    | 'errors.goBack'
    | 'errors.backHome'
    | 'passkey.failed'
    | 'passkey.nameRequired'
    | 'auth.signIn'
    | 'auth.signInSubheading'
    | 'auth.email'
    | 'auth.password'
    | 'auth.name'
    | 'auth.currentPassword'
    | 'auth.newPassword'
    | 'auth.confirmPassword'
    | 'auth.remember'
    | 'auth.forgot'
    | 'auth.noAccount'
    | 'auth.signUp'
    | 'auth.registerHeading'
    | 'auth.registerSubheading'
    | 'auth.registerSubmit'
    | 'auth.haveAccount'
    | 'auth.forgotHeading'
    | 'auth.forgotSubheading'
    | 'auth.forgotSubmit'
    | 'auth.backToSignIn'
    | 'auth.resetHeading'
    | 'auth.resetSubheading'
    | 'auth.resetSubmit'
    | 'auth.verifyHeading'
    | 'auth.verifySubheading'
    | 'auth.verifyText'
    | 'auth.verifyResend'
    | 'auth.signOut'
    | 'auth.confirmHeading'
    | 'auth.confirmSubheading'
    | 'auth.confirmSubmit'
    | 'auth.challengeHeading'
    | 'auth.challengeSubheading'
    | 'auth.code'
    | 'auth.recoveryCode'
    | 'auth.useRecoveryCode'
    | 'auth.useAuthCode'
    | 'auth.save'
    | 'auth.profileInformation'
    | 'auth.profileInformationText'
    | 'auth.unverified'
    | 'auth.resendVerification'
    | 'auth.avatar'
    | 'auth.avatarText'
    | 'auth.updatePassword'
    | 'auth.updatePasswordText'
    | 'auth.deleteAccount'
    | 'auth.deleteAccountText'
    | 'auth.deleteConfirm'
    | 'auth.twoFactor'
    | 'auth.twoFactorText'
    | 'auth.twoFactorOff'
    | 'auth.twoFactorPending'
    | 'auth.twoFactorOn'
    | 'auth.enable'
    | 'auth.disable'
    | 'auth.confirmCode'
    | 'auth.scanText'
    | 'auth.secretKey'
    | 'auth.recoveryCodes'
    | 'auth.recoveryCodesText'
    | 'auth.regenerate'
    | 'auth.copy'
    | 'auth.copied'
    | 'auth.passkeys'
    | 'auth.passkeysText'
    | 'auth.passkeyName'
    | 'auth.addPasskey'
    | 'auth.noPasskeys'
    | 'auth.lastUsed'
    | 'auth.never'
    | 'auth.remove'
    | 'auth.signInWithPasskey'
    | 'auth.confirmWithPasskey'
    | 'auth.or'

export type Messages = Record<MessageKey, string>

const defaults: Messages = {
    'toast.close': 'Close',
    'password.show': 'Show password',
    'password.hide': 'Hide password',
    'upload.remove': 'Remove',
    'upload.tooLarge': ':name is larger than :limit',
    'upload.wrongType': ':name is not an accepted file type',
    'upload.tooMany': 'At most :limit files',
    'upload.drop': 'Drop files here or :browse',
    'upload.browse': 'browse',
    'upload.upTo': 'up to :size',
    'filters.where': 'Where',
    'filters.and': 'and',
    'filters.or': 'or',
    'filters.remove': 'Remove condition',
    'filters.value': 'Value',
    'filters.rangeSeparator': '–',
    'filters.commaHint': 'Separate values with commas',
    'common.yes': 'Yes',
    'common.no': 'No',
    'select.search': 'Search options',
    'select.empty': 'No options match',
    'select.placeholder': 'Select an option',
    'select.selected': ':count selected',
    'select.clear': 'Clear selection',
    // Rendered by the Vue and React tables. Blade and Livewire render these
    // server-side, so they only appear here.
    'filters.title': 'Filters',
    'filters.add': 'Add condition',
    'filters.apply': 'Apply',
    'filters.clear': 'Clear all',
    'filters.empty': 'No conditions yet. Add one to narrow the results.',
    'table.search': 'Search',
    'table.perPage': 'Per page',
    'table.showing': 'Showing :first–:last of :total',
    'table.empty': 'No records found',
    'table.emptyFiltered': 'No records match these filters',
    'table.previous': 'Previous',
    'table.next': 'Next',
    'table.retry': 'Retry',
    'pagination.label': 'Pagination',
    // The admin shell. Blade renders these server-side; they reach the screen
    // only through the Vue shell.
    'layout.skip': 'Skip to content',
    'layout.openMenu': 'Open menu',
    'layout.closeMenu': 'Close menu',
    'layout.mainNav': 'Main navigation',
    'layout.collapse': 'Collapse',
    'layout.toggleTheme': 'Toggle theme',
    'layout.accountMenu': 'Account menu',
    'layout.theme': 'Theme',
    'layout.system': 'System',
    'layout.light': 'Light',
    'layout.dark': 'Dark',
    'errors.goBack': 'Go back',
    'errors.backHome': 'Back to home',
    // Rendered by the passkey binding, in every renderer.
    'passkey.failed': 'Could not use a passkey. Try again, or use your password.',
    'passkey.nameRequired': 'Give this passkey a name first.',
    /*
     * The authentication screens. Blade renders its own from the
     * `my-eyes::auth` translation file; these reach the screen only through
     * the Vue screens, which have no translator of their own.
     */
    'auth.signIn': 'Sign in',
    'auth.signInSubheading': 'Welcome back. Enter your details to continue.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.currentPassword': 'Current password',
    'auth.newPassword': 'New password',
    'auth.confirmPassword': 'Confirm password',
    'auth.remember': 'Remember me',
    'auth.forgot': 'Forgot password?',
    'auth.noAccount': 'Do not have an account?',
    'auth.signUp': 'Sign up',
    'auth.registerHeading': 'Create your account',
    'auth.registerSubheading': 'It only takes a minute.',
    'auth.registerSubmit': 'Create account',
    'auth.haveAccount': 'Already have an account?',
    'auth.forgotHeading': 'Forgot your password?',
    'auth.forgotSubheading': 'Tell us your email and we will send you a reset link.',
    'auth.forgotSubmit': 'Email password reset link',
    'auth.backToSignIn': 'Back to sign in',
    'auth.resetHeading': 'Choose a new password',
    'auth.resetSubheading': 'Pick something you have not used before.',
    'auth.resetSubmit': 'Reset password',
    'auth.verifyHeading': 'Verify your email',
    'auth.verifySubheading': 'We sent a verification link to your inbox.',
    'auth.verifyText':
        'Click the link in that email to finish signing up. If it did not arrive, we can send another one.',
    'auth.verifyResend': 'Resend verification email',
    'auth.signOut': 'Sign out',
    'auth.confirmHeading': 'Confirm your password',
    'auth.confirmSubheading': 'This is a secure area. Please confirm your password to continue.',
    'auth.confirmSubmit': 'Confirm',
    'auth.challengeHeading': 'Two-factor authentication',
    'auth.challengeSubheading': 'Enter the code from your authenticator app.',
    'auth.code': 'Authentication code',
    'auth.recoveryCode': 'Recovery code',
    'auth.useRecoveryCode': 'Use a recovery code',
    'auth.useAuthCode': 'Use an authentication code',
    'auth.save': 'Save',
    'auth.profileInformation': 'Profile information',
    'auth.profileInformationText': 'Update your name, email address and photo.',
    'auth.unverified': 'Your email address is unverified.',
    'auth.resendVerification': 'Resend the verification email',
    'auth.avatar': 'Photo',
    'auth.avatarText': 'JPG, PNG or WebP.',
    'auth.updatePassword': 'Update password',
    'auth.updatePasswordText': 'Use a long, random password to stay secure.',
    'auth.deleteAccount': 'Delete account',
    'auth.deleteAccountText':
        'Once deleted, all of its data is permanently removed. This cannot be undone.',
    'auth.deleteConfirm': 'Confirm your password to continue',
    'auth.twoFactor': 'Two-factor authentication',
    'auth.twoFactorText': 'Add a second step to your sign-in, using an authenticator app.',
    'auth.twoFactorOff': 'Off',
    'auth.twoFactorPending': 'Awaiting confirmation',
    'auth.twoFactorOn': 'On',
    'auth.enable': 'Enable',
    'auth.disable': 'Disable',
    'auth.confirmCode': 'Confirm',
    'auth.scanText': 'Scan this with your authenticator app, then enter the code it shows.',
    'auth.secretKey': 'Or enter this key manually',
    'auth.recoveryCodes': 'Recovery codes',
    'auth.recoveryCodesText':
        'Keep these somewhere safe. Each one signs you in once if you lose your authenticator.',
    'auth.regenerate': 'Regenerate',
    'auth.copy': 'Copy',
    'auth.copied': 'Copied',
    'auth.passkeys': 'Passkeys',
    'auth.passkeysText': 'Sign in with your fingerprint, face or screen lock instead of a password.',
    'auth.passkeyName': 'Name this device',
    'auth.addPasskey': 'Add a passkey',
    'auth.noPasskeys': 'No passkeys yet.',
    'auth.lastUsed': 'Last used :when',
    'auth.never': 'never',
    'auth.remove': 'Remove',
    'auth.signInWithPasskey': 'Sign in with a passkey',
    'auth.confirmWithPasskey': 'Confirm with a passkey',
    'auth.or': 'or',
}

let messages: Messages = { ...defaults }

/**
 * Replaces any subset of the messages. Unknown keys are ignored, so a host
 * sending its whole translation file cannot corrupt the dictionary.
 */
export function configureMessages(next: Partial<Record<string, string>>): void {
    Object.entries(next).forEach(([key, value]) => {
        if (typeof value === 'string' && key in defaults) {
            messages[key as MessageKey] = value
        }
    })
}

export function resetMessages(): void {
    messages = { ...defaults }
}

/**
 * Resolves a message, substituting `:name`-style placeholders — the same
 * convention Laravel uses, so a translation string can be moved between the
 * PHP and JS sides unchanged.
 */
export function t(key: MessageKey, replacements: Record<string, string> = {}): string {
    return Object.entries(replacements).reduce(
        (text, [name, value]) => text.replaceAll(`:${name}`, value),
        messages[key],
    )
}

/**
 * Reads messages from a <script type="application/json" data-me-messages> tag.
 * JSON in a script tag rather than executable code, so no relaxed CSP is needed.
 */
export function loadMessagesFromDocument(root: ParentNode = document): void {
    const node = root.querySelector('script[data-me-messages]')

    if (!node?.textContent) {
        return
    }

    try {
        configureMessages(JSON.parse(node.textContent) as Record<string, string>)
    } catch {
        // Malformed payload: keep the English defaults rather than breaking.
    }
}
