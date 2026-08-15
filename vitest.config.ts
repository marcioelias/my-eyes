import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // The headless modules read window.location and window.history, which
        // is exactly the behaviour worth testing rather than mocking away.
        environment: 'jsdom',
        include: ['packages/*/tests/**/*.test.ts', 'packages/*/tests/**/*.test.tsx'],
        setupFiles: ['packages/vue/tests/setup.ts'],
    },
})
