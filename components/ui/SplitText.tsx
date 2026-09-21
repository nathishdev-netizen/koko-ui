import type { ReactNode } from 'react';

/**
 * Splits a heading into words that rise into place one after another as the
 * heading enters the viewport — the split-text reveal.
 *
 * Server Component: the split happens in the markup, and the motion is native
 * scroll-driven CSS. No JS ships for this, and it costs nothing in CWV.
 *
 * Words, not characters. Per-character staggering on a display serif reads as
 * a ransom note at these sizes, and it explodes the DOM — a six-word heading
 * becomes ~35 spans. Screen readers also announce split characters
 * individually, so the whole heading is exposed as one accessible string and
 * the pieces are hidden from the tree.
 *
 * The per-word delay is set inline because it varies by index; everything else
 * lives in `.kf-split` in globals.css.
 */
export function SplitText({
  children,
  /** Word index to start counting from, so a second SplitText in the same
   *  heading continues the stagger rather than restarting it. */
  startIndex = 0,
  className,
}: {
  children: string;
  startIndex?: number;
  className?: string;
}) {
  const words = children.split(/(\s+)/).filter((part) => part !== '');
  let wordIndex = startIndex;

  return (
    <span className={className ? `kf-split ${className}` : 'kf-split'}>
      {/* The whole string, for assistive tech and for copy-paste. */}
      <span className="kf-sr-only">{children}</span>
      <span aria-hidden="true">
        {words.map((word, index) => {
          if (/^\s+$/.test(word)) return <span key={index}> </span>;
          const i = wordIndex;
          wordIndex += 1;
          return (
            <span
              key={index}
              className="kf-split-word"
              style={{ '--kf-split-i': i } as React.CSSProperties}
            >
              {word}
            </span>
          );
        })}
      </span>
    </span>
  );
}

/** Words in a string, for continuing a stagger across two SplitText calls. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * A heading rule that draws itself in as it enters — the animated underline.
 * Pure CSS; `.kf-rule` keeps its static appearance when motion is reduced or
 * scroll-driven animation is unsupported.
 */
export function AnimatedRule({ className }: { className?: string }): ReactNode {
  return (
    <span
      className={className ? `kf-rule kf-rule--draw ${className}` : 'kf-rule kf-rule--draw'}
      aria-hidden="true"
    />
  );
}
