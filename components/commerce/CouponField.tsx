'use client';

import { useState } from 'react';

import { Button, HStack, Text, TextInput, VStack } from '@/components/ui';

/**
 * Coupon entry.
 *
 * The code is passed to the pricing quote and validated SERVER-side — this
 * component never decides whether a coupon is valid or what it is worth. The
 * applied discount appears in the summary because the quote returns it.
 */
export function CouponField({
  applied,
  onApply,
  onClear,
}: {
  applied: string | null;
  onApply: (code: string) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState('');

  if (applied) {
    return (
      <HStack gap={2} hAlign="between" vAlign="center">
        <Text type="supporting">
          Coupon <strong>{applied}</strong> applied
        </Text>
        <button type="button" className="kf-link-button" onClick={onClear}>
          Remove
        </button>
      </HStack>
    );
  }

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="end" className="kf-coupon-row">
        <TextInput
          label="Coupon code"
          value={code}
          onChange={(value) => setCode(value.toUpperCase())}
          isOptional
        />
        <Button
          label="Apply"
          variant="secondary"
          isDisabled={code.trim().length === 0}
          onClick={() => onApply(code.trim())}
        />
      </HStack>
    </VStack>
  );
}
