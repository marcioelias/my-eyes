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

    Record::insert([
        ['name' => 'Ana', 'status' => 'active', 'amount' => 100],
        ['name' => 'Bruno', 'status' => 'banned', 'amount' => 200],
        ['name' => 'Carla', 'status' => 'active', 'amount' => 300],
    ]);
});

/**
 * @param  array<int, array<string, mixed>>  $filters
 * @param  array<string, mixed>  $extra
 * @return array<int, string>
 */
function conjoined(array $filters, string $conjunction, array $extra = []): array
{
    $table = Table::make(Record::query(), [
        Column::make('name')->searchable()->filterable(FilterType::Text),
        Column::make('status')->filterable(FilterType::Select, ['active' => 'A', 'banned' => 'B']),
        Column::make('amount')->filterable(FilterType::Number),
    ])->forRequest(Request::create('/records', 'GET', array_merge([
        'filters' => $filters,
        'conjunction' => $conjunction,
    ], $extra)));

    return $table->rows()->pluck('name')->all();
}

it('joins conditions with AND by default', function () {
    $names = conjoined([
        ['field' => 'status', 'operator' => 'eq', 'values' => ['active']],
        ['field' => 'amount', 'operator' => 'gt', 'values' => ['250']],
    ], 'and');

    expect($names)->toBe(['Carla']);
});

it('joins conditions with OR when asked', function () {
    $names = conjoined([
        ['field' => 'status', 'operator' => 'eq', 'values' => ['banned']],
        ['field' => 'amount', 'operator' => 'gt', 'values' => ['250']],
    ], 'or');

    expect($names)->toBe(['Bruno', 'Carla']);
});

it('falls back to AND for an unknown conjunction', function () {
    $names = conjoined([
        ['field' => 'status', 'operator' => 'eq', 'values' => ['banned']],
        ['field' => 'amount', 'operator' => 'gt', 'values' => ['250']],
    ], 'nonsense');

    expect($names)->toBe([]);
});

it('keeps an OR group from widening the quick search', function () {
    /*
     * The dangerous case: search narrows to Ana, and the OR filters must be
     * applied to that subset. Without the surrounding group the ORs would leak
     * out and pull Bruno and Carla back in.
     */
    $names = conjoined([
        ['field' => 'status', 'operator' => 'eq', 'values' => ['banned']],
        ['field' => 'amount', 'operator' => 'gt', 'values' => ['250']],
    ], 'or', ['q' => 'Ana']);

    expect($names)->toBe([]);
});

it('keeps an OR group from widening a date range into separate clauses', function () {
    Schema::drop('records');
    Schema::create('records', function (Blueprint $table) {
        $table->increments('id');
        $table->string('name');
        $table->string('status');
        $table->dateTime('placed_at');
    });

    Record::insert([
        ['name' => 'in range', 'status' => 'active', 'placed_at' => '2026-01-15 10:00:00'],
        ['name' => 'out of range', 'status' => 'banned', 'placed_at' => '2026-06-01 10:00:00'],
    ]);

    $table = Table::make(Record::query(), [
        Column::make('status')->filterable(FilterType::Select, ['active' => 'A', 'banned' => 'B']),
        Column::make('placed_at')->filterable(FilterType::Date),
    ])->forRequest(Request::create('/records', 'GET', [
        'conjunction' => 'or',
        'filters' => [
            ['field' => 'status', 'operator' => 'eq', 'values' => ['nobody']],
            // A range is two clauses; they must stay bound together under OR.
            ['field' => 'placed_at', 'operator' => 'between', 'values' => ['2026-01-01', '2026-01-31']],
        ],
    ]));

    expect($table->rows()->pluck('name')->all())->toBe(['in range']);
});

it('exposes the conjunction to the view', function () {
    $table = Table::make(Record::query(), [Column::make('status')->filterable()])
        ->forRequest(Request::create('/records', 'GET', ['conjunction' => 'or']));

    expect($table->filters()->conjunction)->toBe('or');
    expect($table->filters()->isOr())->toBeTrue();
});

it('clears the conjunction along with the filters on reset', function () {
    $table = Table::make(Record::query(), [Column::make('status')->filterable()])
        ->forRequest(Request::create('/records', 'GET', ['conjunction' => 'or', 'q' => 'x']));

    expect($table->resetUrl())->not->toContain('conjunction');
});

it('renders the conjunction into the filter panel', function () {
    $table = Table::make(Record::query(), [Column::make('status')->filterable()])
        ->forRequest(Request::create('/records', 'GET', ['conjunction' => 'or']));

    $html = Blade::render('<x-me::filters :table="$table" />', ['table' => $table]);

    expect($html)->toContain('data-conjunction="or"');
});
