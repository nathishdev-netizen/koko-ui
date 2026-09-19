'use client';

import { useEffect } from 'react';

/**
 * Parallax: elements marked `data-parallax="<strength>"` drift slightly slower
 * than the page as they scroll through the viewport.
 *
 * Deliberately restrained — a few pixels of offset reads as depth; more reads
 * as a gimmick and hurts readability. Disabled entirely under
 * prefers-reduced-motion, and driven by IntersectionObserver + rAF so it costs
 * nothing while the element is off-screen.
 */
/** Ceiling for the strongest drift (the hero); weaker elements scale down. */
const MAX_OFFSET_PX = 120;

export function Parallax() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax]'),
    );
    if (nodes.length === 0) return;

    const visible = new Set<HTMLElement>();
    let frame = 0;

    const update = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      for (const node of visible) {
        const rect = node.getBoundingClientRect();
        const strength = Number(node.dataset.parallax ?? 0.1);
        // Distance of the element's centre from the viewport centre, scaled.
        const raw = (rect.top + rect.height / 2 - mid) * strength;
        // Clamped: the offset scales with distance from the viewport centre, so
        // on a tall section an un-capped value grows far past "a few pixels of
        // depth" and starts to detach the content from the page.
        const limit = MAX_OFFSET_PX * Math.min(1, strength / 0.2);
        const offset = Math.max(-limit, Math.min(limit, raw));
        node.style.setProperty('--kf-parallax', `${offset.toFixed(1)}px`);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(node);
          else visible.delete(node);
        }
        onScroll();
      },
      { rootMargin: '100px' },
    );

    for (const node of nodes) observer.observe(node);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
