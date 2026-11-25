import Link from "next/link";
import { loginAction } from "@/app/actions";
import ThemeToggle from "@/app/ThemeToggle";
import { PasswordField, SubmitButton } from "./LoginFields";

/* Salin isi file ini ke halaman login admin-mu (page.tsx di folder login). */
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-mist/60 px-6 py-12">
      <ThemeToggle className="absolute right-6 top-6 bg-white" />

      <div className="rise w-full max-w-md rounded-[32px] border border-edge bg-white p-8 shadow-[0_30px_60px_-30px_rgba(27,47,75,0.25)] md:p-10">
        <div
          aria-hidden
          className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-steel/10 text-steel"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="3" />
            <path d="M8 10V7a4 4 0 018 0v3" />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">Masuk admin</h1>
        <p className="mt-2 leading-relaxed">Masukkan password untuk mengelola isi portofolio.</p>

        <div className={error ? "shake" : ""}>
          <form action={loginAction} className="mt-8 space-y-4">
            <PasswordField />
            {error && (
              <div role="alert" className="alert-error flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16.5v.01" />
                </svg>
                Password salah. Coba lagi.
              </div>
            )}
            <SubmitButton />
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-steel hover:underline">
            ← Kembali ke website
          </Link>
        </div>
      </div>
    </main>
  );
}