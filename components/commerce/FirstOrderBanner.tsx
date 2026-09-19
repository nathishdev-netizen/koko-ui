'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';

import { Button, Card, Text, TextInput, VStack } from '@/components/ui';
import { claimFirstOrderCoupon, getFirstOrderOffer } from '@/lib/api/promotions';
import type { FirstOrderOffer } from '@/lib/api/types';
import { formatMoney } from '@/lib/format';

const emailSchema = z.email('Enter a valid email address.');

/**
 * First-order offer.
 *
 * 25% at ≥ ₹399, else 20% — but the rate comes from the server, not from a
 * threshold repeated here. Capturing an email in exchange for the code is how
 * the legacy version worked too; it doubles as the signup incentive.
 */
export function FirstOrderBanner({ subtotalPaise }: { subtotalPaise: number }) {
  const [offer, setOffer] = useState<FirstOrderOffer | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [claimed, setClaimed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getFirstOrderOffer(subtotalPaise).then((next) => {
      if (active) setOffer(next);
    });
    return () => {
      active = false;
    };
  }, [subtotalPaise]);

  if (!offer?.isEligible) return null;

  if (claimed) {
    return (
      <Card padding={4} variant="green">
        <VStack gap={1}>
          <Text weight="medium">Your code: {claimed}</Text>
          <Text type="supporting" color="secondary">
            {offer.percentOff}% off this order. Enter it at checkout.
          </Text>
        </VStack>
      </Card>
    );
  }

  const shortfall = offer.minSubtotalForHigher.amount - subtotalPaise;

  return (
    <Card padding={4}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text weight="medium">
            {offer.percentOff}% off your first order
          </Text>
          <Text type="supporting" color="secondary">
            {shortfall > 0
              ? `Spend ${formatMoney({ amount: shortfall, currency: 'INR' })} more to get 25% instead of 20%.`
              : 'Your highest first-order discount is unlocked.'}
          </Text>
        </VStack>

        <form
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            const parsed = emailSchema.safeParse(email);
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message);
              return;
            }
            setError(undefined);
            setBusy(true);
            try {
              const coupon = await claimFirstOrderCoupon(parsed.data);
              setClaimed(coupon.code);
            } finally {
              setBusy(false);
            }
          }}
        >
          <VStack gap={2}>
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              description="We will send your code here."
              status={error ? { type: 'error', message: error } : undefined}
            />
            <Button
              label={busy ? 'Getting your code…' : 'Get my code'}
              variant="primary"
              type="submit"
              isDisabled={busy}
            />
          </VStack>
        </form>
      </VStack>
    </Card>
  );
}
