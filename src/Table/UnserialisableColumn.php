<?php

declare(strict_types=1);

namespace MyEyes\Table;

use LogicException;

/**
 * A column that cannot be expressed in the table payload.
 *
 * Always a column definition mistake rather than a runtime condition, so it
 * fails loudly at development time instead of dropping the cell and leaving a
 * blank column nobody notices until production.
 */
final class UnserialisableColumn extends LogicException
{
    public static function markup(string $key): self
    {
        return new self(
            "Column [{$key}] renders markup, which the table payload cannot carry as text. "
            .'Call ->html() on it to send it as markup, or ->format() it to a plain value.'
        );
    }

    public static function value(string $key, string $type): self
    {
        return new self(
            "Column [{$key}] resolved to a value of type [{$type}], which JSON cannot carry. "
            .'Give it a ->format() closure returning a string, number, boolean or array.'
        );
    }
}
