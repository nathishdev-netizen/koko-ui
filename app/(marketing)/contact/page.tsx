import type { Metadata } from 'next';

import { ContactForm } from '@/components/sections/ContactForm';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Card,
  Heading,
  Link,
  Text,
  VStack,
} from '@/components/ui';
import { JsonLd } from '@/components/ui/JsonLd';
import { brand } from '@/config/brand';
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contact KokoFresh',
  description:
    'Questions about an order, bulk enquiries or anything else — reach the KokoFresh team on WhatsApp, phone or email.',
  path: '/contact',
});

export default function ContactPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ];

  const address = brand.legal.address;
  const waLink = `https://wa.me/${brand.contact.whatsapp.replace(/[^0-9]/g, '')}`;

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
            telephone: brand.contact.phone,
            email: brand.contact.email,
            address: {
              '@type': 'PostalAddress',
              streetAddress: address.street,
              addressLocality: address.locality,
              addressRegion: address.region,
              postalCode: address.postalCode,
              addressCountry: address.country,
            },
          },
        ]}
      />

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

          <VStack gap={2}>
            <p className="kf-eyebrow">Get in touch</p>
            <Heading level={1}>Contact us</Heading>
            <span className="kf-rule" aria-hidden="true" />
            <Text color="secondary" className="kf-measure">
              Order questions, bulk enquiries, or a recipe you want help with — we
              read everything.
            </Text>
          </VStack>

          <div className="kf-cart-grid">
            <Card padding={5}>
              <ContactForm />
            </Card>

            <VStack gap={3}>
              <Card padding={4}>
                <VStack gap={2}>
                  <Text type="label">Fastest: WhatsApp</Text>
                  <Link href={waLink} target="_blank" rel="noopener noreferrer">
                    {brand.contact.phone}
                  </Link>
                  <Text type="supporting" color="secondary">
                    Order updates and support, usually answered same day.
                  </Text>
                </VStack>
              </Card>

              <Card padding={4}>
                <VStack gap={2}>
                  <Text type="label">Email</Text>
                  <Link href={`mailto:${brand.contact.email}`}>
                    {brand.contact.email}
                  </Link>
                </VStack>
              </Card>

              <Card padding={4}>
                <VStack gap={2}>
                  <Text type="label">Address</Text>
                  <Text type="supporting" color="secondary">
                    {brand.legal.entityName}
                    <br />
                    {address.street}
                    <br />
                    {address.locality} {address.postalCode}, {address.region}
                  </Text>
                </VStack>
              </Card>
            </VStack>
          </div>
        </VStack>
      </div>
    </>
  );
}
