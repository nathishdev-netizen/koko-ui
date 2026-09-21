import type { Metadata } from 'next';

import { BundleCompare } from '@/components/sections/BundleCompare';
import { BundleGrid } from '@/components/sections/BundleGrid';
import { BundleSteps } from '@/components/sections/BundleSteps';
import { BundleWhy } from '@/components/sections/BundleWhy';
import { AnimatedRule, BreadcrumbItem, Breadcrumbs, Heading, Text, VStack } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { getBundles } from '@/lib/api/bundles';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: 'Mix & match spice bundles',
  description:
    'Build your own KokoFresh bundle — pick the masalas and chutney powders you actually cook with and save up to ₹134.',
  path: '/shop/bundles',
});

export default async function BundlesPage() {
  const bundles = await getBundles();

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Bundles', path: '/shop/bundles' },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />

      <div className="kf-container kf-shop">
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

          <VStack gap={1.5}>
            <p className="kf-eyebrow">Mix &amp; match</p>
            <Heading level={1}>Mix &amp; Match Bundles</Heading>
            <AnimatedRule />
            <Text color="secondary" className="kf-measure">
              Pick your favorites, we&rsquo;ll pack them for less. Three simple
              bundles for every need &mdash; from first-timers to monthly
              shoppers.
            </Text>
          </VStack>

          <BundleSteps />
        </VStack>
      </div>

      <BundleGrid bundles={bundles} hasHeading={false} />

      <div className="kf-container kf-bundles-foot">
        <VStack gap={10}>
          <BundleCompare bundles={bundles} />
          <BundleWhy />
        </VStack>
      </div>
    </>
  );
}
