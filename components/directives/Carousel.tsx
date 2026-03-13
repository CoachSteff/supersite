'use client';

import React, { useRef, useState, useEffect, Children } from 'react';
import styles from '@/styles/Directives.module.css';

/** Extract individual images from paragraph wrappers */
function extractSlides(children: React.ReactNode): React.ReactNode[] {
  const items: React.ReactNode[] = [];
  Children.forEach(children, (child: any) => {
    if (child?.type === 'img') {
      items.push(child);
    } else if (child?.props?.children) {
      const inner = Children.toArray(child.props.children);
      const images = inner.filter((c: any) => c?.type === 'img');
      if (images.length > 1) {
        images.forEach(img => items.push(img));
      } else {
        items.push(child);
      }
    } else {
      items.push(child);
    }
  });
  return items;
}

export default function Carousel({ children }: any) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slides = extractSlides(children);
  const [active, setActive] = useState(0);

  function scrollTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[index] as HTMLElement;
    if (slide) {
      track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    }
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setActive(index);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselViewport}>
        {slides.length > 1 && (
          <button
            className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
            onClick={() => scrollTo(Math.max(0, active - 1))}
            aria-label="Previous slide"
          >
            {'\u2039'}
          </button>
        )}
        <div ref={trackRef} className={styles.carouselTrack}>
          {slides.map((slide, i) => (
            <div key={i} className={styles.carouselSlide}>
              {slide}
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <button
            className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
            onClick={() => scrollTo(Math.min(slides.length - 1, active + 1))}
            aria-label="Next slide"
          >
            {'\u203A'}
          </button>
        )}
      </div>
      {slides.length > 1 && (
        <div className={styles.carouselNav} role="tablist">
          {slides.map((_, i) => (
            <button
              key={i}
              className={styles.carouselDot}
              data-active={i === active || undefined}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              role="tab"
              aria-selected={i === active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
