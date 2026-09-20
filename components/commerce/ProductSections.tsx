import {
  AwardIcon,
  ChefHatIcon,
  InfoIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingDownIcon,
} from '@/components/icons';
import type { ProductSection } from '@/lib/api/types';

/**
 * Product story / ways to enjoy / nutrition / storage, as OPEN cards.
 *
 * The legacy PDP put these behind tabs; ours had them behind a collapsed
 * accordion, which is worse — a reader had to click five times to learn what
 * the blend is. They are short, and they are the merchandising, so they are
 * shown. Same call as the bundle FAQ.
 *
 * Icons are keyed off the section key with a fallback, so a section the
 * backend invents later still renders with a sensible mark.
 */
const SECTION_ICONS: Record<string, typeof InfoIcon> = {
  story: AwardIcon,
  ways: ChefHatIcon,
  nutrition: SparklesIcon,
  storage: ShieldCheckIcon,
  'why-switch': TrendingDownIcon,
};

export function ProductSections({ sections }: { sections: readonly ProductSection[] }) {
  if (sections.length === 0) return null;

  return (
    <div className="kf-psections">
      {sections.map((section) => {
        const Icon = SECTION_ICONS[section.key] ?? InfoIcon;
        return (
          <article key={section.key} className="kf-psection">
            <h3 className="kf-psection-title">
              <Icon className="kf-psection-icon" aria-hidden="true" />
              {section.title}
            </h3>
            {/* Server-authored merchandising copy from the catalogue. */}
            <div
              className="kf-rich kf-psection-body"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </article>
        );
      })}
    </div>
  );
}
