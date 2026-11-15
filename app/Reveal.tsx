"use client";
import { useEffect, useRef, useState } from "react";

/* Konten memudar naik setiap kali masuk layar.
   Pakai <Reveal once> kalau ingin efeknya hanya berjalan satu kali. */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  once = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={`${
        shown
          ? "translate-y-0 opacity-100 transition duration-700 ease-out motion-reduce:transition-none"
          : "translate-y-6 opacity-0 transition-none"
      } ${className}`}
    >
      {children}
    </div>
  );
}
