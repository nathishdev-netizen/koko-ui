import { JsonLd } from '@/components/ui/JsonLd';
import { BreadcrumbItem, Breadcrumbs, Heading, Text, VStack } from '@/components/ui';
import { breadcrumbJsonLd } from '@/lib/seo';

export type PolicySection = { heading: string; body: string };
export type PolicyFaq = { question: string; answer: string };

/**
 * Shared shell for the policy pages.
 *
 * One component so all four read identically — the legacy versions were four
 * separate 300–470 line files that had drifted apart.
 */
export function PolicyPage({
  title,
  intro,
  sections,
  faq,
  path,
}: {
  title: string;
  intro: string;
  sections: readonly PolicySection[];
  faq?: readonly PolicyFaq[];
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

      <div className="kf-container kf-article">
        <VStack gap={5}>
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

          <VStack gap={2}>
            <p className="kf-eyebrow">Policies</p>
            <Heading level={1}>{title}</Heading>
            <span className="kf-rule" aria-hidden="true" />
            <Text color="secondary" className="kf-measure">
              {intro}
            </Text>
          </VStack>

          <VStack gap={5}>
            {sections.map((section) => (
              <VStack key={section.heading} gap={1.5}>
                <Heading level={2}>{section.heading}</Heading>
                <div
                  className="kf-prose"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </VStack>
            ))}
          </VStack>

          {faq && faq.length > 0 ? (
            <VStack gap={3}>
              <Heading level={2}>Common questions</Heading>
              {faq.map((item) => (
                <VStack key={item.question} gap={1}>
                  <Heading level={3}>{item.question}</Heading>
                  <Text color="secondary">{item.answer}</Text>
                </VStack>
              ))}
            </VStack>
          ) : null}
        </VStack>
      </div>
    </>
  );
}
