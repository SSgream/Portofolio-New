"use client";
import { useEffect, useRef, useState } from "react";

/* true  = nama dan foto meluncur ke header hanya saat kunjungan pertama dalam satu sesi browser.
           Setelah itu (misalnya saat refresh), intro tetap tampil lalu memudar langsung ke web.
   false = selalu meluncur ke header. */
const FLY_ONLY_FIRST_TIME = true;
const HOLD = 3300; // ms intro ditampilkan sebelum meluncur / memudar
const FLY = 1200; // ms durasi peluncuran ke header

type Mode = "fly" | "fade";

export default function Intro({
  name,
  label,
  photo = "/fotoselwin.jpeg",
}: {
  name: string;
  label?: string;
  photo?: string;
}) {
  const [alive, setAlive] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [mode, setMode] = useState<Mode>("fly");
  const nameRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAlive(false);
      return;
    }
    const seen = sessionStorage.getItem("intro-seen") === "1";
    const m: Mode = FLY_ONLY_FIRST_TIME && seen ? "fade" : "fly";
    setMode(m);
    if (m === "fly") root.dataset.intro = "playing";
    document.body.style.overflow = "hidden";
    root.dataset.introActive = "1";

    const timers: number[] = [];
    const clear = () => {
      timers.forEach(clearTimeout);
      delete root.dataset.intro;
      delete root.dataset.introActive;
      document.body.style.overflow = "";
    };
    const end = () => {
      clear();
      sessionStorage.setItem("intro-seen", "1");
      setAlive(false);
    };
    finish.current = end;

    const fly = (el: HTMLElement | null, targetId: string, delay: number) => {
      const to = document.getElementById(targetId);
      if (!el || !to) return;
      const a = el.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      el.style.transformOrigin = "top left";
      el.style.willChange = "transform";
      el.style.transition = `transform ${FLY}ms cubic-bezier(0.76, 0, 0.24, 1) ${delay}ms`;
      el.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})`;
    };

    timers.push(
      window.setTimeout(() => {
        if (m === "fly") {
          fly(avatarRef.current, "site-avatar", 0);
          fly(nameRef.current, "site-name", 80);
          setLeaving(true);
          timers.push(window.setTimeout(end, FLY + 250));
        } else {
          setLeaving(true);
          timers.push(window.setTimeout(end, 800));
        }
      }, HOLD),
    );

    return clear;
  }, []);

  if (!alive) return null;

  const fading = leaving && mode === "fade";
  const bgOut = leaving && mode === "fly";

  return (
    <div
      className={`intro-root fixed inset-0 z-[100] ${leaving ? "is-leaving" : ""} ${
        fading ? "opacity-0 transition-opacity duration-700 ease-in-out" : ""
      }`}
    >
      <div
        className={`absolute inset-0 bg-navy transition-opacity duration-1000 ease-in-out ${
          bgOut ? "opacity-0 delay-200" : "opacity-100"
        }`}
      >
        <div className="hero-grid absolute inset-0" />
        <div className="intro-glow" />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div ref={avatarRef} className="mb-6 h-24 w-24 md:h-28 md:w-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt=""
            className="intro-avatar h-full w-full rounded-full object-cover"
          />
        </div>
        <div
          ref={nameRef}
          aria-label={name}
          className="font-display text-[clamp(2.25rem,8vw,5.5rem)] font-semibold leading-[1.4] text-white"
        >
          {name.split("").map((ch, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="intro-letter inline-block"
              style={{ animationDelay: `${350 + i * 55}ms` }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </div>
        <div className="intro-line mt-3 h-0.5 w-40 origin-left rounded-full bg-peach" />
        {label && <p className="intro-label label mt-5 text-peach">{label}</p>}
      </div>

      <button
        type="button"
        onClick={() => finish.current()}
        className="absolute bottom-6 right-6 inline-flex min-h-11 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-onnavy transition duration-150 hover:bg-white/10 hover:text-white active:scale-95"
      >
        Skip
      </button>
    </div>
  );
}
