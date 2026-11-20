/**
 * Full-page placeholder shown while a page reads localStorage (client only).
 * The spinner is an ink ring; the optional label is announced to screen readers.
 */
export default function PageLoader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4"
      role="status"
    >
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-rule-strong border-t-ink"
        aria-hidden
      />
      <p className="text-ink-soft">{label}</p>
    </div>
  );
}
