import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 ai-pattern opacity-35 mix-blend-screen" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" aria-hidden />

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
          AllRole Lab
        </span>
        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Landing page ringan untuk eksperimen AI kamu
        </h1>
        <p className="text-base text-slate-300 sm:text-lg">
          Simpan rencana dan prototipe di satu tempat. Tambah halaman baru di folder <code>app/</code> kapan pun kamu siap
          melanjutkan ide berikutnya.
        </p>
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pomodoro"
            className="w-full rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:w-auto"
          >
            Buka Pomodoro
          </Link>
          <Link
            href="/roadmap"
            className="w-full rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 sm:w-auto"
          >
            Lihat rencana tim
          </Link>
        </div>
      </main>
    </div>
  );
}
