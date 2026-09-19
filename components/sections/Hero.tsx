'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button, Heading } from '@/components/ui';

export type HeroSlide = {
  title: string;
  titleAccent: string;
  body: string;
  image: string;
  alt: string;
};

/**
 * Hero. Full-bleed photography with a cross-fade between slides.
 *
 * Slide 1 is the LCP element, so it is a priority next/image and every slide is
 * in the DOM at load — nothing is parked at opacity 0 waiting on JS, which
 * keeps the first frame complete for crawlers and for a shared-link preview.
 *
 * Auto-advance stops entirely under prefers-reduced-motion, and pauses on
 * hover/focus so a keyboard user is never fighting the rotation.
 */
export function Hero({
  eyebrow,
  slides,
  cta,
}: {
  eyebrow: string;
  slides: readonly HeroSlide[];
  cta: { label: string; href: string };
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  const active = slides[index] ?? slides[0];
  if (!active) return null;

  return (
    <section
      className="kf-hero"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="kf-hero-media">
        {slides.map((slide, i) => (
          <Image
            key={slide.image}
            src={slide.image}
            alt={i === index ? slide.alt : ''}
            fill
            sizes="100vw"
            priority={i === 0}
            className="kf-hero-img"
            data-active={i === index || undefined}
          />
        ))}
        <div className="kf-hero-scrim" />
      </div>

      <div className="kf-hero-content">
        <p className="kf-eyebrow kf-hero-eyebrow">{eyebrow}</p>

        <Heading level={1} type="display-1">
          <span className="kf-hero-line">{active.title}</span>
          <span className="kf-hero-line kf-hero-accent">{active.titleAccent}</span>
        </Heading>

        <p className="kf-hero-body">{active.body}</p>

        <div className="kf-hero-cta">
          <Button label={cta.label} href={cta.href} variant="primary" size="lg" />
        </div>

        {slides.length > 1 ? (
          <div className="kf-hero-dots" role="group" aria-label="Choose slide">
            {slides.map((slide, i) => (
              <button
                key={slide.image}
                type="button"
                className="kf-hero-dot"
                data-active={i === index || undefined}
                aria-label={`${slide.title} ${slide.titleAccent}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
