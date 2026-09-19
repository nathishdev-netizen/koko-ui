import { notFound } from 'next/navigation';

import { Heading, Text, VStack } from '@/components/ui';
import { FONT_SET, FONT_SETS, type FontSetKey } from '@/themes/kokofresh/fonts';

/**
 * Typography comparison — development only.
 *
 * Renders the same real KokoFresh content in every candidate font set so a
 * direction can be judged side by side rather than from a font's name. Delete
 * this route once the type direction is settled.
 */
export const dynamic = 'force-dynamic';

const KEYS = Object.keys(FONT_SETS) as FontSetKey[];

export default function TypePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <VStack gap={0}>
      {KEYS.map((key) => {
        const set = FONT_SETS[key];
        return (
          <section key={key} className={`kf-typeset ${set.className}`}>
            <div className="kf-container">
              <VStack gap={3}>
                <VStack gap={0.5}>
                  <p className="kf-eyebrow">
                    {set.label}
                    {key === FONT_SET ? ' · live' : ''}
                  </p>
                  <Text type="supporting" color="secondary">
                    {set.note}
                  </Text>
                </VStack>

                <Heading level={2} type="display-1">
                  Authentic &amp; Handcrafted
                </Heading>

                <Text className="kf-measure">
                  Small batch roasted. Crafted by skilled women artisans. Pure,
                  traditional, and full of flavor.
                </Text>

                <p className="kf-accent kf-signature">— From the Heart of KokoFresh</p>

                <div className="kf-typeset-row">
                  <Heading level={3}>Mysore Sambar Powder</Heading>
                  <span className="kf-price kf-numeric">₹140</span>
                  <span className="kf-price-was kf-numeric">₹180</span>
                </div>
              </VStack>
            </div>
          </section>
        );
      })}
    </VStack>
  );
}
