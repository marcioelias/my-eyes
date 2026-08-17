/**
 * Joins class names, dropping anything falsy.
 *
 * Vue's `:class` array does this itself; React has no equivalent, so the one
 * helper lives here rather than being re-implemented per component. Internal —
 * it is not part of the package's surface.
 */
export function cx(...values: Array<string | false | null | undefined>): string {
    return values.filter(Boolean).join(' ')
}
