import { describe, expect, it } from 'vitest'
import { computeVirtualWindow, shouldVirtualise } from '../src/headless/virtual.js'

describe('computeVirtualWindow', () => {
    const options = { total: 100, rowHeight: 44, viewportHeight: 440, overscan: 5 }

    it('renders the visible rows plus the overscan', () => {
        const window = computeVirtualWindow({ ...options, scrollTop: 0 })

        expect(window.start).toBe(0)
        // 10 visible + 5 overscan on each side, clamped at the top.
        expect(window.end).toBe(20)
        expect(window.paddingTop).toBe(0)
        expect(window.paddingBottom).toBe(80 * 44)
    })

    it('moves the window as the viewport scrolls', () => {
        const window = computeVirtualWindow({ ...options, scrollTop: 44 * 20 })

        expect(window.start).toBe(15)
        expect(window.end).toBe(35)
        expect(window.paddingTop).toBe(15 * 44)
        expect(window.paddingBottom).toBe(65 * 44)
    })

    it('never runs past the last row', () => {
        const window = computeVirtualWindow({ ...options, scrollTop: 44 * 1000 })

        expect(window.end).toBe(100)
        expect(window.paddingBottom).toBe(0)
    })

    it('renders everything before the table has been laid out', () => {
        // Zero height means no layout yet — rendering nothing would paint an
        // empty table on the first frame.
        const window = computeVirtualWindow({ ...options, viewportHeight: 0, scrollTop: 0 })

        expect(window).toEqual({ start: 0, end: 100, paddingTop: 0, paddingBottom: 0 })
    })

    it('survives a zero row height', () => {
        const window = computeVirtualWindow({ ...options, rowHeight: 0, scrollTop: 0 })

        expect(Number.isFinite(window.end)).toBe(true)
    })

    it('covers the whole page when it is shorter than the viewport', () => {
        const window = computeVirtualWindow({ ...options, total: 5, scrollTop: 0 })

        expect(window.start).toBe(0)
        expect(window.end).toBe(5)
        expect(window.paddingBottom).toBe(0)
    })
})

describe('shouldVirtualise', () => {
    it('leaves a short page alone', () => {
        expect(shouldVirtualise(25)).toBe(false)
        expect(shouldVirtualise(100)).toBe(true)
    })
})
