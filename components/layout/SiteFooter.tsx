import { LeafIcon, ShieldCheckIcon } from '@/components/icons';
import { Divider, Grid, Heading, HStack, Link, Text, VStack } from '@/components/ui';
import type { Brand } from '@/config/brand';
import type { FooterGroup } from '@/config/nav';

/**
 * Site footer. Server component — no interactivity, so it ships no JS.
 *
 * Brand facts arrive as props from config; nothing is hardcoded here.
 */
export function SiteFooter({
  brand,
  groups,
}: {
  brand: Brand;
  groups: readonly FooterGroup[];
}) {
  const year = new Date().getFullYear();

  // Claims shown under "Why Choose Us". "Free shipping" states the real
  // threshold: the legacy footer claimed it unconditionally, which is
  // inaccurate below ₹399.
  // Our own SVGs are rendered directly rather than through Astryx's <Icon>.
  // Icon is a Client Component, so passing it an SVG *function* from this
  // Server Component would try to serialize the function and fail the build.
  // Sizing and colour come from .kf-footer-icon in globals.css.
  const promises = [
    { icon: <ShieldCheckIcon aria-hidden="true" className="kf-footer-icon" />, label: 'FSSAI Licensed' },
    { icon: <LeafIcon aria-hidden="true" className="kf-footer-icon" />, label: 'Zero Preservatives' },
    { icon: <ShieldCheckIcon aria-hidden="true" className="kf-footer-icon" />, label: 'Free shipping over ₹399' },
    { icon: <LeafIcon aria-hidden="true" className="kf-footer-icon" />, label: 'Made to Order' },
  ];

  const socials = Object.entries(brand.socials).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );

  return (
    <footer className="kf-footer">
      <div className="kf-footer-inner">
        <VStack gap={6}>
          {/* Brand block */}
          <VStack gap={1}>
            <Heading level={2} type="display-3">
              {brand.name}
            </Heading>
            <p className="kf-accent kf-footer-tagline">{brand.tagline}</p>
          </VStack>

          <Divider />

          <Grid gap={5} columns={{ minWidth: 200, repeat: 'fit' }}>
            {/* Link columns, from config */}
            {groups.map((group) => (
              <VStack key={group.title} gap={2}>
                <Heading level={3} weight="semibold">
                  {group.title}
                </Heading>
                <VStack gap={1.5} as="ul" className="kf-footer-list">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </VStack>
              </VStack>
            ))}

            {/* Trust claims — not links */}
            <VStack gap={2}>
              <Heading level={3} weight="semibold">
                Why Choose Us
              </Heading>
              <VStack gap={1.5} as="ul" className="kf-footer-list">
                {promises.map((promise) => (
                  <HStack key={promise.label} gap={1} vAlign="center" as="li">
                    {promise.icon}
                    <Text type="supporting">{promise.label}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            {/* Contact — every value from brand config */}
            <VStack gap={2}>
              <Heading level={3} weight="semibold">
                Contact
              </Heading>
              <VStack gap={1.5}>
                <Text type="supporting">{brand.legal.entityName}</Text>
                <Text type="supporting" color="secondary">
                  {brand.legal.address.street}
                  <br />
                  {brand.legal.address.locality} {brand.legal.address.postalCode}
                </Text>
                <Link href={`mailto:${brand.contact.email}`}>{brand.contact.email}</Link>
                <Link href={`tel:${brand.contact.whatsapp}`}>{brand.contact.phone}</Link>
              </VStack>
            </VStack>

            {/* Socials */}
            {socials.length > 0 ? (
              <VStack gap={2}>
                <Heading level={3} weight="semibold">
                  Follow Us
                </Heading>
                <VStack gap={1.5} as="ul" className="kf-footer-list">
                  {socials.map(([name, url]) => (
                    <li key={name}>
                      <Link href={url} target="_blank" rel="noopener noreferrer">
                        <span className="kf-capitalize">{name}</span>
                      </Link>
                    </li>
                  ))}
                </VStack>
              </VStack>
            ) : null}
          </Grid>

          <Divider />

          <Text type="supporting" color="secondary">
            © {year} {brand.name}. A {brand.legalName} company. All rights reserved.
            {' '}GSTIN {brand.legal.gstin}.
          </Text>
        </VStack>
      </div>
    </footer>
  );
}
