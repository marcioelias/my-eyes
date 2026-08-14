<?php

declare(strict_types=1);

namespace MyEyes\Filters;

/**
 * A comparison a filter condition can make.
 *
 * The backing values are short because they travel in the query string.
 */
enum Operator: string
{
    case Equals = 'eq';
    case NotEquals = 'neq';
    case Contains = 'contains';
    case NotContains = 'not_contains';
    case StartsWith = 'starts';
    case EndsWith = 'ends';
    case GreaterThan = 'gt';
    case GreaterOrEqual = 'gte';
    case LessThan = 'lt';
    case LessOrEqual = 'lte';
    case Between = 'between';
    case In = 'in';
    case IsEmpty = 'empty';
    case IsNotEmpty = 'not_empty';

    public function label(): string
    {
        return __("my-eyes::filters.operators.{$this->value}");
    }

    /**
     * How many value inputs the UI must show. Zero means the operator is
     * self-contained ("is empty"), two means a range.
     */
    public function valueCount(): int
    {
        return match ($this) {
            self::IsEmpty, self::IsNotEmpty => 0,
            self::Between => 2,
            default => 1,
        };
    }
}
