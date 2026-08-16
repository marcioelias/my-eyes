<?php

declare(strict_types=1);

/*
 * Renders every icon to a contact sheet, so the set can be looked at.
 *
 *     php bin/render-icons.php [--only=a,b,c] [--size=40] [--out=name]
 *
 * Drawing an icon without looking at it is guesswork: path data that parses is
 * not the same as an icon that reads. This exists so the last step of adding
 * one is always "look at it next to its neighbours".
 *
 * Needs a headless Chrome on PATH.
 */

$root = dirname(__DIR__);
$options = getopt('', ['only::', 'size::', 'out::']);
$size = (int) ($options['size'] ?? 40);
$only = isset($options['only']) ? explode(',', (string) $options['only']) : null;

$files = glob($root.'/resources/icons/*.svg') ?: [];
sort($files);

$cells = '';
$count = 0;

foreach ($files as $file) {
    $name = basename($file, '.svg');

    if ($only !== null && ! in_array($name, $only, true)) {
        continue;
    }

    $inner = preg_replace('/^.*?<svg[^>]*>|<\/svg>.*$/s', '', (string) file_get_contents($file));
    $count++;

    $cells .= sprintf(
        '<figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
        .' stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="%1$d" height="%1$d">%2$s</svg>'
        .'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
        .' stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">%2$s</svg>'
        .'<figcaption>%3$s</figcaption></figure>',
        $size,
        $inner,
        htmlspecialchars($name),
    );
}

if ($count === 0) {
    fwrite(STDERR, "No icons matched.\n");
    exit(1);
}

/*
 * Every icon is drawn twice: at reading size and at 16px. Detail that survives
 * the first and vanishes in the second is the most common mistake in the set.
 */
$html = <<<HTML
<!doctype html>
<meta charset="utf-8">
<style>
  body { font: 12px system-ui, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 16px }
  main { display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px }
  figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 6px;
           padding: 10px 6px; border: 1px solid #e2e8f0; border-radius: 8px }
  figcaption { color: #64748b; font-size: 10px; text-align: center; word-break: break-word }
</style>
<main>{$cells}</main>
HTML;

@mkdir($root.'/build', 0o755, true);

// Named per run, so concurrent renders do not overwrite each other.
$slug = isset($options['out']) ? preg_replace('/[^a-z0-9-]/', '', (string) $options['out']) : 'icons';
$page = $root."/build/{$slug}.html";
$shot = $root."/build/{$slug}.png";

file_put_contents($page, $html);

$rows = (int) ceil($count / 8);
$height = 40 + $rows * ($size + 62);

$chrome = null;

foreach (['google-chrome', 'chromium', 'chromium-browser'] as $candidate) {
    exec("command -v {$candidate}", $found, $status);

    if ($status === 0) {
        $chrome = $candidate;

        break;
    }
}

if ($chrome === null) {
    fwrite(STDERR, "No headless Chrome found; the sheet is at {$page}.\n");
    exit(1);
}

exec(sprintf(
    '%s --headless --disable-gpu --no-sandbox --hide-scrollbars --screenshot=%s --window-size=920,%d %s 2>/dev/null',
    escapeshellcmd($chrome),
    escapeshellarg($shot),
    $height,
    escapeshellarg($page),
));

echo "Rendered {$count} icons to build/{$slug}.png\n";
