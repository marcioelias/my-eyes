<?php

declare(strict_types=1);

namespace MyEyes\Support;

/**
 * Human readable byte sizes.
 *
 * Illuminate\Support\Number::fileSize() would do this, but it requires the
 * intl extension, and a component library has no business forcing an extension
 * on its host application just to render "2 MB" in a hint.
 */
final class FileSize
{
    private const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

    public static function format(int $bytes): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        $exponent = (int) min(floor(log($bytes, 1024)), count(self::UNITS) - 1);
        $value = $bytes / 1024 ** $exponent;

        // Whole bytes never need a decimal, and a trailing ".0" is noise.
        $decimals = $exponent === 0 || fmod($value, 1.0) === 0.0 ? 0 : 1;

        return number_format($value, $decimals).' '.self::UNITS[$exponent];
    }
}
