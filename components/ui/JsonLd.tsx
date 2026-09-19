/**
 * Renders JSON-LD. Schema that is computed but never rendered does nothing —
 * that was a real defect in the legacy site (LocalBusiness was built in two
 * page components and never emitted).
 *
 * Server component: the payload ships in the initial HTML, which is what
 * crawlers that do not execute JavaScript need.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | readonly Record<string, unknown>[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          // Schema is built by our own builders from typed data, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
