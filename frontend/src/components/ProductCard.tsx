import type { Product } from "../api";
import { formatRupees } from "../lib/format";
import { Link } from "../lib/router";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps): JSX.Element {
  const seller = product.sellerName ?? "Local seller";
  const sellerDetails = product.sellerLocation
    ? `${seller} · ${product.sellerLocation}`
    : seller;

  return (
    <article className="group h-full min-w-0 overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
      <Link
        href={`/p/${encodeURIComponent(product.id)}`}
        className="block h-full rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
        aria-label={`View ${product.title}`}
      >
        <div className="aspect-[4/3] overflow-hidden bg-surface-100">
          <ProductImage
            src={product.imageUrl}
            alt={`${product.title} product photo`}
            className="h-full w-full motion-safe:transition motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
          />
        </div>
        <div className="min-w-0 p-5">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            {product.category}
          </p>
          <h2 className="mt-2 line-clamp-2 [overflow-wrap:anywhere] text-lg font-semibold leading-snug text-surface-900">
            {product.title}
          </h2>
          <p className="mt-3 text-xl font-bold text-surface-900">
            {formatRupees(product.price)}
          </p>
          <p className="mt-3 truncate text-sm text-surface-500">{sellerDetails}</p>
        </div>
      </Link>
    </article>
  );
}
