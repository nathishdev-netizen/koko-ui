'use client';

import { useEffect, useState } from 'react';

import { Divider, HStack, Text, VStack } from '@/components/ui';
import { getQuote, type Quote, type QuoteDestination } from '@/lib/api/pricing';
import type { Cart } from '@/lib/api/types';
import { formatMoney } from '@/lib/format';

/**
 * Order summary — the ONLY place totals are displayed.
 *
 * Every figure comes from `getQuote()`. Nothing is added up locally: the legacy
 * storefront recomputed the cart in four different places and showed customers
 * three different shipping figures for the same order.
 */
export function OrderSummary({
  cart,
  destination,
  couponCode,
}: {
  cart: Cart;
  destination?: QuoteDestination;
  couponCode?: string;
}) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isPricing, setIsPricing] = useState(false);

  useEffect(() => {
    if (cart.lines.length === 0) {
      setQuote(null);
      return;
    }
    let active = true;
    setIsPricing(true);
    getQuote({
      items: cart.lines.map((line) => ({
        variantId: line.variantId,
        quantity: line.quantity,
      })),
      destination,
      couponCode,
    })
      .then((next) => {
        if (active) setQuote(next);
      })
      .finally(() => {
        if (active) setIsPricing(false);
      });
    return () => {
      active = false;
    };
  }, [cart, destination, couponCode]);

  if (cart.lines.length === 0) return null;

  return (
    <VStack gap={3} className="kf-summary">
      <Text type="label">Order summary</Text>
      <Divider />

      {quote ? (
        <VStack gap={1.5}>
          <Row label={`Subtotal (${cart.itemCount} items)`} value={formatMoney(quote.subtotal)} />
          {quote.discount.amount > 0 ? (
            <Row
              label={quote.couponApplied ? `Discount (${quote.couponApplied})` : 'Discount'}
              value={`− ${formatMoney(quote.discount)}`}
              tone="success"
            />
          ) : null}
          <Row
            label="Shipping"
            value={
              quote.shippingFee.amount === 0 ? 'Free' : formatMoney(quote.shippingFee)
            }
          />
          <Divider />
          <HStack gap={2} hAlign="between" vAlign="end">
            <Text weight="semibold">Total</Text>
            <span className="kf-price kf-numeric">{formatMoney(quote.total)}</span>
          </HStack>

          {quote.notes.map((note) => (
            <Text key={note} type="supporting" color="secondary">
              {note}
            </Text>
          ))}
        </VStack>
      ) : (
        <Text type="supporting" color="secondary">
          {isPricing ? 'Calculating…' : 'Add something to see your total.'}
        </Text>
      )}
    </VStack>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success';
}) {
  return (
    <HStack gap={2} hAlign="between">
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Text type="supporting" className={tone === 'success' ? 'kf-discount' : undefined}>
        {value}
      </Text>
    </HStack>
  );
}
