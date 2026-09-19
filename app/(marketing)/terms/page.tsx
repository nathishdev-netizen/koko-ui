import type { Metadata } from 'next';

import { PolicyPage } from '@/components/sections/PolicyPage';
import content from '@/content/pages/terms.json';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'The terms of buying from KokoFresh.',
  path: '/terms',
});

export default function Page() {
  return (
    <PolicyPage
      title={content.title}
      intro={content.intro}
      sections={content.sections}
      path="/terms"
    />
  );
}
