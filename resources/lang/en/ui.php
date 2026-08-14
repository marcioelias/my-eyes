<?php

declare(strict_types=1);

/*
 * Every string the components render on their own.
 *
 * Publish with `--tag=my-eyes-lang` to adjust wording, or drop a new locale
 * directory in to add a language. The keys under "common", "password",
 * "upload" and "toast" are also handed to the JavaScript layer by
 * <x-me::translations />, so a translation applies on both sides at once.
 */

return [

    'common' => [
        'yes' => 'Yes',
        'no' => 'No',
        'close' => 'Close',
        'cancel' => 'Cancel',
        'confirm' => 'Confirm',
        'ok' => 'OK',
        'remove' => 'Remove',
        'save' => 'Save',
        'dismiss' => 'Dismiss',
    ],

    'password' => [
        'show' => 'Show password',
        'hide' => 'Hide password',
    ],

    'numeric' => [
        'increase' => 'Increase',
        'decrease' => 'Decrease',
    ],

    'upload' => [
        'drop' => 'Drop files here or :browse',
        'browse' => 'browse',
        'up_to' => 'up to :size',
        'remove' => 'Remove',
        'too_large' => ':name is larger than :limit',
        'wrong_type' => ':name is not an accepted file type',
        'too_many' => 'At most :limit files',
    ],

    'layout' => [
        'skip' => 'Skip to content',
        'open_menu' => 'Open menu',
        'close_menu' => 'Close menu',
        'main_nav' => 'Main navigation',
        'collapse' => 'Collapse',
        'toggle_theme' => 'Toggle theme',
        'account_menu' => 'Account menu',
        'profile' => 'Profile',
        'sign_out' => 'Sign out',
    ],

    'theme' => [
        'system' => 'System',
        'light' => 'Light',
        'dark' => 'Dark',
        'theme' => 'Theme',
    ],

    'select' => [
        'search' => 'Search options',
        'empty' => 'No options match',
        'placeholder' => 'Select an option',
        'selected' => ':count selected',
        'clear' => 'Clear selection',
    ],

    'pagination' => [
        'label' => 'Pagination',
    ],

    'errors' => [
        'go_back' => 'Go back',
        'back_home' => 'Back to home',
        '401' => [
            'title' => 'Unauthorized',
            'text' => 'You need to sign in to access this page.',
        ],
        '403' => [
            'title' => 'Forbidden',
            'text' => 'You do not have permission to access this page.',
        ],
        '404' => [
            'title' => 'Page not found',
            'text' => 'The page you are looking for does not exist, or it has been moved.',
        ],
        '419' => [
            'title' => 'Page expired',
            'text' => 'Your session expired for security reasons. Please refresh the page and try again.',
        ],
        '429' => [
            'title' => 'Too many requests',
            'text' => 'You have made too many requests in a short time. Please wait a moment and try again.',
        ],
        '500' => [
            'title' => 'Something went wrong',
            'text' => 'An unexpected error occurred on our side. The team has been notified.',
        ],
        '503' => [
            'title' => 'Down for maintenance',
            'text' => 'We are performing scheduled maintenance and will be back shortly.',
        ],
    ],

];
