import type { Metadata } from 'next';
import Link from 'next/link';

import { Card, Grid, Heading, Text, VStack } from '@/components/ui';
import { getOrders } from '@/lib/api/orders';
import { getWishlist } from '@/lib/api/wishlist';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = { title: 'Account', robots: 'noindex, nofollow' };

export default async function AccountPage() {
  const [orders, wishlist] = await Promise.all([getOrders(), getWishlist()]);
  const latest = orders[0];

  return (
    <VStack gap={4}>
      <Grid gap={3} columns={{ minWidth: 200, repeat: 'fit' }}>
        <Card padding={4}>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Orders
            </Text>
            <Heading level={2}>{orders.length}</Heading>
          </VStack>
        </Card>
        <Card padding={4}>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Saved items
            </Text>
            <Heading level={2}>{wishlist.length}</Heading>
          </VStack>
        </Card>
      </Grid>

      {latest ? (
        <VStack gap={2}>
          <Heading level={2}>Latest order</Heading>
          <Card padding={4}>
            <VStack gap={1.5}>
              <Text weight="medium">{latest.id}</Text>
              <Text type="supporting" color="secondary">
                {latest.lines.length} {latest.lines.length === 1 ? 'item' : 'items'} ·{' '}
                {formatMoney(latest.total)} · {latest.status}
              </Text>
              <Link href={`/account/orders/${latest.id}`} className="kf-page-link">
                View order →
              </Link>
            </VStack>
          </Card>
        </VStack>
      ) : null}
    </VStack>
  );
}
