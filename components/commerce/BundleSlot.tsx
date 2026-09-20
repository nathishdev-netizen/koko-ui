'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Dialog, Text } from '@/components/ui';
import type { ProductSummary } from '@/lib/api/types';

/**
 * One numbered slot in a bundle — "Signature Masala Blend 1".
 *
 * This mirrors the legacy interaction, which reads better than a flat grid of
 * togglable products: the customer sees their box as a set of labelled slots,
 * each empty until filled. Clicking a slot opens a picker; choosing shows the
 * product's photo in place, so the box visibly fills up as they go.
 */
export function BundleSlot({
  label,
  products,
  selected,
  onSelect,
  isLocked = false,
}: {
  label: string;
  products: readonly ProductSummary[];
  selected: ProductSummary | null;
  onSelect: (slug: string) => void;
  /** Auto-included items cannot be changed. */
  isLocked?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="kf-slot">
      <span className="kf-slot-label">{label}</span>

      <button
        type="button"
        className="kf-slot-card"
        data-filled={selected ? true : undefined}
        disabled={isLocked}
        aria-haspopup={isLocked ? undefined : 'dialog'}
        onClick={() => !isLocked && setIsOpen(true)}
      >
        {selected ? (
          <>
            <span className="kf-slot-check" aria-hidden="true">
              <CheckMark />
            </span>
            <span className="kf-slot-media">
              {selected.image ? (
                <Image
                  src={selected.image.url}
                  alt=""
                  fill
                  sizes="120px"
                  className="kf-slot-img"
                />
              ) : (
                <span className="kf-slot-initials" aria-hidden="true">
                  {initials(selected.name)}
                </span>
              )}
            </span>
            <span className="kf-slot-name">{selected.name}</span>
            <span className="kf-slot-hint">
              {isLocked ? '✓ Included' : 'Click to change'}
            </span>
          </>
        ) : (
          <>
            <span className="kf-slot-plus" aria-hidden="true">
              +
            </span>
            <span className="kf-slot-name">Add item</span>
            <span className="kf-slot-hint">Tap to choose</span>
          </>
        )}
      </button>

      {isOpen ? (
        <Dialog isOpen={isOpen} onOpenChange={setIsOpen} purpose="info" padding={0} width={420}>
          {/* A plain header rather than DialogHeader: that renders the title
              at display scale, which overflowed the dialog's rounded corners
              for a label this long. This is a UI label, not a page heading. */}
          <div className="kf-picker-head">
            <span className="kf-picker-title">Choose {label}</span>
            <button
              type="button"
              className="kf-picker-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <CloseMark />
            </button>
          </div>
          <ul className="kf-slot-options">
            {products.map((product) => {
              const isSelected = selected?.slug === product.slug;
              return (
                <li key={product.slug}>
                  <button
                    type="button"
                    className="kf-slot-option"
                    data-selected={isSelected || undefined}
                    onClick={() => {
                      onSelect(product.slug);
                      setIsOpen(false);
                    }}
                  >
                    <span className="kf-slot-option-media">
                      {product.image ? (
                        <Image
                          src={product.image.url}
                          alt=""
                          fill
                          sizes="56px"
                          className="kf-slot-img"
                        />
                      ) : (
                        <span className="kf-slot-initials" aria-hidden="true">
                          {initials(product.name)}
                        </span>
                      )}
                    </span>
                    <Text weight="medium">{product.name}</Text>
                    {isSelected ? (
                      <span className="kf-slot-check kf-slot-check--inline" aria-hidden="true">
                        <CheckMark />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </Dialog>
      ) : null}
    </div>
  );
}

function CloseMark() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path
        d="M3 8.4l3.2 3.2L13 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
