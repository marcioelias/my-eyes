<?php

declare(strict_types=1);

/*
 * Strings for the starter kit screens. They are published views, so you own
 * them after publishing — these defaults exist so the pages read correctly in
 * both locales the moment they land.
 */

return [

    'login' => [
        'heading' => 'Sign in',
        'subheading' => 'Welcome back. Enter your details to continue.',
        'remember' => 'Remember me',
        'forgot' => 'Forgot password?',
        'submit' => 'Sign in',
        'no_account' => 'Do not have an account?',
        'sign_up' => 'Sign up',
        'or' => 'or',
    ],

    'two_factor' => [
        'title' => 'Two-factor authentication',
        'text' => 'Add a second step to your sign-in, using an authenticator app.',
        'off' => 'Off',
        'pending' => 'Awaiting confirmation',
        'on' => 'On',
        'enable' => 'Enable',
        'disable' => 'Disable',
        'confirm' => 'Confirm',
        'scan_text' => 'Scan this with your authenticator app, then enter the code it shows.',
        'secret' => 'Or enter this key manually',
        'code' => 'Authentication code',
        'recovery_code' => 'Recovery code',
        'recovery_codes' => 'Recovery codes',
        'recovery_text' => 'Keep these somewhere safe. Each one signs you in once if you lose your authenticator. Regenerating invalidates the previous set.',
        'regenerate' => 'Regenerate',
        'challenge_heading' => 'Two-factor authentication',
        'challenge_subheading' => 'Enter the code from your authenticator app.',
        'challenge_recovery_subheading' => 'Enter one of the recovery codes you saved.',
        'challenge_submit' => 'Continue',
        'use_recovery' => 'Use a recovery code',
        'use_code' => 'Use an authentication code',
    ],

    'passkeys' => [
        'title' => 'Passkeys',
        'text' => 'Sign in with your fingerprint, face or screen lock instead of a password.',
        'name' => 'Name this device',
        'name_placeholder' => 'Work laptop',
        'add' => 'Add a passkey',
        'empty' => 'No passkeys yet.',
        'last_used' => 'Last used :when',
        'never' => 'never',
        'sign_in' => 'Sign in with a passkey',
        'confirm' => 'Confirm with a passkey',
        'failed' => 'Could not use a passkey. Try again, or use your password.',
        'name_required' => 'Give this passkey a name first.',
    ],

    'register' => [
        'heading' => 'Create your account',
        'subheading' => 'It only takes a minute.',
        'submit' => 'Create account',
        'have_account' => 'Already have an account?',
    ],

    'forgot' => [
        'heading' => 'Forgot your password?',
        'subheading' => 'Tell us your email and we will send you a reset link.',
        'submit' => 'Email password reset link',
        'back' => 'Back to sign in',
    ],

    'reset' => [
        'heading' => 'Choose a new password',
        'subheading' => 'Pick something you have not used before.',
        'submit' => 'Reset password',
    ],

    'verify' => [
        'heading' => 'Verify your email',
        'subheading' => 'We sent a verification link to your inbox.',
        'text' => 'Click the link in that email to finish signing up. If it did not arrive, we can send another one.',
        'sent' => 'A new verification link has been sent to your email address.',
        'resend' => 'Resend verification email',
    ],

    'confirm' => [
        'heading' => 'Confirm your password',
        'subheading' => 'This is a secure area. Please confirm your password to continue.',
        'submit' => 'Confirm',
    ],

    'fields' => [
        'name' => 'Name',
        'email' => 'Email',
        'password' => 'Password',
        'new_password' => 'New password',
        'current_password' => 'Current password',
        'confirm_password' => 'Confirm password',
    ],

    'profile' => [
        'heading' => 'Profile',
        'subheading' => 'Manage your account details and security.',
        'information' => 'Profile information',
        'information_text' => 'Update your name, email address and photo.',
        'avatar' => 'Photo',
        'avatar_text' => 'JPG, PNG or WebP.',
        'unverified' => 'Your email address is unverified.',
        'resend' => 'Resend the verification email',
        'password' => 'Update password',
        'password_text' => 'Use a long, random password to stay secure.',
        'delete' => 'Delete account',
        'delete_text' => 'Once deleted, all of its data is permanently removed. This cannot be undone.',
        'delete_confirm' => 'Confirm your password to continue',
        'delete_prompt' => 'Delete this account permanently?',
    ],

    'dashboard' => [
        'heading' => 'Dashboard',
        'subheading' => 'An overview of what is happening.',
        'welcome' => 'Welcome back',
        'welcome_text' => 'This page is a starting point — replace it with your own content.',
        'components_text' => 'Components live under x-me::*. See the my-eyes README for the full list.',
        'new_item' => 'New item',
    ],

    'nav' => [
        'account' => 'Account',
        'settings' => 'Settings',
        'general' => 'General',
        'members' => 'Members',
    ],

];
