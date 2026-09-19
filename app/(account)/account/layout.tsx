import { redirect } from 'next/navigation';

import { AccountNav } from '@/components/account/AccountNav';
import { Heading, Text, VStack } from '@/components/ui';
import { getSession } from '@/lib/api/session';

/**
 * Account shell. Every page under /account requires a session; the guard lives
 * here so no individual page can forget it.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer } = await getSession();
  if (!customer) redirect('/login?next=/account');

  return (
    <div className="kf-container kf-shop">
      <VStack gap={5}>
        <VStack gap={1.5}>
          <p className="kf-eyebrow">Your account</p>
          <Heading level={1}>{customer.name}</Heading>
          <span className="kf-rule" aria-hidden="true" />
          <Text color="secondary">{customer.email}</Text>
        </VStack>

        <div className="kf-account-grid">
          <AccountNav />
          <div>{children}</div>
        </div>
      </VStack>
    </div>
  );
}
