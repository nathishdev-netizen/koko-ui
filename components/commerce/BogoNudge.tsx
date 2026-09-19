'use client';

import { useEffect, useState } from 'react';

import { Badge, Card, Text, VStack } from '@/components/ui';
import { getBogoOffers } from '@/lib/api/promotions';
import type { BogoOffer } from '@/lib/api/types';
import { useCart } from '@/lib/cart/CartProvider';

/**
 * BOGO messaging in the cart.
 *
 * `free = floor(qty / 2)`, matching the legacy rule. Which products qualify is
 * decided by the backend (or the explicit list in lib/api/promotions.ts) — the
 * legacy name-matching fallback is deliberately not ported, since it matched
 * nearly the whole catalogue.
 *
 * Renders nothing when no offer applies, which is the current default.
 */
export function BogoNudge() {
  const { cart } = useCart();
  const [offers, setOffers] = useState<readonly BogoOffer[]>([]);

  useEffect(() => {
    let active = true;
    getBogoOffers(cart).then((next) => {
      if (active) setOffers(next);
    });
    return () => {
      active = false;
    };
  }, [cart]);

  if (offers.length === 0) return null;

  return (
    <VStack gap={2}>
      {offers.map((offer) => (
        <Card key={offer.productSlug} padding={4} variant="green">
          <VStack gap={1}>
            {offer.freeQty > 0 ? (
              <Text weight="medium">
                You are getting {offer.freeQty}{' '}
                {offer.freeQty === 1 ? 'item' : 'items'} free
              </Text>
            ) : null}
            {offer.oneMoreEarnsFree ? (
              <Text type="supporting">
                Add 1 more {offer.productName} to get another free.
              </Text>
            ) : null}
            <Badge variant="green" label="Buy 1 get 1" />
          </VStack>
        </Card>
      ))}
    </VStack>
  );
}
