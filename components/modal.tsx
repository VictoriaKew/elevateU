"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Modal({ children, labelledBy, onClose, closeDisabled = false }: { children: ReactNode; labelledBy: string; onClose: () => void; closeDisabled?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const disabledRef = useRef(closeDisabled);
  closeRef.current = onClose;
  disabledRef.current = closeDisabled;
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = container.current;
    if (!dialog) return;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')).filter((element) => element.getClientRects().length > 0);
    (focusable()[0] ?? dialog).focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !disabledRef.current) { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); dialog?.focus(); return; }
      const current = items.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && current <= 0) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && (current === -1 || current === items.length - 1)) { event.preventDefault(); items[0].focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-5"><div ref={container} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} className="card my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto p-7">{children}</div></div>;
}
