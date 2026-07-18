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
    <div className="flex min-h-screen flex-col bg-brand-paper">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-brand-ink px-4 py-2 text-sm font-semibold text-white focus:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
      >
        Skip to content
      </a>

      <header className="border-b border-brand-700/40 bg-brand-ink">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Link
            href="/"
            className="rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            aria-label="SellThat home"
          >
            <img
              src="/logo-wordmark.svg"
              alt=""
              aria-hidden="true"
              className="h-7 w-auto sm:h-9"
              width={196}
              height={36}
            />
          </Link>
          <p className="hidden max-w-xs text-right text-sm leading-5 text-surface-300 md:block">
            Sell anything from a chat. Discover it here.
          </p>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex flex-1 outline-none">
        {renderRoute(route)}
      </main>

      <footer className="border-t border-brand-700/40 bg-brand-ink">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-6 text-sm text-surface-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SellThat</p>
          <p>Made for local sellers across India.</p>
        </div>
      </footer>
    </div>
  );
}
