<?php

declare(strict_types=1);

/*
 * Renders playground/showcase.blade.php to a single self-contained HTML file,
 * with the compiled CSS and the standalone JS bundle inlined.
 *
 * Run it after building both:
 *
 *   npx @tailwindcss/cli -i packages/core/tests/probe.css -o packages/core/tests/out.css
 *   npm run build
 *   php playground/build.php
 */

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Vite;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\View;
use Illuminate\Support\HtmlString;
use Illuminate\Support\ViewErrorBag;
use MyEyes\Filters\FilterType;
use MyEyes\MyEyesServiceProvider;
use MyEyes\Table\Column;
use MyEyes\Table\Table;
use Orchestra\Testbench\Foundation\Application;

$root = dirname(__DIR__);

require $root.'/vendor/autoload.php';

$css = $root.'/packages/core/tests/out.css';
$js = $root.'/packages/core/dist/my-eyes.min.js';

foreach ([$css, $js] as $asset) {
    if (! is_file($asset)) {
        fwrite(STDERR, "Missing build artifact: {$asset}\n");
        exit(1);
    }
}

$app = Application::create(
    basePath: $root.'/vendor/orchestra/testbench-core/laravel',
);

// The provider merges config, so it can only register once config is bootstrapped.
$app->make(Kernel::class)->bootstrap();
$app->register(MyEyesServiceProvider::class);

// The showcase inlines its own assets, so @vite must render nothing.
$app->instance(Vite::class, new class
{
    public function __invoke(mixed $entrypoints, ?string $buildDirectory = null): string
    {
        return '';
    }
});

View::share('errors', new ViewErrorBag);
config()->set('my-eyes.brand.name', 'my-eyes');

/*
 * The showcase runs in pt-BR so the package's own strings — operators, table
 * chrome, upload hints, the select — are visible translated. The card titles
 * around them stay in English; they are commentary on the demo, not part of it.
 */
app()->setLocale('pt_BR');

/*
 * The table component runs a real query, so the showcase gets a real (in-memory)
 * database rather than a stubbed paginator — what you see is what the component
 * actually produces.
 */
config()->set('database.default', 'showcase');
config()->set('database.connections.showcase', [
    'driver' => 'sqlite',
    'database' => ':memory:',
    'prefix' => '',
]);

Schema::create('orders', function (Blueprint $blueprint): void {
    $blueprint->increments('id');
    $blueprint->string('reference');
    $blueprint->string('customer');
    $blueprint->string('status');
    $blueprint->integer('total');
    $blueprint->string('placed_at');
});

$customers = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Alves', 'Elena Rocha', 'Felipe Nunes', 'Gabriela Reis'];
$statuses = ['paid', 'pending', 'refunded'];

foreach (range(1, 42) as $number) {
    DB::table('orders')->insert([
        'reference' => sprintf('#%05d', 1000 + $number),
        'customer' => $customers[$number % count($customers)],
        'status' => $statuses[$number % count($statuses)],
        'total' => $number * 1730 % 45000 + 2500,
        'placed_at' => sprintf('2026-%02d-%02d', ($number % 12) + 1, ($number % 27) + 1),
    ]);
}

$table = Table::make(DB::table('orders'), [
    Column::make('reference', 'Reference')->sortable()->searchable(),
    Column::make('customer', 'Customer')->sortable()->searchable()->filterable(FilterType::Text),
    Column::make('status', 'Status')
        ->filterable(FilterType::Select, ['paid' => 'Paid', 'pending' => 'Pending', 'refunded' => 'Refunded'])
        ->format(fn (string $value): HtmlString => new HtmlString(
            sprintf(
                '<span class="me-badge me-badge--%s">%s</span>',
                match ($value) {
                    'paid' => 'success',
                    'pending' => 'warning',
                    default => 'danger',
                },
                ucfirst($value),
            )
        )),
    Column::make('total', 'Total')
        ->sortable()
        ->numeric()
        ->filterable(FilterType::Number)
        ->format(fn (int $value): string => 'R$ '.number_format($value / 100, 2, ',', '.')),
    Column::make('placed_at', 'Placed')->sortable()->filterable(FilterType::Date),
])->defaultSort('reference')->perPage(10);

/*
 * The starter kit screens are whole documents. For the showcase only their
 * body is embedded, so the page keeps one copy of the stylesheet instead of one
 * per preview.
 */
foreach (['login', 'register', 'password.request', 'password.email', 'password.store', 'password.confirm', 'verification.send', 'logout', 'dashboard', 'profile.edit'] as $routeName) {
    Route::get('/'.str_replace('.', '/', $routeName), fn () => '')->name($routeName);
}

$bodyOf = static function (string $html): string {
    preg_match('/<body[^>]*>(.*)<\/body>/s', $html, $matches);

    return trim($matches[1] ?? '');
};

$previews = [
    'login' => $bodyOf(view('my-eyes::pages.auth.login')->render()),
    'register' => $bodyOf(view('my-eyes::pages.auth.register')->render()),
    'forgot' => $bodyOf(view('my-eyes::pages.auth.forgot-password')->render()),
    'error' => $bodyOf(view('my-eyes::errors.404')->render()),
];

$html = Blade::render(file_get_contents($root.'/playground/showcase.blade.php'), [
    'table' => $table,
    'previews' => $previews,
]);

/*
 * The showcase is a static file, but the components generate real URLs —
 * sort links, pagination, the auth screens' route() calls. Left alone they
 * point at http://localhost and lead nowhere. They are neutralised here rather
 * than in the components, which are right to emit real links.
 *
 * The demo script below intercepts the clicks and explains why nothing moved.
 */
$html = preg_replace('/href="https?:\/\/localhost[^"]*"/', 'href="#" data-demo-link', (string) $html) ?? $html;
$html = preg_replace('/action="https?:\/\/localhost[^"]*"/', 'action="#" data-demo-link', $html) ?? $html;

// The page-size picker navigates through option values rather than hrefs.
$html = preg_replace('/value="https?:\/\/localhost[^"]*"/', 'value="#"', $html) ?? $html;
$html = str_replace('data-me-navigate', 'data-demo-navigate', $html);

// Inline the real stylesheet and behaviours so the file works from disk.
$html = str_replace(
    '</head>',
    '<style>'.file_get_contents($css).'</style></head>',
    $html
);

$html = str_replace(
    '</body>',
    '<script>'.file_get_contents($js).'</script></body>',
    $html
);

file_put_contents($output = $root.'/playground/index.html', $html);

printf("Wrote %s (%s)\n", $output, number_format(strlen($html) / 1024, 1).' KB');

/*
 * Also emit a body-only fragment. Hosts that wrap content in their own document
 * skeleton (docs sites, the Artifact viewer) cannot take a full document, and
 * nesting one produces malformed markup.
 */
preg_match('/<body[^>]*>(.*)<\/body>/s', $html, $matches);

$fragment = '<title>my-eyes Components</title>'."\n"
    .'<style>'.file_get_contents($css).'</style>'."\n"
    .trim($matches[1] ?? '');

file_put_contents($output = $root.'/playground/fragment.html', $fragment);

printf("Wrote %s (%s)\n", $output, number_format(strlen($fragment) / 1024, 1).' KB');
