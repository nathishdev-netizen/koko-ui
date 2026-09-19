import type { Metadata } from 'next';

import { Button, Heading, Text, VStack } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: 'noindex, follow',
};

/**
 * 404. Renders inside the root layout, so it keeps the site chrome and the
 * visitor always has a way back — a bare 404 is a dead end.
 */
export default function NotFound() {
  return (
    <VStack gap={4} padding={8} hAlign="center">
      <Heading level={1}>Page not found</Heading>
      <Text color="secondary">
        That page doesn’t exist, or it may have moved.
      </Text>
      <Button label="Back to home" href="/" variant="primary" />
    </VStack>
  );
}
