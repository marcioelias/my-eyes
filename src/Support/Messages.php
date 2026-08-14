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
        ];
    }
}
