<?php

declare(strict_types=1);

namespace MyEyes\Filters;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\Request;
use MyEyes\Table\Column;

/**
 * The conditions in play for one request, and how they reach the query.
 *
 * Security note: a condition is only ever built from a column that was declared
 * filterable. Anything else in the query string is dropped, so a crafted URL
 * cannot filter on a column the table never exposed.
 */
final class FilterSet
{
    /**
     * How the conditions are joined.
     *
     * One conjunction for the whole set rather than one per row. Mixing them in
     * a flat list is ambiguous — "A or B and C" reads as "A or (B and C)" in
     * SQL but as "(A or B) and C" to most people — and resolving that properly
     * needs nested groups with visible parentheses. Until the UI has those,
     * a single conjunction is the honest option.
     */
    public const AND = 'and';

    public const OR = 'or';

    /**
     * @param  array<int, Condition>  $conditions
     * @param  self::AND|self::OR  $conjunction
     */
    private function __construct(
        public readonly array $conditions,
        public readonly string $conjunction = self::AND,
    ) {}

    /**
     * Reads conditions from the request, keeping only the valid ones.
     *
     * Expected shape:
     *
     *     ?filters[0][field]=name&filters[0][operator]=contains&filters[0][values][0]=ana
     *
     * @param  array<string, Column>  $columns  Keyed by column key.
     */
    public static function fromRequest(Request $request, array $columns): self
    {
        $raw = $request->input('filters');
        $conditions = [];

        foreach (is_array($raw) ? $raw : [] as $row) {
            if (! is_array($row)) {
                continue;
            }

            $condition = self::parseRow($row, $columns);

            if ($condition !== null && $condition->isComplete()) {
                $conditions[] = $condition;
            }
        }

        return new self($conditions, self::readConjunction($request));
    }

    /**
     * @param  array<int, Condition>  $conditions
     */
    public static function of(array $conditions, string $conjunction = self::AND): self
    {
        return new self($conditions, $conjunction === self::OR ? self::OR : self::AND);
    }

    /** Anything other than an explicit "or" means AND. */
    private static function readConjunction(Request $request): string
    {
        return $request->input('conjunction') === self::OR ? self::OR : self::AND;
    }

    public function isOr(): bool
    {
        return $this->conjunction === self::OR;
    }

    /**
     * @param  array<array-key, mixed>  $row
     * @param  array<string, Column>  $columns
     */
    private static function parseRow(array $row, array $columns): ?Condition
    {
        $field = is_string($row['field'] ?? null) ? $row['field'] : null;
        $operatorValue = is_string($row['operator'] ?? null) ? $row['operator'] : null;

        if ($field === null || $operatorValue === null) {
            return null;
        }

        $column = $columns[$field] ?? null;

        if ($column === null || ! $column->isFilterable()) {
            return null;
        }

        $operator = Operator::tryFrom($operatorValue);

        // The operator must also be one this column's type actually offers.
        if ($operator === null || ! in_array($operator, $column->filterType()->operators(), true)) {
            return null;
        }

        $values = array_values(array_map(
            static fn (mixed $value): string => is_scalar($value) ? (string) $value : '',
            is_array($row['values'] ?? null) ? $row['values'] : [],
        ));

        return new Condition($field, $operator, $values);
    }

    public function isEmpty(): bool
    {
        return $this->conditions === [];
    }

    public function count(): int
    {
        return count($this->conditions);
    }

    /**
     * Applies every condition, joined by the set's conjunction.
     *
     * The whole set is wrapped in one group, and each condition in a group of
     * its own. Both matter: without the outer group an OR would leak out and
     * widen the search and any other constraint on the query; without the inner
     * ones, a condition that expands into several clauses (a date range, "is
     * empty") would have its parts joined by the outer OR instead of staying
     * one unit.
     *
     * @param  array<string, Column>  $columns
     */
    public function apply(EloquentBuilder|QueryBuilder|Relation $query, array $columns): EloquentBuilder|QueryBuilder|Relation
    {
        if ($this->conditions === []) {
            return $query;
        }

        $query->where(function (EloquentBuilder|QueryBuilder $group) use ($columns): void {
            foreach ($this->conditions as $index => $condition) {
                $column = $columns[$condition->field] ?? null;

                if ($column === null) {
                    continue;
                }

                // The first condition always uses where(); the rest follow the
                // conjunction.
                $method = $index === 0 || ! $this->isOr() ? 'where' : 'orWhere';

                $group->{$method}(function (EloquentBuilder|QueryBuilder $nested) use ($column, $condition): void {
                    self::applyOne($nested, $column, $condition);
                });
            }
        });

        return $query;
    }

