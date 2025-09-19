import Link from "next/link";

import { FloatingRubiksCube } from "./components/home/FloatingRubiksCube";

type SectionCard = {
  title: string;
  badge: string;
  href?: string;
  summary?: string;
  accent: string;
};

const sectionCards: SectionCard[] = [
  {
    title: "Pomodoro Studio",
    badge: "Fokus",
    href: "/pomodoro",
    summary: "Atur ritme 25/5, preset fleksibel, dan alarm yang tetap hidup meski berpindah halaman.",
    accent: "from-cyan-200/50 via-cyan-100/10 to-transparent",
  },
  {
    title: "Bot Catatan Keuangan",
    badge: "Automasi",
    href: "/catatan-keuangan",
    summary: "Foto struk, ekstraksi otomatis ke CSV, dan papan ringkas pengeluaran.",
    accent: "from-emerald-200/45 via-sky-100/10 to-transparent",
  },
  {
    title: "Story Forge",
    badge: "Segera",
    accent: "from-fuchsia-100/45 via-purple-100/10 to-transparent",
  },
  {
    title: "Exploration Atlas",
    badge: "Segera",
    accent: "from-sky-100/50 via-indigo-100/10 to-transparent",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 ai-pattern opacity-70" aria-hidden />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-24">
        <header className="max-w-3xl space-y-4 text-center sm:text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">AllRole Lab</span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Kubus Rubik melayang berisi dunia kreatif pastel
          </h1>
          <p className="text-base text-slate-200 sm:text-lg">
            Setiap lapisan kubus adalah komposisi panel pastel yang berputar bebas, menampilkan ekosistem ide, tim, kode,
            dan eksplorasi yang siap kamu buka.
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
          <div className="relative">
            <div className="absolute -inset-14 hidden rounded-full bg-cyan-200/10 blur-3xl lg:block" aria-hidden />
            <FloatingRubiksCube />
          </div>

          <aside className="flex flex-col gap-6">
            <div className="grid gap-4">
              {sectionCards.map((section) => (
                section.href ? (
                  <Link
                    key={section.title}
                    href={section.href}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-300 hover:border-cyan-200/60 hover:bg-white/10"
                  >
                    <span className="inline-flex text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {section.badge}
                    </span>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                      <span className="text-sm font-semibold text-cyan-200 opacity-0 transition group-hover:opacity-100">
                        Buka {"\u2192"}
                      </span>
                    </div>
                    {section.summary && <p className="mt-2 text-sm text-slate-200">{section.summary}</p>}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${section.accent} opacity-0 transition duration-300 group-hover:opacity-100`}
                    />
                  </Link>
                ) : (
                  <div
                    key={section.title}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <span className="inline-flex text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {section.badge}
                    </span>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                      <span className="text-xs text-slate-400">Dalam pengembangan</span>
                    </div>
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${section.accent} opacity-70`} />
                  </div>
                )
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
