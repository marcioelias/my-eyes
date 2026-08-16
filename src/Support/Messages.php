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
        ];
    }
}
