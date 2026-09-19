'use client';

import { useState } from 'react';

import { Button } from '@/components/ui';
import { useCart } from '@/lib/cart/CartProvider';
import type { ProductSummary } from '@/lib/api/types';

/**
 * Weight selector + add-to-cart, directly on the product card.
 *
 * The live site lets a customer buy from the grid without opening the product,
 * which is a real conversion path we were missing. Both controls stop event
 * propagation because the card itself is a link.
 */
export function CardBuyRow({ product }: { product: ProductSummary }) {
  const { add } = useCart();
  const options = product.variantOptions;
  const [variantId, setVariantId] = useState(options[0]?.id ?? '');
  const [busy, setBusy] = useState(false);

  const variant = options.find((v) => v.id === variantId) ?? options[0];
  if (!variant) return null;

  return (
    <div
      className="kf-card-buy"
      onClick={(event) => event.preventDefault()}
      role="presentation"
    >
      {options.length > 1 ? (
        <select
          className="kf-weight-select"
          value={variantId}
          aria-label={`Weight for ${product.name}`}
          onChange={(event) => setVariantId(event.target.value)}
          onClick={(event) => event.stopPropagation()}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id} disabled={!option.inStock}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="kf-weight-static">{variant.label}</span>
      )}

      <Button
        label={busy ? 'Adding…' : product.inStock ? 'Add to cart' : 'Notify me'}
        variant="primary"
        size="sm"
        icon={<CartIcon />}
        isDisabled={busy}
        onClick={async (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!product.inStock) return;
          setBusy(true);
          try {
            await add({
              variantId: variant.id,
              productSlug: `${product.primaryCollectionSlug}/${product.slug}`,
              name: product.name,
              variantLabel: variant.label,
              image: product.image,
              unitPrice: variant.price,
              quantity: 1,
            });
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path
        d="M1.5 1.5h2l1.6 7.4h6.9l1.4-5.2H4.3M6 13a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
