'use client';

import { useState } from 'react';

import { NotifyMeModal } from '@/components/commerce/NotifyMeModal';

import { MinusIcon, PlusIcon } from '@/components/icons';
import {
  Badge,
  Button,
  HStack,
  SegmentedControl,
  SegmentedControlItem,
  Text,
  VStack,
} from '@/components/ui';
import { useCart } from '@/lib/cart/CartProvider';
import { formatMoney } from '@/lib/format';
import type { Product } from '@/lib/api/types';

/**
 * Buy box — variant selection, quantity and add-to-cart.
 *
 * Adapted from the Astryx `product-detail` template. Prices shown are the ones
 * the backend sent; nothing is computed here, and no MRP is ever synthesised.
 * (The legacy PDP back-computed a fake "original price" from a hardcoded
 * per-weight percentage — a fabricated discount we deliberately do not port.)
 */
export function ProductBuyBox({ product }: { product: Product }) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  if (!variant) return null;

  const qty = quantity;
  const onSale =
    variant.compareAtPrice !== null &&
    variant.compareAtPrice.amount > variant.price.amount;

  return (
    <VStack gap={4}>
      <VStack gap={1.5}>
        <HStack gap={2} vAlign="end" wrap="wrap">
          <span className="kf-price kf-price--lg kf-numeric">
            {formatMoney(variant.price)}
          </span>
          {onSale && variant.compareAtPrice ? (
            <>
              <span className="kf-price-was kf-numeric">
                {formatMoney(variant.compareAtPrice)}
              </span>
              <Badge
                variant="error"
                label={`${discountPercent(variant.price.amount, variant.compareAtPrice.amount)}% off`}
              />
            </>
          ) : null}
        </HStack>
        <Text type="supporting" color="secondary">
          Inclusive of all taxes · {variant.weightGrams}g
        </Text>
      </VStack>

      {product.variants.length > 1 ? (
        <VStack gap={1.5}>
          <Text type="label">Size</Text>
          <VStack hAlign="start" className="kf-buy-row">
            <SegmentedControl value={variantId} onChange={setVariantId} label="Size">
              {product.variants.map((option) => (
                <SegmentedControlItem
                  key={option.id}
                  value={option.id}
                  label={option.label}
                  isDisabled={!option.inStock}
                />
              ))}
            </SegmentedControl>
          </VStack>
        </VStack>
      ) : null}

      <VStack gap={1.5}>
        <Text type="label">Quantity</Text>
        <HStack gap={2} vAlign="center" className="kf-buy-row">
          {/* The legacy −/+ stepper. Astryx's NumberInput renders no visible
              step buttons, so a customer had nothing to press. */}
          <div className="kf-qty">
            <button
              type="button"
              onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              aria-label="Decrease quantity"
              disabled={qty <= 1}
            >
              <MinusIcon aria-hidden="true" />
            </button>
            <span className="kf-qty-value kf-numeric" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((n) => Math.min(20, n + 1))}
              aria-label="Increase quantity"
              disabled={qty >= 20}
            >
              <PlusIcon aria-hidden="true" />
            </button>
          </div>
          <Text type="supporting" color="secondary">
            {formatMoney({ amount: variant.price.amount * qty, currency: 'INR' })} total
          </Text>
        </HStack>
      </VStack>

      <Button
        label={isAdding ? 'Adding…' : variant.inStock ? 'Add to cart' : 'Notify me'}
        variant="primary"
        size="lg"
        isDisabled={isAdding}
        onClick={async () => {
          // Out of stock: the same button opens the notify-me capture.
          if (!variant.inStock) {
            setNotifyOpen(true);
            return;
          }
          setIsAdding(true);
          try {
            await add({
              variantId: variant.id,
              productSlug: product.slug,
              name: product.name,
              variantLabel: variant.label,
              image: product.image,
              unitPrice: variant.price,
              quantity: qty,
            });
          } finally {
            setIsAdding(false);
          }
        }}
      />

      <Text type="supporting" color="secondary">
        {variant.inStock
          ? 'Ground fresh after you order · delivered in 3–5 days'
          : 'This blend is not milled yet. We will let you know the moment it is.'}
      </Text>

      <NotifyMeModal
        productName={product.name}
        isOpen={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />

      {/* Mobile: the action follows the customer down the page. */}
      <div className="kf-sticky-buy">
        <span className="kf-price kf-price--sm kf-numeric">
          {formatMoney(variant.price)}
        </span>
        <Button
          label={variant.inStock ? 'Add to cart' : 'Notify me'}
          variant="primary"
          onClick={() => {
            if (!variant.inStock) {
              setNotifyOpen(true);
              return;
            }
            void add({
              variantId: variant.id,
              productSlug: product.slug,
              name: product.name,
              variantLabel: variant.label,
              image: product.image,
              unitPrice: variant.price,
              quantity: qty,
            });
          }}
        />
      </div>
    </VStack>
  );
}

function discountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100);
}
