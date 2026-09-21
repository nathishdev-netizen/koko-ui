import type { Metadata } from 'next';

import { PolicyPage } from '@/components/sections/PolicyPage';
import content from '@/content/pages/refund.json';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Refund Policy',
  description: 'When KokoFresh replaces or refunds an order, and how to raise an issue.',
  path: '/refund-policy',
});

export default function Page() {
  return (
    <PolicyPage
      title={content.title}
      intro={content.intro}
      sections={content.sections}
      closing={content.closing}
      path="/refund-policy"
    />
  );
}
