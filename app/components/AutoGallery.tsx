'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ResponsivePicture from './ResponsivePicture';

type GalleryImage = {
  image: string;
  alt: string;
  label: string;
};

export default function AutoGallery({
  images,
  ariaLabel,
  previousLabel,
  nextLabel,
}: {
  images: GalleryImage[];
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const moveTo = useCallback((index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const safeIndex = (index + images.length) % images.length;
    const slide = slider.children[safeIndex] as HTMLElement | undefined;
    if (!slide) return;

    activeIndexRef.current = safeIndex;
    setActiveIndex(safeIndex);
    slider.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  }, [images.length]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;

    const updateActiveSlide = () => {
      const slides = Array.from(slider.children) as HTMLElement[];
      const nearest = slides.reduce((best, slide, index) => {
        return Math.abs(slide.offsetLeft - slider.scrollLeft) <
          Math.abs(slides[best].offsetLeft - slider.scrollLeft)
          ? index
          : best;
      }, 0);
      activeIndexRef.current = nearest;
      setActiveIndex(nearest);
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveSlide);
    };

    slider.addEventListener('scroll', handleScroll, { passive: true });
    const interval = reduceMotion
      ? undefined
      : window.setInterval(() => {
          if (!pausedRef.current) moveTo(activeIndexRef.current + 1);
        }, 6200);

    return () => {
      slider.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(frame);
      if (interval) window.clearInterval(interval);
    };
  }, [images.length, moveTo]);

  return (
    <div
      className="gallery-shell"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onFocus={() => { pausedRef.current = true; }}
      onBlur={() => { pausedRef.current = false; }}
    >
      <div className="gallery-toolbar">
        <p aria-live="polite">
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          <i>/</i>
          <b>{String(images.length).padStart(2, '0')}</b>
        </p>
        <div>
          <button type="button" onClick={() => moveTo(activeIndex - 1)} aria-label={previousLabel}>←</button>
          <button type="button" onClick={() => moveTo(activeIndex + 1)} aria-label={nextLabel}>→</button>
        </div>
      </div>
      <div className="space-slider" ref={sliderRef} aria-label={ariaLabel}>
        {images.map((item, index) => (
          <figure className="gallery-slide" key={item.image}>
            <ResponsivePicture image={item.image} alt={item.alt} />
            <figcaption>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.label}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
