import { Heading, SplitText, Text } from '@/components/ui';

/**
 * The journal's masthead — a full-width cream band, as the legacy listing led
 * with. Copy comes from content/blog.json so a tenant can rename the journal.
 */
export function BlogListingHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="kf-blog-hero" aria-label="Blog header">
      <div className="kf-blog-hero-inner">
        <p className="kf-eyebrow kf-blog-hero-eyebrow">{eyebrow}</p>
        <Heading level={1} className="kf-blog-hero-title">
          <SplitText>{title}</SplitText> <span aria-hidden="true">🌶️</span>
        </Heading>
        <Text color="secondary" className="kf-blog-hero-sub">
          {subtitle}
        </Text>
      </div>
    </section>
  );
}
