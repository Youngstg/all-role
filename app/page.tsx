"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

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
    accent: "from-cyan-300/60 via-cyan-100/15 to-transparent",
  },
  {
    title: "Bot Catatan Keuangan",
    badge: "Automasi",
    href: "/catatan-keuangan",
    summary: "Foto struk, ekstraksi otomatis ke CSV, dan papan ringkas pengeluaran.",
    accent: "from-emerald-300/55 via-sky-200/10 to-transparent",
  },
  {
    title: "Story Forge",
    badge: "Segera",
    summary: "Konsep generator cerita kolaboratif untuk sesi jam malam.",
    accent: "from-fuchsia-300/55 via-purple-200/10 to-transparent",
  },
  {
    title: "Exploration Atlas",
    badge: "Segera",
    summary: "Koleksi peta interaktif untuk eksperimen belajar dan riset.",
    accent: "from-indigo-300/55 via-blue-200/10 to-transparent",
  },
];

const tileAngles = ["-12deg", "-4deg", "4deg", "12deg"];
const tileOffsets = ["-28px", "-12px", "12px", "28px"];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 ai-pattern opacity-40" aria-hidden />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-24">
        <header className="mx-auto max-w-3xl space-y-5 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">AllRole Lab</span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Satu rumah untuk eksperimen produktivitas dan ide kreatif
          </h1>
          <p className="text-base text-slate-200 sm:text-lg">
            Jelajahi studio fokus, otomasi pencatatan, hingga prototipe ide baru. Semua aplikasi kami hadir dalam satu
            etalase dengan nuansa pastel yang santai.
          </p>
        </header>

        <section className="app-showcase">
          <div className="app-track">
            {sectionCards.map((section, index) => {
              const style: CSSProperties = {
                "--tile-rotate-y": tileAngles[index] ?? "0deg",
                "--tile-shift-x": tileOffsets[index] ?? "0px",
              };

              const Inner = (
                <div className="app-tile__content">
                  <span className="app-tile__badge">{section.badge}</span>
                  <h3 className="app-tile__title">{section.title}</h3>
                  {section.summary && <p className="app-tile__summary">{section.summary}</p>}
                  {section.href && <span className="app-tile__cta">Buka {"\u2192"}</span>}
                  <div className={`app-tile__glow bg-gradient-to-br ${section.accent}`} />
                </div>
              );

              if (section.href) {
                return (
                  <Link key={section.title} href={section.href} className="app-tile" style={style}>
                    {Inner}
                  </Link>
                );
              }

              return (
                <div key={section.title} className="app-tile app-tile--disabled" style={style}>
                  {Inner}
                  <span className="app-tile__status">Dalam pengembangan</span>
                </div>
              );
            })}
          </div>

          <p className="app-showcase__note">
            Tiap modul berbagi fondasi desain sehingga pengalaman tetap konsisten meskipun konteksnya berbeda. Klik atau ketuk kartu untuk membuka detail masing-masing.
          </p>
        </section>
      </main>
    </div>
  );
}
