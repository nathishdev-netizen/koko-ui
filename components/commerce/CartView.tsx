'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

import { OrderSummary } from '@/components/commerce/OrderSummary';
import {
  Button,
  Heading,
  HStack,
  IconButton,
  Icon,
  NumberInput,
  Text,
  VStack,
} from '@/components/ui';
import { BogoNudge } from '@/components/commerce/BogoNudge';
import { CouponField } from '@/components/commerce/CouponField';
import { FirstOrderBanner } from '@/components/commerce/FirstOrderBanner';
import { FreeShippingNudge } from '@/components/commerce/FreeShippingNudge';
import { commerce } from '@/config/commerce';
import { formatMoney } from '@/lib/format';
import { useCart } from '@/lib/cart/CartProvider';

/** Cart contents with quantity controls and a server-priced summary. */
export function CartView() {
  const { cart, isLoading, update, remove } = useCart();
  // The coupon is passed to the quote; the server decides if it is valid.
  const [coupon, setCoupon] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Text type="supporting" color="secondary">
        Loading your cart…
      </Text>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <VStack gap={3} padding={8} hAlign="center" className="kf-center-text">
        <Heading level={2}>Your cart is empty</Heading>
        <Text color="secondary">{commerce.shipping.note} — worth filling it up.</Text>
        <Button label="Shop all blends" href="/shop" variant="primary" size="lg" />
      </VStack>
    );
  }

  // Display hint only — the real shipping figure comes from the quote.
  const subtotal = cart.lines.reduce(
    (sum, line) => sum + line.unitPrice.amount * line.quantity,
    0,
  );

  return (
    <div className="kf-cart-grid">
      <VStack gap={3}>
        <BogoNudge />
        <FirstOrderBanner subtotalPaise={subtotal} />
        <FreeShippingNudge
          subtotalPaise={subtotal}
          thresholdPaise={commerce.shipping.freeThresholdPaise}
        />
        {cart.lines.map((line) => (
          <div key={line.id} className="kf-cart-line">
            <Link href={`/shop/${line.productSlug}`} className="kf-cart-media">
              {line.image ? (
                <Image
                  src={line.image.url}
                  alt=""
                  fill
                  sizes="88px"
                  className="kf-cart-img"
                />
              ) : null}
            </Link>

            <VStack gap={1}>
              <Text weight="medium">{line.name}</Text>
              <Text type="supporting" color="secondary">
                {line.variantLabel}
              </Text>

              {/* Bundle contents render as a readable list, never a blob of
                  text smuggled through an address field. */}
              {line.bundle ? (
                <ul className="kf-bundle-contents">
                  {line.bundle.contents.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              ) : null}

              <HStack gap={2} vAlign="center" className="kf-buy-row">
                <NumberInput
                  value={line.quantity}
                  onChange={(value) => update(line.id, value ?? 1)}
                  min={1}
                  max={20}
                  label={`Quantity for ${line.name}`}
                  isLabelHidden
                />
                <IconButton
                  label={`Remove ${line.name}`}
                  variant="ghost"
                  onClick={() => remove(line.id)}
                  icon={<Icon icon="close" />}
                />
              </HStack>
            </VStack>

            <VStack gap={0.5} hAlign="end">
              <span className="kf-price kf-price--sm kf-numeric">
                {formatMoney({
                  amount: line.unitPrice.amount * line.quantity,
                  currency: 'INR',
                })}
              </span>
              <Text type="supporting" color="secondary">
                {formatMoney(line.unitPrice)} each
              </Text>
            </VStack>
          </div>
        ))}
      </VStack>

      <VStack gap={3}>
        <OrderSummary cart={cart} couponCode={coupon ?? undefined} />
        <CouponField
          applied={coupon}
          onApply={setCoupon}
          onClear={() => setCoupon(null)}
        />
        <Button label="Checkout" href="/checkout" variant="primary" size="lg" />
      </VStack>

      {/* Mobile: total + checkout stay reachable while scrolling the lines. */}
      <div className="kf-sticky-buy">
        <VStack gap={0}>
          <Text type="supporting" color="secondary">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </Text>
          <span className="kf-price kf-price--sm kf-numeric">
            {formatMoney({ amount: subtotal, currency: 'INR' })}
          </span>
        </VStack>
        <Button label="Checkout" href="/checkout" variant="primary" />
      </div>
    </div>
  );
}
