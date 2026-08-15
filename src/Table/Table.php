<?php

declare(strict_types=1);

namespace MyEyes\Table;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use MyEyes\Filters\FilterSet;

/**
 * A sortable, filterable, paginated table.
 *
 * Everything is driven by the query string, so the table works without
 * JavaScript, is linkable and back-button friendly:
 *
 *     ?sort=name&direction=asc&per_page=25&q=ana&filters[0][field]=status...
 *
 * Typical use — the controller declares, the view renders:
 *
 * ```php
 * $table = Table::make(User::query(), [
 *     Column::make('name', __('Name'))->sortable()->searchable(),
 *     Column::make('email', __('Email'))->sortable()->searchable(),
 *     Column::make('status', __('Status'))
 *         ->filterable(FilterType::Select, ['active' => 'Active', 'banned' => 'Banned'])
 *         ->format(fn (string $value) => view('cells.status', ['status' => $value])),
 *     Column::make('created_at', __('Created'))->sortable()->filterable(FilterType::Date),
 * ])->defaultSort('created_at', 'desc');
 *
 * return view('users.index', ['table' => $table]);
 * ```
 *
 * ```blade
 * <x-me::table :table="$table" />
 * ```
 *
 * Nothing here is required: a table with no sortable, filterable or searchable
 * column simply renders rows and pagination.
 */
final class Table implements Jsonable
{
    /** @var array<string, Column> */
    private array $columns = [];

    private ?string $defaultSortKey = null;

    private string $defaultSortDirection = 'asc';

    private int $defaultPerPage = 25;

    /** @var array<int, int> */
    private array $perPageOptions = [10, 25, 50, 100];

    /**
     * Prefix for the query string keys, for more than one table on a page.
     */
    private ?string $name = null;

    private ?Request $request = null;

    private ?LengthAwarePaginator $paginator = null;

    private ?FilterSet $filters = null;

    /**
     * @param  array<int, Column>  $columns
     */
    private function __construct(private readonly EloquentBuilder|QueryBuilder|Relation $query, array $columns)
    {
        foreach ($columns as $column) {
            $this->columns[$column->key()] = $column;
        }
    }

    /**
     * @param  array<int, Column>  $columns
     */
    public static function make(EloquentBuilder|QueryBuilder|Relation $query, array $columns = []): self
    {
        return new self($query, $columns);
    }

    /** Applied when the request does not ask for a specific order. */
    public function defaultSort(string $key, string $direction = 'asc'): self
    {
        $this->defaultSortKey = $key;
        $this->defaultSortDirection = self::normaliseDirection($direction);

        return $this;
    }

    public function perPage(int $perPage): self
    {
        $this->defaultPerPage = $perPage;

        return $this;
    }

    /**
     * @param  array<int, int>  $options
     */
    public function perPageOptions(array $options): self
    {
        $this->perPageOptions = $options;

        return $this;
    }

    /**
     * Namespaces this table's query string keys, so two tables on the same page
     * do not fight over `sort` and `page`.
     */
    public function name(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    /** Overrides the request, mostly useful in tests. */
    public function forRequest(Request $request): self
    {
        $this->request = $request;
        $this->paginator = null;

        return $this;
    }

    /** @return array<string, Column> */
    public function columns(): array
    {
        return $this->columns;
    }

    /** @return array<int, Column> */
    public function filterableColumns(): array
    {
        return array_values(array_filter($this->columns, static fn (Column $c): bool => $c->isFilterable()));
    }

    public function isSearchable(): bool
    {
        return array_filter($this->columns, static fn (Column $c): bool => $c->isSearchable()) !== [];
    }

    /** The query string key for a parameter, honouring the table name. */
    public function parameter(string $key): string
    {
        return $this->name === null ? $key : "{$this->name}_{$key}";
    }

    public function request(): Request
    {
        return $this->request ??= request();
    }

    public function sortKey(): ?string
    {
        return $this->requestedSortColumn()?->key() ?? $this->defaultSortKey;
    }

    public function sortDirection(): string
    {
        // The direction only counts alongside a sort column the table allows.
        if ($this->requestedSortColumn() !== null) {
            return self::normaliseDirection($this->request()->string($this->parameter('direction'))->toString());
        }

        return $this->defaultSortDirection;
    }

    private function requestedSortColumn(): ?Column
    {
        $requested = $this->request()->string($this->parameter('sort'))->toString();
        $column = $this->columns[$requested] ?? null;

        return $column !== null && $column->isSortable() ? $column : null;
    }

    public function search(): string
    {
        return trim($this->request()->string($this->parameter('q'))->toString());
    }

    public function filters(): FilterSet
    {
        return $this->filters ??= FilterSet::fromRequest(
            $this->requestForFilters(),
            $this->columns,
        );
    }

    /** @return array<int, int> */
    public function perPageChoices(): array
    {
        return $this->perPageOptions;
    }

    public function currentPerPage(): int
    {
        $requested = (int) $this->request()->input($this->parameter('per_page'), 0);

        return in_array($requested, $this->perPageOptions, true) ? $requested : $this->defaultPerPage;
    }

    /**
     * Runs the query. Memoised, so a view can call rows() and paginator()
     * without hitting the database twice.
     */
    public function paginator(): LengthAwarePaginator
    {
        return $this->paginator ??= $this->build();
    }

    /** @return Collection<int, mixed> */
    public function rows(): Collection
    {
        return new Collection($this->paginator()->items());
    }

    public function isEmpty(): bool
    {
        return $this->paginator()->total() === 0;
    }

    private function build(): LengthAwarePaginator
    {
        $query = $this->query;

        $this->applySearch($query);
        $this->filters()->apply($query, $this->columns);
        $this->applySort($query);

        /** @var LengthAwarePaginator $paginator */
        $paginator = $query->paginate(
            perPage: $this->currentPerPage(),
            pageName: $this->parameter('page'),
        );

        // Keeps sort, filters and search when following a page link.
        return $paginator->withQueryString();
    }

    private function applySearch(EloquentBuilder|QueryBuilder|Relation $query): void
    {
        $term = $this->search();

        if ($term === '') {
            return;
        }

        $searchable = array_filter($this->columns, static fn (Column $c): bool => $c->isSearchable());

        if ($searchable === []) {
            return;
        }

        // Grouped so the ORs cannot leak out and widen the filters.
        $query->where(function (EloquentBuilder|QueryBuilder $nested) use ($searchable, $term): void {
            foreach ($searchable as $column) {
                $handler = $column->searchHandler();

                if ($handler !== null) {
                    $handler($nested, $term);

                    continue;
                }

                $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $term);
                $nested->orWhere($column->target(), 'like', "%{$escaped}%");
            }
        });
    }

