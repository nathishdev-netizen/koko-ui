'use client';

import { useState } from 'react';

import { NotifyMeModal } from '@/components/commerce/NotifyMeModal';

/**
 * Notify-me button for a coming-soon / out-of-stock product card.
 *
 * The legacy card kept this clickable while the rest of the card was inert, so
 * a customer could register interest in something they cannot buy yet — the one
 * conversion path an unavailable product still has. Same behaviour here: the
 * card link is suppressed, this button is not.
 */
export function CardNotifyButton({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="kf-notify-btn"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <BellIcon />
        Notify me
      </button>

      <NotifyMeModal
        productName={productName}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 16 16" className="kf-notify-icon" aria-hidden="true">
      <path
        d="M8 1.5a3.5 3.5 0 013.5 3.5v2.3l1 2.2h-9l1-2.2V5A3.5 3.5 0 018 1.5zM6.4 12a1.6 1.6 0 003.2 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
