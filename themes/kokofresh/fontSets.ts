/**
 * Font sets — swappable typography directions for evaluation.
 *
 * `FONT_SET` below picks the live set. To try another, change that one constant
 * and restart the dev server, or append `?font=<key>` in development to preview
 * a set without editing anything.
 *
 * Each set names three ROLES, not three families:
 *    display → headings, hero, section titles
 *    body    → copy, buttons, labels, nav, prices
 *    accent  → pull quotes, signatures, taglines (see .kf-accent)
 * The accent is usually the display face's italic, which costs no extra
 * request. Keep it rationed — an accent only reads as special when it is rare.
 */
import {
  Antic_Didone,
  Bodoni_Moda,
  Bricolage_Grotesque,
  Cormorant_Garamond,
  DM_Sans,
  Figtree,
  Gloock,
  Italiana,
  Jost,
  Libre_Bodoni,
  Marcellus,
  Prata,
  Instrument_Serif,
  Manrope,
  Newsreader,
  Onest,
  Outfit,
  Schibsted_Grotesk,
  Source_Serif_4,
  Tenor_Sans,
  Young_Serif,
} from 'next/font/google';

/** ── Which set is live. Change this one line to switch. ───────────────── */
export const FONT_SET: FontSetKey = 'prata';

// ── Set A: Cormorant Garamond + DM Sans ────────────────────────────────────
// High-contrast Garamond revival. Classic premium-food register.
const cormorantDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-body' });

// ── Set B: Instrument Serif + Manrope ──────────────────────────────────────
// Tighter, more contemporary serif. Modern editorial rather than classical.
const instrumentDisplay = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-body' });

// ── Set C: Bricolage Grotesque + DM Sans ───────────────────────────────────
// No serif at all. Confident, current, reads younger.
const bricolageDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

// ── Set D: Source Serif 4 + Outfit ─────────────────────────────────────────
// Sturdier low-contrast serif — holds up on small screens and busy photography
// where a Garamond's thin strokes get lost.
const sourceSerifDisplay = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

const outfit = Outfit({ subsets: ['latin'], display: 'swap', variable: '--font-body' });

// ── Set E: Young Serif + Figtree ───────────────────────────────────────────
// Chunky slab-ish serif with real craft character — bakery/roastery energy
// rather than fashion-magazine. The most distinctive option here.
const youngSerifDisplay = Young_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-heading',
});

const figtree = Figtree({ subsets: ['latin'], display: 'swap', variable: '--font-body' });

// ── Set F: Gloock + Onest ──────────────────────────────────────────────────
// Very high-contrast modern display serif. Fashion-house drama at headline
// size, paired with a quiet geometric body.
const gloockDisplay = Gloock({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-heading',
});

const onest = Onest({ subsets: ['latin'], display: 'swap', variable: '--font-body' });

// ── Set G: Newsreader + Schibsted Grotesk ──────────────────────────────────
// Warm literary serif with optical sizing — reads like a good food magazine
// rather than a luxury logo.
const newsreaderDisplay = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

// ── Set H: Bricolage Grotesque display + Onest body ────────────────────────
// Sans-only but with personality: Bricolage's slightly eccentric forms carry
// the headline while Onest keeps the copy quiet.
const bricolageOnest = { display: bricolageDisplay, body: onest };

/*
 * ── Luxury sets ───────────────────────────────────────────────────────────
 * Luxury typography is built on contrast and space. The register the fashion
 * houses use is Didone — dramatic thick/thin strokes and strong vertical
 * stress (Dior's wordmark is Didot-family) — not the softer Garamond warmth
 * Cormorant offers. Bodies here are quiet, widely-spaced sans faces so the
 * display carries all the drama.
 */

