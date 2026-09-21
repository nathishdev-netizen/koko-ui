import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ProcessSection } from '@/components/about/ProcessSection';
import {
  ArrowRightIcon,
  HeartHandshakeIcon,
  InstagramIcon,
  LeafIcon,
  LightbulbIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@/components/icons';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Heading,
  SplitText,
  Text,
  wordCount,
} from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { brand } from '@/config/brand';
import content from '@/content/pages/about.json';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About KokoFresh | Our Story, Mission & Karnataka Heritage',
  description:
    'Learn how KokoFresh was born from a home kitchen in Karnataka. We craft authentic, preservative-free Indian spice blends and chutney powders made by women artisans.',
  path: '/about',
});

const VALUE_ICONS = {
  shield: ShieldCheckIcon,
  lightbulb: LightbulbIcon,
  handshake: HeartHandshakeIcon,
} as const;

/**
 * About — the legacy page's sections in its order: hero → story → ingredients
 * → values → process → CTA. Copy is verbatim from `content/pages/about.json`.
 *
 * The story section is the page's dark moment: the legacy photograph becomes
 * a PINNED backdrop under the brown, grained scrim (the same mechanism as the
 * home page's brand story), so the copy scrolls over a stationary image.
 */
export default function AboutPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];
  const { hero, story, ingredients, values, process, cta } = content;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />

      {/* Hero */}
      <section className="kf-about-hero">
        <div className="kf-container">
          <Breadcrumbs label="Breadcrumb" variant="supporting">
            {trail.map((crumb, i) => (
              <BreadcrumbItem key={crumb.path} href={i === trail.length - 1 ? undefined : crumb.path}>
                {crumb.name}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
          <div className="kf-about-hero-inner">
            <Heading level={1} className="kf-about-hero-title">
              <SplitText>{hero.title}</SplitText>
            </Heading>
            <p className="kf-about-lead" dangerouslySetInnerHTML={{ __html: hero.lead }} />
          </div>
        </div>
      </section>

      {/* Story — pinned photograph under the brown scrim. */}
      <section className="kf-section kf-section--brown kf-pinned kf-about-story" aria-labelledby="story-title">
        <div className="kf-pinned-media" aria-hidden="true">
          <Image src={story.image.url} alt="" fill sizes="100vw" className="kf-pinned-img" />
        </div>
        <div className="kf-container kf-pinned-body">
          <div className="kf-about-story-grid">
            <div className="kf-about-story-copy">
              <span className="kf-about-pill">
                <SparklesIcon className="kf-about-pill-icon" aria-hidden="true" />
                {story.pill}
              </span>
              <Heading level={2} id="story-title" className="kf-about-h2">
                <SplitText>{story.titleLead}</SplitText>{' '}
                <span className="kf-h-alt">
                  <SplitText startIndex={wordCount(story.titleLead)}>
                    {story.titleAlt}
                  </SplitText>
                </span>{' '}
                <SplitText
                  startIndex={wordCount(story.titleLead) + wordCount(story.titleAlt)}
                >
                  {story.titleTail}
                </SplitText>
              </Heading>
              {story.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="kf-about-para" dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
            <aside className="kf-stat-card kf-stat-card--on-ink" aria-label={`${story.stat.value} ${story.stat.label}`}>
              <span className="kf-stat-value kf-numeric">{story.stat.value}</span>
              <span className="kf-stat-label">{story.stat.label}</span>
            </aside>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="kf-section kf-about-ingredients" aria-labelledby="ingredients-title">
        <div className="kf-container">
          <div className="kf-about-split">
            <figure className="kf-about-media">
              <Image
                src={ingredients.image.url}
                alt={ingredients.image.alt}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                className="kf-about-media-img"
              />
              <figcaption className="kf-stat-card kf-stat-card--badge" aria-label={`${ingredients.stat.value} ${ingredients.stat.label}`}>
                <span className="kf-stat-value kf-numeric">{ingredients.stat.value}</span>
                <span className="kf-stat-label">{ingredients.stat.label}</span>
              </figcaption>
            </figure>
            <div className="kf-about-split-copy">
              <span className="kf-about-pill">
                <LeafIcon className="kf-about-pill-icon" aria-hidden="true" />
                {ingredients.pill}
              </span>
              <Heading level={2} id="ingredients-title" className="kf-about-h2">
                <SplitText>{ingredients.titleLead}</SplitText>{' '}
                <span className="kf-h-alt">
                  <SplitText startIndex={wordCount(ingredients.titleLead)}>
                    {ingredients.titleAlt}
                  </SplitText>
                </span>
              </Heading>
              <div className="kf-panel kf-about-promise">
                {ingredients.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)} className="kf-about-para" dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="kf-section kf-section--light kf-about-values" aria-labelledby="values-title">
        <div className="kf-container">
          <div className="kf-about-values-head">
            <Heading level={2} id="values-title" className="kf-about-h2 kf-about-h2--xl">
              <SplitText>{values.titleLead}</SplitText>{' '}
              <span className="kf-h-alt">
                <SplitText startIndex={wordCount(values.titleLead)}>
                  {values.titleAlt}
                </SplitText>
              </span>
            </Heading>
            <Text color="secondary" className="kf-about-values-sub">
              {values.subtitle}
            </Text>
          </div>
          <div className="kf-values-grid">
            {values.items.map((v) => {
              const Icon = VALUE_ICONS[v.icon as keyof typeof VALUE_ICONS] ?? ShieldCheckIcon;
              return (
                <article key={v.title} className="kf-value-card">
                  <Icon className="kf-value-icon" aria-hidden="true" />
                  <h3 className="kf-value-title">{v.title}</h3>
                  <p className="kf-value-body">{v.body}</p>
                  <span className="kf-value-stat">{v.stat}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process — kept as the legacy section. */}
      <ProcessSection
        title={process.title}
        subtitleLead={process.subtitleLead}
        subtitleBrand={process.subtitleBrand}
        subtitleTail={process.subtitleTail}
        steps={process.steps}
      />

      {/* CTA */}
      <section className="kf-section kf-about-cta" aria-labelledby="cta-title">
        <div className="kf-container kf-container--narrow">
          <Heading level={2} id="cta-title" className="kf-about-h2 kf-about-h2--xl">
            <SplitText>{cta.titleLead}</SplitText>{' '}
            <span className="kf-h-alt">
              <SplitText startIndex={wordCount(cta.titleLead)}>
                {cta.titleAlt}
              </SplitText>
            </span>
          </Heading>
          <Text className="kf-about-cta-body">{cta.body}</Text>
          <div className="kf-about-cta-row">
            <Link href={cta.primary.href} className="kf-pill-btn kf-pill-btn--primary">
              {cta.primary.label}
              <ArrowRightIcon className="kf-pill-btn-icon" aria-hidden="true" />
            </Link>
            {brand.socials?.instagram ? (
              <a
                href={brand.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="kf-pill-btn kf-pill-btn--outline"
              >
                <InstagramIcon className="kf-pill-btn-icon" aria-hidden="true" />
                {cta.secondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
