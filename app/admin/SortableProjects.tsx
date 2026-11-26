"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { reorderProjects } from "@/app/reorder";
import { FEATURED } from "@/lib/projectOrder";
import { toast } from "./ui";

/* Daftar projek yang bisa diurutkan di admin.
   - Desktop: seret gagang (⋮⋮) di kiri baris.
   - HP dan keyboard: tombol panah naik/turun.
   - Nomor urut diberi otomatis (1, 2, 3, ...), jadi tidak mungkin ada angka kembar.
   - Tiga teratas tampil di banner; ada garis pemisah setelah baris ke-3.
   - Urutan tersimpan otomatis begitu selesai menyeret atau menekan panah. */

type Row = { id: number; node: React.ReactNode };

function move<T>(arr: T[], from: number, to: number) {
  const a = arr.slice();
  const [x] = a.splice(from, 1);
  a.splice(to, 0, x);
  return a;
}

const arrow =
  "inline-flex h-7 w-9 items-center justify-center rounded-lg text-steel transition duration-150 hover:bg-mist active:scale-90 disabled:pointer-events-none disabled:opacity-30";

export default function SortableProjects({ rows }: { rows: Row[] }) {
  const ids = rows.map((r) => r.id);
  const key = ids.join(",");
  const [order, setOrder] = useState<number[]>(ids);
  const [armed, setArmed] = useState<number | null>(null); // gagang sedang ditekan
  const [dragging, setDragging] = useState<number | null>(null);
  const saved = useRef<number[]>(ids);
  const timer = useRef<number | undefined>(undefined);
  const busy = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);
  const byId = new Map(rows.map((r) => [r.id, r]));

  // sinkron dengan data terbaru dari server (setelah tambah/hapus/edit), kecuali sedang menyimpan
  useEffect(() => {
    if (busy.current || timer.current !== undefined) return;
    setOrder(ids);
    saved.current = ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // nilai urutan di dalam form edit ikut diperbarui, supaya menyimpan edit tidak mengembalikan urutan lama
  useEffect(() => {
    listRef.current
      ?.querySelectorAll<HTMLInputElement>('li[data-pid] input[name="sort_order"]')
      .forEach((inp) => {
        const pid = inp.closest("li[data-pid]")?.getAttribute("data-pid");
        const pos = order.findIndex((o) => String(o) === pid) + 1;
        if (pos > 0) inp.value = String(pos);
      });
  }, [order]);

  const commit = (next: number[], delay: number) => {
    setOrder(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      timer.current = undefined;
      busy.current = true;
      try {
        await reorderProjects(next);
        saved.current = next;
        toast("Urutan tersimpan.");
      } catch {
        toast("Gagal menyimpan urutan. Coba lagi.", "err");
        setOrder(saved.current);
      } finally {
        busy.current = false;
      }
    }, delay);
  };

  const list = order.filter((id) => byId.has(id));

  return (
    <div>
      <p className="mb-4 flex items-start gap-2 rounded-2xl bg-steel/10 px-4 py-3 text-sm text-navy">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-steel" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8v.01" />
        </svg>
        <span>
          <strong>{FEATURED} projek teratas</strong> tampil di banner utama. Seret gagang ⋮⋮ (atau pakai panah ▲▼) untuk mengubah urutan;
          tersimpan otomatis. Projek baru masuk tepat di bawah banner.
        </span>
      </p>

      <ul ref={listRef}>
        {list.map((id, i) => {
          const row = byId.get(id)!;
          const top = i < FEATURED;
          return (
            <Fragment key={id}>
            <li
              data-pid={id}
              draggable={armed === id}
              onDragStart={(e) => {
                setDragging(id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(id));
              }}
              onDragOver={(e) => {
                if (dragging === null || dragging === id) return;
                e.preventDefault();
                const r = e.currentTarget.getBoundingClientRect();
                const mid = r.top + r.height / 2;
                const from = list.indexOf(dragging);
                const to = i;
                if ((from < to && e.clientY < mid) || (from > to && e.clientY > mid)) return;
                setOrder(move(list, from, to));
              }}
              onDrop={(e) => e.preventDefault()}
              onDragEnd={() => {
                setDragging(null);
                setArmed(null);
                if (list.join(",") !== saved.current.join(",")) commit(list, 0);
              }}
              className={`mb-3 flex items-start gap-2 last:mb-0 ${dragging === id ? "opacity-50" : ""}`}
            >
              {/* kontrol urutan */}
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Seret untuk mengubah urutan"
                  title="Seret untuk mengubah urutan"
                  onMouseDown={() => setArmed(id)}
                  onMouseUp={() => setArmed(null)}
                  className="pointer-coarse:hidden inline-flex h-16 w-6 cursor-grab items-center justify-center rounded-lg text-steel/70 transition-colors hover:bg-mist hover:text-steel active:cursor-grabbing"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
                    <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
                    <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
                  </svg>
                </button>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    aria-label={`Naikkan urutan: ${i + 1} ke ${i}`}
                    disabled={i === 0}
                    onClick={() => commit(move(list, i, i - 1), 700)}
                    className={arrow}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
                  </button>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${top ? "bg-navy text-white" : "bg-mist text-steel"}`}
                    title={top ? "Tampil di banner" : undefined}
                  >
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    aria-label={`Turunkan urutan: ${i + 1} ke ${i + 2}`}
                    disabled={i === list.length - 1}
                    onClick={() => commit(move(list, i, i + 1), 700)}
                    className={arrow}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                </div>
              </div>

              <div className="min-w-0 flex-1">{row.node}</div>
            </li>
            {i === FEATURED - 1 && list.length > FEATURED && (
              <li aria-hidden="true" className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-steel">
                <span className="h-px flex-1 bg-edge" />
                Batas banner · di bawah ini hanya di daftar kartu
                <span className="h-px flex-1 bg-edge" />
              </li>
            )}
            </Fragment>
          );
        })}
      </ul>
    </div>
  );
}
