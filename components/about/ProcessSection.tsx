'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { Heading, Text } from '@/components/ui';

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

/**
 * "Our Process — The KoKoFresh Way", reproducing the legacy section's
 * behaviour without framer-motion:
 *
 * Desktop: a sticky figure on the left shows the ACTIVE step's photograph and
 * crossfades as the six steps scroll past on the right. Which step is active
 * is decided by an IntersectionObserver whose bottom margin is -50%, so a step
 * becomes active as it crosses the middle of the viewport — the legacy
 * threshold. The number badge scales up and fills when active.
 *
 * Mobile: each step carries its own inline photo, and a sticky 1–6 stepper
 * with a progress bar sits under the header; tapping a number scrolls there.
 *
 * All six images are mounted once and toggled with `data-active`, so a swap is
 * an opacity transition rather than a remount — no flash, no refetch.
 */
export function ProcessSection({
  title,
  subtitleLead,
  subtitleBrand,
  subtitleTail,
  steps,
}: {
  title: string;
  subtitleLead: string;
  subtitleBrand: string;
  subtitleTail: string;
  steps: readonly ProcessStep[];
}) {
  const [active, setActive] = useState(steps[0]?.id ?? '1');
  const [isMobile, setIsMobile] = useState(false);
  const stepRefs = useRef<Record<string, HTMLElement | null>>({});
  const stepperRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const apply = () => setIsMobile(mql.matches);
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.id;
            if (id) setActive(id);
          }
        }
      },
      isMobile
        ? { threshold: 0.6, rootMargin: '-20% 0px -20% 0px' }
        : { threshold: 0, rootMargin: '0px 0px -50% 0px' },
    );
    for (const step of steps) {
      const el = stepRefs.current[step.id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [isMobile, steps]);

  function goTo(id: string) {
    const el = stepRefs.current[id];
    if (!el) return;
    if (isMobile) {
      // Clear the sticky header and the stepper itself.
      const offset = 72 + (stepperRef.current?.getBoundingClientRect().height ?? 0) + 12;
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - offset, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const activeIndex = Math.max(0, steps.findIndex((s) => s.id === active));

  return (
    <section className="kf-process" aria-labelledby="process-title">
      <div className="kf-process-head">
        <Heading level={2} id="process-title" className="kf-process-title">
          {title}
        </Heading>
        <Text className="kf-process-sub">
          {subtitleLead} <strong>{subtitleBrand}</strong> {subtitleTail}
        </Text>
      </div>

      {isMobile ? (
        <nav ref={stepperRef} className="kf-process-stepper" aria-label="Process steps">
          <div className="kf-process-stepper-row">
            {steps.map((s) => (
              <button
                key={s.id}
                type="button"
                className="kf-process-stepper-btn"
                data-active={s.id === active || undefined}
                aria-current={s.id === active ? 'step' : undefined}
                onClick={() => goTo(s.id)}
              >
                {s.id}
              </button>
            ))}
          </div>
          <div className="kf-process-progress" aria-hidden="true">
            <span style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }} />
          </div>
        </nav>
      ) : null}

      <div className="kf-process-layout">
        {!isMobile ? (
          <div className="kf-process-figure" aria-hidden="true">
            <div className="kf-process-frame">
              {steps.map((s) => (
                <Image
                  key={s.id}
                  src={s.image}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 45vw, 520px"
                  className="kf-process-img"
                  data-active={s.id === active || undefined}
                  priority={s.id === steps[0]?.id}
                />
              ))}
            </div>
          </div>
        ) : null}

        <ol className="kf-process-steps">
          {steps.map((s) => (
            <li
              key={s.id}
              data-id={s.id}
              ref={(el) => {
                stepRefs.current[s.id] = el;
              }}
              className="kf-process-step"
              data-active={s.id === active || undefined}
            >
              {isMobile ? (
                <div className="kf-process-mobile-media">
                  <Image src={s.image} alt={s.alt} fill sizes="100vw" className="kf-process-img" data-active />
                </div>
              ) : null}
              <div className="kf-process-step-head">
                <span className="kf-process-num" aria-hidden="true">
                  {s.id}
                </span>
                <h3 className="kf-process-step-title">{s.title}</h3>
              </div>
              <p className="kf-process-desc">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
