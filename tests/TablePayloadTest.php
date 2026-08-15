<?php

declare(strict_types=1);

use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\HtmlString;
use MyEyes\Filters\FilterType;
use MyEyes\Table\Column;
use MyEyes\Table\Table;
use MyEyes\Table\UnserialisableColumn;
use MyEyes\Tests\Fixtures\Record;

/**
 * The payload contract consumed by the Vue and React tables.
 *
 * @see docs/policies/table-payload.md
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

    Record::insert([
        ['name' => 'Ana Souza', 'email' => 'ana@example.com', 'status' => 'active', 'amount' => 300, 'notes' => 'vip'],
        ['name' => 'Bruno Lima', 'email' => 'bruno@example.com', 'status' => 'banned', 'amount' => 100, 'notes' => null],
        ['name' => 'Carla Dias', 'email' => 'carla@example.com', 'status' => 'active', 'amount' => 200, 'notes' => ''],
    ]);
});

/**
 * @param  array<int, Column>  $columns
 * @param  array<string, mixed>  $query
 */
function payloadTable(array $columns, array $query = []): Table
{
    return Table::make(Record::query(), $columns)
        ->forRequest(Request::create('/records', 'GET', $query));
}

it('describes every column', function () {
    $payload = payloadTable([
        Column::make('name', 'Name')->sortable()->searchable(),
        Column::make('amount', 'Amount')->numeric()->filterable(FilterType::Number),
    ])->toPayload();

    expect($payload['columns'])->toBe([
        ['key' => 'name', 'label' => 'Name', 'align' => 'start', 'sortable' => true, 'searchable' => true, 'filterable' => false, 'html' => false],
        ['key' => 'amount', 'label' => 'Amount', 'align' => 'end', 'sortable' => false, 'searchable' => false, 'filterable' => true, 'html' => false],
    ]);
});

it('carries only the declared columns in each row', function () {
    // "email" is a real database column, but the table never declared it.
    $payload = payloadTable([Column::make('name')])->toPayload();

    expect($payload['rows'][0])->toBe(['name' => 'Ana Souza'])
        ->and($payload['rows'][0])->not->toHaveKey('email');
});

it('passes values through the format closure', function () {
    $payload = payloadTable([
        Column::make('amount')->format(fn (int $amount): string => "R$ {$amount}"),
    ])->toPayload();

    expect($payload['rows'][0]['amount'])->toBe('R$ 300');
});

it('keeps null values null', function () {
    $payload = payloadTable([Column::make('notes')], ['sort' => 'id'])->toPayload();

    expect($payload['rows'][1]['notes'])->toBeNull();
});

it('reports the state that was applied, not the state requested', function () {
    // "status" is not sortable and 999 is not an offered page size (P-02).
    $payload = payloadTable([
        Column::make('name')->sortable(),
        Column::make('status'),
    ], ['sort' => 'status', 'direction' => 'desc', 'per_page' => 999])->toPayload();

    expect($payload['sort']['key'])->toBeNull()
        ->and($payload['pagination']['perPage'])->toBe(25);
});

it('drops a filter on a column that is not filterable', function () {
    $payload = payloadTable([
        Column::make('name'),
        Column::make('status'),
    ], [
        'filters' => [['field' => 'status', 'operator' => 'eq', 'values' => ['active']]],
    ])->toPayload();

    expect($payload['filters']['conditions'])->toBe([])
        ->and($payload['rows'])->toHaveCount(3);
});

it('reports the applied sort, search and filters', function () {
    $payload = payloadTable([
        Column::make('name')->sortable()->searchable(),
        Column::make('status')->filterable(FilterType::Select, ['active' => 'Active']),
    ], [
        'sort' => 'name',
        'direction' => 'desc',
        'q' => 'a',
        'conjunction' => 'or',
        'filters' => [['field' => 'status', 'operator' => 'eq', 'values' => ['active']]],
    ])->toPayload();

    expect($payload['sort'])->toBe(['key' => 'name', 'direction' => 'desc'])
        ->and($payload['search'])->toBe('a')
        ->and($payload['filters']['conjunction'])->toBe('or')
        ->and($payload['filters']['conditions'])->toBe([
            ['field' => 'status', 'operator' => 'eq', 'values' => ['active']],
        ]);
});

