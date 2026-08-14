<?php

declare(strict_types=1);

namespace MyEyes\Tests;

use Illuminate\Support\Facades\View;
use Illuminate\Support\MessageBag;
use Illuminate\Support\ViewErrorBag;
use MyEyes\MyEyesServiceProvider;
use Orchestra\Testbench\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Outside an HTTP request nothing shares the error bag, and every form
        // component reads it. Tests that need errors overwrite this.
        View::share('errors', new ViewErrorBag);
    }

    /**
     * @return array<int, class-string>
     */
    protected function getPackageProviders($app): array
    {
        return [MyEyesServiceProvider::class];
    }

    /** Table tests run against a real (in-memory) database, not mocks. */
    protected function defineEnvironment($app): void
    {
        $app['config']->set('database.default', 'testing');
        $app['config']->set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);
    }

    protected function shareErrors(string $field, string $message): void
    {
        $bag = new ViewErrorBag;
        $bag->put('default', new MessageBag([$field => [$message]]));

        View::share('errors', $bag);
    }
}
