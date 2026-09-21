import Link from 'next/link';

import {
  CheckIcon,
  ClockIcon,
  EyeIcon,
  FileTextIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  ShareIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@/components/icons';
import { JsonLd } from '@/components/ui/JsonLd';
import { BreadcrumbItem, Breadcrumbs, Heading, Text } from '@/components/ui';
import { breadcrumbJsonLd } from '@/lib/seo';

export type PolicyItem = {
  icon?: string;
  title: string;
  description?: string;
  /** Escalation-matrix fields, used by the `levels` layout. */
  level?: string;
  email?: string;
  phone?: string;
  responseTime?: string;
  resolutionTime?: string;
};

export type PolicySection = {
  heading: string;
  /** Prose sections carry `body`; structured ones carry `items` + `layout`. */
  body?: string;
  lede?: string;
  /** 'grid-4' | 'grid-3' | 'accent-2' | 'pair' | 'levels'. A plain string
   *  because JSON imports widen literals; unknown values fall back to a grid. */
  layout?: string;
  items?: readonly PolicyItem[];
};

/**
 * Icons are keyed by name in the JSON so content stays free of components.
 * An unknown key falls back to the document mark rather than rendering nothing.
 */
const ICONS: Record<string, typeof FileTextIcon> = {
  file: FileTextIcon,
  lock: LockIcon,
  share: ShareIcon,
  eye: EyeIcon,
  shield: ShieldCheckIcon,
  truck: TruckIcon,
  check: CheckIcon,
  mail: MailIcon,
  clock: ClockIcon,
  mappin: MapPinIcon,
  package: PackageIcon,
};
export type PolicyFaq = { question: string; answer: string };
export type PolicyClosing = {
  heading: string;
  body: string;
  cta?: { label: string; href: string };
};

/**
 * Shared shell for the policy pages, following the legacy layout: a dark hero
 * band, each clause in its own bordered card on a narrow measure, then a dark
 * closing band with a route back into the shop.
 *
 * One component so all of them read identically — the legacy versions were
 * separate 294-466 line files that had drifted apart (only two of the three
 * carried a closing CTA, and each hero used a slightly different gradient).
 */
export function PolicyPage({
  title,
  intro,
  sections,
  faq,
  closing,
  path,
}: {
  title: string;
  intro: string;
  sections: readonly PolicySection[];
  faq?: readonly PolicyFaq[];
  closing?: PolicyClosing;
  path: string;
}) {
  const trail = [
    { name: 'Home', path: '/' },
    { name: title, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(trail),
          // FAQPage schema wins rich results, and the answers must match the
          // real shipping rule the pricing API enforces.
          ...(faq && faq.length > 0
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faq.map((item) => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: { '@type': 'Answer', text: item.answer },
                  })),
                },
              ]
            : []),
        ]}
      />

      {/* Hero — the brand's ink rather than the legacy's pure black, so the
          band matches every other dark surface on the site. */}
      <section className="kf-section kf-section--brown kf-policy-hero">
        <div className="kf-container kf-policy-inner">
          <Breadcrumbs label="Breadcrumb" variant="supporting">
            {trail.map((crumb, i) => (
              <BreadcrumbItem
                key={crumb.path}
                href={i === trail.length - 1 ? undefined : crumb.path}
              >
                {crumb.name}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
          <p className="kf-eyebrow">Policies</p>
          <Heading level={1} className="kf-policy-title">
            {title}
          </Heading>
          <p className="kf-policy-intro">{intro}</p>
        </div>
      </section>

      <section className="kf-section kf-policy-body">
        <div className="kf-container kf-policy-inner">
          <div className="kf-policy-cards">
            {sections.map((section) =>
              section.layout && section.items ? (
                <section key={section.heading} className="kf-policy-group">
                  <h2 className="kf-policy-heading">{section.heading}</h2>
                  {section.lede ? <p className="kf-policy-lede">{section.lede}</p> : null}
                  <PolicyItems layout={section.layout} items={section.items} />
                </section>
              ) : (
                <article key={section.heading} className="kf-policy-card">
                  <h2 className="kf-policy-heading">{section.heading}</h2>
                  <div
                    className="kf-prose"
                    dangerouslySetInnerHTML={{ __html: section.body ?? '' }}
                  />
                </article>
              ),
            )}

            {faq && faq.length > 0 ? (
              <article className="kf-policy-card">
                <h2 className="kf-policy-heading">Common questions</h2>
                <div className="kf-policy-faq">
                  {faq.map((item) => (
                    <div key={item.question}>
                      <h3 className="kf-policy-q">{item.question}</h3>
                      <Text color="secondary">{item.answer}</Text>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </section>

      {closing ? (
        <section className="kf-section kf-section--brown kf-policy-closing">
          <div className="kf-container kf-policy-inner">
            <Heading level={2} className="kf-policy-closing-title">
              {closing.heading}
            </Heading>
            <p className="kf-policy-intro">{closing.body}</p>
            {closing.cta ? (
              <Link
                href={closing.cta.href}
                className="kf-pill-btn kf-pill-btn--on-ink"
              >
                {closing.cta.label}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

/**
 * Structured sections, rendered in the grid their content suits — the legacy
 * privacy page alternated a 4-up icon grid, a 2-up accent list, 3-up cards and
 * the escalation matrix rather than running one flat column, which is what
 * makes a long policy scannable.
 */
function PolicyItems({
  layout,
  items,
}: {
  layout: string;
  items: readonly PolicyItem[];
}) {
  if (layout === 'levels') {
    return (
      <div className="kf-policy-grid kf-policy-grid--3">
        {items.map((item) => (
          <article key={item.title} className="kf-policy-level">
            <header className="kf-policy-level-head">
              <span className="kf-policy-level-tag">{item.level}</span>
              <h3 className="kf-policy-level-title">{item.title}</h3>
            </header>
            <dl className="kf-policy-level-body">
              {item.email ? (
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${item.email}`}>{item.email}</a>
                  </dd>
                </div>
              ) : null}
              {item.phone ? (
                <div>
                  <dt>Phone</dt>
                  <dd>{item.phone}</dd>
                </div>
              ) : null}
              <div>
                <dt>Response</dt>
                <dd>{item.responseTime}</dd>
              </div>
              <div>
                <dt>Resolution</dt>
                <dd>{item.resolutionTime}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    );
  }

  if (layout === 'accent-2') {
    return (
      <div className="kf-policy-grid kf-policy-grid--2">
        {items.map((item) => (
          <article key={item.title} className="kf-policy-accent">
            <h3 className="kf-policy-item-title">{item.title}</h3>
            <p className="kf-policy-item-body">{item.description}</p>
          </article>
        ))}
      </div>
    );
  }

  const columns = layout === 'grid-4' ? '4' : layout === 'pair' ? '2' : '3';

  return (
    <div className={`kf-policy-grid kf-policy-grid--${columns}`}>
      {items.map((item) => {
        const Icon = (item.icon && ICONS[item.icon]) || FileTextIcon;
        return (
          <article key={item.title} className="kf-policy-item">
            <Icon className="kf-policy-item-icon" aria-hidden="true" />
            <h3 className="kf-policy-item-title">{item.title}</h3>
            <p className="kf-policy-item-body">{item.description}</p>
          </article>
        );
      })}
    </div>
  );
}
