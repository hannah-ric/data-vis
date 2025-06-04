/**
 * Shortcut management module for data visualization.
 *
 * Registers global keyboard shortcuts:
 * - Ctrl+F: trigger data filtering
 * - Ctrl+R: trigger resize
 * - Ctrl+E: trigger data export
 *
 * Usage:
 * import { registerShortcuts } from './shortcuts.js';
 * registerShortcuts({
 *   onFilter: () => { ... },
 *   onResize: () => { ... },
 *   onExport: () => { ... }
 * });
 */

export function registerShortcuts({ onFilter, onResize, onExport } = {}) {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 'f':
          event.preventDefault();
          if (typeof onFilter === 'function') onFilter();
          break;
        case 'r':
          event.preventDefault();
          if (typeof onResize === 'function') onResize();
          break;
        case 'e':
          event.preventDefault();
          if (typeof onExport === 'function') onExport();
          break;
        default:
          break;
      }
    }
  });
}

