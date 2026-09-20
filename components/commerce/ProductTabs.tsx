'use client';

import { useState } from 'react';

import {
  AwardIcon,
  ChefHatIcon,
  InfoIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TrendingDownIcon,
} from '@/components/icons';
import { ReviewList } from '@/components/reviews/ReviewList';
import { Tab, TabList } from '@/components/ui';
import type { ProductSection, Review, ReviewSummary } from '@/lib/api/types';

/**
 * Product story / ways to enjoy / nutrition / storage / why switch / reviews,
 * as TABS in one bordered card — the legacy PDP's layout.
 *
 * Tabs are right for this content specifically because the sections are so
 * uneven: "Our story" runs several screens while "Storage" is two lines, so
 * stacking them buried the reviews and side-by-side cards left huge empty
 * tails. One panel at a time keeps the page short and every section one click
 * away.
 *
 * Reviews is a tab here, as it was on the legacy page, so the review content
 * is not repeated further down.
 */
const SECTION_ICONS: Record<string, typeof InfoIcon> = {
  story: AwardIcon,
  ways: ChefHatIcon,
  nutrition: SparklesIcon,
  storage: ShieldCheckIcon,
  'why-switch': TrendingDownIcon,
};

export function ProductTabs({
  sections,
  reviews,
  reviewSummary,
}: {
  sections: readonly ProductSection[];
  reviews: readonly Review[];
  reviewSummary: ReviewSummary;
}) {
  const tabs = [
    ...sections.map((section) => ({
      value: section.key,
      label: section.title,
      Icon: SECTION_ICONS[section.key] ?? InfoIcon,
    })),
    { value: 'reviews', label: 'Reviews', Icon: StarIcon },
  ];
  const [active, setActive] = useState(tabs[0]?.value ?? 'reviews');

  return (
    <div className="kf-ptabs">
      <TabList
        value={active}
        onChange={setActive}
        role="tablist"
        layout="fill"
        hasDivider
        aria-label="Product information"
      >
        {tabs.map(({ value, label, Icon }) => (
          <Tab
            key={value}
            value={value}
            label={label}
            panelId={`ptab-${value}`}
            icon={<Icon />}
          />
        ))}
      </TabList>

      {sections.map((section) =>
        section.key === active ? (
          <div
            key={section.key}
            id={`ptab-${section.key}`}
            role="tabpanel"
            className="kf-ptab-panel"
          >
            {/* Server-authored merchandising copy from the catalogue. */}
            <div
              className="kf-rich kf-ptab-body"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </div>
        ) : null,
      )}

      {active === 'reviews' ? (
        <div id="ptab-reviews" role="tabpanel" className="kf-ptab-panel">
          <ReviewList reviews={reviews} summary={reviewSummary} hasHeading={false} />
        </div>
      ) : null}
    </div>
  );
}
