import { useEffect } from "react";
import { Link } from "../lib/router";

interface NotFoundProps {
  title?: string;
  message?: string;
}

export function NotFound({
  title = "Page not found",
  message = "The page you are looking for does not exist.",
}: NotFoundProps): JSX.Element {
  useEffect(() => {
    document.title = `${title} | SellThat`;
  }, [title]);

  return (
    <div className="mx-auto flex min-h-[58vh] w-full max-w-2xl items-center px-4 py-16 text-center sm:px-6">
      <section className="w-full rounded-3xl border border-stone-200 bg-white px-6 py-14 shadow-card" aria-labelledby="not-found-heading">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">404</p>
        <h1 id="not-found-heading" className="mt-3 text-3xl font-bold tracking-tight text-stone-950">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md break-words leading-7 text-stone-600">{message}</p>
        <Link
          href="/"
          replace
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
        >
          Back to marketplace
        </Link>
      </section>
    </div>
  );
}
