import type { Metadata } from 'next';

import { PolicyPage } from '@/components/sections/PolicyPage';
import content from '@/content/pages/privacy.json';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'What KokoFresh collects, why, and what we never do with your data.',
  path: '/privacy-policy',
});

export default function Page() {
  return (
    <PolicyPage
      title={content.title}
      intro={content.intro}
      sections={content.sections}
      path="/privacy-policy"
    />
  );
}
