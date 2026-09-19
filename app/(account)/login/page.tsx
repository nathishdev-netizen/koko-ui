import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/account/LoginForm';
import { Card, Heading, Text, VStack } from '@/components/ui';
import { getSession } from '@/lib/api/session';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: 'noindex, nofollow',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { customer } = await getSession();
  const params = await searchParams;
  const raw = params.next;
  const next = (Array.isArray(raw) ? raw[0] : raw) ?? '/account';

  // Only same-site paths are honoured. The legacy /auth/callback redirected to
  // an unvalidated absolute URL read from localStorage — an open redirect.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  if (customer) redirect(safeNext);

  return (
    <div className="kf-container kf-shop">
      <VStack gap={4} hAlign="center">
        <VStack gap={1.5} hAlign="center" className="kf-center-text">
          <p className="kf-eyebrow">Welcome back</p>
          <Heading level={1}>Sign in</Heading>
          <span className="kf-rule" aria-hidden="true" />
        </VStack>

        <Card padding={6} width="100%">
          <VStack gap={3}>
            <Text type="supporting" color="secondary">
              We will email you a sign-in link — no password to remember.
            </Text>
            <LoginForm next={safeNext} />
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}
