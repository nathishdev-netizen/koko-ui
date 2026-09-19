import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge, Card, Heading, HStack, Text, VStack } from '@/components/ui';
import { getOrders } from '@/lib/api/orders';
import type { OrderStatus } from '@/lib/api/types';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = { title: 'Orders', robots: 'noindex, nofollow' };

/** Status colours read at a glance without relying on the word alone. */
const TONE: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  processing: 'warning',
  shipped: 'neutral',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'error',
};

export default async function OrdersPage() {
  const orders = await getOrders();

  if (orders.length === 0) {
    return (
      <VStack gap={2} padding={8} hAlign="center" className="kf-center-text">
        <Heading level={2}>No orders yet</Heading>
        <Text color="secondary">Your first order will appear here.</Text>
      </VStack>
    );
  }

  return (
    <VStack gap={3}>
      <Heading level={2}>Orders</Heading>
      {orders.map((order) => (
        <Card key={order.id} padding={4}>
          <VStack gap={2}>
            <HStack gap={2} hAlign="between" vAlign="center" wrap="wrap">
              <Text weight="medium">{order.id}</Text>
              <Badge variant={TONE[order.status]} label={order.status} />
            </HStack>
            <Text type="supporting" color="secondary">
              {new Date(order.placedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}{' '}
              · {order.lines.length} {order.lines.length === 1 ? 'item' : 'items'} ·{' '}
              {formatMoney(order.total)}
            </Text>
            <Link href={`/account/orders/${order.id}`} className="kf-page-link">
              View order →
            </Link>
          </VStack>
        </Card>
      ))}
    </VStack>
  );
}
