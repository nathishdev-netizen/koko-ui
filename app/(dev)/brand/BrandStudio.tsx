'use client';

import { useEffect, useState } from 'react';

import { Button, Heading, Text, VStack } from '@/components/ui';

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
];

/** Ready-made palettes, to show a rebrand in one click. */
const PRESETS: readonly { name: string; values: Record<string, string> }[] = [
  {
    name: 'KokoFresh',
    values: {
      brandInk: '#33240F', brandInkSoft: '#3A2912', brandInkDeep: '#2A1D0C',
      brandInkRaised: '#40301A', onInk: '#F7EEDC', onInkSecondary: '#CBB99D',
      onInkAccent: '#F0A85C', onFill: '#FFFFFF',
    },
  },
  {
    name: 'Indigo',
    values: {
      brandInk: '#12408A', brandInkSoft: '#174C9E', brandInkDeep: '#0D2F66',
      brandInkRaised: '#1B4F9C', onInk: '#EAF2FF', onInkSecondary: '#B9CDEA',
      onInkAccent: '#7FB2FF', onFill: '#FFFFFF',
    },
  },
  {
    name: 'Forest',
    values: {
      brandInk: '#1E3D2B', brandInkSoft: '#264A34', brandInkDeep: '#142A1D',
      brandInkRaised: '#2A5039', onInk: '#EAF3EC', onInkSecondary: '#B4CCBB',
      onInkAccent: '#86C79A', onFill: '#FFFFFF',
    },
  },
  {
    name: 'Claret',
    values: {
      brandInk: '#5C1A2B', brandInkSoft: '#6B2033', brandInkDeep: '#3F111D',
      brandInkRaised: '#73243A', onInk: '#FBEDF0', onInkSecondary: '#DDB9C3',
      onInkAccent: '#E8869B', onFill: '#FFFFFF',
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

export function BrandStudio() {
  const [values, setValues] = useState<Record<string, string>>(PRESETS[0]!.values);

  // Writes straight to :root, exactly as the server-injected <style> does.
  useEffect(() => {
    const root = document.documentElement;
    for (const s of SWATCHES) {
      const v = values[s.key];
      if (v) root.style.setProperty(s.cssVar, v);
    }
    return () => {
      for (const s of SWATCHES) root.style.removeProperty(s.cssVar);
    };
  }, [values]);

  const ratio = contrast(values.brandInk ?? '#000000', values.onFill ?? '#FFFFFF');
  const passesAA = ratio >= 4.5;

  const json = JSON.stringify(
    Object.fromEntries(SWATCHES.map((s) => [s.key, values[s.key]])),
    null,
    2,
  );

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
            <Button
              label="Copy config"
              variant="secondary"
              size="sm"
              onClick={() => navigator.clipboard?.writeText(json)}
            />
          </VStack>
        </VStack>
      </div>

      <div className="kf-studio-preview">
        <VStack gap={4}>
          <Text type="supporting" color="secondary">
            Live preview — these are the real components, not mock-ups.
          </Text>

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
