# Drawing an icon

The set is one visual family. An icon that ignores these rules will look wrong
next to the others even when it is a fine drawing on its own, so the rules
matter more than the subject.

## The loop

1. Draw the SVG into `resources/icons/<name>.svg`
2. `php bin/build-icons.php` — regenerates `src/Support/Icons.php` and
   `packages/core/src/bundled-icons.ts`
3. `php bin/render-icons.php` — renders a contact sheet to
   `build/icons.png`
4. **Look at the sheet.** Next to its neighbours, not on its own
5. Fix and repeat

Step 4 is the one that cannot be skipped. Path data that parses is not the same
as an icon that reads, and nothing but looking will tell the difference.

## The file

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9"/>
    <path d="m8.5 12.5 2.5 2.5 4.5-5"/>
</svg>
```

- **24×24 viewBox**, always. The generator rejects anything else
- **No `fill`, `stroke` or `stroke-width`** anywhere inside. Those belong to
  the component, which is what lets one icon serve every size and colour. The
  generator rejects them
- One element per line, so a diff on an icon is readable
- Name in lower-case kebab-case, describing the *thing*, not the action:
  `trash`, not `delete`. The same glyph serves "delete", "remove" and "discard"

## Geometry

| Rule | Value |
|---|---|
| Grid | 24×24 |
| Live area | 20×20 — keep drawings inside `2 … 22` |
| Stroke | 1.75, applied by the component. Draw for that weight |
| Terminals | Round. Never square off a stroke end |
| Corners | Round, radius 2 on a rectangle, 1 on small detail |
| Alignment | Snap to whole or half units. `12.5` is fine, `12.37` is not |

Optical, not mathematical:

- A circle reads larger than a square of the same size. `r="9"` next to a
  `20×20` rectangle balances; `r="10"` does not
- Centre optically, not numerically. A triangle looks low when its bounding box
  is centred
- Keep counters — the holes in the drawing — at least 2 units wide, or the icon
  fills in at 16px

## Weight and density

The set is read at 16–20px. Detail that survives at 40px disappears there.

- Three or four elements per icon. `server-crash` is at the limit and is the
  busiest in the set
- No text, no numerals
- No hairline detail: nothing thinner than the stroke itself
- Where a metaphor needs detail to be legible, choose a simpler metaphor

## Consistency with what exists

Before drawing, open the neighbours:

- `plus`, `minus`, `check`, `x` — the simplest forms, and the weight everything
  else is judged against
- `user`, `users` — how bodies and heads are proportioned
- `mail`, `folder`, `file-question` — how containers are drawn
- `settings` — the most ornamental the set gets

Reuse a shape that already exists rather than drawing a second version of it.
An `archive` that puts a lid on the same box `package` uses is one family; a
box drawn from scratch is two.

## Naming

Prefer the noun. Where a set of related icons exists, keep a common prefix so
they sort together: `file`, `file-plus`, `file-check`, `file-x`.

State goes as a suffix, and the modifier sits bottom-right of the base glyph:
`circle-check`, `circle-x`. Off-states use `-off`: `eye-off`, `bell-off`.
