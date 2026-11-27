"use client";
import { useEffect, useRef, useState } from "react";
import { FEATURED } from "@/lib/projectOrder";
import Art from "./ProjectArt";
import FeaturedBanner from "./FeaturedBanner";
import Reveal from "./Reveal";

type Project = {
  id: number; title: string; description: string; tech: string;
  kind: string; year: string; url: string; repo: string; image_url: string;
};

const FIRST = 0; // kartu tersembunyi dulu; yang tampil di awal hanya banner
const STEP = 6; // jumlah kartu yang muncul tiap klik

const SCATTER = [
  { x: "-9vw", y: "150px", r: "-7deg" },
  { x: "0vw", y: "240px", r: "3deg" },
  { x: "9vw", y: "150px", r: "7deg" },
];

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
    const first = shown === 0;
    setFrom(shown);
    setShown((n) => n + STEP);
    // pertama kali dibuka: gulir halus supaya kartu langsung terlihat
    if (first) {
      window.setTimeout(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        gridRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }, 60);
    }
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

  const featured = projects.slice(0, FEATURED);
  const hasMore = projects.length > FEATURED; // kalau projek <= 3, cukup banner saja
  const remaining = projects.length - shown;

  return (
    <>
      <Reveal once>
        <FeaturedBanner projects={featured} />
      </Reveal>

      {hasMore && (
      <>
      <div
        ref={gridRef}
        className={`relative grid scroll-mt-24 gap-6 md:grid-cols-2 lg:grid-cols-3 ${shown > 0 ? "mt-12" : ""}`}
      >
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
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {shown < projects.length && (
          <button
            type="button"
            onClick={more}
            disabled={closing}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-8 font-semibold text-white transition duration-200 hover:bg-steel active:scale-[0.97] disabled:opacity-60"
          >
            {shown === 0
              ? `Browse all projects (${projects.length})`
              : `Show ${Math.min(STEP, remaining)} more · ${remaining} left`}
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
      </>
      )}
    </>
  );
}