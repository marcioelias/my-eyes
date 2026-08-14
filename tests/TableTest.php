<?php

declare(strict_types=1);

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use MyEyes\Filters\FilterType;
use MyEyes\Table\Column;
use MyEyes\Table\Table;
use MyEyes\Tests\Fixtures\Record;

beforeEach(function () {
    Schema::create('records', function (Blueprint $table) {
        $table->increments('id');
        $table->string('name');
        $table->string('email');
        $table->string('status');
        $table->integer('amount');
        $table->string('notes')->nullable();
    });

    Record::insert([
        ['name' => 'Ana Souza', 'email' => 'ana@example.com', 'status' => 'active', 'amount' => 300, 'notes' => 'vip'],
        ['name' => 'Bruno Lima', 'email' => 'bruno@example.com', 'status' => 'banned', 'amount' => 100, 'notes' => null],
        ['name' => 'Carla Dias', 'email' => 'carla@example.com', 'status' => 'active', 'amount' => 200, 'notes' => ''],
    ]);
});

/**
 * @param  array<string, mixed>  $query
 */
function table(array $query = []): Table
{
    return Table::make(Record::query(), [
        Column::make('name')->sortable()->searchable(),
        Column::make('email')->searchable(),
        Column::make('status')->filterable(FilterType::Select, ['active' => 'Active', 'banned' => 'Banned']),
        Column::make('amount')->sortable()->filterable(FilterType::Number)->numeric(),
        Column::make('notes')->filterable(FilterType::Text),
    ])->forRequest(Request::create('/records', 'GET', $query));
}

it('returns every row with no parameters', function () {
    expect(table()->rows())->toHaveCount(3);
});

it('sorts by a sortable column', function () {
    $names = table(['sort' => 'name', 'direction' => 'desc'])->rows()->pluck('name')->all();

    expect($names)->toBe(['Carla Dias', 'Bruno Lima', 'Ana Souza']);
});

it('defaults to ascending when no direction is given', function () {
    expect(table(['sort' => 'amount'])->rows()->pluck('amount')->all())->toBe([100, 200, 300]);
});

it('applies the default sort when the request asks for nothing', function () {
    $table = Table::make(Record::query(), [Column::make('amount')->sortable()])
        ->defaultSort('amount', 'desc')
        ->forRequest(Request::create('/records'));

    expect($table->rows()->pluck('amount')->all())->toBe([300, 200, 100]);
});

it('ignores a sort on a column that is not sortable', function () {
    // "status" exists but was never marked sortable — it must not reach ORDER BY.
    $table = table(['sort' => 'status', 'direction' => 'desc']);

    expect($table->sortKey())->toBeNull();
    expect($table->rows())->toHaveCount(3);
});

it('ignores a sort on a column that does not exist', function () {
    expect(table(['sort' => 'password', 'direction' => 'desc'])->sortKey())->toBeNull();
});

it('searches across searchable columns only', function () {
    // Matches the email column, which is searchable.
    expect(table(['q' => 'bruno@'])->rows())->toHaveCount(1);

    // "active" appears in status, which is not searchable.
    expect(table(['q' => 'active'])->rows())->toHaveCount(0);
});

it('treats wildcards in the search term literally', function () {
    expect(table(['q' => '%'])->rows())->toHaveCount(0);
});

it('paginates and honours a whitelisted page size', function () {
    $table = table(['per_page' => 10]);

    expect($table->currentPerPage())->toBe(10);
    expect($table->paginator()->perPage())->toBe(10);
});

it('falls back to the default page size when the request asks for an unlisted one', function () {
    expect(table(['per_page' => 9999])->currentPerPage())->toBe(25);
});

it('filters with a select equals condition', function () {
    $rows = table(['filters' => [
        ['field' => 'status', 'operator' => 'eq', 'values' => ['active']],
    ]])->rows();

    expect($rows)->toHaveCount(2);
});

it('filters with a numeric range', function () {
    $rows = table(['filters' => [
        ['field' => 'amount', 'operator' => 'between', 'values' => ['150', '350']],
    ]])->rows()->pluck('amount')->all();

    expect($rows)->toBe([300, 200]);
});

