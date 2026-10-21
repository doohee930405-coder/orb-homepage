'use client';

import { useEffect } from 'react';

export default function AdminShortcutListener() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isModifier = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

      // Support physical key codes, English keys, and Korean IME keys:
      // 'A' key on Korean keyboard produces 'ㅁ'
      // 'M' key on Korean keyboard produces 'ㅡ'
      const isA = code === 'KeyA' || key === 'a' || key === 'ㅁ';
      const isM = code === 'KeyM' || key === 'm' || key === 'ㅡ';

      // Shortcuts to open Admin:
      // 1. Ctrl+Shift+A / Ctrl+Shift+M
      // 2. Alt+A / Alt+M (recommended as it avoids Chrome's Ctrl+Shift+A "Search Tabs" conflict)
      // 3. Ctrl+Alt+A / Ctrl+Alt+M
      if (
        (isModifier && isShift && (isA || isM)) ||
        (isAlt && (isA || isM)) ||
        (isModifier && isAlt && (isA || isM))
      ) {
        e.preventDefault();
        window.location.href = '/admin/columns';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
