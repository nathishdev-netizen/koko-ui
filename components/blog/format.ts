/** "14 August 2026" — the en-IN long form the legacy blog used throughout. */
export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "spice-notes" -> "Spice Notes", for tag chips and pills. */
export function tagLabel(tag: string): string {
  return tag
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
