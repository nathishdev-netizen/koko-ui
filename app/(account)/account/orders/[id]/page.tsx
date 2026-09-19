import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Badge, Card, Divider, Heading, HStack, Link, Text, VStack } from '@/components/ui';
import { getOrder } from '@/lib/api/orders';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = { title: 'Order', robots: 'noindex, nofollow' };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Scoped by session server-side: a customer cannot read another's order by
  // guessing an id.
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <VStack gap={4}>
      <HStack gap={2} hAlign="between" vAlign="center" wrap="wrap">
        <Heading level={2}>{order.id}</Heading>
        <Badge variant="neutral" label={order.status} />
      </HStack>

      <Card padding={4}>
        <VStack gap={3}>
          {order.lines.map((line) => (
            <HStack key={`${line.name}-${line.variantLabel}`} gap={3} hAlign="between">
              <VStack gap={0.5}>
                <Text weight="medium">{line.name}</Text>
                <Text type="supporting" color="secondary">
                  {line.variantLabel} × {line.quantity}
                </Text>
              </VStack>
              <span className="kf-numeric">
                {formatMoney({
                  amount: line.unitPrice.amount * line.quantity,
                  currency: 'INR',
                })}
              </span>
            </HStack>
          ))}

          <Divider />

          <VStack gap={1}>
            <HStack gap={2} hAlign="between">
              <Text type="supporting" color="secondary">
                Subtotal
              </Text>
              <span className="kf-numeric">{formatMoney(order.subtotal)}</span>
            </HStack>
            <HStack gap={2} hAlign="between">
              <Text type="supporting" color="secondary">
                Shipping
              </Text>
              <span className="kf-numeric">
                {order.shippingFee.amount === 0 ? 'Free' : formatMoney(order.shippingFee)}
              </span>
            </HStack>
            {order.discount.amount > 0 ? (
              <HStack gap={2} hAlign="between">
                <Text type="supporting" color="secondary">
                  Discount
                </Text>
                <span className="kf-numeric kf-discount">
                  − {formatMoney(order.discount)}
                </span>
              </HStack>
            ) : null}
            <Divider />
            <HStack gap={2} hAlign="between" vAlign="end">
              <Text weight="semibold">Total</Text>
              <span className="kf-price kf-price--sm kf-numeric">
                {formatMoney(order.total)}
              </span>
            </HStack>
          </VStack>
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={1}>
          <Text type="label">Delivering to</Text>
          <Text type="supporting" color="secondary">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            <br />
            {order.shippingAddress.city} {order.shippingAddress.postalCode},{' '}
            {order.shippingAddress.state}
          </Text>
          {order.trackingUrl ? (
            <Link href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
              Track this order
            </Link>
          ) : null}
        </VStack>
      </Card>
    </VStack>
  );
}
