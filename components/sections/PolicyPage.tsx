import Link from 'next/link';

import { JsonLd } from '@/components/ui/JsonLd';
import { BreadcrumbItem, Breadcrumbs, Heading, Text } from '@/components/ui';
import { breadcrumbJsonLd } from '@/lib/seo';

export type PolicySection = { heading: string; body: string };
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
            {sections.map((section) => (
              <article key={section.heading} className="kf-policy-card">
                <h2 className="kf-policy-heading">{section.heading}</h2>
                <div
                  className="kf-prose"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </article>
            ))}

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
