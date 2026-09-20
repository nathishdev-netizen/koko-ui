import type { Metadata } from 'next';
import Image from 'next/image';

import {
  ClockIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  XIcon,
  YoutubeIcon,
} from '@/components/icons';
import { ContactForm } from '@/components/sections/ContactForm';
import { BreadcrumbItem, Breadcrumbs, Heading, Text } from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { brand } from '@/config/brand';
import content from '@/content/pages/contact.json';
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us | Customer Support & Bulk Orders | KokoFresh',
  description:
    'Questions about our masalas? Need bulk orders? WhatsApp, email, or call us—we respond within 24 hours. Bangalore-based with India-wide delivery.',
  path: '/contact',
});

/** "@koko_fresh_india" from an Instagram/X/YouTube profile URL. */
function handleFromUrl(url: string): string {
  const segment = new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
  return `@${segment.replace(/^@/, '')}`;
}

/**
 * Contact — the legacy page's six sections, in order: hero → "Choose Your
 * Vibe" (four ways to reach us) → "Drop Us a Line" form → "Quick Answers"
 * FAQ → "Come Say Hi" office + map → "Still Have Questions?" CTA.
 *
 * Every number, address, handle and hour comes from `config/brand.json`;
 * the copy lives in `content/pages/contact.json`.
 */
