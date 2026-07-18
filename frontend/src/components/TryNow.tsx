import { useEffect, useId, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// Public SellThat WhatsApp number, in wa.me form (country code + number, no +).
const WHATSAPP_NUMBER = "919400245958";
const PREFILLED_TEXT = "hi";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_TEXT)}`;

function WhatsAppGlyph({ className }: { className?: string }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.19 8.19 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

export function TryNow(): JSX.Element {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = triggerRef.current;
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-5 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-card ring-1 ring-brand-700/40 motion-safe:transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:bottom-8 sm:right-8 sm:text-base"
      >
        <WhatsAppGlyph className="h-5 w-5" />
        Try now
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/70 px-4 py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            aria-describedby={descId}
            className="w-full max-w-sm rounded-3xl border border-surface-200 bg-white p-6 text-center shadow-card sm:p-8"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden="true">
              <WhatsAppGlyph className="h-6 w-6" />
            </div>
            <h2 id={headingId} className="mt-4 text-xl font-bold tracking-tight text-surface-900">
              Try SellThat on WhatsApp
            </h2>
            <p id={descId} className="mt-2 text-sm leading-6 text-surface-500">
              Scan this code to start a chat, or tap the button below. We’ll say hi and help you list a product.
            </p>

            <div className="mt-6 flex justify-center">
              <div className="rounded-2xl border border-surface-200 bg-white p-4">
                <QRCodeSVG
                  value={WHATSAPP_LINK}
                  size={192}
                  bgColor="#ffffff"
                  fgColor="#000002"
                  level="M"
                  marginSize={0}
                  role="img"
                  aria-label="WhatsApp QR code for SellThat"
                />
              </div>
            </div>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white motion-safe:transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            >
              <WhatsAppGlyph className="h-5 w-5" />
              Open WhatsApp
            </a>

            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 min-h-11 w-full rounded-xl px-4 py-2 text-sm font-semibold text-surface-500 motion-safe:transition hover:text-surface-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
