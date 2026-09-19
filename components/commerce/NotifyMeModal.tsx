'use client';

import { useState } from 'react';
import { z } from 'zod';

import { Button, Dialog, DialogHeader, Text, TextInput, VStack } from '@/components/ui';

// Legacy accepted email OR phone, requiring at least one. Kept as-is.
const schema = z
  .object({
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .refine((v) => Boolean(v.email?.trim() || v.phone?.trim()), {
    message: 'Enter an email or a phone number so we can reach you.',
  })
  .refine((v) => !v.email?.trim() || z.email().safeParse(v.email).success, {
    message: 'Enter a valid email address.',
  });

/** Back-in-stock capture for out-of-stock and coming-soon products. */
export function NotifyMeModal({
  productName,
  isOpen,
  onClose,
}: {
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      // `form` keeps a stray backdrop click from discarding typed input.
      purpose="form"
      padding={5}
    >
      <DialogHeader
        title={done ? 'We will let you know' : `Notify me: ${productName}`}
      />
      {done ? (
        <Text type="supporting" color="secondary">
          You are on the list. We will message you the moment {productName} is
          milled.
        </Text>
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = schema.safeParse({ email, phone });
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message);
              return;
            }
            setError(undefined);
            setDone(true);
          }}
        >
          <VStack gap={3}>
            <Text type="supporting" color="secondary">
              This blend is not milled yet. Leave an email or phone number and we
              will tell you the moment it is.
            </Text>
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              isOptional
            />
            <TextInput
              label="Phone"
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
              isOptional
              status={error ? { type: 'error', message: error } : undefined}
            />
            <Button label="Notify me" variant="primary" type="submit" />
          </VStack>
        </form>
      )}
    </Dialog>
  );
}