    private static function applyOne(EloquentBuilder|QueryBuilder|Relation $query, Column $column, Condition $condition): void
    {
        $handler = $column->filterHandler();

        if ($handler !== null) {
            $handler($query, $condition);

            return;
        }

        if ($column->filterType() === FilterType::Date) {
            self::applyDateCondition($query, $column->target(), $condition);

            return;
        }

        self::applyCondition($query, $column->target(), $condition);
    }

    /**
     * Date filtering, expanded to whole days.
     *
     * An <input type="date"> submits "2026-01-31". Comparing that against a
     * datetime column means "2026-01-31 00:00:00", so `between` would drop
     * everything recorded during the final day and `<=` would drop the day
     * itself — the classic off-by-one-day filter bug. Each operator is
     * therefore widened to the day's real boundaries.
     *
     * A value that already carries a time is used verbatim.
     */
    private static function applyDateCondition(EloquentBuilder|QueryBuilder|Relation $query, string $target, Condition $condition): void
    {
        $from = $condition->firstValue() ?? '';
        $to = $condition->secondValue() ?? '';

        $startOfDay = static fn (string $date): string => self::isPlainDate($date) ? "{$date} 00:00:00" : $date;
        $endOfDay = static fn (string $date): string => self::isPlainDate($date) ? "{$date} 23:59:59" : $date;

        match ($condition->operator) {
            // "is 31 Jan" means anywhere inside that day.
            Operator::Equals => $query->whereBetween($target, [$startOfDay($from), $endOfDay($from)]),
            Operator::NotEquals => $query->whereNotBetween($target, [$startOfDay($from), $endOfDay($from)]),
            // "after 31 Jan" starts once that day is over.
            Operator::GreaterThan => $query->where($target, '>', $endOfDay($from)),
            Operator::GreaterOrEqual => $query->where($target, '>=', $startOfDay($from)),
            Operator::LessThan => $query->where($target, '<', $startOfDay($from)),
            Operator::LessOrEqual => $query->where($target, '<=', $endOfDay($from)),
            // Both ends inclusive, which is what a date range reads as.
            Operator::Between => $query->whereBetween($target, [$startOfDay($from), $endOfDay($to)]),
            Operator::IsEmpty => $query->whereNull($target),
            Operator::IsNotEmpty => $query->whereNotNull($target),
            default => $query->where($target, '=', $from),
        };
    }

    private static function isPlainDate(string $value): bool
    {
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1;
    }

    private static function applyCondition(EloquentBuilder|QueryBuilder|Relation $query, string $target, Condition $condition): void
    {
        $value = $condition->firstValue() ?? '';

        match ($condition->operator) {
            Operator::Equals => $query->where($target, '=', $value),
            Operator::NotEquals => $query->where($target, '!=', $value),
            Operator::Contains => $query->where($target, 'like', '%'.self::escapeLike($value).'%'),
            Operator::NotContains => $query->where($target, 'not like', '%'.self::escapeLike($value).'%'),
            Operator::StartsWith => $query->where($target, 'like', self::escapeLike($value).'%'),
            Operator::EndsWith => $query->where($target, 'like', '%'.self::escapeLike($value)),
            Operator::GreaterThan => $query->where($target, '>', $value),
            Operator::GreaterOrEqual => $query->where($target, '>=', $value),
            Operator::LessThan => $query->where($target, '<', $value),
            Operator::LessOrEqual => $query->where($target, '<=', $value),
            Operator::Between => $query->whereBetween($target, [$value, $condition->secondValue() ?? '']),
            Operator::In => $query->whereIn($target, self::splitList($value)),
            // "Empty" covers both NULL and '', which is what a user means.
            Operator::IsEmpty => $query->where(
                fn (EloquentBuilder|QueryBuilder $nested) => $nested->whereNull($target)->orWhere($target, '=', '')
            ),
            Operator::IsNotEmpty => $query->whereNotNull($target)->where($target, '!=', ''),
        };
    }

    /**
     * Wildcards typed by the user must match literally, not act as wildcards.
     */
    private static function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $value);
    }

    /**
     * @return array<int, string>
     */
    private static function splitList(string $value): array
    {
        return array_values(array_filter(
            array_map('trim', explode(',', $value)),
            static fn (string $item): bool => $item !== '',
        ));
    }

    /**
     * The query string representation, for building links that keep filters.
     *
     * @return array<int, array{field: string, operator: string, values: array<int, string>}>
     */
    public function toQuery(): array
    {
        return array_map(static fn (Condition $condition): array => $condition->toArray(), $this->conditions);
    }
}
