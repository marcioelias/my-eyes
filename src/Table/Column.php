<?php

declare(strict_types=1);

namespace MyEyes\Table;

use Closure;
use Illuminate\Contracts\Support\Htmlable;
use MyEyes\Filters\Condition;
use MyEyes\Filters\FilterType;
use MyEyes\Filters\Operator;

/**
 * One column of a table.
 *
 * The same definition drives three things — the header, the cell rendering and
 * the sort/filter whitelist — so a column can never be sortable in the UI but
 * rejected by the query, or vice versa.
 */
final class Column
{
    private string $label;

    private bool $sortable = false;

    private bool $filterable = false;

    private bool $searchable = false;

    private FilterType $type = FilterType::Text;

    private string $align = 'start';

    /** @var array<string|int, string> */
    private array $options = [];

    private ?Closure $format = null;

    private ?string $view = null;

    /**
     * The database column, when it differs from the key used for display.
     */
    private ?string $field = null;

    private ?Closure $sortUsing = null;

    private ?Closure $filterUsing = null;

    private ?Closure $searchUsing = null;

    private function __construct(private readonly string $key, ?string $label = null)
    {
        $this->label = $label ?? str($key)->afterLast('.')->headline()->toString();
    }

    public static function make(string $key, ?string $label = null): self
    {
        return new self($key, $label);
    }

    public function sortable(bool $sortable = true): self
    {
        $this->sortable = $sortable;

        return $this;
    }

    /**
     * Allows this column in the advanced filter builder.
     *
     * @param  array<string|int, string>  $options  Required for FilterType::Select.
     */
    public function filterable(FilterType $type = FilterType::Text, array $options = []): self
    {
        $this->filterable = true;
        $this->type = $type;
        $this->options = $options;

        return $this;
    }

    /** Includes this column in the quick search box. */
    public function searchable(bool $searchable = true): self
    {
        $this->searchable = $searchable;

        return $this;
    }

    public function type(FilterType $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function align(string $align): self
    {
        $this->align = $align;

        return $this;
    }

    /** Numbers read better right-aligned with matching digit widths. */
    public function numeric(): self
    {
        $this->type = FilterType::Number;
        $this->align = 'end';

        return $this;
    }

    public function field(string $field): self
    {
        $this->field = $field;

        return $this;
    }

    /**
     * Renders the cell. Return a Htmlable to emit markup, anything else is
     * escaped.
     *
     * @param  Closure(mixed, mixed): (string|Htmlable|null)  $format
     */
    public function format(Closure $format): self
    {
        $this->format = $format;

        return $this;
    }

    /** Renders the cell through a Blade view, receiving `row` and `value`. */
    public function view(string $view): self
    {
        $this->view = $view;

        return $this;
    }

    /**
     * Takes over sorting for this column.
     *
     * Use it when the value is not a plain column — a relation, a computed
     * expression, a join:
     *
     * ```php
     * Column::make('customer.name', 'Customer')
     *     ->sortable()
     *     ->sortUsing(fn (Builder $query, string $direction) => $query
     *         ->orderBy(Customer::select('name')->whereColumn('id', 'orders.customer_id'), $direction));
     * ```
     *
     * @param  Closure(mixed, string): mixed  $sortUsing  Receives the query and 'asc'|'desc'.
     */
    public function sortUsing(Closure $sortUsing): self
    {
        $this->sortUsing = $sortUsing;

        return $this;
    }

    /**
     * Takes over filtering for this column.
     *
     * ```php
     * Column::make('tags', 'Tags')
     *     ->filterable(FilterType::Text)
     *     ->filterUsing(fn (Builder $query, Condition $condition) => $query
     *         ->whereHas('tags', fn ($tag) => $tag->where('name', $condition->firstValue())));
     * ```
     *
     * @param  Closure(mixed, Condition): mixed  $filterUsing
     */
    public function filterUsing(Closure $filterUsing): self
    {
        $this->filterUsing = $filterUsing;

        return $this;
    }

    /**
     * Takes over quick search for this column.
     *
     * @param  Closure(mixed, string): mixed  $searchUsing  Receives the query and the term.
     */
    public function searchUsing(Closure $searchUsing): self
    {
        $this->searchUsing = $searchUsing;

        return $this;
    }

    public function sortHandler(): ?Closure
    {
        return $this->sortUsing;
    }

    public function filterHandler(): ?Closure
    {
        return $this->filterUsing;
    }

    public function searchHandler(): ?Closure
    {
        return $this->searchUsing;
    }

    public function key(): string
    {
        return $this->key;
    }

    /** The column to sort and filter on in the database. */
    public function target(): string
    {
        return $this->field ?? $this->key;
    }

    public function label(): string
    {
        return $this->label;
    }

    public function isSortable(): bool
    {
        return $this->sortable;
    }

    public function isFilterable(): bool
    {
        return $this->filterable;
    }

    public function isSearchable(): bool
    {
        return $this->searchable;
    }

    public function filterType(): FilterType
    {
        return $this->type;
    }

    /** @return array<string|int, string> */
    public function options(): array
    {
        return $this->options;
    }

    public function alignment(): string
    {
        return $this->align;
    }

    /**
     * Resolves the cell's content for a row.
     */
    public function render(mixed $row): string|Htmlable|null
    {
        $value = data_get($row, $this->key);

        if ($this->view !== null) {
            return view($this->view, ['row' => $row, 'value' => $value, 'column' => $this]);
        }

        if ($this->format !== null) {
            return ($this->format)($value, $row);
        }

        return $value === null ? null : (string) $value;
    }

    /**
     * The shape the filter builder needs on the client side.
     *
     * @return array{key: string, label: string, type: string, inputType: string, operators: array<int, array{value: string, label: string, values: int}>, options: array<string|int, string>}
     */
    public function toFilterSchema(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'type' => $this->type->value,
            'inputType' => $this->type->inputType(),
            'operators' => array_map(
                fn (Operator $operator): array => [
                    'value' => $operator->value,
                    'label' => $operator->label(),
                    'values' => $operator->valueCount(),
                ],
                $this->type->operators(),
            ),
            'options' => $this->options,
        ];
    }
}
