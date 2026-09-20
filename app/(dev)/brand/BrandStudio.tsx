'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { Button, Heading, Text, VStack } from '@/components/ui';
import { FONT_SETS, FONT_SET_OPTIONS, fontClassName } from '@/themes/kokofresh/fonts';
import { resetTheme, saveTheme } from './actions';

/**
 * Brand studio — a live demonstration of the white-label seam.
 *
 * Writes the same `--kf-*` custom properties the server injects, so what you
 * see here is exactly what a tenant's config produces. Nothing is persisted:
 * this is a showcase and a design sandbox, not the config store. The real
 * source of truth is config/theme.json (or the backend's /site-config).
 */

type Swatch = {
  key: string;
  cssVar: string;
  label: string;
  hint: string;
};

const SWATCHES: readonly Swatch[] = [
  { key: 'brandInk', cssVar: '--kf-brand-ink', label: 'Brand ink', hint: 'Buttons, chips, ribbons, dark sections' },
  { key: 'brandInkSoft', cssVar: '--kf-brand-ink-soft', label: 'Ink — soft', hint: 'Gradient light end' },
  { key: 'brandInkDeep', cssVar: '--kf-brand-ink-deep', label: 'Ink — deep', hint: 'Gradient dark end' },
  { key: 'brandInkRaised', cssVar: '--kf-brand-ink-raised', label: 'Ink — raised', hint: 'Panels on the dark ground' },
  { key: 'onInk', cssVar: '--kf-on-ink', label: 'Text on ink', hint: 'Headings on dark' },
  { key: 'onInkSecondary', cssVar: '--kf-on-ink-secondary', label: 'Text on ink — dim', hint: 'Body copy on dark' },
  { key: 'onInkAccent', cssVar: '--kf-on-ink-accent', label: 'Accent on ink', hint: 'Eyebrows and highlights' },
  { key: 'onFill', cssVar: '--kf-on-fill', label: 'Text on fill', hint: 'Label inside a filled button' },
  { key: 'accent', cssVar: '--color-accent', label: 'Accent', hint: 'Links, focus rings, chillies' },
  { key: 'accentText', cssVar: '--color-text-accent', label: 'Accent — text', hint: 'Link text, discount chip' },
];

/** Corner shape presets. Pills stay pills; these are cards and panels. */
const SHAPES: readonly { name: string; card: string; control: string }[] = [
  { name: 'Round', card: '30px', control: '12px' },
  { name: 'Soft', card: '12px', control: '8px' },
  { name: 'Sharp', card: '4px', control: '3px' },
];

/** Ready-made palettes, to show a rebrand in one click. */
const PRESETS: readonly { name: string; values: Record<string, string> }[] = [
  {
    name: 'KokoFresh',
    values: {
      brandInk: '#33240F', brandInkSoft: '#3A2912', brandInkDeep: '#2A1D0C',
      brandInkRaised: '#40301A', onInk: '#F7EEDC', onInkSecondary: '#CBB99D',
      onInkAccent: '#F0A85C', onFill: '#FFFFFF',
      accent: '#C25510', accentText: '#9A4600',
      radiusCard: '30px', radiusControl: '12px', fontSet: 'prata',
    },
  },
  {
    name: 'Indigo',
    values: {
      brandInk: '#12408A', brandInkSoft: '#174C9E', brandInkDeep: '#0D2F66',
      brandInkRaised: '#1B4F9C', onInk: '#EAF2FF', onInkSecondary: '#B9CDEA',
      onInkAccent: '#7FB2FF', onFill: '#FFFFFF',
      accent: '#1E63C8', accentText: '#154E9E',
      radiusCard: '12px', radiusControl: '8px', fontSet: 'bodoniModa',
    },
  },
  {
    name: 'Forest',
    values: {
      brandInk: '#1E3D2B', brandInkSoft: '#264A34', brandInkDeep: '#142A1D',
      brandInkRaised: '#2A5039', onInk: '#EAF3EC', onInkSecondary: '#B4CCBB',
      onInkAccent: '#86C79A', onFill: '#FFFFFF',
      accent: '#2F7D4F', accentText: '#1F5E39',
      radiusCard: '30px', radiusControl: '12px', fontSet: 'cormorant',
    },
  },
  {
    name: 'Claret',
    values: {
      brandInk: '#5C1A2B', brandInkSoft: '#6B2033', brandInkDeep: '#3F111D',
      brandInkRaised: '#73243A', onInk: '#FBEDF0', onInkSecondary: '#DDB9C3',
      onInkAccent: '#E8869B', onFill: '#FFFFFF',
      accent: '#A8324D', accentText: '#87263C',
      radiusCard: '4px', radiusControl: '3px', fontSet: 'italiana',
    },
  },
];

