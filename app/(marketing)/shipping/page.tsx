import type { Metadata } from 'next';

import { PolicyPage } from '@/components/sections/PolicyPage';
import content from '@/content/pages/shipping.json';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Shipping Policy',
  description: 'How KokoFresh ships — free over ₹399, ₹50 Karnataka, ₹70 rest of India, dispatched within 48 hours.',
  path: '/shipping',
});

export default function Page() {
  return (
    <PolicyPage
      title={content.title}
      intro={content.intro}
      sections={content.sections}
      faq={content.faq}
      path="/shipping"
    />
  );
}
