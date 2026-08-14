<?php

declare(strict_types=1);

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use MyEyes\Filters\FilterType;
use MyEyes\Table\Column;
use MyEyes\Table\Table;
use MyEyes\Tests\Fixtures\Record;

/*
 * An <input type="date"> submits "2026-01-31" with no time. Against a datetime
 * column that means midnight, so a naive filter silently drops everything
 * recorded during the final day. These cover the boundaries in both directions.
 */

beforeEach(function () {
    Schema::create('records', function (Blueprint $table) {
        $table->increments('id');
        $table->string('name');
        $table->dateTime('placed_at');
    });

    Record::insert([
        ['name' => 'before', 'placed_at' => '2026-01-30 23:59:59'],
        ['name' => 'start of day', 'placed_at' => '2026-01-31 00:00:00'],
        ['name' => 'midday', 'placed_at' => '2026-01-31 12:30:00'],
        ['name' => 'end of day', 'placed_at' => '2026-01-31 23:59:59'],
        ['name' => 'after', 'placed_at' => '2026-02-01 00:00:01'],
    ]);
});

/**
 * @param  array<int, string>  $values
 * @return array<int, string>
 */
function dateFilter(string $operator, array $values): array
{
    $table = Table::make(Record::query(), [
        Column::make('placed_at')->filterable(FilterType::Date),
    ])->forRequest(Request::create('/records', 'GET', [
        'filters' => [['field' => 'placed_at', 'operator' => $operator, 'values' => $values]],
    ]));

    return $table->rows()->pluck('name')->all();
}

it('includes the whole final day of a between range', function () {
    $names = dateFilter('between', ['2026-01-31', '2026-01-31']);

    expect($names)->toBe(['start of day', 'midday', 'end of day']);
});

it('spans multiple days inclusively', function () {
    expect(dateFilter('between', ['2026-01-30', '2026-02-01']))
        ->toHaveCount(5);
});

it('treats equals as the entire day', function () {
    expect(dateFilter('eq', ['2026-01-31']))
        ->toBe(['start of day', 'midday', 'end of day']);
});

it('excludes the entire day for not equals', function () {
    expect(dateFilter('neq', ['2026-01-31']))->toBe(['before', 'after']);
});

it('starts after the day ends for greater than', function () {
    expect(dateFilter('gt', ['2026-01-31']))->toBe(['after']);
});

it('includes the day itself for greater or equal', function () {
    expect(dateFilter('gte', ['2026-01-31']))
        ->toBe(['start of day', 'midday', 'end of day', 'after']);
});

it('stops before the day starts for less than', function () {
    expect(dateFilter('lt', ['2026-01-31']))->toBe(['before']);
});

it('includes the whole day for less or equal', function () {
    expect(dateFilter('lte', ['2026-01-31']))
        ->toBe(['before', 'start of day', 'midday', 'end of day']);
});

it('uses a value that already carries a time verbatim', function () {
    expect(dateFilter('gte', ['2026-01-31 12:00:00']))
        ->toBe(['midday', 'end of day', 'after']);
});

it('offers between among the date operators', function () {
    $operators = array_map(
        fn ($operator) => $operator->value,
        FilterType::Date->operators(),
    );

    expect($operators)->toContain('between')->toContain('gte')->toContain('lte');
});
