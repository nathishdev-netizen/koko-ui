'use client';

import { useState } from 'react';

import { Button, Card, Heading, Text, VStack } from '@/components/ui';
import { claimSpinPrize } from '@/lib/api/promotions';
import type { Coupon, SpinPrize } from '@/lib/api/types';

/**
 * Spin-to-win.
 *
 * Same five segments and weights as the legacy wheel. The difference is where
 * the code comes from: legacy hardcoded KOKO10 / KOKO15 / FREESHIP as string
 * constants in the client bundle, so anyone could read them from the JavaScript
 * and reuse them indefinitely. Here the winning code is issued per spin, so it
 * can be single-use and expiring.
 */
export function SpinWheel({ prizes }: { prizes: readonly SpinPrize[] }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ prize: SpinPrize; coupon: Coupon | null } | null>(
    null,
  );
  const [turns, setTurns] = useState(0);

  const segment = 360 / prizes.length;

  async function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // Weighted pick.
    const total = prizes.reduce((sum, p) => sum + p.weight, 0);
    let roll = Math.random() * total;
    const won = prizes.find((p) => (roll -= p.weight) <= 0) ?? prizes[0]!;
    const index = prizes.indexOf(won);

    // Land the pointer on the winning segment after a few full rotations.
    setTurns((t) => t + 5 * 360 + (360 - index * segment - segment / 2));

    window.setTimeout(async () => {
      const coupon = await claimSpinPrize(won.id);
      setResult({ prize: won, coupon });
      setSpinning(false);
    }, 3200);
  }

  return (
    <VStack gap={4} hAlign="center">
      <div className="kf-wheel-wrap">
        <div
          className="kf-wheel"
          style={{ transform: `rotate(${turns}deg)` }}
          aria-hidden="true"
        >
          {prizes.map((prize, i) => (
            <span
              key={prize.id}
              className="kf-wheel-seg"
              style={{ transform: `rotate(${i * segment}deg)` }}
              data-alt={i % 2 === 1 || undefined}
            >
              <span className="kf-wheel-label">{prize.label}</span>
            </span>
          ))}
        </div>
        <span className="kf-wheel-pin" aria-hidden="true" />
      </div>

      <Button
        label={spinning ? 'Spinning…' : 'Spin the wheel'}
        variant="primary"
        size="lg"
        isDisabled={spinning}
        onClick={spin}
      />

      {/* Announced politely so a screen reader hears the outcome. */}
      <div aria-live="polite">
        {result ? (
          <Card padding={4}>
            <VStack gap={1} hAlign="center">
              <Heading level={2}>{result.prize.label}</Heading>
              {result.coupon ? (
                <>
                  <Text weight="medium">Your code: {result.coupon.code}</Text>
                  <Text type="supporting" color="secondary">
                    Valid for 7 days. Enter it at checkout.
                  </Text>
                </>
              ) : (
                <Text type="supporting" color="secondary">
                  No prize this time — but the shop is still worth a look.
                </Text>
              )}
            </VStack>
          </Card>
        ) : null}
      </div>
    </VStack>
  );
}
