import Image from 'next/image';

import {
  Button,
  ClickableCard,
  
  Heading,
  Text,
  VStack,
} from '@/components/ui';
import type { Collection } from '@/lib/api/types';

/** Category cards. Server component. */
export function CollectionGrid({
  heading,
  subheading,
  cta,
  collections,
}: {
  heading: string;
  subheading: string;
  cta: { label: string; href: string };
  collections: readonly Collection[];
}) {
  if (collections.length === 0) return null;

  return (
    <section
      className="kf-section"
      aria-labelledby="collections-heading"
    >
      <div className="kf-container">
        <VStack gap={5}>
          <VStack gap={1.5} hAlign="center" className="kf-center-text">
            <Heading level={2} id="collections-heading">
              {heading.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="kf-h-alt">{heading.split(' ').slice(-1)}</span>
            </Heading>
            <Text color="secondary">{subheading}</Text>
          </VStack>

          <div className="kf-card-grid kf-card-grid--quad">
            {collections.map((collection) => (
              <ClickableCard
                className="kf-card-link"
                key={collection.slug}
                href={`/shop/${collection.slug}`}
                label={collection.name}
                padding={0}
              >
                <article className="kf-collection">
                  <div className="kf-collection-media">
                    {collection.heroImage ? (
                      <Image
                        src={collection.heroImage.url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                        className="kf-collection-img"
                      />
                    ) : (
                      <div
                        className="kf-collection-placeholder"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <VStack gap={1} padding={4}>
                    <Heading level={3}>{collection.name}</Heading>
                    <Text type="supporting" color="secondary" maxLines={3}>
                      {collection.description}
                    </Text>
                    <span className="kf-explore">Explore →</span>
                  </VStack>
                </article>
              </ClickableCard>
            ))}
          </div>

          <div className="kf-center">
            <Button
              label={cta.label}
              href={cta.href}
              variant="primary"
              size="lg"
            />
          </div>
        </VStack>
      </div>
    </section>
  );
}
