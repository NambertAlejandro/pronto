'use client';

import { useEffect, useRef } from 'react';

/** Scroll-linked transforms without React rerenders or scroll interception. */
export function usePlanParallax() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = true;

    const update = () => {
      frame = 0;
      if (motion.matches) {
        stage.style.setProperty('--scene-scroll', '0px');
        stage.removeAttribute('data-parallax');
        return;
      }
      if (!visible) return;
      const top = stage.getBoundingClientRect().top;
      const distance = Math.min(700, Math.max(0, window.innerHeight * 0.45 - top));
      const strength = window.innerWidth <= 700 ? 0.3 : 1;
      stage.style.setProperty('--scene-scroll', `${(distance * strength).toFixed(2)}px`);
      stage.setAttribute('data-parallax', 'active');
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }, { rootMargin: '100px' });

    observer.observe(stage);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);

  return ref;
}
