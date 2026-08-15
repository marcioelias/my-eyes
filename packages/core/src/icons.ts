/*
 * The icon set, shared by every renderer that draws icons in JavaScript.
 *
 * Generated from resources/views/components/icon.blade.php in the Composer
 * package. A Pest test asserts the two sets carry the same names, so one can
 * never gain an icon the other does not have.
 */

export type IconName =
    | 'alert-circle'
    | 'alert-triangle'
    | 'arrow-left'
    | 'check'
    | 'check-circle'
    | 'chevron-down'
    | 'chevron-right'
    | 'clock'
    | 'eye'
    | 'eye-off'
    | 'file-question'
    | 'home'
    | 'info'
    | 'layout-dashboard'
    | 'lock'
    | 'log-out'
    | 'mail'
    | 'menu'
    | 'minus'
    | 'monitor'
    | 'moon'
    | 'panel-left'
    | 'plus'
    | 'search'
    | 'server-crash'
    | 'settings'
    | 'shield-off'
    | 'sun'
    | 'upload-cloud'
    | 'user'
    | 'users'
    | 'x'

export const icons: Record<IconName, string> = {
    'alert-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'alert-triangle': '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'eye': '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M10.7 5.1A11 11 0 0 1 12 5c5 0 9 3.5 9.9 6.6a1 1 0 0 1 0 .7 11.6 11.6 0 0 1-2.2 3.4"/><path d="M6.6 6.6A11.5 11.5 0 0 0 2.1 11.6a1 1 0 0 0 0 .7C3 15.5 7 19 12 19a11 11 0 0 0 5.4-1.4"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    'file-question': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 13a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.6"/><path d="M12 19h.01"/>',
    'home': '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-8h6v8"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m2 7 8.9 5.5a2 2 0 0 0 2.2 0L22 7"/>',
    'menu': '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    'minus': '<path d="M5 12h14"/>',
    'monitor': '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    'panel-left': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
    'plus': '<path d="M12 5v14"/><path d="M5 12h14"/>',
    'search': '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    'server-crash': '<path d="M6 10H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><path d="M6 14H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2"/><path d="M6 6h.01"/><path d="M6 18h.01"/><path d="m13 6-4 6h6l-4 6"/>',
    'settings': '<path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.2a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.2a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.2a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.2a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'shield-off': '<path d="M19.7 14A9 9 0 0 0 20 11V5l-8-3-3.5 1.3"/><path d="M4.7 4.7 4 5v6c0 5 3.4 8.4 7.3 9.9a1 1 0 0 0 .7 0 12 12 0 0 0 4-2.4"/><path d="m2 2 20 20"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
    'upload-cloud': '<path d="M12 13v8"/><path d="m8 17 4-4 4 4"/><path d="M20.9 18.4A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 4 16.2"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
}
