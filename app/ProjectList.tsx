"use client";
import { useEffect, useRef, useState } from "react";

type Project = {
  id: number; title: string; description: string; tech: string;
  kind: string; year: string; url: string; repo: string; image_url: string;
};

const FIRST = 3; // jumlah projek yang tampil di awal
const STEP = 6; // tambahan setiap klik "View more"

/* Posisi awal tiap kartu (kiri / tengah / kanan) sebelum "mendarat".
   x, y = jarak dari posisi akhir, r = kemiringan. Ubah angkanya untuk efek lebih liar / lebih kalem. */
const SCATTER = [
  { x: "-9vw", y: "150px", r: "-7deg" },
  { x: "0vw", y: "240px", r: "3deg" },
  { x: "9vw", y: "150px", r: "7deg" },
];

function Art({ i }: { i: number }) {
  const v = i % 3;
  const bg = ["bg-navy", "bg-steel", "bg-cream"][v];
  return (
    <div className={`${bg} aspect-[16/10]`} aria-hidden>
      <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {v === 0 && (
          <>
            {[50, 80, 60, 110, 90, 130].map((h, k) => (
              <rect key={k} x={40 + k * 56} y={170 - h} width="34" height={h} rx="6"
                fill={k === 5 ? "#E9A66B" : "#C3D0E0"} opacity={k === 5 ? 1 : 0.45} />
            ))}
            <polyline points="57,95 113,70 169,85 225,45 281,60 337,30" fill="none" stroke="#fff"
              strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {v === 1 && (
          <>
            <path d="M0 150 L60 120 120 132 180 85 240 100 300 55 360 70 400 40 V200 H0Z" fill="#fff" opacity="0.22" />
            <polyline points="0,150 60,120 120,132 180,85 240,100 300,55 360,70 400,40" fill="none"
              stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          </>
        )}
        {v === 2 &&
          ([[300, "#1B2F4B"], [210, "#2F5D8C"], [130, "#E9A66B"]] as const).map(([w, c], k) => (
            <rect key={k} x="40" y={40 + k * 46} width={w} height="26" rx="13" fill={c} />
          ))}
      </svg>
    </div>
  );
}

function Description({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      if (!open) setClamped(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, open]);

  return (
    <div className="mt-3">
      <p ref={ref} className={`leading-relaxed ${open ? "" : "line-clamp-3"}`}>
        {text}
      </p>
      {(clamped || open) && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-steel hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default function ProjectList({ projects }: { projects: Project[] }) {
  const [shown, setShown] = useState(FIRST);
  const [from, setFrom] = useState(FIRST); // kartu mulai dari index ini yang animasi masuk
  const [closing, setClosing] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  /* Scroll-linked: tiap kartu punya progres sendiri (--p, 0 → 1).
     Posisi dihitung dari offsetTop (bukan getBoundingClientRect) supaya
     transform kartu tidak memengaruhi perhitungannya sendiri. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const gridTop = grid.getBoundingClientRect().top;
      Array.from(grid.children).forEach((node) => {
        const card = node as HTMLElement;
        const top = gridTop + card.offsetTop; // posisi kartu di layar tanpa transform
        const t = (vh * 0.98 - top) / (vh * 0.5);
        const p = Math.min(1, Math.max(0, t));
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        card.style.setProperty("--p", eased.toFixed(4));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [shown, projects.length]);

  const more = () => {
    setFrom(shown);
    setShown((n) => n + STEP);
  };

  const less = () => {
    setClosing(true);
    window.setTimeout(() => {
      setShown(FIRST);
      setFrom(FIRST);
      setClosing(false);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("projek")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }, 380);
  };

  return (
    <>
      <div ref={gridRef} className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((x, i) => {
          const meta = [
            String(x.tech).split(",").map((t) => t.trim()).filter(Boolean).join(", "),
            x.kind,
            x.year,
          ].filter(Boolean).join(" · ");
          const s = SCATTER[i % 3];
          return (
            <article
              key={x.id}
              style={{
                "--x": s.x, "--y": s.y, "--r": s.r,
                animationDelay: closing
                  ? `${Math.min(Math.max(i - FIRST, 0), 5) * 40}ms`
                  : i >= from && i < shown ? `${(i - from) * 90}ms` : undefined,
              } as React.CSSProperties}
              className={`${i >= shown ? "hidden" : "flex"} ${
                closing && i >= FIRST ? "pop-out" : i >= from && i < shown ? "pop-in" : ""
              } float-card group flex-col overflow-hidden rounded-[28px] border border-edge bg-card shadow-[0_1px_2px_rgba(27,47,75,0.04),0_16px_40px_-20px_rgba(27,47,75,0.2)] hover:border-steel/30 hover:shadow-[0_28px_56px_-24px_rgba(27,47,75,0.38)]`}
            >
              <div className="p-3 pb-0">
                {x.image_url ? (
                  <a
                    href={x.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${x.title} image in full size`}
                    className="block aspect-[16/10] overflow-hidden rounded-2xl bg-mist"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={x.image_url} alt={`${x.title} project preview`} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-500 motion-safe:group-hover:scale-105" />
                  </a>
                ) : (
                  <div className="overflow-hidden rounded-2xl">
                    <Art i={i} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col px-6 pb-5 pt-5">
                {meta && <p className="text-sm font-medium text-steel">{meta}</p>}
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-navy">{x.title}</h3>
                {x.description && <Description text={x.description} />}
                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  {x.url ? (
                    <a href={x.url} className="inline-flex min-h-11 items-center font-semibold text-steel hover:underline">View case study →</a>
                  ) : (
                    <span />
                  )}
                  {x.repo && (
                    <a
                      href={x.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${x.title} source code on GitHub`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edge px-4 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
                    >
                      <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {projects.length > FIRST && (
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {shown < projects.length && (
            <button
              type="button"
              onClick={more}
              disabled={closing}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-8 font-semibold text-white transition duration-200 hover:bg-steel active:scale-[0.97] disabled:opacity-60"
            >
              View more
            </button>
          )}
          {shown > FIRST && (
            <button
              type="button"
              onClick={less}
              disabled={closing}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-edge bg-white px-8 font-semibold text-navy transition duration-200 hover:border-navy active:scale-[0.97] disabled:opacity-60"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </>
  );
}