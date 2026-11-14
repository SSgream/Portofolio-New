"use client";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

/* ---------- Notifikasi (toast) ---------- */
type Kind = "ok" | "err";
type Item = { id: number; msg: string; kind: Kind };

export function toast(msg: string, kind: Kind = "ok") {
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { msg, kind } }));
}

export function Toaster() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    let n = 0;
    const on = (e: Event) => {
      const { msg, kind } = (e as CustomEvent).detail as { msg: string; kind: Kind };
      const id = ++n;
      setItems((l) => [...l, { id, msg, kind }]);
      setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4000);
    };
    window.addEventListener("app-toast", on);
    return () => window.removeEventListener("app-toast", on);
  }, []);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg ${t.kind === "ok" ? "bg-navy" : "bg-[#9b2c2c]"}`}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden className={t.kind === "ok" ? "text-peach" : "text-white"}>
            {t.kind === "ok" ? (
              <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M10 5v6M10 14.5v.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            )}
          </svg>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ---------- Form yang memunculkan notifikasi setelah berhasil ---------- */
export function ActionForm({
  action, message, confirmText, className, children,
}: {
  action: (fd: FormData) => Promise<void>;
  message: string;
  confirmText?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      className={className}
      action={async (fd: FormData) => {
        if (confirmText && !window.confirm(confirmText)) return;
        try {
          await action(fd);
          toast(message);
        } catch {
          toast("Gagal menyimpan. Periksa isian atau ukuran gambar (maks 4 MB), lalu coba lagi.", "err");
        }
      }}
    >
      {children}
    </form>
  );
}

/* ---------- Tombol dengan hover, klik, dan status memproses ---------- */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SubmitButton({
  children, pendingLabel = "Menyimpan…", variant = "primary", className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const look =
    variant === "danger"
      ? "px-4 text-sm text-[#9b2c2c] hover:bg-[#9b2c2c]/10"
      : "bg-peach px-6 text-navy hover:-translate-y-px hover:shadow-md hover:brightness-95";
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-semibold transition duration-150 active:translate-y-0 active:scale-95 active:brightness-90 disabled:cursor-wait disabled:opacity-60 ${look} ${className}`}
    >
      {pending && <Spinner />}
      {pending ? pendingLabel : children}
    </button>
  );
}
