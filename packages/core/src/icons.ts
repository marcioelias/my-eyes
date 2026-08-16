/*
 * The icon registry.
 *
 * my-eyes bundles a set drawn for it, in one visual family. An icon set is a
 * styling decision, though, and this package's rule is that styling decisions
 * belong to the application — so the registry is open: drop in Font Awesome,
 * Heroicons, a set of your own, or override one icon.
 *
 * What is registered is the *inner* geometry of a 24x24 SVG. The wrapper is
 * the component's, which is what keeps stroke width, colour and sizing under
 * the design system's control rather than baked into each icon.
 */

import { bundledIcons, type BundledIconName } from './bundled-icons.js'

export { bundledIcons, type BundledIconName }

/** A bundled name, or anything the application registered. */
export type IconName = BundledIconName | (string & {})

const registry = new Map<string, string>(Object.entries(bundledIcons))

/**
 * Adds icons, or replaces bundled ones.
 *
 * ```ts
 * registerIcons({
 *     invoice: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/>',
 * })
 * ```
 *
 * A set drawn on a different grid needs its own viewBox, which this does not
 * carry — rescale it to 24x24 first, or the icon will not sit with the rest.
 */
export function registerIcons(icons: Record<string, string>): void {
    Object.entries(icons).forEach(([name, geometry]) => registry.set(name, geometry))
}

/** Undoes every registration, leaving the bundled set. Used by tests. */
export function resetIcons(): void {
    registry.clear()
    Object.entries(bundledIcons).forEach(([name, geometry]) => registry.set(name, geometry))
}

export function hasIcon(name: string): boolean {
    return registry.has(name)
}

export function iconNames(): string[] {
    return [...registry.keys()].sort()
}

/**
 * The geometry for an icon.
 *
 * An unknown name throws rather than returning nothing. A silently empty icon
 * is invisible, and an invisible control is a bug that reaches production
 * without anyone noticing.
 */
export function icon(name: string): string {
    const geometry = registry.get(name)

    if (geometry === undefined) {
        throw new Error(
            `Unknown my-eyes icon [${name}]. Register it with registerIcons({ '${name}': '<path .../>' }), `
            + 'or pick one of the bundled names.',
        )
    }

    return geometry
}

/**
 * The whole registry, for a renderer that wants to look icons up itself.
 *
 * @deprecated Prefer icon(name); this stays for the components that read the
 * map directly and will follow in a later version.
 */
export const icons: Record<string, string> = new Proxy(
    {},
    {
        get: (_target, name: string) => registry.get(name),
        has: (_target, name: string) => registry.has(name),
        ownKeys: () => [...registry.keys()],
        getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    },
)
