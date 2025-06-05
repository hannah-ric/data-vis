import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check each shortcut
      shortcuts.forEach(({ key, ctrl, shift, alt, handler, enabled = true }) => {
        if (!enabled) return;

        const keyMatch = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          handler(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// Common shortcuts
export const SHORTCUTS = {
  UNDO: { key: 'z', ctrl: true },
  REDO: { key: 'y', ctrl: true },
  REDO_ALT: { key: 'z', ctrl: true, shift: true },
  SAVE: { key: 's', ctrl: true },
  EXPORT: { key: 'e', ctrl: true },
  NEW: { key: 'n', ctrl: true },
  OPEN: { key: 'o', ctrl: true },
  DELETE: { key: 'Delete' },
  ESCAPE: { key: 'Escape' }
};

export default useKeyboardShortcuts; 