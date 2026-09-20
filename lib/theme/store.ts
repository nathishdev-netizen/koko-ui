import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { brandTheme, brandThemeSchema, type BrandTheme } from '@/config/theme';

/**
 * Where a saved brand theme lives.
 *
 * The chain, in priority order:
 *   1. the backend's /site-config `theme` (once Frappe ships it) — the real
 *      answer for multi-tenant, resolved per request in lib/api/site-config.ts
 *   2. a locally saved override (this module)
 *   3. config/theme.json, the committed default
 *
 * Step 2 exists so the brand studio's Save actually changes the site. It writes
 * to a data directory rather than mutating config/theme.json, keeping the
 * committed default intact and the saved state gitignored.
 *
 * IMPORTANT: serverless filesystems (Vercel) are read-only apart from /tmp, and
 * /tmp is per-instance and ephemeral. So a save is durable in local development
 * and best-effort in production — which is correct, because in production the
 * durable store is the backend, not a file. `canPersist()` reports which case
 * you are in so the UI can tell the truth rather than silently losing a save.
 */
const DATA_DIR = path.join(process.cwd(), '.data');
const THEME_FILE = path.join(DATA_DIR, 'theme.json');

/** False on a read-only serverless filesystem. */
export function canPersist(): boolean {
  return process.env.VERCEL !== '1';
}

export async function readSavedTheme(): Promise<BrandTheme | null> {
  try {
    const raw = await fs.readFile(THEME_FILE, 'utf8');
    const parsed = brandThemeSchema.safeParse(JSON.parse(raw));
    // A corrupt or hand-edited file must not take the site down; fall through
    // to the committed default instead.
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function writeSavedTheme(theme: BrandTheme): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(THEME_FILE, `${JSON.stringify(theme, null, 2)}\n`, 'utf8');
}

export async function clearSavedTheme(): Promise<void> {
  await fs.rm(THEME_FILE, { force: true });
}

/** The effective local theme: a saved override, else the committed default. */
export async function getLocalTheme(): Promise<BrandTheme> {
  return (await readSavedTheme()) ?? brandTheme;
}