/** Relative luminance, for the contrast readout. */
function luminance(hex: string): number {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}

function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function BrandStudio({
  initial,
  canPersist,
}: {
  /** The theme currently in effect, so the studio opens on the live colours. */
  initial: Record<string, string>;
  canPersist: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const frameRef = useRef<HTMLIFrameElement>(null);

  /**
   * Writes the pending theme into a document as inline custom properties —
   * exactly what the server-injected <style> does, so the preview and the saved
   * result cannot disagree.
   */
  const paint = useCallback(
    (doc: Document | null | undefined) => {
      if (!doc) return;
      const root = doc.documentElement;
      for (const sw of SWATCHES) {
        const v = values[sw.key];
        if (v) root.style.setProperty(sw.cssVar, v);
      }
      if (values.radiusCard) root.style.setProperty('--kf-radius-card', values.radiusCard);
      if (values.radiusControl) {
        root.style.setProperty('--kf-radius-control', values.radiusControl);
      }

      // Identity is markup, not style. In the framed preview we can still
      // reflect it, because the frame is same-origin — so the demo shows the
      // real name rather than making you save to see it.
      if (doc !== document && values.brandName) {
        for (const el of doc.querySelectorAll('[class*=top-nav-heading]')) {
          el.textContent = values.brandName;
        }
      }

      // Fonts are next/font classes on <html>, not custom properties, so the
      // class list is swapped rather than a variable set. Every set's classes
      // are removed first so switching does not stack them.
      if (values.fontSet) {
        for (const key of Object.keys(FONT_SETS)) {
          for (const cls of fontClassName(key).split(' ')) {
            if (cls) root.classList.remove(cls);
          }
        }
        for (const cls of fontClassName(values.fontSet).split(' ')) {
          if (cls) root.classList.add(cls);
        }
      }
    },
    [values],
  );

  // The studio's own chrome.
  useEffect(() => {
    paint(document);
    const root = document.documentElement;
    return () => {
      for (const sw of SWATCHES) root.style.removeProperty(sw.cssVar);
      root.style.removeProperty('--kf-radius-card');
      root.style.removeProperty('--kf-radius-control');
    };
  }, [paint]);

  /**
   * The framed storefront. CSS variables do not cross a document boundary, so
   * the parent writes them into the frame directly — same-origin, so this is
   * allowed. Without it the preview would only ever show the SAVED theme, which
   * is useless while you are choosing colours.
   */
  useEffect(() => {
    paint(frameRef.current?.contentDocument);
  }, [paint]);

  const ratio = contrast(values.brandInk ?? '#000000', values.onFill ?? '#FFFFFF');
  const passesAA = ratio >= 4.5;

  /**
   * The full theme payload. Built from one place so the saved config and the
   * displayed JSON can never drift — an earlier version listed only the colour
   * swatches here, and shape, font and identity were silently dropped on save.
   */
  const payload: Record<string, string> = Object.fromEntries(
    [
      ...SWATCHES.map((sw) => sw.key),
      'radiusCard',
      'radiusControl',
      'fontSet',
      'brandName',
      'tagline',
      'logoSrc',
    ]
      .map((k) => [k, values[k]])
      .filter(([, v]) => v),
  );

  const json = JSON.stringify(payload, null, 2);

  return (
    <div className="kf-studio">
      <div className="kf-studio-controls">
        <VStack gap={5}>
          <VStack gap={1}>
            <p className="kf-eyebrow">White-label</p>
            <Heading level={2}>Brand studio</Heading>
            <Text type="supporting" color="secondary">
              Change a colour and watch the whole storefront follow. This writes
              the same CSS variables the server injects for a tenant.
            </Text>
          </VStack>

          <VStack gap={2}>
            <span className="kf-filter-label">Presets</span>
            <div className="kf-preset-row">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className="kf-preset"
                  onClick={() => setValues(p.values)}
                >
                  <span
                    className="kf-preset-dot"
                    style={{ background: p.values.brandInk }}
                    aria-hidden="true"
                  />
                  {p.name}
                </button>
              ))}
            </div>
          </VStack>

          <VStack gap={2}>
            <span className="kf-filter-label">Identity</span>
            <label className="kf-field">
              <span>Brand name</span>
              <input
                type="text"
                className="kf-text-input"
                value={values.brandName ?? ''}
                placeholder="KokoFresh"
                onChange={(e) => setValues((v) => ({ ...v, brandName: e.target.value }))}
              />
            </label>
            <label className="kf-field">
              <span>Tagline</span>
              <input
                type="text"
                className="kf-text-input"
                value={values.tagline ?? ''}
                placeholder="From Karnataka's kitchens to your table"
                onChange={(e) => setValues((v) => ({ ...v, tagline: e.target.value }))}
              />
            </label>
            <label className="kf-field">
              <span>Logo path or URL</span>
              <input
                type="text"
                className="kf-text-input"
                value={values.logoSrc ?? ''}
                placeholder="/brand/kokofresh-logo.webp"
                onChange={(e) => setValues((v) => ({ ...v, logoSrc: e.target.value }))}
              />
            </label>
          </VStack>

          <VStack gap={2}>
            <span className="kf-filter-label">Typography</span>
            <select
              className="kf-text-input"
              value={values.fontSet ?? 'prata'}
              onChange={(e) => setValues((v) => ({ ...v, fontSet: e.target.value }))}
            >
              {FONT_SET_OPTIONS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
            <Text type="supporting" color="secondary">
              Self-hosted and loaded per set — no extra network request.
            </Text>
          </VStack>

          <VStack gap={2}>
            <span className="kf-filter-label">Corner shape</span>
            <div className="kf-preset-row">
              {SHAPES.map((sh) => (
                <button
                  key={sh.name}
                  type="button"
                  className="kf-preset"
                  data-active={values.radiusCard === sh.card || undefined}
                  onClick={() =>
                    setValues((v) => ({ ...v, radiusCard: sh.card, radiusControl: sh.control }))
                  }
                >
                  <span
                    className="kf-shape-dot"
                    style={{ borderRadius: sh.control }}
                    aria-hidden="true"
                  />
                  {sh.name}
                </button>
              ))}
            </div>
          </VStack>

          <VStack gap={3}>
            <span className="kf-filter-label">Colours</span>
            {SWATCHES.map((s) => (
              <label key={s.key} className="kf-swatch-row">
                <input
                  type="color"
                  className="kf-swatch-input"
                  value={values[s.key] ?? '#000000'}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [s.key]: e.target.value.toUpperCase() }))
                  }
                />
                <span className="kf-swatch-meta">
                  <span className="kf-swatch-label">{s.label}</span>
                  <span className="kf-swatch-hint">{s.hint}</span>
                </span>
                <code className="kf-swatch-hex">{values[s.key]}</code>
              </label>
            ))}
          </VStack>

          {/* Contrast is the thing a colour picker lets you get wrong. */}
          <div className="kf-contrast" data-pass={passesAA || undefined}>
            <strong>{ratio.toFixed(2)}:1</strong>
            <span>
              button label contrast — {passesAA ? 'passes AA' : 'FAILS AA (needs 4.5)'}
            </span>
          </div>

          <VStack gap={2}>
            <span className="kf-filter-label">config/theme.json</span>
            <pre className="kf-config-out">{json}</pre>
            <div className="kf-preset-row">
              <Button
                label={pending ? 'Saving…' : 'Save to site'}
                variant="primary"
                size="sm"
                isDisabled={pending || !canPersist}
                onClick={() =>
                  startTransition(async () => {
                    const r = await saveTheme(payload);
                    setStatus(r);
                  })
                }
              />
              <Button
                label="Reset"
                variant="secondary"
                size="sm"
                isDisabled={pending || !canPersist}
                onClick={() =>
                  startTransition(async () => {
                    const r = await resetTheme();
                    setStatus(r);
                    if (r.ok) setValues(PRESETS[0]!.values);
                  })
                }
              />
              <Button
                label="Copy config"
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard?.writeText(json)}
              />
            </div>

            {status ? (
              <p className="kf-save-status" data-ok={status.ok || undefined}>
                {status.message}
              </p>
            ) : null}

            {!canPersist ? (
              <Text type="supporting" color="secondary">
                This deployment has a read-only filesystem, so Save is
                unavailable. Copy the config into config/theme.json, or return it
                from the backend on /site-config.
              </Text>
            ) : null}
          </VStack>
        </VStack>
      </div>

      <div className="kf-studio-preview">
        <VStack gap={4}>
          <Text type="supporting" color="secondary">
            Live preview — the real storefront, updating as you change things.
            Colours, shape, type and the brand name all update as you edit.
          </Text>

          <div className="kf-frame-wrap">
            <iframe
              ref={frameRef}
              src="/"
              className="kf-frame"
              title="Storefront preview"
              // Paint on load too: the effect above can run before the frame's
              // document exists, and on every later navigation inside it.
              onLoad={() => paint(frameRef.current?.contentDocument)}
            />
          </div>

          <div className="kf-demo-card">
            <VStack gap={3}>
              <Heading level={3}>Buttons &amp; controls</Heading>
              <div className="kf-card-buy">
                <select className="kf-weight-select" aria-label="Weight">
                  <option>100g</option>
                </select>
                <Button label="Add to cart" variant="primary" size="sm" />
              </div>
              <div className="kf-preset-row">
                <button type="button" className="kf-chip" data-active>
                  Active chip
                </button>
                <button type="button" className="kf-chip">
                  Inactive
                </button>
                <span className="kf-notify-btn">Notify me</span>
              </div>
            </VStack>
          </div>

          <div className="kf-demo-card">
            <VStack gap={2}>
              <Heading level={3}>Badges</Heading>
              <div className="kf-preset-row">
                <span className="kf-demo-ribbon">BESTSELLER</span>
                <span className="kf-demo-ribbon">SINGLE ESTATE</span>
                <span className="kf-off">18% OFF</span>
                <span className="kf-veg" title="Vegetarian" />
              </div>
              <Text type="supporting" color="secondary">
                The green veg mark is deliberately NOT themeable — the FSSAI
                symbol is a legal standard, not a brand choice.
              </Text>
            </VStack>
          </div>

          <aside className="kf-demo-strip">
            <VStack gap={1}>
              <p className="kf-eyebrow">Better value</p>
              <Heading level={3}>Save More with Bundles</Heading>
              <Text color="secondary">
                Curated combos of our bestsellers — crafted for every kitchen.
              </Text>
            </VStack>
            <span className="kf-bundle-strip-cta">Explore Bundles →</span>
          </aside>
        </VStack>
      </div>
    </div>
  );
}
