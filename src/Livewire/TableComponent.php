<?php

declare(strict_types=1);

namespace MyEyes\Livewire;

use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Livewire\Component;
use MyEyes\Table\Column;
use MyEyes\Table\Table;

/**
 * A Livewire table: declare the query and the columns, get the rest.
 *
 * ```php
 * class UsersTable extends TableComponent
 * {
 *     protected function query(): Builder
 *     {
 *         return User::query();
 *     }
 *
 *     protected function columns(): array
 *     {
 *         return [
 *             Column::make('name', __('Name'))->sortable()->searchable(),
 *             Column::make('status', __('Status'))->filterable(FilterType::Select, [
 *                 'active' => __('Active'),
 *             ]),
 *         ];
 *     }
 * }
 * ```
 *
 * Extend it when the page is the table. When the table is one part of a larger
 * component, use InteractsWithTable directly instead.
 *
 * @see docs/features/livewire-package.md
 */
abstract class TableComponent extends Component
{
    use InteractsWithTable;

    /** Visual variants, matching the Blade component's props. */
    public bool $striped = false;

    public bool $compact = false;

    abstract protected function query(): EloquentBuilder|QueryBuilder|Relation;

    /**
     * @return array<int, Column>
     */
    abstract protected function columns(): array;

    public function table(): Table
    {
        return $this->buildTable($this->query(), $this->columns());
    }

    public function render(): View
    {
        // Resolved through the factory rather than the view() helper: the view
        // lives in this package's namespace, which only exists once the service
        // provider has registered it.
        return app(Factory::class)->make('my-eyes::livewire.table', [
            'table' => $this->table(),
            'striped' => $this->striped,
            'compact' => $this->compact,
        ]);
    }
}
