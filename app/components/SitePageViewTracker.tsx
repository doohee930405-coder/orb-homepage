'use client';

import { useEffect, useRef } from 'react';

export default function SitePageViewTracker() {
  const lastTrackedPathRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trackCurrentPage = () => {
      try {
        const path = window.location.pathname || '/';

        // 1. Exclude admin dashboard and internal API endpoints
        if (path.startsWith('/admin') || path.startsWith('/api')) return;

        // 2. Exclude individual column article pages (they are tracked with full metadata by ColumnViewTracker)
        if (path.startsWith('/columns/') && path !== '/columns' && path !== '/columns/') {
          return;
        }

        // 3. Exclude automated bots, crawlers, and headless testing agents
        if (
          navigator.webdriver ||
          (window as any)._phantom ||
          (window as any).__nightmare ||
          /bot|crawler|spider|headless|googlebot|bingbot|yeti|gptbot/i.test(navigator.userAgent || '')
        ) {
          return;
        }

        // 4. Cooldown: 15 seconds per path in sessionStorage to prevent rapid F5 / reload spam
        const cooldownKey = `orb_site_pv_${path}`;
        const lastTime = parseInt(sessionStorage.getItem(cooldownKey) || '0', 10);
        const now = Date.now();
        if (now - lastTime < 15000) {
          lastTrackedPathRef.current = path;
          return;
        }
        sessionStorage.setItem(cooldownKey, now.toString());
        lastTrackedPathRef.current = path;

        // 5. Retrieve or initialize persistent visitor identifier (1-year lifetime)
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

        // 6. Retrieve or initialize session identifier
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
          path,
          title: document.title || '오브한의원 마곡점',
          visitorId,
          sessionId,
          referrer: document.referrer || '',
          type: 'site',
        });

        // Use fetch with keepalive for non-blocking beacon delivery
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {
          try {
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              const blob = new Blob([payload], { type: 'application/json' });
              navigator.sendBeacon('/api/analytics/track', blob);
            }
          } catch {}
        });
      } catch (err) {
        // Silent fail to ensure visitor UX is never disrupted
      }
    };

    // Track on initial page mount
    trackCurrentPage();

    // Listen for client-side navigation (e.g. browser back/forward)
    window.addEventListener('popstate', trackCurrentPage);
    return () => {
      window.removeEventListener('popstate', trackCurrentPage);
    };
  }, []);

  return null;
}
