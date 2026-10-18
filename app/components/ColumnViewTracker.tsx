'use client';

import { useEffect, useRef } from 'react';

interface ColumnViewTrackerProps {
  slug: string;
}

export default function ColumnViewTracker({ slug }: ColumnViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!slug || trackedRef.current || typeof window === 'undefined') return;
    trackedRef.current = true;

    // Retrieve or initialize session identifier
    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('orb_visitor_session_id') || '';
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('orb_visitor_session_id', sessionId);
      }
    } catch {
      sessionId = `sess_${Date.now()}`;
    }

    const payload = JSON.stringify({ slug, sessionId });

    // Use sendBeacon if available, fallback to fetch with keepalive
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [slug]);

  return null;
}
