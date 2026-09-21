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
import {
  BreadcrumbItem,
  Breadcrumbs,
  Card,
  Grid,
  Heading,
  Text,
  VStack,
} from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
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

export type PolicyFaq = { question: string; answer: string };
export type PolicyClosing = {
  heading: string;
  body: string;
  cta?: { label: string; href: string };
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

/** Columns per layout, matching the legacy grids. */
const COLUMNS: Record<string, number> = {
  'grid-4': 4,
  'grid-3': 3,
  'accent-2': 2,
  pair: 2,
  levels: 3,
};

/**
 * Shared shell for the policy pages, following the legacy layout: a dark hero
 * band, alternating grid shapes so a long policy stays scannable, then a dark
 * closing band with a route back into the shop.
 *
 * Two measures, as the legacy had: prose runs at 896px (`max-w-4xl`) so
 * clauses stay readable, while grid sections run the full 1280px
 * (`max-w-7xl`) — locking everything to the narrow measure left the card
 * grids cramped with dead space either side.
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
        <div className="kf-container kf-policy-narrow">
          <VStack gap={2}>
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
          </VStack>
        </div>
      </section>

      <section className="kf-section kf-policy-body">
        <VStack gap={8}>
          {sections.map((section) =>
            section.layout && section.items ? (
              // Grid sections take the wide measure, as the legacy did.
              <div key={section.heading} className="kf-container kf-policy-wide">
                <VStack gap={3}>
                  <VStack gap={1}>
                    <Heading level={2} className="kf-policy-heading">
                      {section.heading}
                    </Heading>
                    {section.lede ? (
                      <Text color="secondary" className="kf-policy-lede">
                        {section.lede}
                      </Text>
                    ) : null}
                  </VStack>
                  <PolicyItems layout={section.layout} items={section.items} />
                </VStack>
              </div>
            ) : (
              // Prose stays at the narrow measure so clauses read comfortably.
              <div key={section.heading} className="kf-container kf-policy-narrow">
                <Card padding={5}>
                  <VStack gap={2}>
                    <Heading level={2} className="kf-policy-heading">
                      {section.heading}
                    </Heading>
                    <div
                      className="kf-prose"
                      dangerouslySetInnerHTML={{ __html: section.body ?? '' }}
                    />
                  </VStack>
                </Card>
              </div>
            ),
          )}

          {faq && faq.length > 0 ? (
            <div className="kf-container kf-policy-narrow">
              <Card padding={5}>
                <VStack gap={3}>
                  <Heading level={2} className="kf-policy-heading">
                    Common questions
                  </Heading>
                  {faq.map((item) => (
                    <VStack key={item.question} gap={0.5}>
                      <Text weight="medium">{item.question}</Text>
                      <Text color="secondary">{item.answer}</Text>
                    </VStack>
                  ))}
                </VStack>
              </Card>
            </div>
          ) : null}
        </VStack>
      </section>

      {closing ? (
        <section className="kf-section kf-section--brown kf-policy-closing">
          <div className="kf-container kf-policy-narrow">
            <VStack gap={3} hAlign="center" className="kf-center-text">
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
            </VStack>
          </div>
        </section>
      ) : null}
    </>
  );
}

/**
 * Structured sections, rendered in the grid their content suits — the legacy
 * alternated a 4-up icon grid, 2-up accent bars, 3-up cards and the escalation
 * matrix rather than running one flat column, which is what makes a long
 * policy scannable.
 */
function PolicyItems({
  layout,
  items,
}: {
  layout: string;
  items: readonly PolicyItem[];
}) {
  const columns = COLUMNS[layout] ?? 3;

  if (layout === 'levels') {
    return (
      <Grid columns={{ minWidth: 260, max: columns }} gap={4}>
        {items.map((item) => (
          <Card key={item.title} padding={0} className="kf-policy-level">
            <div className="kf-policy-level-head">
              <span className="kf-policy-level-tag">{item.level}</span>
              <h3 className="kf-policy-level-title">{item.title}</h3>
            </div>
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
          </Card>
        ))}
      </Grid>
    );
  }

  if (layout === 'accent-2') {
    return (
      <Grid columns={{ minWidth: 300, max: columns }} gap={3}>
        {items.map((item) => (
          <div key={item.title} className="kf-policy-accent">
            <Text weight="medium" className="kf-policy-item-title">
              {item.title}
            </Text>
            <Text type="supporting" color="secondary">
              {item.description}
            </Text>
          </div>
        ))}
      </Grid>
    );
  }

  return (
    <Grid columns={{ minWidth: 240, max: columns }} gap={3}>
      {items.map((item) => {
        const Icon = (item.icon && ICONS[item.icon]) || FileTextIcon;
        return (
          <Card key={item.title} padding={4} className="kf-policy-item">
            <VStack gap={1.5}>
              <Icon className="kf-policy-item-icon" aria-hidden="true" />
              <Text weight="medium" className="kf-policy-item-title">
                {item.title}
              </Text>
              <Text type="supporting" color="secondary">
                {item.description}
              </Text>
            </VStack>
          </Card>
        );
      })}
    </Grid>
  );
}