// Libre Bodoni: a true Didone. The closest free face to the Dior register.
const libreBodoniDisplay = Libre_Bodoni({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

const jost = Jost({ subsets: ['latin'], display: 'swap', variable: '--font-body' });

// Bodoni Moda: optical-size Didone, sharper hairlines at display sizes.
const bodoniModaDisplay = Bodoni_Moda({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

const tenorSans = Tenor_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-body',
});

// Prata: high-contrast Didone with a warmer, less severe axis.
const prataDisplay = Prata({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-heading',
});

// Italiana: very fine, airy display face — couture-poster elegance.
const italianaDisplay = Italiana({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-heading',
});

// Marcellus: Roman-inscriptional. Heritage authority rather than fashion.
const marcellusDisplay = Marcellus({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-heading',
});

// Antic Didone: Didone forms at a single quiet weight.
const anticDidoneDisplay = Antic_Didone({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-heading',
});

/*
 * ── Fontshare sets (Indian Type Foundry, free for commercial use) ──────────
 * Self-hosted in public/fonts and declared in public/fonts/fontshare.css, so
 * these are plain family names rather than next/font objects. They are the
 * faces premium product sites actually use, and none of them reads as a
 * default — which is the point.
 */
const fontshare = (display: string, body: string) =>
  `kf-fs kf-fs-${display} kf-fs-body-${body}`;

export const FONT_SETS = {
  cormorant: {
    label: 'Cormorant Garamond + DM Sans',
    note: 'Refined high-contrast serif. Classic premium-food register.',
    className: `${cormorantDisplay.variable} ${dmSans.variable}`,
  },
  instrument: {
    label: 'Instrument Serif + Manrope',
    note: 'Modern editorial. Tighter and less ornamental than a Garamond.',
    className: `${instrumentDisplay.variable} ${manrope.variable}`,
  },
  bricolage: {
    label: 'Bricolage Grotesque + DM Sans',
    note: 'Sans-only. Confident and contemporary; drops the heritage signal.',
    className: `${bricolageDisplay.variable} ${dmSans.variable}`,
  },
  source: {
    label: 'Source Serif 4 + Outfit',
    note: 'Sturdy low-contrast serif. Survives small screens and busy imagery.',
    className: `${sourceSerifDisplay.variable} ${outfit.variable}`,
  },
  young: {
    label: 'Young Serif + Figtree',
    note: 'Chunky craft serif — bakery/roastery character, not fashion magazine.',
    className: `${youngSerifDisplay.variable} ${figtree.variable}`,
  },
  gloock: {
    label: 'Gloock + Onest',
    note: 'Very high-contrast display serif. Dramatic, fashion-house headlines.',
    className: `${gloockDisplay.variable} ${onest.variable}`,
  },
  newsreader: {
    label: 'Newsreader + Schibsted Grotesk',
    note: 'Warm literary serif. Reads like a good food magazine.',
    className: `${newsreaderDisplay.variable} ${schibsted.variable}`,
  },
  bricolageOnest: {
    label: 'Bricolage Grotesque + Onest',
    note: 'Sans-only with character. Eccentric headline, quiet body.',
    className: `${bricolageOnest.display.variable} ${bricolageOnest.body.variable}`,
  },

  // ── Fontshare ────────────────────────────────────────────────────────────
  zodiak: {
    label: 'Zodiak + Satoshi',
    note: 'Fontshare. Characterful contemporary serif with real edge; Satoshi is the premium-product default.',
    className: fontshare('zodiak', 'satoshi'),
  },
  gambetta: {
    label: 'Gambetta + General Sans',
    note: 'Fontshare. Calligraphic old-style serif — heritage warmth without the Garamond cliché.',
    className: fontshare('gambetta', 'general-sans'),
  },
  erode: {
    label: 'Erode + Switzer',
    note: 'Fontshare. Weathered, slightly rough serif. Hand-made and imperfect on purpose.',
    className: fontshare('erode', 'switzer'),
  },
  bespoke: {
    label: 'Bespoke Serif + Satoshi',
    note: 'Fontshare. Confident modern serif with a tailored, luxury-goods feel.',
    className: fontshare('bespoke-serif', 'satoshi'),
  },
  clash: {
    label: 'Clash Display + Satoshi',
    note: 'Fontshare. Wide, high-impact display sans. Bold and unmistakably current.',
    className: fontshare('clash-display', 'satoshi'),
  },
  cabinet: {
    label: 'Cabinet Grotesk + General Sans',
    note: 'Fontshare. Sharp geometric display with subtle quirks. Modern and premium.',
    className: fontshare('cabinet-grotesk', 'general-sans'),
  },

  // ── Luxury / Didone ──────────────────────────────────────────────────────
  libreBodoni: {
    label: 'Libre Bodoni + Jost',
    note: 'True Didone — the Dior register. Dramatic thick/thin, strong vertical stress.',
    className: `${libreBodoniDisplay.variable} ${jost.variable}`,
  },
  bodoniModa: {
    label: 'Bodoni Moda + Tenor Sans',
    note: 'Optical-size Didone with razor hairlines. The most couture of these.',
    className: `${bodoniModaDisplay.variable} ${tenorSans.variable}`,
  },
  prata: {
    label: 'Prata + Jost',
    note: 'High-contrast Didone with a warmer axis. Luxury without severity.',
    className: `${prataDisplay.variable} ${jost.variable}`,
  },
  italiana: {
    label: 'Italiana + Tenor Sans',
    note: 'Fine, airy couture-poster display. Elegant and very light.',
    className: `${italianaDisplay.variable} ${tenorSans.variable}`,
  },
  marcellus: {
    label: 'Marcellus + Jost',
    note: 'Roman-inscriptional capitals. Heritage authority rather than fashion.',
    className: `${marcellusDisplay.variable} ${jost.variable}`,
  },
  anticDidone: {
    label: 'Antic Didone + Tenor Sans',
    note: 'Quiet Didone at a single weight. Understated editorial luxury.',
    className: `${anticDidoneDisplay.variable} ${tenorSans.variable}`,
  },
} as const;

export type FontSetKey = keyof typeof FONT_SETS;

export function isFontSetKey(value: string | undefined): value is FontSetKey {
  return value !== undefined && value in FONT_SETS;
}

/** Class names for a set — falls back to the configured default. */
export function fontClassName(key?: string): string {
  return FONT_SETS[isFontSetKey(key) ? key : FONT_SET].className;
}
