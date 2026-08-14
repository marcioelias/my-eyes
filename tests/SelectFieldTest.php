<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;

/**
 * @param  array<array-key, mixed>  $data
 */
function renderSelectField(string $tag, array $data = []): string
{
    return Blade::render($tag, $data);
}

it('normalises a flat value => label map into option objects', function () {
    $html = renderSelectField(
        '<x-me::select-field name="status" :options="[\'paid\' => \'Paid\', \'due\' => \'Due\']" />'
    );

    expect($html)
        ->toContain('data-me-select')
        ->toContain('&quot;value&quot;:&quot;paid&quot;')
        ->toContain('&quot;label&quot;:&quot;Paid&quot;');
});

it('carries disabled, description and group through to the client', function () {
    $html = renderSelectField('<x-me::select-field name="stack" :options="$options" />', [
        'options' => [
            ['value' => 'php', 'label' => 'PHP', 'group' => 'Backend'],
            ['value' => 'go', 'label' => 'Go', 'disabled' => true],
            ['value' => 'js', 'label' => 'JS', 'description' => 'Browser and Node'],
        ],
    ]);

    expect($html)
        ->toContain('&quot;disabled&quot;:true')
        ->toContain('&quot;group&quot;:&quot;Backend&quot;')
        ->toContain('&quot;description&quot;:&quot;Browser and Node&quot;');
});

it('marks multiple selection and pre-selects values', function () {
    $html = renderSelectField(
        '<x-me::select-field name="tags" multiple :selected="[\'php\', \'js\']" :options="[\'php\' => \'PHP\', \'js\' => \'JS\']" />'
    );

    expect($html)
        ->toContain('data-multiple="true"')
        ->toContain('data-selected="[&quot;php&quot;,&quot;js&quot;]"')
        ->toContain('data-empty="false"');
});

it('accepts a single scalar selection', function () {
    $html = renderSelectField(
        '<x-me::select-field name="status" selected="due" :options="[\'paid\' => \'Paid\', \'due\' => \'Due\']" />'
    );

    expect($html)->toContain('data-selected="[&quot;due&quot;]"');
});

it('starts empty when nothing is selected', function () {
    $html = renderSelectField('<x-me::select-field name="status" :options="[\'paid\' => \'Paid\']" />');

    expect($html)->toContain('data-selected="[]"')->toContain('data-empty="true"');
});

it('renders the search box and empty state by default', function () {
    $html = renderSelectField('<x-me::select-field name="s" :options="[]" />');

    expect($html)
        ->toContain('data-me-select-search')
        ->toContain('data-me-select-empty')
        ->toContain('Search options');
});

it('omits the search box when searching is turned off', function () {
    $html = renderSelectField('<x-me::select-field name="s" :searchable="false" :options="[]" />');

    expect($html)->not->toContain('data-me-select-search');
});

it('surfaces validation errors like any other field', function () {
    $this->shareErrors('tags', 'Pick at least one tag.');

    $html = renderSelectField('<x-me::select-field name="tags" :label="\'Tags\'" :options="[]" />');

    expect($html)
        ->toContain('aria-invalid="true"')
        ->toContain('Pick at least one tag.');
});

it('translates its chrome', function () {
    app()->setLocale('pt_BR');

    $html = renderSelectField('<x-me::select-field name="s" :options="[]" />');

    expect($html)
        ->toContain('Buscar opções')
        ->toContain('Selecione uma opção')
        ->toContain('Nenhuma opção corresponde');
});

it('offers all three colour modes with system first', function () {
    $html = Blade::render('<x-me::theme-menu />');

    expect($html)
        ->toContain('data-me-theme="system"')
        ->toContain('data-me-theme="light"')
        ->toContain('data-me-theme="dark"');

    // System is the default, so it leads the list.
    expect(strpos($html, 'data-me-theme="system"'))
        ->toBeLessThan((int) strpos($html, 'data-me-theme="light"'));
});

it('shows the selected mode on the cycling toggle', function () {
    $html = Blade::render('<x-me::theme-toggle />');

    expect($html)
        ->toContain('me-theme-icon-system')
        ->toContain('me-theme-icon-light')
        ->toContain('me-theme-icon-dark')
        ->toContain('data-me-theme');
});
