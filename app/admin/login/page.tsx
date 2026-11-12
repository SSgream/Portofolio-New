import { loginAction } from "@/app/actions";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="rounded-3xl border border-edge bg-card p-8">
        <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight text-navy">Masuk admin</h1>
        <form action={loginAction} className="space-y-3">
          <input name="password" type="password" required placeholder="Password" className="min-h-11 w-full rounded-xl border border-edge bg-white px-4" />
          {error && <p role="alert" className="text-sm text-[#9b2c2c]">Password salah. Coba lagi.</p>}
          <button className="min-h-11 w-full rounded-full bg-peach px-6 font-semibold text-navy">Masuk</button>
        </form>
      </div>
    </main>
  );
}
