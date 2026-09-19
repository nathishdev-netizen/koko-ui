'use client';

import { useState } from 'react';
import { z } from 'zod';

import { Button, Text, TextArea, TextInput, VStack } from '@/components/ui';

const schema = z.object({
  name: z.string().min(2, 'Enter your name.'),
  email: z.email('Enter a valid email address.'),
  message: z.string().min(10, 'Tell us a little more.'),
});

/** Contact form. Submission wires to the backend in Phase 10. */
export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  if (sent) {
    return (
      <VStack gap={1}>
        <Text weight="medium">Thanks — we have your message</Text>
        <Text type="supporting" color="secondary">
          We usually reply within a working day. For anything urgent, WhatsApp is
          faster.
        </Text>
      </VStack>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = schema.safeParse(values);
        if (!parsed.success) {
          const next: Record<string, string> = {};
          for (const issue of parsed.error.issues) {
            const key = String(issue.path[0] ?? '');
            if (key && !next[key]) next[key] = issue.message;
          }
          setErrors(next);
          return;
        }
        setErrors({});
        setSent(true);
      }}
    >
      <VStack gap={3}>
        <TextInput
          label="Your name"
          value={values.name}
          onChange={set('name')}
          autoComplete="name"
          isRequired
          status={errors.name ? { type: 'error', message: errors.name } : undefined}
        />
        <TextInput
          label="Email"
          type="email"
          value={values.email}
          onChange={set('email')}
          autoComplete="email"
          isRequired
          status={errors.email ? { type: 'error', message: errors.email } : undefined}
        />
        <TextArea
          label="Message"
          value={values.message}
          onChange={set('message')}
          rows={5}
          isRequired
          status={errors.message ? { type: 'error', message: errors.message } : undefined}
        />
        <Button label="Send message" variant="primary" size="lg" type="submit" />
      </VStack>
    </form>
  );
}
