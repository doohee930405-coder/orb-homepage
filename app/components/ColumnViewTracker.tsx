'use client';

import { useEffect, useRef } from 'react';

interface ColumnViewTrackerProps {
  slug: string;
}

export default function ColumnViewTracker({ slug }: ColumnViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!slug || trackedRef.current || typeof window === 'undefined') return;

    // Exclude automated bots and headless browsers
    if (
      navigator.webdriver ||
      (window as any)._phantom ||
      (window as any).__nightmare ||
      /bot|crawler|spider|headless|googlebot|bingbot|yeti|gptbot/i.test(navigator.userAgent || '')
    ) {
      return;
    }

    trackedRef.current = true;

    // Cooldown check for the same article (avoid double-counting rapid reload/re-render within 15s)
    try {
      const lastViewKey = `orb_last_view_${slug}`;
      const lastViewTime = parseInt(sessionStorage.getItem(lastViewKey) || '0', 10);
      const now = Date.now();
      if (now - lastViewTime < 15000) {
        return;
      }
      sessionStorage.setItem(lastViewKey, now.toString());
    } catch {}

    // 1. Retrieve or initialize persistent visitor identifier (across sessions, 1-year lifetime)
    let visitorId = '';
    try {
      visitorId = localStorage.getItem('orb_vid') || '';
      if (!visitorId) {
        const cookieMatch = document.cookie.match(/(?:^|;\s*)orb_vid=([^;]+)/);
        if (cookieMatch) visitorId = decodeURIComponent(cookieMatch[1]);
      }
      if (!visitorId) {
        visitorId = `vid_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('orb_vid', visitorId);
        document.cookie = `orb_vid=${encodeURIComponent(visitorId)}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      if (!visitorId) {
        visitorId = `vid_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
      }
    }

    // 2. Retrieve or initialize session identifier (per-session)
    let sessionId = '';
    try {
      sessionId = sessionStorage.getItem('orb_visitor_session_id') || '';
      if (!sessionId) {
        sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('orb_visitor_session_id', sessionId);
      }
    } catch {
      sessionId = `sess_${Date.now()}`;
    }

    const payload = JSON.stringify({
      slug,
      path: `/columns/${slug}`,
      title: document.title || '오브한의원 의학 칼럼',
      referrer: document.referrer || '',
      visitorId,
      sessionId,
      type: 'column',
    });

    // Use fetch with keepalive for standard HTTP payload delivery
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Fallback to sendBeacon if fetch fails or page is unloading
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/track', blob);
        }
      } catch {}
    });
  }, [slug]);

  return null;
}
