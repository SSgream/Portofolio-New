"use client";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

/* ---------- Notifikasi (toast) ---------- */
type Kind = "ok" | "err";
type ToastItem = { id: number; msg: string; kind: Kind };

export function toast(msg: string, kind: Kind = "ok") {
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { msg, kind } }));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
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
          className={`toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-full py-2.5 pl-3 pr-5 text-sm font-semibold text-white shadow-lg ${t.kind === "ok" ? "bg-navy" : "bg-[#9b2c2c]"}`}
        >
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden>
              {t.kind === "ok" ? (
                <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M10 5v6M10 14.5v.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              )}
            </svg>
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ---------- Form yang memunculkan notifikasi setelah berhasil ----------
   reset    : kosongkan isian setelah berhasil (untuk form tambah)
   collapse : tutup panel <details> tempat form berada setelah berhasil */
export function ActionForm({
  action, message, confirmText, className, children, reset = false, collapse = false,
}: {
  action: (fd: FormData) => Promise<void>;
  message: string;
  confirmText?: string;
  className?: string;
  children: React.ReactNode;
  reset?: boolean;
  collapse?: boolean;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      className={className}
      action={async (fd: FormData) => {
        if (confirmText && !window.confirm(confirmText)) return;
        try {
          await action(fd);
          toast(message);
          if (reset) ref.current?.reset();
          if (collapse) ref.current?.closest("details")?.removeAttribute("open");
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
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const look =
    variant === "danger"
      ? "btn-danger border px-5 text-sm"
      : variant === "secondary"
        ? "border border-edge bg-white px-6 text-navy hover:border-navy"
        : "bg-navy px-6 text-white hover:bg-steel";
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-semibold transition duration-200 active:scale-[0.97] disabled:cursor-wait disabled:opacity-60 ${look} ${className}`}
    >
      {pending && <Spinner />}
      {pending ? pendingLabel : children}
    </button>
  );
}

/* ---------- Pilih gambar: kotak unggah dengan pratinjau ---------- */
export function ImageField({
  current, label = "Gambar projek", maxMB = 4,
}: {
  current?: string;
  label?: string;
  maxMB?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [removed, setRemoved] = useState(false);

  // bersihkan pratinjau saat form di-reset (setelah berhasil menambah)
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => {
      setPreview(null);
      setFileName("");
      setError("");
      setRemoved(false);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setPreview(null);
      setFileName("");
      setError("");
      return;
    }
    if (f.size > maxMB * 1024 * 1024) {
      setError(`Ukuran file ${(f.size / 1048576).toFixed(1)} MB, melebihi batas ${maxMB} MB. Pilih gambar yang lebih kecil.`);
      e.target.value = "";
      setPreview(null);
      setFileName("");
      return;
    }
    setError("");
    setFileName(f.name);
    setPreview(URL.createObjectURL(f));
  };

  const shown = preview ?? (current && !removed ? current : null);

  return (
    <div className="md:col-span-2">
      <span className="mb-1 block text-sm font-medium text-navy">{label}</span>
      <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-edge bg-white p-3 transition duration-200 focus-within:border-steel focus-within:ring-4 focus-within:ring-steel/15 hover:border-steel hover:bg-mist/60">
        <input ref={inputRef} type="file" name="image" accept="image/*" onChange={onPick} className="sr-only" />
        <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mist text-steel">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className={`h-full w-full object-cover ${removed && !preview ? "opacity-30" : ""}`} />
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <circle cx="9" cy="10" r="1.6" />
              <path d="M21 16l-5-5-8 8" />
            </svg>
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-navy">
            {fileName || (current ? "Ganti gambar" : "Pilih gambar")}
          </span>
          <span className="block text-sm">JPG, PNG, atau WebP, maks {maxMB} MB</span>
        </span>
      </label>
      {error && (
        <div role="alert" className="alert-error mt-2 rounded-xl border px-3 py-2 text-sm font-medium">
          {error}
        </div>
      )}
      {current && (
        <label className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="remove_image"
            value="1"
            onChange={(e) => setRemoved(e.target.checked)}
            className="h-4 w-4"
          />
          Hapus gambar saat ini
        </label>
      )}
    </div>
  );
}