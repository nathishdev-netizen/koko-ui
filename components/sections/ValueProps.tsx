import { LeafIcon, ShieldCheckIcon } from '@/components/icons';
import { Grid, Heading, Text, VStack } from '@/components/ui';

const ICONS = {
  'hand-heart': ShieldCheckIcon,
  leaf: LeafIcon,
  package: ShieldCheckIcon,
} as const;

/**
 * "Not Your Average Masala" — centred cards with a large icon and a pill badge,
 * matching the live site. The heading splits into two tones.
 */
export function ValueProps({
  heading,
  subheading,
  items,
}: {
  heading: string;
  subheading: string;
  items: readonly { icon: string; title: string; body: string; stat: string }[];
}) {
  // Split on the last two words so the tail recedes, as on the live site.
  const words = heading.split(' ');
  const lead = words.slice(0, -2).join(' ');
  const tail = words.slice(-2).join(' ');

  return (
    <section className="kf-section" aria-labelledby="usp-heading">
      <div className="kf-container">
        <VStack gap={6}>
          <VStack gap={2} hAlign="center" className="kf-center-text">
            <Heading level={2} id="usp-heading">
              {lead} <span className="kf-h-alt">{tail}</span>
            </Heading>
            <Text color="secondary" className="kf-measure">
              {subheading}
            </Text>
          </VStack>

          <Grid gap={3} columns={{ minWidth: 260, repeat: 'fit' }}>
            {items.map((item) => {
              const Icon = ICONS[item.icon as keyof typeof ICONS] ?? LeafIcon;
              return (
                <div key={item.title} className="kf-usp-card">
                  <VStack gap={3} hAlign="center" className="kf-center-text">
                    <Icon aria-hidden="true" className="kf-usp-icon" />
                    <Heading level={3}>{item.title}</Heading>
                    <Text type="supporting" color="secondary">
                      {item.body}
                    </Text>
                    <p className="kf-usp-pill">{item.stat}</p>
                  </VStack>
                </div>
              );
            })}
          </Grid>
        </VStack>
      </div>
    </section>
  );
}
