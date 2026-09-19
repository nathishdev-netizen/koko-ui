import { Collapsible, CollapsibleGroup, Heading, Text, VStack } from '@/components/ui';

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

export function BundleFaq() {
  return (
    <section aria-labelledby="bundle-faq">
      <VStack gap={4}>
        <Heading level={2} id="bundle-faq" className="kf-center-text">
          Frequently Asked Questions
        </Heading>
        <CollapsibleGroup>
          {BUNDLE_FAQS.map((faq) => (
            <Collapsible key={faq.q} trigger={faq.q} value={faq.q}>
              <Text color="secondary">{faq.a}</Text>
            </Collapsible>
          ))}
        </CollapsibleGroup>
      </VStack>
    </section>
  );
}
