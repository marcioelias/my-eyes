/*
 * Entry point for the bundled build (dist/my-eyes.min.js).
 *
 * For projects without a bundler: drop the file in with a <script> tag and the
 * behaviours start themselves. Everything is also exposed on window.myEyes for
 * manual re-initialisation after an AJAX update.
 */

import { configureMessages, initMyEyes, startMyEyes, toast } from './index.js'
import { applyScheme, getStoredScheme, resolvedScheme, setScheme } from './headless/theme.js'

declare global {
    interface Window {
        myEyes: {
            init: typeof initMyEyes
            toast: typeof toast
            configureMessages: typeof configureMessages
            applyScheme: typeof applyScheme
            getStoredScheme: typeof getStoredScheme
            resolvedScheme: typeof resolvedScheme
            setScheme: typeof setScheme
        }
    }
}

window.myEyes = {
    init: initMyEyes,
    toast,
    configureMessages,
    applyScheme,
    getStoredScheme,
    resolvedScheme,
    setScheme,
}

startMyEyes()
