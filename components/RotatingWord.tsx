"use client";
import { useEffect, useRef, useState } from "react";

const INTERVAL = 4500; // ms tiap kata tampil (termasuk waktu sapuan)
const SWEEP = 1800; // ms durasi sapuan kata baru (kotak ikut melebar/menyempit selama waktu ini)
const COLORS = 5;

export default function RotatingWord({ words }: { words: string[] }) {
  const n = words.length;
  const many = n > 1;
  const [idx, setIdx] = useState(0);
  const [started, setStarted] = useState(false); // sudah pernah berganti (sebelumnya tidak ada animasi)
  const [width, setWidth] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false); // transisi lebar aktif setelah ukuran pertama terpasang
  const texts = useRef<(HTMLSpanElement | null)[]>([]);

  // ganti kata
  useEffect(() => {
    if (!many) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const t = window.setInterval(() => {
      if (root.dataset.introActive) return; // tunggu intro selesai
      setStarted(true);
      setIdx((i) => (i + 1) % n);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [many, n]);

  // ukur lebar kata yang tampil (teks + padding kiri-kanan) supaya kotak bisa menyesuaikan
  useEffect(() => {
    if (!many) return;
    const measure = () => {
      const el = texts.current[idx];
      if (!el || !el.parentElement) return;
      const pad = parseFloat(getComputedStyle(el.parentElement).paddingLeft) * 2;
      setWidth(el.offsetWidth + pad);
    };
    measure();
    const t = window.setTimeout(() => setAnimate(true), 60);
    const ro = new ResizeObserver(measure);
    texts.current.forEach((el) => el && ro.observe(el));
    document.fonts?.ready.then(measure);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [idx, many, words]);

  const prev = (idx - 1 + n) % n;

  return (
    <span
      className="relative -mb-[0.1em] mt-[0.12em] inline-grid"
      style={{
        gridTemplateColumns: "minmax(0, 1fr)",
        width: many && width ? width : undefined,
        clipPath: "inset(0 round 1rem)",
        transition: animate ? `width ${SWEEP}ms cubic-bezier(0.5, 0, 0.2, 1)` : undefined,
      }}
    >
      {words.map((w, i) => {
        const active = i === idx;
        const under = started && many && i === prev; // kata lama, tetap terlihat sampai tertutup
        return (
          <span
            key={`${w}-${i}`}
            aria-hidden={!active}
            className={`hl-${i % COLORS} col-start-1 row-start-1 flex items-center justify-start whitespace-nowrap px-3 pb-[0.1em] pt-[0.04em] ${
              active && started ? "word-wipe" : ""
            }`}
            style={{
              animationDuration: `${SWEEP}ms`,
              zIndex: active ? 20 : under ? 10 : 0,
              visibility: active || under ? "visible" : "hidden",
            }}
          >
            <span
              ref={(el) => {
                texts.current[i] = el;
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </span>
  );
}