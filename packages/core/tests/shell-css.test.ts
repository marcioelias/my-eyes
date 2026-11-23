import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../css/components/shell.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function declarationsFor(selector: string): string[] {
    return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
        .filter(([, selectors]) => selectors.split(',').some((candidate) => candidate.trim() === selector))
        .map(([, , body]) => body);
}

describe('collapsed sidebar rail', () => {
    it('does not clip the submenu flyouts, nor scroll sideways', () => {
        const body = declarationsFor(".me-shell[data-sidebar-collapsed='true'] .me-sidebar__body").join(';');

        expect(body).toMatch(/overflow\s*:\s*visible/);
    });
});
