'use client';

import { useEffect } from 'react';

export default function SiteMotion() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const root = document.documentElement;
    root.setAttribute('data-motion-ready', 'true');
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-inview', '');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        section.setAttribute('data-inview', '');
      } else {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
      root.removeAttribute('data-motion-ready');
    };
  }, []);

  return null;
}
