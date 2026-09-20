'use server';

import { revalidatePath } from 'next/cache';

import { brandThemeSchema } from '@/config/theme';
import {
  canPersist,
  clearSavedTheme,
  writeSavedTheme,
} from '@/lib/theme/store';

export type SaveResult = {
  ok: boolean;
  message: string;
};

/**
 * Persists a brand theme and repaints the whole site.
 *
 * Guarded by the same env flag as the page: a Server Action is a public
 * endpoint, so checking only in the component would leave the mutation
 * reachable in production even while the UI is hidden.
 */
function studioEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_ENABLE_BRAND_STUDIO === '1'
  );
}

export async function saveTheme(values: unknown): Promise<SaveResult> {
  if (!studioEnabled()) {
    return { ok: false, message: 'Brand studio is disabled.' };
  }

  // Re-validated server-side: the client cannot be trusted, and these values
  // are injected into a <style> tag.
  const parsed = brandThemeSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid colour value.',
    };
  }

  if (!canPersist()) {
    return {
      ok: false,
      message:
        'This deployment has a read-only filesystem, so the theme cannot be saved here. Copy the config into config/theme.json, or let the backend return it on /site-config.',
    };
  }

  try {
    await writeSavedTheme(parsed.data);
  } catch {
    return { ok: false, message: 'Could not write the theme file.' };
  }

  // Every page renders the theme from the root layout, so the whole site has
  // to be revalidated, not just this route.
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Saved — the whole site now uses these colours.' };
}

export async function resetTheme(): Promise<SaveResult> {
  if (!studioEnabled()) {
    return { ok: false, message: 'Brand studio is disabled.' };
  }
  if (!canPersist()) {
    return { ok: false, message: 'Read-only filesystem: nothing to reset.' };
  }
  await clearSavedTheme();
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Reset to the committed default.' };
}
