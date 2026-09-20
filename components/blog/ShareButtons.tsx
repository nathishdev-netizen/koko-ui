'use client';

import { useState } from 'react';

/**
 * WhatsApp · X · Copy link — the legacy share row, shown above and below the
 * article. The URL is built from the canonical site URL rather than
 * `window.location`, so server and client render the same markup.
 */
export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${url}`)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="kf-share" aria-label="Share this post">
      <span className="kf-share-label">
        <ShareIcon /> Share
      </span>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="kf-share-btn kf-share-btn--wa"
      >
        <WhatsAppIcon /> WhatsApp
      </a>
      <a
        href={x}
        target="_blank"
        rel="noopener noreferrer"
        className="kf-share-btn kf-share-btn--x"
      >
        <XIcon /> Twitter
      </a>
      <button
        type="button"
        className="kf-share-btn kf-share-btn--copy"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard can be denied (insecure context, permissions). The
            // link is still in the address bar; nothing to recover from.
          }
        }}
      >
        {copied ? (
          <>
            <CheckIcon /> Copied!
          </>
        ) : (
          <>
            <LinkIcon /> Copy Link
          </>
        )}
      </button>
    </div>
  );
}

const svg = { width: 15, height: 15, viewBox: '0 0 24 24', 'aria-hidden': true as const };

function ShareIcon() {
  return (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg {...svg} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m.01 1.67c4.54 0 8.23 3.7 8.23 8.24 0 4.54-3.69 8.23-8.23 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg {...svg} fill="currentColor">
      <path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L.1 1.2h7.6l5.2 6.9zm-1.3 19.4h2L6.5 3.3H4.3z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
