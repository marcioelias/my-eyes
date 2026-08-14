<?php

declare(strict_types=1);

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Schema;
use MyEyes\Filters\FilterType;
use MyEyes\Table\Column;
use MyEyes\Table\Table;
use MyEyes\Tests\Fixtures\Record;

beforeEach(function () {
    Schema::create('records', function (Blueprint $table) {
        $table->increments('id');
        $table->string('name');
        $table->string('status');
        $table->integer('amount');
    });

    foreach (range(1, 30) as $number) {
        Record::insert([
            'name' => "Record {$number}",
            'status' => $number % 2 === 0 ? 'active' : 'banned',
            'amount' => $number * 10,
        ]);
    }
});

/**
 * @param  array<string, mixed>  $query
 */
function renderTable(array $query = [], string $tag = '<x-me::table :table="$table" />'): string
{
    $table = Table::make(Record::query(), [
        Column::make('name', 'Name')->sortable()->searchable(),
        Column::make('status', 'Status')->filterable(FilterType::Select, ['active' => 'Active', 'banned' => 'Banned']),
        Column::make('amount', 'Amount')->sortable()->numeric()->format(fn (int $value): string => "R$ {$value}"),
    ])->forRequest(Request::create('/records', 'GET', $query));

    return Blade::render($tag, ['table' => $table]);
}

it('renders headers, rows and formatted cells', function () {
    $html = renderTable();

    expect($html)
        ->toContain('me-table-shell')
        ->toContain('me-table-viewport')
        ->toContain('Name')
        ->toContain('Record 1')
        ->toContain('R$ 10');
});

it('staggers rows with an index custom property', function () {
    expect(renderTable())->toContain('style="--me-row: 0"')->toContain('style="--me-row: 1"');
});

it('right-aligns numeric columns', function () {
    expect(renderTable())->toContain('me-table__cell--end');
});

it('marks the sorted column and links the opposite direction', function () {
    $html = renderTable(['sort' => 'name', 'direction' => 'asc']);

    expect($html)
        ->toContain('aria-sort="ascending"')
        ->toContain('direction=desc');
});

it('renders sort links only for sortable columns', function () {
    $html = renderTable();

    // Amount and Name are sortable; Status is not.
    expect(substr_count($html, 'me-table__sort"'))->toBe(2);
});

it('paginates and renders page controls', function () {
    $html = renderTable(['per_page' => 10]);

    expect($html)
        ->toContain('me-pagination')
        ->toContain('Showing 1–10 of 30')
        ->toContain('aria-current="page"');
});

it('offers page sizes as navigable urls', function () {
    $html = renderTable(['per_page' => 10]);

    expect($html)->toContain('data-me-navigate')->toContain('per_page=25');
});

it('renders the filter builder with a schema matching the columns', function () {
    $html = renderTable();

    expect($html)
        ->toContain('data-me-filters')
        ->toContain('data-me-filters-panel')
        // Only "status" is filterable.
        ->toContain('&quot;key&quot;:&quot;status&quot;')
        ->not->toContain('&quot;key&quot;:&quot;name&quot;');
});

it('shows the active filter count and a clear link', function () {
    $html = renderTable(['filters' => [
        ['field' => 'status', 'operator' => 'eq', 'values' => ['active']],
    ]]);

    expect($html)->toContain('me-badge--primary')->toContain('Clear all');
});

it('keeps sort and page size when the search form is submitted', function () {
    $html = renderTable(['sort' => 'name', 'direction' => 'desc', 'per_page' => 10]);

    expect($html)
        ->toContain('<input type="hidden" name="sort" value="name"')
        ->toContain('<input type="hidden" name="per_page" value="10"');
});

it('renders an empty state that reflects whether filters are active', function () {
    $unfiltered = renderTable(['q' => 'nothing-matches-this']);
    expect($unfiltered)->toContain('No records match these filters');

    Record::query()->delete();
    expect(renderTable())->toContain('No records found');
});

it('renders a confirm modal with role colour and a spoofed method', function () {
    $html = Blade::render(<<<'BLADE'
        <x-me::modal
            id="delete-user"
            variant="danger"
            title="Delete this account?"
            confirm="Delete"
            cancel="Cancel"
            action="/users/1"
            method="DELETE"
        >
            This cannot be undone.
        </x-me::modal>
    BLADE);

    expect($html)
        ->toContain('<dialog')
        ->toContain('me-modal--danger')
        ->toContain('aria-labelledby="delete-user-title"')
        ->toContain('me-btn--danger')
        ->toContain('data-me-modal-close')
        ->toContain('name="_method" value="DELETE"')
        ->toContain('name="_token"')
        ->toContain('This cannot be undone.');
});

it('renders a single-button modal when no cancel label is given', function () {
    $html = Blade::render('<x-me::modal id="done" variant="success" title="Saved" confirm="OK" />');

    expect($html)
        ->toContain('me-modal--success')
        ->toContain('OK')
        ->not->toContain('me-btn--secondary');
});
