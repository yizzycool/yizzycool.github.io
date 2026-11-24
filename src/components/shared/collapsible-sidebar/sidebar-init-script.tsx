import { SIDEBAR_DATA_ATTRS, SIDEBAR_STORAGE_KEYS } from './constants';

const SIDEBAR_INIT_CODE = `
(function() {
  try {
    var entries = [
      ['${SIDEBAR_STORAGE_KEYS.blog}', '${SIDEBAR_DATA_ATTRS.blog}'],
      ['${SIDEBAR_STORAGE_KEYS.tools}', '${SIDEBAR_DATA_ATTRS.tools}']
    ];
    for (var i = 0; i < entries.length; i++) {
      if (window.localStorage.getItem(entries[i][0]) === 'true') {
        document.documentElement.setAttribute(entries[i][1], 'collapsed');
      }
    }
  } catch (e) {}
})();
`;

/**
 * Synchronous pre-paint script that restores each sidebar's collapsed state on `<html>`
 * before hydration to prevent layout shift (CLS) and flicker.
 */
export function SidebarInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: SIDEBAR_INIT_CODE }} />;
}
