import { Heading, Text, VStack } from '@/components/ui';

/** "Why Choose Our Bundles?" — the legacy section, copy unchanged. */
const REASONS: readonly { title: string; body: string }[] = [
  {
    title: 'Better Value',
    body: 'Save up to 20% compared to buying items individually',
  },
  {
    title: 'Curated Selection',
    body: 'Expertly chosen combinations for authentic Karnataka cuisine',
  },
  {
    title: 'Perfect Gifting',
    body: 'Beautifully packaged bundles ideal for any occasion',
  },
];

export function BundleWhy() {
  return (
    <section className="kf-why" aria-labelledby="why-bundles">
      <VStack gap={5}>
        <Heading level={2} id="why-bundles" className="kf-center-text">
          Why Choose Our Bundles?
        </Heading>
        <div className="kf-why-grid">
          {REASONS.map((reason) => (
            <VStack key={reason.title} gap={1.5} hAlign="center" className="kf-center-text">
              <Heading level={3} className="kf-why-title">
                {reason.title}
              </Heading>
              <Text type="supporting" color="secondary">
                {reason.body}
              </Text>
            </VStack>
          ))}
        </div>
      </VStack>
    </section>
  );
}
