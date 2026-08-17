<?php

declare(strict_types=1);

namespace MyEyes\Support;

/**
 * The subset of translations the JavaScript layer needs.
 *
 * The bindings render some text themselves — a toast's close button, upload
 * validation, the filter builder's labels — and cannot call Laravel's
 * translator. This maps those to the keys `@my-eyes/core` looks up, so one
 * translation file serves both sides.
 *
 * Blade applications get this automatically through <x-me::translations />.
 * For Vue, React or Inertia, hand the array to the client and call
 * `configureMessages()` with it:
 *
 * ```php
 * // AppServiceProvider, for Inertia
 * Inertia::share('myEyesMessages', fn () => Messages::forJavaScript());
 * ```
 *
 * ```js
 * import { configureMessages } from '@my-eyes/core'
 * configureMessages(page.props.myEyesMessages)
 * ```
 */
final class Messages
{
    /**
     * Keyed by the message key used in the JS dictionary.
     *
     * @return array<string, string>
     */
    public static function forJavaScript(): array
    {
        return [
            'toast.close' => __('my-eyes::ui.common.close'),
            'password.show' => __('my-eyes::ui.password.show'),
            'password.hide' => __('my-eyes::ui.password.hide'),
            'upload.remove' => __('my-eyes::ui.upload.remove'),
            'upload.tooLarge' => __('my-eyes::ui.upload.too_large'),
            'upload.wrongType' => __('my-eyes::ui.upload.wrong_type'),
            'upload.tooMany' => __('my-eyes::ui.upload.too_many'),
            'upload.drop' => __('my-eyes::ui.upload.drop'),
            'upload.browse' => __('my-eyes::ui.upload.browse'),
            'upload.upTo' => __('my-eyes::ui.upload.up_to'),
            'filters.where' => __('my-eyes::filters.ui.where'),
            'filters.and' => __('my-eyes::filters.ui.and'),
            'filters.or' => __('my-eyes::filters.ui.or'),
            'filters.remove' => __('my-eyes::filters.ui.remove'),
            'filters.value' => __('my-eyes::filters.ui.value'),
            'filters.rangeSeparator' => '–',
            'filters.commaHint' => __('my-eyes::filters.ui.comma_hint'),
            'common.yes' => __('my-eyes::ui.common.yes'),
            'common.no' => __('my-eyes::ui.common.no'),
            'select.search' => __('my-eyes::ui.select.search'),
            'select.empty' => __('my-eyes::ui.select.empty'),
            'select.placeholder' => __('my-eyes::ui.select.placeholder'),
            'select.selected' => __('my-eyes::ui.select.selected'),
            'select.clear' => __('my-eyes::ui.select.clear'),
            /*
             * Blade and Livewire render the table chrome server-side, so these
             * only reach the screen through the Vue and React tables. They are
             * exported all the same: one translation file has to serve every
             * renderer, and a Blade application that mounts a Vue table on one
             * page should not have to translate it twice.
             */
            'filters.title' => __('my-eyes::filters.ui.title'),
            'filters.add' => __('my-eyes::filters.ui.add'),
            'filters.apply' => __('my-eyes::filters.ui.apply'),
            'filters.clear' => __('my-eyes::filters.ui.clear'),
            'filters.empty' => __('my-eyes::filters.ui.empty'),
            'table.search' => __('my-eyes::filters.table.search'),
            'table.perPage' => __('my-eyes::filters.table.per_page'),
            'table.showing' => __('my-eyes::filters.table.showing'),
            'table.empty' => __('my-eyes::filters.table.empty'),
            'table.emptyFiltered' => __('my-eyes::filters.table.empty_filtered'),
            'table.previous' => __('my-eyes::filters.table.previous'),
            'table.next' => __('my-eyes::filters.table.next'),
            'table.retry' => __('my-eyes::filters.table.retry'),
            'pagination.label' => __('my-eyes::ui.pagination.label'),
            'layout.skip' => __('my-eyes::ui.layout.skip'),
            'layout.openMenu' => __('my-eyes::ui.layout.open_menu'),
            'layout.closeMenu' => __('my-eyes::ui.layout.close_menu'),
            'layout.mainNav' => __('my-eyes::ui.layout.main_nav'),
            'layout.collapse' => __('my-eyes::ui.layout.collapse'),
            'layout.toggleTheme' => __('my-eyes::ui.layout.toggle_theme'),
            'layout.accountMenu' => __('my-eyes::ui.layout.account_menu'),
            'layout.theme' => __('my-eyes::ui.theme.theme'),
            'layout.system' => __('my-eyes::ui.theme.system'),
            'layout.light' => __('my-eyes::ui.theme.light'),
            'layout.dark' => __('my-eyes::ui.theme.dark'),
            'errors.goBack' => __('my-eyes::ui.errors.go_back'),
            'errors.backHome' => __('my-eyes::ui.errors.back_home'),
            'passkey.failed' => __('my-eyes::auth.passkeys.failed'),
            'passkey.nameRequired' => __('my-eyes::auth.passkeys.name_required'),
            /*
             * The authentication screens. Blade renders its own from the same
             * translation file; these reach the screen only through the Vue
             * screens, which have no translator of their own.
             */
            'auth.signIn' => __('my-eyes::auth.login.heading'),
            'auth.signInSubheading' => __('my-eyes::auth.login.subheading'),
            'auth.email' => __('my-eyes::auth.fields.email'),
            'auth.password' => __('my-eyes::auth.fields.password'),
            'auth.name' => __('my-eyes::auth.fields.name'),
            'auth.currentPassword' => __('my-eyes::auth.fields.current_password'),
            'auth.newPassword' => __('my-eyes::auth.fields.new_password'),
            'auth.confirmPassword' => __('my-eyes::auth.fields.confirm_password'),
            'auth.remember' => __('my-eyes::auth.login.remember'),
            'auth.forgot' => __('my-eyes::auth.login.forgot'),
            'auth.noAccount' => __('my-eyes::auth.login.no_account'),
            'auth.signUp' => __('my-eyes::auth.login.sign_up'),
            'auth.registerHeading' => __('my-eyes::auth.register.heading'),
            'auth.registerSubheading' => __('my-eyes::auth.register.subheading'),
            'auth.registerSubmit' => __('my-eyes::auth.register.submit'),
            'auth.haveAccount' => __('my-eyes::auth.register.have_account'),
            'auth.forgotHeading' => __('my-eyes::auth.forgot.heading'),
            'auth.forgotSubheading' => __('my-eyes::auth.forgot.subheading'),
            'auth.forgotSubmit' => __('my-eyes::auth.forgot.submit'),
            'auth.backToSignIn' => __('my-eyes::auth.forgot.back'),
            'auth.resetHeading' => __('my-eyes::auth.reset.heading'),
            'auth.resetSubheading' => __('my-eyes::auth.reset.subheading'),
            'auth.resetSubmit' => __('my-eyes::auth.reset.submit'),
            'auth.verifyHeading' => __('my-eyes::auth.verify.heading'),
            'auth.verifySubheading' => __('my-eyes::auth.verify.subheading'),
            'auth.verifyText' => __('my-eyes::auth.verify.text'),
            'auth.verifyResend' => __('my-eyes::auth.verify.resend'),
            'auth.signOut' => __('my-eyes::ui.layout.sign_out'),
            'auth.confirmHeading' => __('my-eyes::auth.confirm.heading'),
            'auth.confirmSubheading' => __('my-eyes::auth.confirm.subheading'),
            'auth.confirmSubmit' => __('my-eyes::auth.confirm.submit'),
            'auth.challengeHeading' => __('my-eyes::auth.two_factor.challenge_heading'),
            'auth.challengeSubheading' => __('my-eyes::auth.two_factor.challenge_subheading'),
            'auth.code' => __('my-eyes::auth.two_factor.code'),
            'auth.recoveryCode' => __('my-eyes::auth.two_factor.recovery_code'),
            'auth.useRecoveryCode' => __('my-eyes::auth.two_factor.use_recovery'),
            'auth.useAuthCode' => __('my-eyes::auth.two_factor.use_code'),
            'auth.save' => __('my-eyes::ui.common.save'),
            'auth.profileInformation' => __('my-eyes::auth.profile.information'),
            'auth.profileInformationText' => __('my-eyes::auth.profile.information_text'),
            'auth.unverified' => __('my-eyes::auth.profile.unverified'),
            'auth.resendVerification' => __('my-eyes::auth.profile.resend'),
            'auth.avatar' => __('my-eyes::auth.profile.avatar'),
            'auth.avatarText' => __('my-eyes::auth.profile.avatar_text'),
            'auth.updatePassword' => __('my-eyes::auth.profile.password'),
            'auth.updatePasswordText' => __('my-eyes::auth.profile.password_text'),
            'auth.deleteAccount' => __('my-eyes::auth.profile.delete'),
            'auth.deleteAccountText' => __('my-eyes::auth.profile.delete_text'),
            'auth.deleteConfirm' => __('my-eyes::auth.profile.delete_confirm'),
            'auth.twoFactor' => __('my-eyes::auth.two_factor.title'),
            'auth.twoFactorText' => __('my-eyes::auth.two_factor.text'),
            'auth.twoFactorOff' => __('my-eyes::auth.two_factor.off'),
            'auth.twoFactorPending' => __('my-eyes::auth.two_factor.pending'),
            'auth.twoFactorOn' => __('my-eyes::auth.two_factor.on'),
            'auth.enable' => __('my-eyes::auth.two_factor.enable'),
            'auth.disable' => __('my-eyes::auth.two_factor.disable'),
            'auth.confirmCode' => __('my-eyes::auth.two_factor.confirm'),
            'auth.scanText' => __('my-eyes::auth.two_factor.scan_text'),
            'auth.secretKey' => __('my-eyes::auth.two_factor.secret'),
            'auth.recoveryCodes' => __('my-eyes::auth.two_factor.recovery_codes'),
            'auth.recoveryCodesText' => __('my-eyes::auth.two_factor.recovery_text'),
            'auth.regenerate' => __('my-eyes::auth.two_factor.regenerate'),
            'auth.copy' => __('my-eyes::ui.common.copy'),
            'auth.copied' => __('my-eyes::ui.common.copied'),
            'auth.passkeys' => __('my-eyes::auth.passkeys.title'),
            'auth.passkeysText' => __('my-eyes::auth.passkeys.text'),
            'auth.passkeyName' => __('my-eyes::auth.passkeys.name'),
            'auth.addPasskey' => __('my-eyes::auth.passkeys.add'),
            'auth.noPasskeys' => __('my-eyes::auth.passkeys.empty'),
            'auth.lastUsed' => __('my-eyes::auth.passkeys.last_used'),
            'auth.never' => __('my-eyes::auth.passkeys.never'),
            'auth.remove' => __('my-eyes::ui.common.remove'),
            'auth.signInWithPasskey' => __('my-eyes::auth.passkeys.sign_in'),
            'auth.confirmWithPasskey' => __('my-eyes::auth.passkeys.confirm'),
            'auth.or' => __('my-eyes::auth.login.or'),
        ];
    }
}
