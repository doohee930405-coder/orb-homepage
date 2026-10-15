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
      const key = e.key.toLowerCase();

      // Ctrl+Shift+A (Admin) or Ctrl+Shift+M (Migration) or Alt+A
      if ((isModifier && isShift && (key === 'a' || key === 'm')) || (e.altKey && key === 'a')) {
        e.preventDefault();
        window.location.href = '/admin/columns';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
