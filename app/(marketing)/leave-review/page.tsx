import type { Metadata } from 'next';

import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Card, Heading, Text, VStack } from '@/components/ui';
import { getProducts } from '@/lib/api/products';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Leave a review',
    description: 'Tell us how your KokoFresh blend turned out.',
    path: '/leave-review',
  }),
  robots: 'noindex, follow',
};

/**
 * Review page. Accepts `?product=&name=` so the WhatsApp review request and the
 * post-delivery prompt can deep-link straight into a prefilled form.
 */
export default async function LeaveReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const single = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const catalogue = await getProducts({ pageSize: 100 });
  const slug = single('product');
  const product = slug ? catalogue.items.find((p) => p.slug === slug) : undefined;

  return (
    <div className="kf-container kf-article">
      <VStack gap={5}>
        <VStack gap={1.5}>
          <p className="kf-eyebrow">Your thoughts</p>
          <Heading level={1}>Leave a review</Heading>
          <span className="kf-rule" aria-hidden="true" />
          <Text color="secondary" className="kf-measure">
            Reviews are read by a person before they go up, so it may take a day or
            two to appear.
          </Text>
        </VStack>

        <Card padding={5}>
          {product ? (
            <ReviewForm
              productSlug={product.slug}
              productName={product.name}
              defaultName={single('name') ?? ''}
            />
          ) : (
            <VStack gap={2}>
              <Text weight="medium">Which blend are you reviewing?</Text>
              <VStack gap={1} as="ul" className="kf-footer-list">
                {catalogue.items.slice(0, 12).map((item) => (
                  <li key={item.slug}>
                    <a
                      className="kf-page-link"
                      href={`/leave-review?product=${item.slug}`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </VStack>
            </VStack>
          )}
        </Card>
      </VStack>
    </div>
  );
}
