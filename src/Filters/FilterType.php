<?php

declare(strict_types=1);

namespace MyEyes\Filters;

/**
 * What kind of value a column holds. It decides which operators the filter UI
 * offers and how the value input is rendered.
 */
enum FilterType: string
{
    case Text = 'text';
    case Number = 'number';
    case Date = 'date';
    case Boolean = 'boolean';
    case Select = 'select';

    public function label(): string
    {
        return __("my-eyes::filters.types.{$this->value}");
    }

    /**
     * Operators that make sense for this type, in the order they are offered.
     *
     * @return array<int, Operator>
     */
    public function operators(): array
    {
        return match ($this) {
            self::Text => [
                Operator::Contains,
                Operator::NotContains,
                Operator::Equals,
                Operator::NotEquals,
                Operator::StartsWith,
                Operator::EndsWith,
                Operator::IsEmpty,
                Operator::IsNotEmpty,
            ],
            self::Number, self::Date => [
                Operator::Equals,
                Operator::NotEquals,
                Operator::GreaterThan,
                Operator::GreaterOrEqual,
                Operator::LessThan,
                Operator::LessOrEqual,
                Operator::Between,
                Operator::IsEmpty,
                Operator::IsNotEmpty,
            ],
            self::Select => [
                Operator::Equals,
                Operator::NotEquals,
                Operator::In,
                Operator::IsEmpty,
                Operator::IsNotEmpty,
            ],
            self::Boolean => [
                Operator::Equals,
            ],
        };
    }

    /** The HTML input type used for the value field. */
    public function inputType(): string
    {
        return match ($this) {
            self::Number => 'number',
            self::Date => 'date',
            default => 'text',
        };
    }
}
