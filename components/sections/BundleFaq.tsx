import { Heading, Text, VStack } from '@/components/ui';

/**
 * Bundle FAQ — the legacy site's six questions, copy unchanged.
 *
 * Also emitted as FAQPage JSON-LD by the page, so the answers can surface in
 * search results.
 */
export const BUNDLE_FAQS: readonly { q: string; a: string }[] = [
  {
    q: 'Can I customize what goes in my bundle?',
    a: 'Yes! You choose which signature blends and chutney powders you want. We pack according to your selections.',
  },
  {
    q: 'What if I want multiples of the same product?',
    a: "Absolutely! If you love Puliyogare, get 2 or 3 of them in your bundle. It's your choice.",
  },
  {
    q: 'Is this gift-wrapped?',
    a: "The Festival Box comes in gift-ready packaging. For Taster's Pack and Monthly Pack, you can add gift wrapping for ₹50 at checkout.",
  },
  {
    q: 'How long do these products last?',
    a: 'All products have 6-12 months shelf life. Store in a cool, dry place.',
  },
  {
    q: 'Can I add individual products to my bundle order?',
    a: 'Yes! Add any bundle to cart, then continue shopping for individual items.',
  },
  {
    q: 'Do you ship bundles outside Bangalore?',
    a: 'Yes, we ship pan-India. Delivery in 3-5 business days.',
  },
];

/**
 * Six questions as OPEN cards in two columns, matching the legacy layout.
 *
 * Not an accordion: with only six short answers there is nothing to collapse
 * for, and hiding them behind clicks means most readers never see them. The
 * answers are the point.
 */
export function BundleFaq() {
  return (
    <section aria-labelledby="bundle-faq">
      <VStack gap={5}>
        <Heading level={2} id="bundle-faq" className="kf-center-text">
          Frequently Asked Questions
        </Heading>
        <div className="kf-faq-grid">
          {BUNDLE_FAQS.map((faq) => (
            <article key={faq.q} className="kf-faq-card">
              <h3 className="kf-faq-q">
                <span className="kf-faq-mark" aria-hidden="true">
                  Q
                </span>
                {faq.q}
              </h3>
              <Text type="supporting" color="secondary">
                {faq.a}
              </Text>
            </article>
          ))}
        </div>
      </VStack>
    </section>
  );
}
