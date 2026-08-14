<?php

declare(strict_types=1);

namespace MyEyes\Filters;

/**
 * One line of the filter builder: "field — operator — value(s)".
 *
 * Always constructed against a whitelisted column, never straight from input.
 */
final readonly class Condition
{
    /**
     * @param  array<int, string>  $values
     */
    public function __construct(
        public string $field,
        public Operator $operator,
        public array $values = [],
    ) {}

    public function firstValue(): ?string
    {
        return $this->values[0] ?? null;
    }

    public function secondValue(): ?string
    {
        return $this->values[1] ?? null;
    }

    /**
     * Whether the condition carries the values its operator needs. A half-filled
     * row in the UI is skipped rather than treated as an empty match.
     */
    public function isComplete(): bool
    {
        $required = $this->operator->valueCount();

        if ($required === 0) {
            return true;
        }

        for ($index = 0; $index < $required; $index++) {
            if (($this->values[$index] ?? '') === '') {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array{field: string, operator: string, values: array<int, string>}
     */
    public function toArray(): array
    {
        return [
            'field' => $this->field,
            'operator' => $this->operator->value,
            'values' => $this->values,
        ];
    }
}
