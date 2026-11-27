"use client";

import { useEffect, useRef, useState } from "react";
import Art from "./ProjectArt";

export type FeaturedProject = {
  id: number;
  title: string;
  description: string;
  tech: string;
  kind: string;
  year: string;
  url: string;
  repo: string;
  image_url: string;
};

const DURATION = 4500;
const SLIDE = 650;

function Chevron({ dir }: { dir: "l" | "r" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "l" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export default function FeaturedBanner({
  projects,
}: {
  projects: FeaturedProject[];
}) {
  const n = projects.length;
  const many = n > 1;

  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hold, setHold] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [shown, setShown] = useState(false); // animasi masuk saat digulir

  const outerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animasi masuk: kartu melayang naik lalu mendarat, sama seperti bagian lain saat digulir.
  // Diamati lewat pembungkus yang tidak bergerak supaya tidak berkedip di tepi layar.
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = many && !reduce && !hover && !focus && !hold && visible;

  const go = (i: number) => {
    setIdx(((i % n) + n) % n);
  };

  useEffect(() => {
    if (!playing) return;

    const timer = window.setTimeout(() => {
      setIdx((current) => (current + 1) % n);
    }, DURATION);

    return () => window.clearTimeout(timer);
  }, [idx, n, playing]);

  if (n === 0) return null;

  /* Tombol panah: di HP berada di baris bawah bersama titik indikator (tidak menutupi teks),
     di layar >= sm melayang di kiri-kanan kartu. */
  const arrowOverlay =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-navy shadow-md backdrop-blur-md transition duration-200 hover:scale-105 hover:bg-white active:scale-95 sm:inline-flex";
  const arrowInline =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-edge bg-white text-navy shadow-sm transition duration-200 active:scale-95 sm:hidden";

  return (
    <div ref={outerRef}>
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      className={`relative ${
        shown
          ? "translate-y-0 scale-100 opacity-100 transition duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          : "translate-y-16 scale-[0.97] opacity-0 transition-none"
      }`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocus(false);
        }
      }}
    >
      {/* Featured card */}
      <div className="relative">
        <div className="overflow-hidden rounded-[24px] border border-edge bg-white shadow-[0_1px_2px_rgba(27,47,75,0.04),0_20px_40px_-30px_rgba(27,47,75,0.25)]">
          <div
            className="overflow-hidden"
            style={{ touchAction: "pan-y" }}
            onPointerDown={(event) => {
              startX.current = event.clientX;
              swiped.current = false;
              if (event.pointerType !== "mouse") setHold(true);
            }}
            onPointerUp={(event) => {
              const start = startX.current;
              startX.current = null;
              setHold(false);

              if (start === null || !many) return;

              const distance = event.clientX - start;
              if (Math.abs(distance) > 50) {
                swiped.current = true;
                go(idx + (distance < 0 ? 1 : -1));
              }
            }}
            onPointerCancel={() => {
              startX.current = null;
              setHold(false);
            }}
            onClickCapture={(event) => {
              if (swiped.current) {
                event.preventDefault();
                event.stopPropagation();
                swiped.current = false;
              }
            }}
          >
            <div
              className="flex"
              aria-live={playing ? "off" : "polite"}
              style={{
                transform: `translateX(-${idx * 100}%)`,
                transition: reduce
                  ? "none"
                  : `transform ${SLIDE}ms cubic-bezier(0.65, 0, 0.35, 1)`,
              }}
            >
              {projects.map((project, i) => {
                const active = i === idx;
                const tabIndex = active ? 0 : -1;

                const chips = String(project.tech)
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .slice(0, 6);

                const meta = [project.kind, project.year]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <article
                    key={project.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${n}`}
                    aria-hidden={!active}
                    className="grid w-full shrink-0 items-center gap-5 p-4 sm:p-5 lg:grid-cols-[1.12fr_0.88fr] lg:gap-7 lg:p-6 xl:p-7"
                  >
                    {/* Project preview */}
                    <div className="min-w-0 self-center">
                      {project.image_url ? (
                        <a
                          href={project.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={tabIndex}
                          aria-label={`Open ${project.title} image in full size`}
                          className="mx-auto block aspect-[16/9] max-h-[230px] overflow-hidden rounded-xl bg-mist ring-1 ring-edge sm:max-h-[260px] lg:max-h-[280px]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.image_url}
                            alt={`${project.title} project preview`}
                            loading={i === 0 ? "eager" : "lazy"}
                            className="h-full w-full object-contain"
                          />
                        </a>
                      ) : (
                        <div className="overflow-hidden rounded-xl ring-1 ring-edge">
                          <Art i={i} />
                        </div>
                      )}
                    </div>

                    {/* Project information */}
                    <div className="flex min-w-0 flex-col lg:min-h-[310px] lg:py-1">
                      {meta && (
                        <p className="label text-xs text-steel">{meta}</p>
                      )}

                      <h3 className="mt-2 font-display text-2xl font-bold leading-[1.15] tracking-tight text-navy sm:text-3xl lg:text-[1.85rem]">
                        {project.title}
                      </h3>

                      {project.description && (
                        <p className="mt-3 text-sm leading-[1.65] text-ink/80 sm:text-[0.95rem]">
                          {project.description}
                        </p>
                      )}

                      {chips.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {chips.map((chip) => (
                            <li
                              key={chip}
                              className="rounded-full border border-edge bg-mist/60 px-3 py-1 text-xs font-medium text-navy"
                            >
                              {chip}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Actions */}
                      {(project.url || project.repo) && (
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 lg:mt-auto lg:pt-5">
                          {project.url ? (
                            <a
                              href={project.url}
                              tabIndex={tabIndex}
                              className="inline-flex min-h-10 items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition duration-200 hover:bg-steel active:scale-[0.97]"
                            >
                              View case study
                              <span aria-hidden className="ml-2">↗</span>
                            </a>
                          ) : (
                            <span />
                          )}

                          {project.repo && (
                            <a
                              href={project.repo}
                              target="_blank"
                              rel="noopener noreferrer"
                              tabIndex={tabIndex}
                              aria-label={`${project.title} source code on GitHub`}
                              className="ml-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-edge px-4 text-sm font-semibold text-navy transition duration-200 hover:border-navy hover:bg-mist/60 active:scale-[0.97]"
                            >
                              <svg
                                viewBox="0 0 16 16"
                                width="17"
                                height="17"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                              </svg>
                              GitHub
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panah melayang (layar >= sm) */}
        {many && (
          <>
            <button
              type="button"
              onClick={() => go(idx - 1)}
              aria-label="Previous project"
              className={`${arrowOverlay} left-3`}
            >
              <Chevron dir="l" />
            </button>

            <button
              type="button"
              onClick={() => go(idx + 1)}
              aria-label="Next project"
              className={`${arrowOverlay} right-3`}
            >
              <Chevron dir="r" />
            </button>
          </>
        )}
      </div>

      {/* Baris kontrol: titik indikator (di HP dengan panah di kiri-kanannya) */}
      {many && (
        <div className="mt-3 flex items-center justify-center gap-3 sm:mt-2.5">
          <button
            type="button"
            onClick={() => go(idx - 1)}
            aria-label="Previous project"
            className={arrowInline}
          >
            <Chevron dir="l" />
          </button>

          <div className="flex items-center gap-2.5">
            {projects.map((project, i) => {
              const active = i === idx;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show project ${i + 1}: ${project.title}`}
                  aria-current={active}
                  className="group flex h-9 items-center justify-center px-0.5 sm:h-6"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active
                        ? "w-7 bg-navy"
                        : "w-2 bg-navy/20 group-hover:bg-navy/45"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => go(idx + 1)}
            aria-label="Next project"
            className={arrowInline}
          >
            <Chevron dir="r" />
          </button>
        </div>
      )}
    </div>
    </div>
  );
}