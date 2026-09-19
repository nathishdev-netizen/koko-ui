'use client';

import { useEffect, useState } from 'react';

import { Text } from '@/components/ui';

/**
 * Announcement strip above the header. Collapses once the page is scrolled so
 * it does not eat viewport on long pages.
 *
 * Not an Astryx Banner: Banner is a status component (it requires a
 * status/icon and is styled for info/warning/error), which is the wrong
 * semantics for a marketing message.
 *
 * Copy differs by breakpoint, so both strings render and CSS picks one — this
 * keeps it a single server-rendered DOM with no layout shift from a JS width
 * check.
 */
export function AnnouncementBar({
  desktop,
  mobile,
}: {
  desktop: string;
  mobile: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="kf-announcement" data-collapsed={scrolled || undefined}>
      <div className="kf-announcement-inner">
        <Text type="supporting" weight="medium">
          <span className="kf-announcement-desktop">{desktop}</span>
          <span className="kf-announcement-mobile">{mobile}</span>
        </Text>
      </div>
    </div>
  );
}
