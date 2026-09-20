import {
  ChefHatIcon,
  InfoIcon,
  SparklesIcon,
  TrendingDownIcon,
} from '@/components/icons';
import { Heading, Text, VStack } from '@/components/ui';
import type { Bundle } from '@/lib/api/types';

/**
 * The legacy configurator's lower content: About This Bundle · benefits ·
 * Smart Shopping Math · testimonials · Quick Prep Ideas.
 *
 * Every field is optional on the Bundle, so a bundle that has none of this
 * renders nothing rather than an empty shell.
 */
export function BundleAbout({ bundle }: { bundle: Bundle }) {
  const hasAny =
    bundle.fullDescription ||
    bundle.benefits?.length ||
    bundle.quickPrep ||
    bundle.testimonials?.length;
  if (!hasAny) return null;

  return (
    <div className="kf-about-grid">
      {bundle.fullDescription ? (
        <section className="kf-panel" aria-labelledby="about-bundle">
          <VStack gap={3}>
            <Heading level={2} id="about-bundle" className="kf-panel-title">
              <InfoIcon className="kf-panel-icon" aria-hidden="true" />
              About This Bundle
            </Heading>
            {bundle.fullDescription.split('\n\n').map((para) => (
              <Text key={para.slice(0, 24)} color="secondary">
                {para}
              </Text>
            ))}

            {bundle.smartMath ? (
              <div className="kf-smart-math">
                <Heading level={3} className="kf-panel-subtitle">
                  <TrendingDownIcon className="kf-panel-icon" aria-hidden="true" />
                  Smart Shopping Math
                </Heading>
                <ul>
                  {bundle.smartMath.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {bundle.smartMath.footer ? (
                  <p className="kf-smart-footer">{bundle.smartMath.footer}</p>
                ) : null}
              </div>
            ) : null}

            {bundle.bestValue ? (
              <p className="kf-best-value">★ Our Best Value Bundle ★</p>
            ) : null}
          </VStack>
        </section>
      ) : null}

      {bundle.benefits?.length ? (
          <section className="kf-panel" aria-labelledby="bundle-benefits">
            <VStack gap={3}>
              <Heading level={2} id="bundle-benefits" className="kf-panel-title">
                <SparklesIcon className="kf-panel-icon" aria-hidden="true" />
                {bundle.benefitsTitle ?? "Why You'll Love It"}
              </Heading>
              <ul className="kf-tick-list">
                {bundle.benefits.map((benefit) => (
                  <li key={benefit}>
                    <TickIcon />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </VStack>
          </section>
        ) : null}

      {bundle.quickPrep ? (
          <section className="kf-panel" aria-labelledby="quick-prep">
            <VStack gap={3}>
              <Heading level={2} id="quick-prep" className="kf-panel-title">
                <ChefHatIcon className="kf-panel-icon" aria-hidden="true" />
                {bundle.quickPrep.title}
              </Heading>
              <ul className="kf-tick-list">
                {bundle.quickPrep.items.map((item) => (
                  <li key={item}>
                    <SparkIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </VStack>
          </section>
        ) : null}

      {bundle.testimonials?.length ? (
          <section className="kf-panel kf-panel--tint" aria-labelledby="bundle-love">
            <VStack gap={3}>
              <Heading level={2} id="bundle-love" className="kf-panel-title">
                <SparklesIcon className="kf-panel-icon" aria-hidden="true" />
                Why People Love This
              </Heading>
              {bundle.testimonials.map((t) => (
                <figure key={t.quote} className="kf-testimonial">
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>— {t.author}</figcaption>
                </figure>
              ))}
            </VStack>
          </section>
      ) : null}
    </div>
  );
}

function TickIcon() {
  return (
    <svg viewBox="0 0 16 16" className="kf-list-icon" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M4.8 8.3l2.1 2.1 4.3-4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="kf-list-icon" aria-hidden="true">
      <path
        d="M9 1.5L4 9h3l-1 5.5L11 7H8l1-5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