it('combines multiple conditions with AND', function () {
    $rows = table(['filters' => [
        ['field' => 'status', 'operator' => 'eq', 'values' => ['active']],
        ['field' => 'amount', 'operator' => 'gt', 'values' => ['250']],
    ]])->rows();

    expect($rows)->toHaveCount(1);
    expect($rows->first()->name)->toBe('Ana Souza');
});

it('treats null and empty string alike for is-empty', function () {
    $rows = table(['filters' => [
        ['field' => 'notes', 'operator' => 'empty', 'values' => []],
    ]])->rows();

    // Bruno is NULL, Carla is ''.
    expect($rows->pluck('name')->all())->toEqualCanonicalizing(['Bruno Lima', 'Carla Dias']);
});

it('rejects a filter on a column that is not filterable', function () {
    // "name" is searchable and sortable, but never marked filterable.
    $table = table(['filters' => [
        ['field' => 'name', 'operator' => 'eq', 'values' => ['Ana Souza']],
    ]]);

    expect($table->filters()->isEmpty())->toBeTrue();
    expect($table->rows())->toHaveCount(3);
});

it('rejects a filter on a column that does not exist', function () {
    $table = table(['filters' => [
        ['field' => 'password', 'operator' => 'eq', 'values' => ['x']],
    ]]);

    expect($table->filters()->isEmpty())->toBeTrue();
});

it('rejects an operator the column type does not offer', function () {
    // "contains" is a text operator; status is a select.
    $table = table(['filters' => [
        ['field' => 'status', 'operator' => 'contains', 'values' => ['act']],
    ]]);

    expect($table->filters()->isEmpty())->toBeTrue();
});

it('skips a condition that is missing its value', function () {
    $table = table(['filters' => [
        ['field' => 'status', 'operator' => 'eq', 'values' => ['']],
    ]]);

    expect($table->filters()->isEmpty())->toBeTrue();
    expect($table->rows())->toHaveCount(3);
});

it('survives a malformed filters parameter', function () {
    expect(table(['filters' => 'not-an-array'])->rows())->toHaveCount(3);
    expect(table(['filters' => ['garbage']])->rows())->toHaveCount(3);
});

it('uses a custom sort handler when the column defines one', function () {
    $table = Table::make(Record::query(), [
        Column::make('name')->sortable()->sortUsing(
            fn ($query, string $direction) => $query->orderBy('amount', $direction)
        ),
    ])->forRequest(Request::create('/records', 'GET', ['sort' => 'name', 'direction' => 'desc']));

    expect($table->rows()->pluck('amount')->all())->toBe([300, 200, 100]);
});

it('uses a custom filter handler when the column defines one', function () {
    $table = Table::make(Record::query(), [
        Column::make('label')
            ->filterable(FilterType::Text)
            ->filterUsing(fn ($query, $condition) => $query->where('name', 'like', $condition->firstValue().'%')),
    ])->forRequest(Request::create('/records', 'GET', ['filters' => [
        ['field' => 'label', 'operator' => 'contains', 'values' => ['Ana']],
    ]]));

    expect($table->rows())->toHaveCount(1);
});

it('namespaces query parameters when the table is named', function () {
    $table = Table::make(Record::query(), [Column::make('amount')->sortable()])
        ->name('orders')
        ->forRequest(Request::create('/records', 'GET', ['orders_sort' => 'amount', 'orders_direction' => 'desc']));

    expect($table->parameter('sort'))->toBe('orders_sort');
    expect($table->rows()->pluck('amount')->all())->toBe([300, 200, 100]);
});

it('builds sort urls that toggle direction and reset the page', function () {
    $table = table(['sort' => 'name', 'direction' => 'asc', 'page' => 3]);
    $column = $table->columns()['name'];

    $url = $table->sortUrl($column);

    expect($url)->toContain('direction=desc');
    expect($url)->not->toContain('page=3');
});

it('exposes a filter schema limited to filterable columns', function () {
    $schema = table()->filterSchema();

    expect(collect($schema)->pluck('key')->all())->toBe(['status', 'amount', 'notes']);

    $status = collect($schema)->firstWhere('key', 'status');
    expect($status['options'])->toBe(['active' => 'Active', 'banned' => 'Banned']);
    expect(collect($status['operators'])->pluck('value'))->toContain('eq')->not->toContain('contains');
});
