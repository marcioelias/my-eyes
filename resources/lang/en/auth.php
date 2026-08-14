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
        'information_text' => 'Update your name and email address.',
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
