import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from "react";

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};

const getPathname = (): string => window.location.pathname;

export function usePathname(): string {
  return useSyncExternalStore(subscribe, getPathname, () => "/");
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  replace?: boolean;
}

export function Link({ href, replace = false, onClick, ...props }: LinkProps): JSX.Element {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    onClick?.(event);
    const target = event.currentTarget.target;
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.currentTarget.hasAttribute("download") ||
      (target !== "" && target !== "_self")
    ) {
      return;
    }

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    const updateHistory = replace ? window.history.replaceState : window.history.pushState;
    updateHistory.call(window.history, null, "", destination);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
