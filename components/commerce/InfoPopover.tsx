'use client';

import { useState, type ReactNode } from 'react';

import { InfoIcon } from '@/components/icons';
import { Dialog } from '@/components/ui';

/**
 * The legacy PDP's ⓘ affordance: a small icon button beside a claim that opens
 * a modal explaining it. Used on "Made fresh for you"; reusable wherever a
 * short promise needs the longer story behind it.
 *
 * A real Dialog rather than a CSS tooltip: the content is a sentence or two,
 * it must be reachable by keyboard and screen reader, and a hover tooltip is
 * unusable on touch — which is where most of this traffic is.
 */
export function InfoPopover({
  label,
  title,
  subtitle,
  icon,
  children,
}: {
  /** Accessible name for the trigger, e.g. "Why we grind after you order". */
  label: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="kf-info-trigger"
        onClick={() => setIsOpen(true)}
        aria-label={label}
      >
        <InfoIcon aria-hidden="true" />
      </button>

      <Dialog isOpen={isOpen} onOpenChange={setIsOpen} purpose="info" padding={0} width={460}>
        <div className="kf-info-modal">
          <div className="kf-info-head">
            {icon ? <span className="kf-info-head-icon">{icon}</span> : null}
            <div className="kf-info-head-text">
              <h3 className="kf-info-title">{title}</h3>
              {subtitle ? <p className="kf-info-subtitle">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              className="kf-picker-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <CloseMark />
            </button>
          </div>
          <div className="kf-info-body">{children}</div>
        </div>
      </Dialog>
    </>
  );
}

function CloseMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
