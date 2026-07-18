import { useEffect, useState } from "react";
import { ApiError, getProduct, type Product as ProductData } from "../api";
import { ProductImage } from "../components/ProductImage";
import { formatQuantity, formatRupees } from "../lib/format";
import { Link } from "../lib/router";
import { NotFound } from "./NotFound";

type ProductState =
  | { status: "loading" }
  | { status: "ready"; product: ProductData }
  | { status: "not-found" }
  | { status: "error" };

interface ProductProps {
  id: string;
}

export function Product({ id }: ProductProps): JSX.Element {
  const [state, setState] = useState<ProductState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    void getProduct(id, controller.signal)
      .then((product) => setState({ status: "ready", product }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 404) {
          setState({ status: "not-found" });
          return;
        }
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [attempt, id]);

  useEffect(() => {
    if (state.status === "ready") {
      document.title = `${state.product.title} | SellThat`;
    }
  }, [state]);

  if (state.status === "not-found") {
    return <NotFound title="Product not found" message="This product may have been removed or the link may be incorrect." />;
  }

  if (state.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" role="status">
        <span className="sr-only">Loading product…</span>
        <div className="h-5 w-32 rounded bg-stone-200 motion-safe:animate-pulse" aria-hidden="true" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2" aria-hidden="true">
          <div className="aspect-square rounded-3xl bg-stone-200 motion-safe:animate-pulse" />
          <div className="space-y-5 py-4">
            <div className="h-4 w-24 rounded bg-stone-200 motion-safe:animate-pulse" />
            <div className="h-10 w-4/5 rounded bg-stone-200 motion-safe:animate-pulse" />
            <div className="h-8 w-32 rounded bg-stone-200 motion-safe:animate-pulse" />
            <div className="h-24 rounded-2xl bg-stone-100 motion-safe:animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex min-h-[58vh] w-full max-w-2xl items-center px-4 py-16 text-center sm:px-6">
        <section className="w-full rounded-3xl border border-amber-200 bg-amber-50 px-6 py-12" role="alert">
          <h1 className="text-2xl font-bold text-stone-950">We couldn’t load this product</h1>
          <p className="mt-3 leading-7 text-stone-600">Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-6 min-h-11 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-300"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  const { product } = state;
  const sellerName = product.sellerName ?? "Local seller";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/"
        replace
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-stone-600 hover:text-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
      >
        <span aria-hidden="true">←</span> Back to marketplace
      </Link>

      <article className="mt-6 grid min-w-0 items-start gap-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-14">
        <div className="aspect-square min-w-0 overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 shadow-card">
          <ProductImage
            src={product.imageUrl}
            alt={`${product.title} product photo`}
            className="h-full w-full"
            eager
          />
        </div>

        <div className="min-w-0 lg:py-4">
          <p className="[overflow-wrap:anywhere] text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
            {product.category}
          </p>
          <h1 className="mt-3 [overflow-wrap:anywhere] text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
            {product.title}
          </h1>
          <p className="mt-5 text-3xl font-bold text-stone-950">{formatRupees(product.price)}</p>

          <dl className="mt-6 flex min-w-0 flex-wrap gap-3 text-sm">
            <div className="max-w-full rounded-full bg-brand-50 px-4 py-2 text-brand-800">
              <dt className="sr-only">Quantity</dt>
              <dd className="font-semibold">{formatQuantity(product.quantity)} available</dd>
            </div>
            <div className="max-w-full rounded-full bg-stone-100 px-4 py-2 text-stone-700">
              <dt className="sr-only">Category</dt>
              <dd className="[overflow-wrap:anywhere] font-medium">{product.category}</dd>
            </div>
          </dl>

          <section className="mt-8 border-t border-stone-200 pt-7" aria-labelledby="description-heading">
            <h2 id="description-heading" className="text-lg font-semibold text-stone-900">About this product</h2>
            <p className="mt-3 whitespace-pre-line [overflow-wrap:anywhere] leading-7 text-stone-600">
              {product.description.trim() || "No description provided."}
            </p>
          </section>

          <section className="mt-8 min-w-0 rounded-2xl border border-stone-200 bg-white p-5" aria-labelledby="seller-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Sold by</p>
            <h2 id="seller-heading" className="mt-1 [overflow-wrap:anywhere] text-lg font-semibold text-stone-900">{sellerName}</h2>
            {product.sellerLocation && <p className="mt-1 [overflow-wrap:anywhere] text-sm text-stone-600">{product.sellerLocation}</p>}
          </section>

          <button
            type="button"
            disabled
            className="mt-6 min-h-12 w-full cursor-not-allowed rounded-xl bg-stone-200 px-6 py-3 font-semibold text-stone-500"
          >
            Buy — coming soon
          </button>
          <p className="mt-2 text-center text-xs leading-5 text-stone-500">
            Buying on SellThat is not available yet.
          </p>
        </div>
      </article>
    </div>
  );
}
