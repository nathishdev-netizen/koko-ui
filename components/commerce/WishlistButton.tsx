'use client';

import { useEffect, useState } from 'react';

import { HeartIcon } from '@/components/icons';
import { addToWishlist, getWishlist, removeFromWishlist } from '@/lib/api/wishlist';

/**
 * Wishlist toggle.
 *
 * Every change round-trips to the server, so a saved item follows the customer
 * across devices. The legacy heart had no onClick at all — it was decorative.
 */
export function WishlistButton({
  productSlug,
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  const [saved, setSaved] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getWishlist().then((slugs) => {
      if (active) setSaved(slugs.includes(productSlug));
    });
    return () => {
      active = false;
    };
  }, [productSlug]);

  return (
    <button
      type="button"
      className="kf-wish"
      data-on={saved || undefined}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName}`}
      disabled={isBusy}
      onClick={async (event) => {
        // The card is a link; keep the toggle from navigating.
        event.preventDefault();
        event.stopPropagation();
        setIsBusy(true);
        try {
          const next = saved
            ? await removeFromWishlist(productSlug)
            : await addToWishlist(productSlug);
          setSaved(next.includes(productSlug));
        } finally {
          setIsBusy(false);
        }
      }}
    >
      <HeartIcon aria-hidden="true" />
    </button>
  );
}
