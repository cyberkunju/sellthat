export function Empty(): JSX.Element {
  return (
    <section
      className="rounded-3xl border border-dashed border-brand-200 bg-white px-6 py-16 text-center shadow-card"
      aria-labelledby="empty-heading"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl" aria-hidden="true">
        🛍️
      </div>
      <h2 id="empty-heading" className="mt-5 text-xl font-semibold text-surface-900">
        No products yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-surface-500">
        Local sellers are getting their products ready. Check back soon.
      </p>
    </section>
  );
}
