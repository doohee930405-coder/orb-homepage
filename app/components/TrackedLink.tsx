'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';

type AnalyticsEvent = 'booking_click' | 'phone_click' | 'map_click';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: AnalyticsEvent;
  children: ReactNode;
  eventLabel?: string;
};

export default function TrackedLink({
  eventName,
  eventLabel,
  children,
  href,
  ...props
}: TrackedLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={() => {
        window.gtag?.('event', eventName, {
          link_url: href,
          link_text: eventLabel,
        });
      }}
    >
      {children}
    </a>
  );
}
