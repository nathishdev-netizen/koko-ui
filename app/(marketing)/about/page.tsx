import type { Metadata } from 'next';

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
import content from '@/content/pages/about.json';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About KokoFresh',
  description:
    'Karnataka spice blends ground after you order, by women artisans, with no fillers or preservatives. Why we do it the slow way.',
  path: '/about',
});

export default function AboutPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />

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
            <p className="kf-eyebrow">{content.eyebrow}</p>
            <Heading level={1}>{content.title}</Heading>
            <span className="kf-rule" aria-hidden="true" />
            <p className="kf-story-lead">{content.lead}</p>
          </VStack>

          <VStack gap={5}>
            {content.sections.map((section) => (
              <VStack key={section.heading} gap={1.5}>
                <Heading level={2}>{section.heading}</Heading>
                <div
                  className="kf-prose"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </VStack>
            ))}
          </VStack>

          <Grid gap={3} columns={{ minWidth: 200, repeat: 'fit' }}>
            {content.values.map((value) => (
              <Card key={value.title} padding={4}>
                <VStack gap={1}>
                  <Heading level={3}>{value.title}</Heading>
                  <Text type="supporting" color="secondary">
                    {value.body}
                  </Text>
                </VStack>
              </Card>
            ))}
          </Grid>
        </VStack>
      </div>
    </>
  );
}
