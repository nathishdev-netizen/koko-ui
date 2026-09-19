import { Heading, Text, VStack } from '@/components/ui';

/**
 * "How bundling works" — the legacy site's four steps, drawn as a connected
 * path rather than four separate boxes.
 *
 * The steps describe one continuous journey, so they are rendered as beads on a
 * line: the rule runs behind the numbered discs and the eye follows it left to
 * right. Four equal cards said "four unrelated things" instead.
 */
const STEPS: readonly { title: string; body: string }[] = [
  { title: 'Choose bundle', body: 'Starter Kit, Festival Box, or Monthly Pack' },
  { title: 'Pick products', body: 'Select which masalas and chutneys you want' },
  { title: 'We pack & ship', body: 'Arrives at your doorstep in 3–5 days' },
  { title: 'You save money', body: 'Up to ₹134 off retail prices' },
];

export function BundleSteps() {
  return (
    <section className="kf-steps" aria-label="How bundling works">
      <ol className="kf-steps-track">
        {STEPS.map((step, index) => (
          <li key={step.title} className="kf-step">
            <span className="kf-step-num" aria-hidden="true">
              {index + 1}
            </span>
            <VStack gap={1}>
              <Heading level={3} className="kf-step-title">
                {step.title}
              </Heading>
              <Text type="supporting" color="secondary">
                {step.body}
              </Text>
            </VStack>
          </li>
        ))}
      </ol>
    </section>
  );
}
