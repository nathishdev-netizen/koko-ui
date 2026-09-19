/**
 * Font loading for the KokoFresh brand.
 *
 * Lives beside the theme — NOT in app/layout.tsx — because the font choice is a
 * brand fact. The layout consumes these exports without naming a family, so a
 * second brand swaps this file and the layout is untouched.
 *
 * The actual families live in ./fontSets.ts, which defines several candidate
 * directions and a single FONT_SET constant that selects the live one. That
 * indirection exists so a typography direction can be swapped (or compared in
 * development via `?font=<key>`) without editing any component.
 *
 * next/font self-hosts every set and emits size-adjusted fallback metrics, so
 * nothing shifts when the webfont arrives (CLS).
 */
export { FONT_SET, FONT_SETS, fontClassName, isFontSetKey } from './fontSets';
export type { FontSetKey } from './fontSets';
