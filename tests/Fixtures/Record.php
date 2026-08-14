<?php

declare(strict_types=1);

namespace MyEyes\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $status
 * @property int $amount
 * @property ?string $notes
 */
final class Record extends Model
{
    protected $table = 'records';

    public $timestamps = false;

    protected $guarded = [];
}
