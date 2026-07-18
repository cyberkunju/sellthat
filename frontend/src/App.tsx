import { useEffect, useRef } from "react";
import { Link, usePathname } from "./lib/router";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Product } from "./pages/Product";

type Route =
  | { kind: "home" }
  | { kind: "product"; id: string }
  | { kind: "not-found" };

function matchRoute(pathname: string): Route {
  const normalized = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  if (normalized === "/") return { kind: "home" };

  const match = /^\/p\/([^/]+)$/.exec(normalized);
  if (!match?.[1]) return { kind: "not-found" };

  try {
    const id = decodeURIComponent(match[1]);
    return id ? { kind: "product", id } : { kind: "not-found" };
  } catch {
    return { kind: "not-found" };
  }
}

function renderRoute(route: Route): JSX.Element {
  if (route.kind === "home") return <Home />;
  if (route.kind === "product") return <Product key={route.id} id={route.id} />;
  return <NotFound />;
}

export default function App(): JSX.Element {
  const pathname = usePathname();
  const route = matchRoute(pathname);
  const initialRender = useRef(true);

  useEffect(() => {
    if (route.kind === "home") {
      document.title = "SellThat — Local products, listed simply";
    } else if (route.kind === "product") {
      document.title = "SellThat marketplace";
    }

    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    document.getElementById("main-content")?.focus();
  }, [pathname, route.kind]);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-stone-950 px-4 py-2 text-sm font-semibold text-white focus:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
      >
        Skip to content
      </a>

      <header className="border-b border-stone-200 bg-white/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            aria-label="SellThat home"
          >
            <img src="/logo-mark.svg" alt="" aria-hidden="true" className="h-8 w-8" width={32} height={32} />
            <span className="block text-2xl font-black tracking-tight text-stone-950">
              Sell<span className="text-brand-600">That</span>
            </span>
          </Link>
          <p className="max-w-xs text-right text-xs leading-5 text-stone-600 sm:text-sm">
            Sell anything from a chat. Discover it here.
          </p>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex flex-1 outline-none">
        {renderRoute(route)}
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SellThat</p>
          <p>Made for local sellers across India.</p>
        </div>
      </footer>
    </div>
  );
}
