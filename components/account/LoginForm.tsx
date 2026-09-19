'use client';

import { useState } from 'react';
import { z } from 'zod';

import { Button, Text, TextInput, VStack } from '@/components/ui';

const emailSchema = z.email('Enter a valid email address.');

/**
 * Sign-in request.
 *
 * Email-link auth: this form never collects or stores a password, and the
 * session is established by Frappe as an httpOnly cookie. No token is ever
 * readable from JavaScript here.
 */
export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <VStack gap={1}>
        <Text weight="medium">Check your inbox</Text>
        <Text type="supporting" color="secondary">
          We sent a sign-in link to {email}.
        </Text>
      </VStack>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = emailSchema.safeParse(email);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message);
          return;
        }
        setError(undefined);
        // The request itself lands with the auth endpoint in Phase 10.
        setSent(true);
      }}
      noValidate
    >
      <VStack gap={3}>
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          isRequired
          status={error ? { type: 'error', message: error } : undefined}
        />
        <input type="hidden" name="next" value={next} />
        <Button label="Email me a link" variant="primary" size="lg" type="submit" />
      </VStack>
    </form>
  );
}
