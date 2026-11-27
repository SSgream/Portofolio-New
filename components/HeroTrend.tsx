"use client";
import { useEffect, useRef, useState } from "react";

/* Garis tren sebagai latar hero (3/5 tinggi hero dari dasar).
   1. Garis tergambar dari ujung kiri ke ujung kanan setelah intro selesai.
   2. Dua cahaya menyusuri garis dari ujung ke ujung dan terus berulang:
      yang tipis berjalan duluan, beberapa saat kemudian yang tebal menyusul di belakangnya.
   Ujung cahaya sengaja dibuat transparan di kedua sisi, supaya di luar cahaya garis tetap
   tipis dan polos (tidak tiba-tiba menebal). */
const PATH =
  "M0 240 C120 220 180 140 300 160 S480 250 600 190 S800 60 920 100 S1100 150 1200 60";
const CYCLE = "6.5s";
const FOLLOW_DELAY = 650; // ms jarak antara cahaya tipis dan yang tebal

export default function HeroTrend() {
  const reveal = useRef<SVGAnimationElement>(null);
  const lead = useRef<SVGAnimationElement>(null);
  const follow = useRef<SVGAnimationElement>(null);
  const [still, setStill] = useState(false); // reduced motion: tampil statis

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    const root = document.documentElement;
    const timers: number[] = [];
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      mo.disconnect();
      reveal.current?.beginElement();
      timers.push(window.setTimeout(() => lead.current?.beginElement(), 2400));
      timers.push(window.setTimeout(() => follow.current?.beginElement(), 2400 + FOLLOW_DELAY));
    };
    const mo = new MutationObserver(() => {
      if (!root.dataset.introActive) start();
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-intro-active"] });
    if (!root.dataset.introActive) start();
    return () => {
      mo.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const move = (r: React.RefObject<SVGAnimationElement | null>) =>
    !still && (
      <animateTransform
        ref={r as unknown as React.Ref<SVGAnimateTransformElement>}
        attributeName="gradientTransform"
        type="translate"
        values="0 0;1560 0;1560 0"
        keyTimes="0;0.7;1"
        dur={CYCLE}
        begin="indefinite"
        repeatCount="indefinite"
      />
    );

  return (
    <svg
      className="absolute inset-x-0 bottom-0 h-24 w-full sm:h-40 md:h-3/5"
      viewBox="0 0 1200 300"
      preserveAspectRatio="none"
    >
      <defs>
        <clipPath id="trend-clip">
          <rect x="0" y="0" width={still ? 1200 : 0} height="300">
            <animate
              ref={reveal as unknown as React.Ref<SVGAnimateElement>}
              attributeName="width"
              from="0"
              to="1200"
              dur="2.4s"
              begin="indefinite"
              fill="freeze"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.65 0 0.35 1"
            />
          </rect>
        </clipPath>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2F5D8C" stopOpacity="0.09" />
          <stop offset="1" stopColor="#2F5D8C" stopOpacity="0" />
        </linearGradient>

        {/* cahaya tipis (depan) */}
        <linearGradient id="trend-lead" gradientUnits="userSpaceOnUse" x1="-240" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#2F5D8C" stopOpacity="0" />
          <stop className="trend-lead-hi" offset="0.85" stopColor="#1B2F4B" stopOpacity="1" />
          <stop offset="1" stopColor="#1B2F4B" stopOpacity="0" />
          {move(lead)}
        </linearGradient>

        {/* cahaya tebal (menyusul di belakang) */}
        <linearGradient id="trend-follow" gradientUnits="userSpaceOnUse" x1="-360" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#2F5D8C" stopOpacity="0" />
          <stop className="trend-follow-hi" offset="0.8" stopColor="#2F5D8C" stopOpacity="0.8" />
          <stop offset="1" stopColor="#2F5D8C" stopOpacity="0" />
          {move(follow)}
        </linearGradient>
      </defs>

      <g clipPath="url(#trend-clip)">
        <path d={`${PATH} L1200 300 L0 300 Z`} fill="url(#trend-fill)" />
        {/* garis dasar */}
        <path
          d={PATH}
          fill="none"
          className="trend-base" stroke="#C9D6E6"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* cahaya tebal, di belakang */}
        <path
          d={PATH}
          fill="none"
          stroke="url(#trend-follow)"
          strokeWidth="6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 6px rgba(47,93,140,0.35))" }}
        />
        {/* cahaya tipis, di depan */}
        <path
          d={PATH}
          fill="none"
          stroke="url(#trend-lead)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}