/*
 * Row windowing for the data table.
 *
 * Fixed row height rather than measured: table rows in this design system are
 * a known height, and assuming it keeps this to arithmetic — no observers, no
 * measurement pass, no layout thrash. A row that grows taller than declared
 * shifts the padding slightly; a row that needs to be arbitrarily tall wants a
 * card list, not a table.
 */

export interface VirtualWindowOptions {
    /** Rows on the current page. Server pagination decides this, not the client. */
    total: number
    rowHeight: number
    viewportHeight: number
    scrollTop: number
    /** Rows kept rendered beyond the viewport, so scrolling does not flicker. */
    overscan: number
}

export interface VirtualWindow {
    /** First rendered row, inclusive. */
    start: number
    /** Last rendered row, exclusive. */
    end: number
    /** Spacer heights standing in for the rows that are not rendered. */
    paddingTop: number
    paddingBottom: number
}

export function computeVirtualWindow(options: VirtualWindowOptions): VirtualWindow {
    const { total, overscan } = options
    const rowHeight = Math.max(1, options.rowHeight)
    const viewportHeight = Math.max(0, options.viewportHeight)
    const scrollTop = Math.max(0, options.scrollTop)

    /*
     * A viewport of zero height means the table has not been laid out yet —
     * during SSR, or before the first frame. Rendering nothing then would show
     * an empty table on first paint, so everything is rendered until a real
     * height arrives.
     */
    if (viewportHeight === 0) {
        return { start: 0, end: total, paddingTop: 0, paddingBottom: 0 }
    }

    const visible = Math.ceil(viewportHeight / rowHeight)

    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const end = Math.min(total, start + visible + overscan * 2)

    return {
        start,
        end,
        paddingTop: start * rowHeight,
        paddingBottom: Math.max(0, (total - end) * rowHeight),
    }
}

/**
 * Whether virtualising is worth it at all.
 *
 * Below the threshold the spacer rows and the scroll handler cost more than
 * they save, and a plain table is both simpler and more accessible.
 */
export function shouldVirtualise(total: number, threshold = 30): boolean {
    return total > threshold
}
