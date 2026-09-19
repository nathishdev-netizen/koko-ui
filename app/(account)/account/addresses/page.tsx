import type { Metadata } from 'next';

import { Badge, Card, Heading, HStack, Text, VStack } from '@/components/ui';
import { getOrders } from '@/lib/api/orders';

export const metadata: Metadata = { title: 'Addresses', robots: 'noindex, nofollow' };

export default async function AddressesPage() {
  // Until the addresses endpoint lands, the most recent order's address is a
  // truthful stand-in rather than invented data.
  const orders = await getOrders();
  const address = orders[0]?.shippingAddress;

  return (
    <VStack gap={3}>
      <Heading level={2}>Addresses</Heading>
      {address ? (
        <Card padding={4}>
          <VStack gap={1.5}>
            <HStack gap={2} vAlign="center">
              <Text weight="medium">{address.fullName}</Text>
              <Badge variant="neutral" label="Default" />
            </HStack>
            <Text type="supporting" color="secondary">
              {address.line1}
              <br />
              {address.city} {address.postalCode}, {address.state}
              <br />
              {address.phone}
            </Text>
          </VStack>
        </Card>
      ) : (
        <Text color="secondary">No saved addresses yet.</Text>
      )}
    </VStack>
  );
}
