@props([
    'name' => null,
    'id' => null,
    'label' => null,
    'hint' => null,
    'error' => null,
    'accept' => null,
    'multiple' => false,
    'maxSize' => null,
    'maxFiles' => null,
    'required' => false,
    'disabled' => false,
])

{{--
    The dropzone is a <label> wrapping a real file input, so click and keyboard
    activation work with no JavaScript. Drag-and-drop, the file list and the
    size/type checks are added by the binding on top of that.

    maxSize is given in bytes.
--}}

@php
    $id ??= $name;
    $error ??= $name ? $errors->first($name) : null;
@endphp

<x-me::field :label="$label" :hint="$hint" :error="$error" :for="$id" :required="$required">
    <div
        class="me-upload"
        data-me-upload
        @if (! is_null($maxSize)) data-max-size="{{ $maxSize }}" @endif
        @if (! is_null($maxFiles)) data-max-files="{{ $maxFiles }}" @endif
        data-msg-too-large="{{ __('my-eyes::ui.upload.too_large') }}"
        data-msg-wrong-type="{{ __('my-eyes::ui.upload.wrong_type') }}"
        data-msg-too-many="{{ __('my-eyes::ui.upload.too_many') }}"
        data-msg-remove="{{ __('my-eyes::ui.upload.remove') }}"
    >
        <label class="me-upload__zone" data-me-upload-zone @if ($disabled) data-disabled="true" @endif>
            <input
                {{ $attributes->class(['me-upload__input']) }}
                type="file"
                data-me-upload-input
                @if ($id) id="{{ $id }}" @endif
                @if ($name) name="{{ $name }}{{ $multiple ? '[]' : '' }}" @endif
                @if ($accept) accept="{{ $accept }}" @endif
                @if ($multiple) multiple @endif
                @if ($required) required @endif
                @if ($disabled) disabled @endif
            />

            <x-me::icon name="upload-cloud" class="me-upload__icon" />

            <span class="me-upload__title">
                {!! __('my-eyes::ui.upload.drop', ['browse' => '<em>'.__('my-eyes::ui.upload.browse').'</em>']) !!}
            </span>

            @if ($accept || $maxSize)
                <span class="me-upload__hint">
                    {{ collect([$accept, $maxSize ? __('my-eyes::ui.upload.up_to', ['size' => \MyEyes\Support\FileSize::format((int) $maxSize)]) : null])->filter()->implode(' · ') }}
                </span>
            @endif
        </label>

        <ul class="me-upload__list" data-me-upload-list></ul>
    </div>
</x-me::field>
