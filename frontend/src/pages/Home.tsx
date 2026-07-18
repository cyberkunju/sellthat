import { useEffect, useState } from "react";
import { getProducts, type Product } from "../api";
import { Empty } from "../components/Empty";
import { ProductCard } from "../components/ProductCard";

type HomeState =
  | { status: "loading" }
  | { status: "ready"; products: Product[] }
  | { status: "error" };

export function Home(): JSX.Element {
  const [state, setState] = useState<HomeState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    void getProducts(controller.signal)
      .then((products) => {
        const newestFirst = [...products].sort(
          (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
        );
        setState({ status: "ready", products: newestFirst });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section className="mb-10 max-w-2xl border-l-4 border-brand-600 pl-5 sm:pl-6" aria-labelledby="products-heading">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Marketplace
        </p>
        <h1 id="products-heading" className="mt-3 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
          Fresh finds from local sellers
        </h1>
        <p className="mt-3 text-base leading-7 text-surface-500 sm:text-lg">
          Discover useful, unique products listed directly by people across India.
        </p>
      </section>

      {state.status === "loading" && (
        <section
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="Loading products"
          role="status"
        >
          <span className="sr-only">Loading products…</span>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card" aria-hidden="true">
              <div className="aspect-[4/3] bg-surface-200 motion-safe:animate-pulse" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-20 rounded bg-surface-200 motion-safe:animate-pulse" />
                <div className="h-5 w-4/5 rounded bg-surface-200 motion-safe:animate-pulse" />
                <div className="h-6 w-2/5 rounded bg-surface-200 motion-safe:animate-pulse" />
                <div className="h-4 w-3/5 rounded bg-surface-100 motion-safe:animate-pulse" />
              </div>
            </div>
          ))}
        </section>
      )}

      {state.status === "error" && (
        <section
          className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-12 text-center"
          role="alert"
          aria-labelledby="products-error-heading"
        >
          <h2 id="products-error-heading" className="text-xl font-semibold text-surface-900">
            We couldn’t load the marketplace
          </h2>
          <p className="mt-2 text-sm leading-6 text-surface-500">
            Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-5 min-h-11 rounded-xl bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-surface-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
          >
            Try again
          </button>
        </section>
      )}

      {state.status === "ready" && state.products.length === 0 && <Empty />}

      {state.status === "ready" && state.products.length > 0 && (
        <section
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="Products"
        >
          {state.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}
