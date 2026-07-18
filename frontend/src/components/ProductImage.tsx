import { useEffect, useState } from "react";
import { toAssetUrl } from "../api";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}

export function ProductImage({
  src,
  alt,
  className = "",
  eager = false,
}: ProductImageProps): JSX.Element {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-surface-200 text-surface-400 ${className}`}
        role="img"
        aria-label="Product image unavailable"
      >
        <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" aria-hidden="true">
          <path d="M6.5 8.5h11l1 11h-13l1-11Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={toAssetUrl(src)}
      alt={alt}
      className={`bg-surface-100 object-cover ${className}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
