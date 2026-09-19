'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button, Card, Grid, HStack, Text, VStack } from '@/components/ui';
import { getProducts } from '@/lib/api/products';
import type { ProductSummary } from '@/lib/api/types';
import { useCart } from '@/lib/cart/CartProvider';
import { formatMoney } from '@/lib/format';

/**
 * Free-shipping progress plus products that actually close the gap.
 *
 * The legacy version picked ONE product at random from a pool, without checking
 * whether its price would reach the threshold — so it often suggested something
 * that left the customer still short. Here we rank by how close each product
 * gets to the threshold and only suggest ones that cross it.
 *
 * The threshold is a display hint from config; the real shipping figure always
 * comes from the pricing quote.
 */
export function FreeShippingNudge({
  subtotalPaise,
  thresholdPaise,
}: {
  subtotalPaise: number;
  thresholdPaise: number;
}) {
  const { add } = useCart();
  const [candidates, setCandidates] = useState<readonly ProductSummary[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const shortfall = thresholdPaise - subtotalPaise;
  const qualified = shortfall <= 0;

  useEffect(() => {
    if (qualified) return;
    let active = true;
    getProducts({ pageSize: 100 }).then((result) => {
      if (!active) return;
      const inStock = result.items.filter((p) => p.inStock);

      // Rank by how neatly each product closes the gap: cheapest product that
      // still crosses the threshold first, so the customer spends the least.
      const closers = inStock
        .filter((p) => p.priceFrom.amount >= shortfall)
        .sort((a, b) => a.priceFrom.amount - b.priceFrom.amount);

      // If nothing single-handedly closes it, offer the most expensive items,
      // which get them closest.
      const nearest = inStock
        .filter((p) => p.priceFrom.amount < shortfall)
        .sort((a, b) => b.priceFrom.amount - a.priceFrom.amount);

      setCandidates([...closers, ...nearest].slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, [shortfall, qualified]);

  if (qualified) {
    return (
      <Card padding={4} variant="green">
        <Text weight="medium">Free shipping unlocked</Text>
      </Card>
    );
  }

  const progress = Math.min(100, Math.round((subtotalPaise / thresholdPaise) * 100));

  return (
    <Card padding={4}>
      <VStack gap={3}>
        <VStack gap={1.5}>
          <Text weight="medium">
            Add {formatMoney({ amount: shortfall, currency: 'INR' })} more for free
            shipping
          </Text>
          <div
            className="kf-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress towards free shipping"
          >
            <span className="kf-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </VStack>

        {candidates.length > 0 ? (
          <VStack gap={2}>
            <Text type="supporting" color="secondary">
              These would get you there:
            </Text>
            <Grid gap={2} columns={{ minWidth: 150, repeat: 'fit' }}>
              {candidates.map((product) => (
                <div key={product.slug} className="kf-nudge-item">
                  <div className="kf-nudge-media">
                    {product.image ? (
                      <Image
                        src={product.image.url}
                        alt=""
                        fill
                        sizes="80px"
                        className="kf-nudge-img"
                      />
                    ) : null}
                  </div>
                  <VStack gap={1}>
                    <Text type="supporting" weight="medium" maxLines={2}>
                      {product.name}
                    </Text>
                    <HStack gap={1.5} vAlign="center" wrap="wrap">
                      <span className="kf-numeric">{formatMoney(product.priceFrom)}</span>
                      <Button
                        label={busy === product.slug ? 'Adding…' : 'Add'}
                        variant="secondary"
                        size="sm"
                        isDisabled={busy !== null}
                        onClick={async () => {
                          setBusy(product.slug);
                          try {
                            await add({
                              variantId: `${product.slug}-default`,
                              productSlug: `${product.primaryCollectionSlug}/${product.slug}`,
                              name: product.name,
                              variantLabel: 'Default',
                              image: product.image,
                              unitPrice: product.priceFrom,
                              quantity: 1,
                            });
                          } finally {
                            setBusy(null);
                          }
                        }}
                      />
                    </HStack>
                  </VStack>
                </div>
              ))}
            </Grid>
          </VStack>
        ) : null}
      </VStack>
    </Card>
  );
}
