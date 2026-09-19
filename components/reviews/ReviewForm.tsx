'use client';

import { useState } from 'react';
import { z } from 'zod';

import { Button, Text, TextArea, TextInput, VStack } from '@/components/ui';
import { submitReview } from '@/lib/api/reviews';

const schema = z.object({
  rating: z.number().min(1, 'Choose a rating.').max(5),
  authorName: z.string().min(2, 'Enter your name.'),
  email: z.email('Enter a valid email address.'),
  title: z.string().optional(),
  body: z.string().min(10, 'Tell us a little more about the blend.'),
});

// Legacy used emotional labels on the star picker; kept.
const LABELS = ['', 'Not for me', 'It was okay', 'Good', 'Really good', 'Absolutely amazing'];

/** Write a review. Submissions land as pending and are moderated. */
export function ReviewForm({
  productSlug,
  productName,
  defaultName = '',
}: {
  productSlug: string;
  productName: string;
  defaultName?: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [values, setValues] = useState({
    authorName: defaultName,
    email: '',
    title: '',
    body: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  if (done) {
    return (
      <VStack gap={1}>
        <Text weight="medium">Thank you</Text>
        <Text type="supporting" color="secondary">
          Your review is with our team and will appear once it is checked.
        </Text>
      </VStack>
    );
  }

  const shown = hovered || rating;

  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const parsed = schema.safeParse({ ...values, rating });
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
        setBusy(true);
        try {
          await submitReview({ ...parsed.data, productSlug });
          setDone(true);
        } finally {
          setBusy(false);
        }
      }}
    >
      <VStack gap={3}>
        <VStack gap={1}>
          <Text type="label">How was {productName}?</Text>
          <div className="kf-rate" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="kf-rate-star"
                data-on={star <= shown || undefined}
                aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                aria-pressed={star === rating}
                onMouseEnter={() => setHovered(star)}
                onFocus={() => setHovered(star)}
                onClick={() => setRating(star)}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9z" />
                </svg>
              </button>
            ))}
          </div>
          <Text type="supporting" color={errors.rating ? undefined : 'secondary'}>
            {errors.rating ?? LABELS[shown] ?? ''}
          </Text>
        </VStack>

        <TextInput
          label="Your name"
          value={values.authorName}
          onChange={set('authorName')}
          autoComplete="name"
          isRequired
          status={errors.authorName ? { type: 'error', message: errors.authorName } : undefined}
        />
        <TextInput
          label="Email"
          type="email"
          value={values.email}
          onChange={set('email')}
          autoComplete="email"
          description="Not published — we use it to verify your purchase."
          isRequired
          status={errors.email ? { type: 'error', message: errors.email } : undefined}
        />
        <TextInput
          label="Headline"
          value={values.title}
          onChange={set('title')}
          isOptional
        />
        <TextArea
          label="Your review"
          value={values.body}
          onChange={set('body')}
          rows={5}
          isRequired
          status={errors.body ? { type: 'error', message: errors.body } : undefined}
        />

        <Button
          label={busy ? 'Sending…' : 'Submit review'}
          variant="primary"
          size="lg"
          type="submit"
          isDisabled={busy}
        />
      </VStack>
    </form>
  );
}
