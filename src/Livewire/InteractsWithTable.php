<?php

declare(strict_types=1);

namespace MyEyes\Livewire;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\Request;
use Livewire\WithPagination;
use MyEyes\Table\Column;
use MyEyes\Table\Table;

/**
 * Table state for a Livewire component.
 *
 * The query building is not reimplemented here. The properties are gathered
 * into a Request and handed to MyEyes\Table\Table, which sorts, searches,
 * filters and paginates exactly as it does for Blade — including discarding a
 * sort on a column that is not sortable, or an operator a column's type does
 * not offer. A property is a request parameter by another name, and is trusted
 * exactly as little.
 *
 * The keys are the ones the Blade table uses, so a URL produced by one renders
 * the same table in the other.
 *
 * @see docs/features/livewire-package.md
 */
trait InteractsWithTable
{
    use WithPagination;

    public string $sort = '';

    public string $direction = '';

    public string $search = '';

    /** Null means "whatever the table declared", so it stays out of the URL. */
    public ?int $perPage = null;

    /** @var array<int, array<string, mixed>> */
    public array $filters = [];

    public string $conjunction = 'and';

    /**
     * Namespaces this table's query string keys, for more than one on a page.
     * Override it to name the table.
     */
    protected function tableName(): ?string
    {
        return null;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    protected function queryStringInteractsWithTable(): array
    {
        return [
            'sort' => ['as' => $this->tableParameter('sort'), 'except' => ''],
            'direction' => ['as' => $this->tableParameter('direction'), 'except' => ''],
            'search' => ['as' => $this->tableParameter('q'), 'except' => ''],
            'perPage' => ['as' => $this->tableParameter('per_page'), 'except' => null],
            'filters' => ['as' => $this->tableParameter('filters'), 'except' => []],
            'conjunction' => ['as' => $this->tableParameter('conjunction'), 'except' => 'and'],
        ];
    }

    /**
     * Builds the table from the component's current state.
     *
     * @param  array<int, Column>  $columns
     */
    protected function buildTable(EloquentBuilder|QueryBuilder|Relation $query, array $columns): Table
    {
        $table = Table::make($query, $columns);

        if ($this->tableName() !== null) {
            $table->name($this->tableName());
        }

        return $table->forRequest($this->tableRequest());
    }

    /**
     * The component's state, shaped as the request Table already knows how to
     * read. Page is absent on purpose: Livewire resolves the current page
     * through its own paginator, which is what keeps wire:click paging working.
     */
    private function tableRequest(): Request
    {
        return Request::create('/', 'GET', [
            $this->tableParameter('sort') => $this->sort,
            $this->tableParameter('direction') => $this->direction,
            $this->tableParameter('q') => $this->search,
            $this->tableParameter('per_page') => $this->perPage,
            $this->tableParameter('filters') => $this->filters,
            $this->tableParameter('conjunction') => $this->conjunction,
        ]);
    }

    protected function tableParameter(string $key): string
    {
        return Table::parameterFor($this->tableName(), $key);
    }

    /**
     * Sorts by a column, toggling direction when it is already the active one.
     */
    public function sortBy(string $key): void
    {
        if ($this->sort === $key) {
            $this->direction = $this->direction === 'asc' ? 'desc' : 'asc';
        } else {
            $this->sort = $key;
            $this->direction = 'asc';
        }

        $this->resetTablePage();
    }

    /**
     * Replaces the whole condition set, as the filter panel hands it over.
     *
     * @param  array<int, array<string, mixed>>  $filters
     */
    public function applyFilters(array $filters = [], string $conjunction = 'and'): void
    {
        $this->filters = array_values($filters);
        $this->conjunction = $conjunction === 'or' ? 'or' : 'and';

        $this->resetTablePage();
    }

    /** Clears search and filters, leaving sort and page size alone. */
    public function resetTable(): void
    {
        $this->search = '';
        $this->filters = [];
        $this->conjunction = 'and';

        $this->resetTablePage();
    }

    /*
     * Row order and the result set both changed, so the page the user was on
     * no longer means anything.
     */

    public function updatedSearch(): void
    {
        $this->resetTablePage();
    }

    public function updatedPerPage(): void
    {
        $this->resetTablePage();
    }

    protected function resetTablePage(): void
    {
        $this->resetPage($this->tableParameter('page'));
    }
}
