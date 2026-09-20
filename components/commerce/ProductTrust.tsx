import { ChefHatIcon, ShieldCheckIcon, TruckIcon } from '@/components/icons';
import { Card, Grid, Text, VStack } from '@/components/ui';
import { commerce } from '@/config/commerce';

/**
 * Trust badges + the freshness promise, carried over from the legacy PDP.
 * Copy is unchanged; the shipping line reads from commerce config so it cannot
 * drift from the rule the pricing API enforces.
 */
export function ProductTrust() {
  const badges = [
    { title: 'Free Delivery', body: commerce.shipping.note, Icon: TruckIcon },
    { title: 'Secure Payment', body: '100% safe checkout', Icon: ShieldCheckIcon },
    { title: 'Authentic Recipe', body: 'Traditional taste', Icon: ChefHatIcon },
  ];

  return (
    <VStack gap={3}>
      <Card padding={4}>
        <VStack gap={1}>
          <Text type="label">Made fresh for you</Text>
          <Text type="supporting" color="secondary">
            Handcrafted by women artisans within 48 hours of your order, delivered
            in 3–5 days.
          </Text>
        </VStack>
      </Card>

      <Grid gap={2} columns={{ minWidth: 140, repeat: 'fit' }}>
        {badges.map(({ title, body, Icon }) => (
          <div key={title} className="kf-trust-badge">
            <Icon aria-hidden="true" className="kf-trust-icon" />
            <VStack gap={0}>
              <Text type="supporting" weight="medium">
                {title}
              </Text>
              <Text type="supporting" color="secondary">
                {body}
              </Text>
            </VStack>
          </div>
        ))}
      </Grid>
    </VStack>
  );
}
