<?php

declare(strict_types=1);

namespace MyEyes\Table;

use BackedEnum;
use Closure;
use DateTimeInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\HtmlString;
use JsonSerializable;
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

    private bool $html = false;

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
     * Marks this column's values as markup rather than text.
     *
     * Only meaningful for clients that render from the payload — Vue and
     * React. It is opt-in per column, and deliberately so: this is the one
     * place a table can inject markup into the page, and that has to be a
     * decision someone made, not a default.
     */
    public function html(bool $html = true): self
    {
        $this->html = $html;

        return $this;
    }

    public function isHtml(): bool
    {
        return $this->html;
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
     * Resolves the cell's content for a row, as Blade renders it.
     */
    public function render(mixed $row): string|Htmlable|null
    {
        if ($this->view !== null) {
            return $this->renderView($row);
        }

        $value = $this->resolve($row);

        return match (true) {
            $value === null, $value instanceof Htmlable => $value,
            $value instanceof BackedEnum => (string) $value->value,
            default => (string) $value,
        };
    }

    /**
     * The raw cell value: the row's data for this key, through format() when
     * one is set. Shared by render() and toValue(), which then differ only in
     * how they present it.
     */
    private function resolve(mixed $row): mixed
    {
        $value = data_get($row, $this->key);

        return $this->format !== null ? ($this->format)($value, $row) : $value;
    }

    /**
     * Wrapped in an HtmlString rather than handed back as a View: both are
     * Htmlable, so Blade emits the markup either way, but this one is also
     * something the payload can carry once the column opts in with html().
     */
    private function renderView(mixed $row): HtmlString
    {
        /** @var string $view */
        $view = $this->view;

        return new HtmlString(
            view($view, ['row' => $row, 'value' => data_get($row, $this->key), 'column' => $this])->render()
        );
    }

    /**
     * The cell's value for a row, as something JSON can carry.
     *
     * Server-rendering constructs — a Blade view, an Htmlable — only mean
     * something once the column has opted into markup with html(). Without
     * that, sending them would silently turn escaped output into raw output on
     * the client, so this throws instead.
     *
     * @see docs/policies/table-payload.md P-04 to P-07
     */
    public function toValue(mixed $row): mixed
    {
        if ($this->view !== null) {
            return $this->markup($this->renderView($row));
        }

        $value = $this->resolve($row);

        if ($value instanceof Htmlable) {
            return $this->markup($value);
        }

        return self::serialise($value, $this->key);
    }

    private function markup(Htmlable $rendered): string
    {
        if (! $this->html) {
            throw UnserialisableColumn::markup($this->key);
        }

        return $rendered->toHtml();
    }

    /**
     * Normalises the values Eloquent hands back that JSON has no notion of.
     *
     * Dates and enums are common enough on a model that refusing them would be
     * a footgun rather than a safeguard. Anything beyond these is a column
     * definition mistake and says so.
     */
    private static function serialise(mixed $value, string $key): mixed
    {
        return match (true) {
            $value === null, is_scalar($value) => $value,
            $value instanceof BackedEnum => $value->value,
            $value instanceof DateTimeInterface => $value->format(DateTimeInterface::ATOM),
            is_array($value) => $value,
            $value instanceof Arrayable => $value->toArray(),
            $value instanceof JsonSerializable => $value->jsonSerialize(),
            default => throw UnserialisableColumn::value($key, get_debug_type($value)),
        };
    }

    /**
     * The column's description in the payload, for clients that render from
     * data rather than from markup.
     *
     * @return array{key: string, label: string, align: string, sortable: bool, searchable: bool, filterable: bool, html: bool}
     */
    public function toPayload(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'align' => $this->align,
            'sortable' => $this->sortable,
            'searchable' => $this->searchable,
            'filterable' => $this->filterable,
            'html' => $this->html,
        ];
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
