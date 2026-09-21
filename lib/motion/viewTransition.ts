/**
 * Runs a DOM update inside a View Transition when the browser supports one and
 * the visitor has not asked for reduced motion; otherwise runs it directly.
 *
 * The callback MUST leave the DOM in its new state by the time it returns —
 * for React state that means `flushSync`, since a batched update would let the
 * browser capture the old state twice and animate nothing.
 *
 * Deliberately NOT used for `router.push`: a Next navigation resolves after
 * the callback returns, so the browser would capture the old page as both
 * frames. Route-level transitions need the framework's own hook, not this.
 */
export function withViewTransition(update: () => void): void {
  if (typeof document === 'undefined') {
    update();
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof document.startViewTransition !== 'function') {
    update();
    return;
  }

  document.startViewTransition(update);
}