it('describes pagination', function () {
    $payload = payloadTable([Column::make('name')], ['per_page' => 10])->toPayload();

    expect($payload['pagination'])->toBe([
        'page' => 1,
        'perPage' => 10,
        'total' => 3,
        'lastPage' => 1,
        'from' => 1,
        'to' => 3,
    ])->and($payload['perPageOptions'])->toBe([10, 25, 50, 100]);
});

it('reports no range on an empty page', function () {
    $payload = payloadTable([Column::make('name')->searchable()], ['q' => 'nobody'])->toPayload();

    expect($payload['rows'])->toBe([])
        ->and($payload['pagination']['total'])->toBe(0)
        ->and($payload['pagination']['from'])->toBeNull()
        ->and($payload['pagination']['to'])->toBeNull();
});

it('includes the filter schema the builder needs', function () {
    $payload = payloadTable([
        Column::make('status')->filterable(FilterType::Select, ['active' => 'Active']),
    ])->toPayload();

    expect($payload['schema'])->toHaveCount(1)
        ->and($payload['schema'][0]['key'])->toBe('status')
        ->and($payload['schema'][0]['options'])->toBe(['active' => 'Active']);
});

it('prefixes nothing in the payload when the table is named', function () {
    // The prefix belongs to the query string, not to the payload's own keys.
    $payload = Table::make(Record::query(), [Column::make('name')->sortable()])
        ->name('users')
        ->forRequest(Request::create('/records', 'GET', ['users_sort' => 'name', 'users_direction' => 'desc']))
        ->toPayload();

    expect($payload['sort'])->toBe(['key' => 'name', 'direction' => 'desc']);
});

it('refuses to serialise a column that renders markup', function () {
    payloadTable([
        Column::make('status')->format(fn (string $status): HtmlString => new HtmlString("<b>{$status}</b>")),
    ])->toPayload();
})->throws(UnserialisableColumn::class, 'Column [status] renders markup');

it('sends markup when the column opted in', function () {
    $payload = payloadTable([
        Column::make('status')
            ->html()
            ->format(fn (string $status): HtmlString => new HtmlString("<b>{$status}</b>")),
    ], ['sort' => 'id'])->toPayload();

    expect($payload['columns'][0]['html'])->toBeTrue()
        ->and($payload['rows'][0]['status'])->toBe('<b>active</b>');
});

it('refuses to serialise a value JSON cannot carry', function () {
    payloadTable([
        Column::make('name')->format(fn (): object => new stdClass),
    ])->toPayload();
})->throws(UnserialisableColumn::class, 'Column [name] resolved to a value of type [stdClass]');

it('normalises dates and enums', function () {
    $payload = payloadTable([
        Column::make('name')->format(fn (): DateTimeImmutable => new DateTimeImmutable('2026-02-01 10:30:00', new DateTimeZone('UTC'))),
        Column::make('status')->format(fn (string $status): Status => Status::from($status)),
    ], ['sort' => 'id'])->toPayload();

    expect($payload['rows'][0]['name'])->toBe('2026-02-01T10:30:00+00:00')
        ->and($payload['rows'][0]['status'])->toBe('active');
});

it('encodes itself as JSON for a route to return', function () {
    $table = payloadTable([Column::make('name')]);

    expect($table)->toBeInstanceOf(Jsonable::class)
        ->and(json_decode($table->toJson(), true))->toBe($table->toPayload());
});

enum Status: string
{
    case Active = 'active';
    case Banned = 'banned';
}
