/**
 * KokoFresh brand theme.
 *
 * Palette carried forward from the legacy storefront (REBUILD_ANALYSIS.md 1.2):
 *   brown #A0937D · beige #E7D4B5 · light beige #F6E6CB · green #B6C7AA
 *   brand dark #3B2B13 · brand orange #DE7921 · cream ground #FFF8E1
 * Type: see themes/kokofresh/fontSets.ts — FONT_SET selects the live pairing.
 *   Currently Prata (display) + Jost (body): a high-contrast Didone in the
 *   register luxury houses use, with a quiet geometric body so the display
 *   carries all the drama.
 *
 * Only tokens that differ from Astryx defaults are overridden; everything else
 * inherits. Adding a second brand means adding themes/<brand>/ — no component
 * code changes.
 *
 * Built to CSS by `pnpm theme:build` (runs as part of `pnpm build`). A built
 * theme is required because only built themes are present at first paint in an
 * SSR app — runtime injection would cost us CLS.
 */
import { defineTheme } from '@astryxdesign/core/theme';

export const kokofreshTheme = defineTheme({
  name: 'kokofresh',

  color: {
    // Light scheme, matching the live site's register. Both halves of each
    // pair hold the same value so the design does not change with the OS.
    accent: ['#E8873A', '#E8873A'],
    neutralStyle: 'warm',
    contrast: 'standard',
  },

  typography: {
    scale: { base: 16, ratio: 1.2 },
    body: {
      family: 'Jost',
      fallbacks: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    },
    heading: {
      family: 'Prata',
      fallbacks: 'Georgia, Cambria, "Times New Roman", serif',
    },
  },

  // Rounded 2xl/3xl cards are core to the artisanal look.
  radius: { base: 8, multiplier: 1.25 },

  // Component overrides go through the theme rather than CSS: StyleX guards its
  // rules with repeated :not(#\#) for artificial specificity, so a plain class
  // selector cannot win. `borderWidth` here is the supported route.
  components: {
    card: {
      base: { borderWidth: '2px' },
    },
    // Primary buttons take the brand's ink rather than the orange accent.
    // Scoped to the button here rather than changing --color-accent, which also
    // drives links, icons, focus rings and the spice-heat chillies.
    //
    // These reference the CSS variables from globals.css, NOT literal hexes:
    // the theme is compiled at build time, so a literal here would not follow a
    // tenant's runtime colour override and the buttons would stay brown while
    // the rest of the page rebranded. The var() fallback keeps the build
    // self-contained if the token is ever absent.
    button: {
      'variant:primary': {
        backgroundColor: 'var(--kf-brand-ink, #33240F)',
        color: 'var(--kf-on-fill, #FFFFFF)',
      },
      // Secondary ships a translucent dark fill that reads as grey against the
      // cream ground. An outlined brown button pairs with the primary instead.
      'variant:secondary': {
        backgroundColor: 'transparent',
        // Secondary ships no border at all, so a colour alone leaves bare text
        // with nothing to read as a button. Give it a real outline.
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'var(--kf-brand-ink, #33240F)',
        color: 'var(--kf-brand-ink, #33240F)',
      },
    },
  },

  tokens: {
    // Warm cream ground — the live site's register. Deliberately NOT near-white:
    // the brand's character is in the warmth, so the body sits around 90%
    // lightness rather than 97%.
    // Dark mirrors light's ordering — body darkest, card mid, surface
    // lightest — so cards lift off the page in both schemes. Previously card
    // and surface were the same value in dark, which flattened every card.
    '--color-background-body': ['#FBF3E4', '#FBF3E4'],
    '--color-background-surface': ['#FFFDF8', '#FFFDF8'],
    '--color-background-card': ['#F4E7CE', '#F4E7CE'],
    '--color-background-muted': ['#EFE0C2', '#EFE0C2'],

    // Ink is a warm dark brown rather than near-black — softer on a cream
    // ground while still clearing AA comfortably (10.9:1).
    '--color-text-primary': ['#33240F', '#33240F'],
    '--color-text-secondary': ['#6A5A48', '#6A5A48'],

    // Astryx derives a very dark accent (#9A4600) for maximum contrast. We
    // have headroom, so set the brand orange explicitly — still 4.9:1 on cream,
    // comfortably past AA, but it reads as orange rather than brown.
    '--color-accent': ['#C25510', '#C25510'],
    '--color-text-accent': ['#9A4600', '#9A4600'],
    '--color-icon-accent': ['#C25510', '#C25510'],

    '--color-border': ['#E0CDA8', '#E0CDA8'],
    '--color-border-emphasized': ['#C2A97F', '#C2A97F'],

    // Green from the legacy palette reads as the success/fresh signal.
    '--color-success': ['#7A9463', '#7A9463'],
  },
});
