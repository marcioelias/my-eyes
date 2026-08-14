<x-me::layouts.error
    status="403"
    icon="shield-off"
    :title="__('my-eyes::ui.errors.403.title')"
>
    {{ ($exception ?? null)?->getMessage() ?: __('my-eyes::ui.errors.403.text') }}
</x-me::layouts.error>