    private function applySort(EloquentBuilder|QueryBuilder|Relation $query): void
    {
        $key = $this->sortKey();

        if ($key === null) {
            return;
        }

        $column = $this->columns[$key] ?? null;

        if ($column === null || ! $column->isSortable()) {
            return;
        }

        $direction = $this->sortDirection();
        $handler = $column->sortHandler();

        if ($handler !== null) {
            $handler($query, $direction);

            return;
        }

        $query->orderBy($column->target(), $direction);
    }

    /**
     * Filters live under the table's own key when the table is named.
     */
    private function requestForFilters(): Request
    {
        if ($this->name === null) {
            return $this->request();
        }

        $scoped = $this->request()->input($this->parameter('filters'));

        return Request::create('/', 'GET', [
            'filters' => is_array($scoped) ? $scoped : [],
            'conjunction' => $this->request()->input($this->parameter('conjunction')),
        ]);
    }

    /**
     * URL that sorts by this column, toggling direction when it is already
     * the active one. Resets to page 1, since row order changed.
     */
    public function sortUrl(Column $column): string
    {
        $isActive = $this->sortKey() === $column->key();
        $direction = $isActive && $this->sortDirection() === 'asc' ? 'desc' : 'asc';

        return $this->urlWith([
            $this->parameter('sort') => $column->key(),
            $this->parameter('direction') => $direction,
            $this->parameter('page') => null,
        ]);
    }

    public function perPageUrl(int $perPage): string
    {
        return $this->urlWith([
            $this->parameter('per_page') => $perPage,
            $this->parameter('page') => null,
        ]);
    }

    public function resetUrl(): string
    {
        return $this->urlWith([
            $this->parameter('q') => null,
            $this->parameter('filters') => null,
            $this->parameter('conjunction') => null,
            $this->parameter('page') => null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    private function urlWith(array $parameters): string
    {
        return $this->request()->fullUrlWithQuery($parameters);
    }

    /**
     * The table as data, for clients that render rows themselves rather than
     * receiving markup — the Vue and React components.
     *
     * The state reported here is the state that was *applied*, not the state
     * that was requested: a sort on a column that is not sortable, or a page
     * size outside the offered options, is already gone by the time it reaches
     * this method. Clients render their controls from this, which is what
     * keeps them honest when the server rejects something.
     *
     * @see docs/policies/table-payload.md
     *
     * @return array<string, mixed>
     */
    public function toPayload(): array
    {
        $paginator = $this->paginator();

        return [
            'columns' => array_values(array_map(
                static fn (Column $column): array => $column->toPayload(),
                $this->columns,
            )),
            'rows' => $this->rows()
                ->map(fn (mixed $row): array => $this->rowPayload($row))
                ->all(),
            'sort' => [
                'key' => $this->sortKey(),
                'direction' => $this->sortDirection(),
            ],
            'search' => $this->search(),
            'filters' => [
                'conditions' => $this->filters()->toQuery(),
                'conjunction' => $this->filters()->conjunction,
            ],
            'schema' => $this->filterSchema(),
            'pagination' => [
                'page' => $paginator->currentPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'lastPage' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'perPageOptions' => $this->perPageOptions,
        ];
    }

    /**
     * Only declared columns reach the client, so an attribute the table never
     * exposed cannot leak through the payload.
     *
     * @return array<string, mixed>
     */
    private function rowPayload(mixed $row): array
    {
        $values = [];

        foreach ($this->columns as $key => $column) {
            $values[$key] = $column->toValue($row);
        }

        return $values;
    }

    /**
     * Lets a route return the table directly — Laravel turns a Jsonable into a
     * JSON response on its own, so the application needs no controller of its
     * own to serve one.
     */
    public function toJson($options = 0): string
    {
        return json_encode($this->toPayload(), $options | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    /**
     * Column definitions the filter builder needs on the client.
     *
     * @return array<int, array<string, mixed>>
     */
    public function filterSchema(): array
    {
        return array_map(
            static fn (Column $column): array => $column->toFilterSchema(),
            $this->filterableColumns(),
        );
    }

    private static function normaliseDirection(string $direction): string
    {
        return strtolower($direction) === 'desc' ? 'desc' : 'asc';
    }
}
