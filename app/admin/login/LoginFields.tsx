"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";

/* Letakkan file ini di folder yang sama dengan halaman login. */

export function PasswordField() {
  const [show, setShow] = useState(false);
  const eye = {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  return (
    <div>
      <label htmlFor="password" className="mb-2 block text-sm font-semibold text-navy">
        Password
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Masukkan password"
          className="h-12 w-full rounded-2xl border border-edge bg-white pl-4 pr-12 text-navy outline-none transition duration-200 placeholder:text-navy/40 focus:border-steel focus:ring-4 focus:ring-steel/15"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-steel transition duration-200 hover:bg-mist"
        >
          {show ? (
            <svg {...eye}>
              <path d="M3 3l18 18" />
              <path d="M10.6 6.1A9.8 9.8 0 0112 6c5 0 8.5 4 9.5 6a12.6 12.6 0 01-2.7 3.5M6.6 6.7A12.7 12.7 0 002.5 12c1 2 4.5 6 9.5 6a9.7 9.7 0 004.2-1" />
              <path d="M9.9 9.9a3 3 0 004.2 4.2" />
            </svg>
          ) : (
            <svg {...eye}>
              <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-6 font-semibold text-white transition duration-200 hover:bg-steel active:scale-[0.98] disabled:opacity-70"
    >
      {pending ? (
        <>
          <svg className="animate-spin" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Memeriksa…
        </>
      ) : (
        "Masuk"
      )}
    </button>
  );
}
