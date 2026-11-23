import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../css/components/table.css'), 'utf8');

/**
 * Specificity as [ids, classes/attributes/pseudo-classes, elements], enough
 * for the plain selectors this stylesheet uses.
 */
function specificity(selector: string): [number, number, number] {
    const ids = (selector.match(/#[\w-]+/g) ?? []).length;
    const classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length;
    const elements = (selector.replace(/[.#][\w-]+|\[[^\]]+\]|::?[\w-]+/g, ' ').match(/[a-z][\w-]*/gi) ?? []).length;

    return [ids, classes, elements];
}

function selectorsSetting(property: string, value: string): string[] {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];

    return rules
        .filter(([, , body]) => new RegExp(`${property}\\s*:\\s*${value}\\s*;`).test(body))
        .flatMap(([, selectors]) => selectors.split(',').map((selector) => selector.replace(/\/\*[\s\S]*?\*\//g, '').trim()));
}

function outranks(a: [number, number, number], b: [number, number, number]): boolean {
    for (let index = 0; index < 3; index++) {
        if (a[index] !== b[index]) {
            return a[index] > b[index];
        }
    }

    return false;
}

describe('table column alignment', () => {
    const base = selectorsSetting('text-align', 'start').map(specificity);

    it.each([
        ['end', 'me-table__cell--end'],
        ['center', 'me-table__cell--center'],
    ])('lets align: %s win over the base cell rule, in the header and the body', (value, className) => {
        const aligned = selectorsSetting('text-align', value).filter((selector) => selector.includes(className));

        expect(aligned).not.toHaveLength(0);
        aligned.forEach((selector) => base.forEach((rule) => expect(outranks(specificity(selector), rule)).toBe(true)));
    });

    it('lines the sort control up with the column', () => {
        expect(selectorsSetting('justify-content', 'flex-end')).toContain('.me-table__cell--end .me-table__sort');
        expect(selectorsSetting('justify-content', 'center')).toContain('.me-table__cell--center .me-table__sort');
    });
});
