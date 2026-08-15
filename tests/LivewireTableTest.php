<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Livewire\Livewire;
use MyEyes\Filters\FilterType;
use MyEyes\Livewire\TableComponent;
use MyEyes\Table\Column;
use MyEyes\Tests\Fixtures\Record;

/**
 * @see docs/features/livewire-package.md
 */
beforeEach(function () {
    Schema::create('records', function (Blueprint $table) {
        $table->increments('id');
        $table->string('name');
        $table->string('email');
        $table->string('status');
        $table->integer('amount');
        $table->string('notes')->nullable();
    });

    foreach (range(1, 30) as $number) {
        Record::insert([
            'name' => sprintf('Person %02d', $number),
            'email' => "person{$number}@example.com",
            'status' => $number % 2 === 0 ? 'active' : 'banned',
            'amount' => $number * 10,
            'notes' => null,
        ]);
    }
});

class RecordsTable extends TableComponent
{
    protected function query(): Builder
    {
        return Record::query();
    }

    protected function columns(): array
    {
        return [
            Column::make('name')->sortable()->searchable(),
            Column::make('status')->filterable(FilterType::Select, ['active' => 'Active', 'banned' => 'Banned']),
            Column::make('amount')->sortable(),
        ];
    }
}

final class NamedRecordsTable extends RecordsTable
{
    protected function tableName(): ?string
    {
        return 'records';
    }
}

it('renders rows without any state', function () {
    Livewire::test(RecordsTable::class)
        ->assertSee('Person 01')
        ->assertSee('Person 25');
});

it('sorts by a column and toggles direction', function () {
    Livewire::test(RecordsTable::class)
        ->call('sortBy', 'amount')
        ->assertSet('sort', 'amount')
        ->assertSet('direction', 'asc')
        ->call('sortBy', 'amount')
        ->assertSet('direction', 'desc')
        ->assertSeeInOrder(['Person 30', 'Person 29']);
});

it('starts a new column ascending', function () {
    Livewire::test(RecordsTable::class)
        ->call('sortBy', 'amount')
        ->call('sortBy', 'amount')
        ->call('sortBy', 'name')
        ->assertSet('sort', 'name')
        ->assertSet('direction', 'asc');
});

it('returns to the first page when the sort changes', function () {
    Livewire::test(RecordsTable::class)
        ->call('gotoPage', 2)
        ->assertSet('paginators.page', 2)
        ->call('sortBy', 'name')
        ->assertSet('paginators.page', 1);
});

it('returns to the first page when the search changes', function () {
    Livewire::test(RecordsTable::class)
        ->call('gotoPage', 2)
        ->set('search', 'Person 1')
        ->assertSet('paginators.page', 1);
});

it('searches across searchable columns', function () {
    Livewire::test(RecordsTable::class)
        ->set('search', 'Person 07')
        ->assertSee('Person 07')
        ->assertDontSee('Person 08');
});

it('applies a filter set from the panel', function () {
    Livewire::test(RecordsTable::class)
        ->call('applyFilters', [['field' => 'status', 'operator' => 'eq', 'values' => ['active']]], 'and')
        ->assertSet('filters', [['field' => 'status', 'operator' => 'eq', 'values' => ['active']]])
        ->assertSee('Person 02')
        ->assertDontSee('Person 01');
});

it('ignores a filter on a column that is not filterable', function () {
    // "name" is searchable and sortable, but was never marked filterable.
    Livewire::test(RecordsTable::class)
        ->call('applyFilters', [['field' => 'name', 'operator' => 'eq', 'values' => ['Person 01']]], 'and')
        ->assertSee('Person 02');
});

it('ignores a sort on a column that is not sortable', function () {
    Livewire::test(RecordsTable::class)
        ->call('sortBy', 'status')
        // The property changed, but the query did not: the table drops it.
        ->assertSet('sort', 'status')
        ->assertSeeInOrder(['Person 01', 'Person 02']);
});

it('clears search and filters but keeps the sort', function () {
    Livewire::test(RecordsTable::class)
        ->call('sortBy', 'amount')
        ->set('search', 'Person 07')
        ->call('applyFilters', [['field' => 'status', 'operator' => 'eq', 'values' => ['active']]], 'or')
        ->call('resetTable')
        ->assertSet('search', '')
        ->assertSet('filters', [])
        ->assertSet('conjunction', 'and')
        ->assertSet('sort', 'amount');
});

it('honours a page size the table offers and ignores one it does not', function () {
    Livewire::test(RecordsTable::class)
        ->set('perPage', 10)
        ->assertDontSee('Person 11')
        ->set('perPage', 999)
        ->assertSee('Person 11');
});

it('returns to the first page when the page size changes', function () {
    Livewire::test(RecordsTable::class)
        ->call('gotoPage', 2)
        ->set('perPage', 10)
        ->assertSet('paginators.page', 1);
});

it('normalises the conjunction to and or or', function () {
    Livewire::test(RecordsTable::class)
        ->call('applyFilters', [], 'nonsense')
        ->assertSet('conjunction', 'and');
});

it('restores state from the query string', function () {
    Livewire::withQueryParams(['sort' => 'amount', 'direction' => 'desc', 'q' => 'Person'])
        ->test(RecordsTable::class)
        ->assertSet('sort', 'amount')
        ->assertSet('direction', 'desc')
        ->assertSet('search', 'Person')
        ->assertSeeInOrder(['Person 30', 'Person 29']);
});

it('reads a named table state from its own prefixed keys', function () {
    Livewire::withQueryParams(['records_sort' => 'amount', 'records_direction' => 'desc', 'sort' => 'name'])
        ->test(NamedRecordsTable::class)
        ->assertSet('sort', 'amount')
        ->assertSet('direction', 'desc')
        ->assertSeeInOrder(['Person 30', 'Person 29']);
});

it('pages a named table under its own page key', function () {
    Livewire::test(NamedRecordsTable::class)
        ->call('gotoPage', 2, 'records_page')
        ->assertSet('paginators.records_page', 2)
        ->assertSee('Person 26');
});