export default function ContactPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ];
  const { hero, methods, form, faq, office, cta } = content;
  const { contact, legal, socials } = brand;
  const address = legal.address;
  const waNumber = contact.whatsapp.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(methods.whatsapp.message)}`;
  const socialLinks = [
    socials.instagram ? { href: socials.instagram, label: handleFromUrl(socials.instagram), Icon: InstagramIcon } : null,
    socials.twitter ? { href: socials.twitter, label: handleFromUrl(socials.twitter), Icon: XIcon } : null,
    socials.youtube ? { href: socials.youtube, label: handleFromUrl(socials.youtube), Icon: YoutubeIcon } : null,
  ].filter((s): s is NonNullable<typeof s> => s !== null);

  const cards = [
    { key: 'whatsapp', Icon: MessageCircleIcon, ...methods.whatsapp, href: waLink, action: contact.phone, external: true },
    { key: 'social', Icon: InstagramIcon, ...methods.social, href: socials.instagram ?? '#', action: socials.instagram ? handleFromUrl(socials.instagram) : brand.name, external: true },
    { key: 'email', Icon: MailIcon, ...methods.email, href: `mailto:${contact.email}`, action: contact.email, external: false },
    { key: 'phone', Icon: PhoneIcon, ...methods.phone, href: `tel:${contact.whatsapp}`, action: contact.phone, external: false },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(trail),
          {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: brand.name,
            image: absoluteUrl(brand.logo.src),
            url: absoluteUrl('/'),
            telephone: contact.phone,
            email: contact.email,
            sameAs: Object.values(socials).filter(Boolean),
            address: {
              '@type': 'PostalAddress',
              streetAddress: address.street,
              addressLocality: address.locality,
              addressRegion: address.region,
              postalCode: address.postalCode,
              addressCountry: address.country,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.items.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          },
        ]}
      />

      {/* Hero */}
      <section className="kf-about-hero kf-contact-hero">
        <div className="kf-container">
          <Breadcrumbs label="Breadcrumb" variant="supporting">
            {trail.map((crumb, i) => (
              <BreadcrumbItem key={crumb.path} href={i === trail.length - 1 ? undefined : crumb.path}>
                {crumb.name}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
          <div className="kf-about-hero-inner">
            <Heading level={1} className="kf-about-hero-title">
              {hero.title}
            </Heading>
            <p className="kf-contact-sub">
              {hero.subtitleLead} <span className="kf-h-alt">{hero.subtitleAlt}</span>{' '}
              <span aria-hidden="true">{hero.subtitleEmoji}</span>
            </p>
            <p className="kf-about-lead">{hero.lead}</p>
          </div>
        </div>
      </section>

      {/* Choose Your Vibe sticks while the form slides up over it. The two are
          wrapped together because a sticky element is pinned for the height of
          its CONTAINING BLOCK — without the wrapper that is the page, and the
          vibe cards stay pinned behind every later section. See globals.css. */}
      <div className="kf-stack">
        <section className="kf-section kf-contact-methods kf-stack-under" aria-labelledby="methods-title">
          <div className="kf-container">
            <div className="kf-about-values-head">
              <Heading level={2} id="methods-title" className="kf-about-h2 kf-about-h2--xl">
                {methods.titleLead} <span className="kf-h-alt">{methods.titleAlt}</span>
              </Heading>
              <Text color="secondary" className="kf-about-values-sub">
                {methods.subtitle}
              </Text>
            </div>
            <div className="kf-contact-grid">
              {cards.map(({ key, Icon, highlight, title, body, href, action, external }) => (
                <article key={key} className="kf-value-card kf-contact-card">
                  <Icon className="kf-value-icon" aria-hidden="true" />
                  <span className="kf-contact-highlight">{highlight}</span>
                  <h3 className="kf-value-title">{title}</h3>
                  <p className="kf-value-body">{body}</p>
                  <a
                    href={href}
                    className="kf-pill-btn kf-pill-btn--primary kf-contact-action"
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {key === 'whatsapp' ? <MessageCircleIcon className="kf-pill-btn-icon" aria-hidden="true" /> : null}
                    {action}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Drop Us a Line */}
        <section className="kf-section kf-section--light kf-contact-form-section kf-stack-over" aria-labelledby="form-title">
          <div className="kf-container kf-container--narrow">
            <div className="kf-about-values-head">
              <Heading level={2} id="form-title" className="kf-about-h2 kf-about-h2--xl">
                {form.titleLead} <span className="kf-h-alt">{form.titleAlt}</span>
              </Heading>
              <Text color="secondary" className="kf-about-values-sub">
                {form.subtitle}
              </Text>
            </div>
            <ContactForm copy={form} />
          </div>
        </section>
      </div>

      {/* Quick Answers */}
      {/* Quick Answers is the page's one dark moment: a pinned photograph
          behind the brown scrim, the cards scrolling over a stationary image
          — the same mechanism as the home brand story and the About story.
          Its six cards flip to the raised-ink surface from the --brown token
          overrides alone. */}
      <section className="kf-section kf-section--brown kf-pinned kf-contact-faq" aria-labelledby="faq-title">
        <div className="kf-pinned-media" aria-hidden="true">
          <Image src={faq.backdrop.image} alt="" fill sizes="100vw" className="kf-pinned-img" />
        </div>
        <div className="kf-container kf-pinned-body">
          <div className="kf-about-values-head">
            <Heading level={2} id="faq-title" className="kf-about-h2 kf-about-h2--xl">
              {faq.titleLead} <span className="kf-h-alt">{faq.titleAlt}</span>
            </Heading>
            <Text color="secondary" className="kf-about-values-sub">
              {faq.subtitle}
            </Text>
          </div>
          <div className="kf-faq-grid kf-contact-faq-grid">
            {faq.items.map((item) => (
              <article key={item.q} className="kf-faq-card kf-contact-faq-card">
                <h3 className="kf-contact-faq-q">{item.q}</h3>
                <p className="kf-contact-faq-a">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Come Say Hi */}
      <section className="kf-section kf-section--light kf-contact-office" aria-labelledby="office-title">
        <div className="kf-container">
          <div className="kf-contact-office-grid">
            <div className="kf-contact-office-copy">
              <Heading level={2} id="office-title" className="kf-about-h2 kf-about-h2--xl">
                {office.titleLead} <span className="kf-h-alt">{office.titleAlt}</span>
              </Heading>
              <ul className="kf-contact-info">
                <li>
                  <MapPinIcon className="kf-contact-info-icon" aria-hidden="true" />
                  <div>
                    <h3>{office.hqLabel}</h3>
                    <p>
                      {legal.entityName}
                      <br />
                      {address.street}
                      <br />
                      {address.locality} {address.postalCode}
                    </p>
                  </div>
                </li>
                {contact.hours?.length ? (
                  <li>
                    <ClockIcon className="kf-contact-info-icon" aria-hidden="true" />
                    <div>
                      <h3>{office.hoursLabel}</h3>
                      <p>
                        {contact.hours.map((line, i) => (
                          <span key={line}>
                            {i > 0 ? <br /> : null}
                            {line}
                          </span>
                        ))}
                      </p>
                    </div>
                  </li>
                ) : null}
                <li>
                  <MailIcon className="kf-contact-info-icon" aria-hidden="true" />
                  <div>
                    <h3>{office.emailsLabel}</h3>
                    <p>
                      {office.generalLabel}: <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      {contact.businessEmail ? (
                        <>
                          <br />
                          {office.businessLabel}: <a href={`mailto:${contact.businessEmail}`}>{contact.businessEmail}</a>
                        </>
                      ) : null}
                      {contact.pressEmail ? (
                        <>
                          <br />
                          {office.pressLabel}: <a href={`mailto:${contact.pressEmail}`}>{contact.pressEmail}</a>
                        </>
                      ) : null}
                    </p>
                  </div>
                </li>
              </ul>
              {socialLinks.length > 0 ? (
                <div className="kf-contact-socials">
                  {socialLinks.map(({ href, label, Icon }) => (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="kf-pill-btn kf-pill-btn--outline kf-pill-btn--sm">
                      <Icon className="kf-pill-btn-icon" aria-hidden="true" />
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            {contact.mapEmbedUrl ? (
              <div className="kf-contact-map-wrap">
                <div className="kf-contact-map">
                  <iframe
                    src={contact.mapEmbedUrl}
                    title={office.mapTitle}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="kf-contact-map-badge" aria-hidden="true">
                  <span className="kf-contact-map-pin">📍</span>
                  <span>{office.mapBadge}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Still Have Questions? */}
      <section className="kf-section kf-about-cta kf-contact-cta" aria-labelledby="cta-title">
        <div className="kf-container kf-container--narrow">
          <Heading level={2} id="cta-title" className="kf-about-h2 kf-about-h2--xl">
            {cta.titleLead} <span className="kf-h-alt">{cta.titleAlt}</span>
          </Heading>
          <Text className="kf-about-cta-body">{cta.body}</Text>
          {socials.instagram ? (
            <div className="kf-about-cta-row">
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="kf-pill-btn kf-pill-btn--primary">
                <InstagramIcon className="kf-pill-btn-icon" aria-hidden="true" />
                {cta.button}
              </a>
            </div>
          ) : null}
          <p className="kf-contact-response">{cta.responseTime}</p>
        </div>
      </section>
    </>
  );
}
