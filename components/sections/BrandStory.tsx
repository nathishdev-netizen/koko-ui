import Image from 'next/image';

import { Text, VStack } from '@/components/ui';

/**
 * Brand story — the quote exactly as the live site presents it: no heading, no
 * eyebrow, just the words and the signature on the brown ground.
 *
 * The image behind it is PINNED: it is fixed to the viewport and revealed
 * through this section like a window, so the copy scrolls over a stationary
 * photograph. That is the classic parallax read — a layer that holds still
 * while the page moves past it — rather than an element drifting at a
 * different speed, which just looks like a jump.
 */
export function BrandStory({
  paragraphs,
  signature,
  backdrop,
}: {
  paragraphs: readonly string[];
  signature: string;
  backdrop?: { image: string; alt: string };
}) {
  return (
    <section className="kf-section kf-section--brown kf-pinned" aria-label="Our story">
      {backdrop ? (
        <div className="kf-pinned-media" aria-hidden="true">
          <Image src={backdrop.image} alt="" fill sizes="100vw" className="kf-pinned-img" />
        </div>
      ) : null}

      <div className="kf-container kf-container--narrow kf-pinned-body">
        <VStack gap={4} hAlign="center" className="kf-center-text">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="kf-story-quote">
              {paragraph}
            </p>
          ))}

          <Text type="supporting" color="secondary">
            — {signature}
          </Text>
        </VStack>
      </div>
    </section>
  );
}
