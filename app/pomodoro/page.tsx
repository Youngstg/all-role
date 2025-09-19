"use client";

import { useMemo } from "react";

import {
  MAX_CYCLES,
  MAX_MINUTES,
  MIN_CYCLES,
  MIN_MINUTES,
  formatTime,
  phaseLabelMap,
} from "./constants";
import { usePomodoro } from "../providers/PomodoroProvider";

export default function PomodoroPage() {
  const {
    focusMinutes,
    breakMinutes,
    cycles,
    phase,
    currentCycle,
    secondsLeft,
    isRunning,
    isAlarmActive,
    totalForPhase,
    start,
    pause,
    resume,
    reset,
    stopAlarm,
    updateFocusMinutes,
    updateBreakMinutes,
    updateCycles,
  } = usePomodoro();

  const progressPercent = useMemo(() => {
    if (!totalForPhase || phase === "idle" || phase === "complete") return 0;
    return ((totalForPhase - secondsLeft) / totalForPhase) * 100;
  }, [phase, secondsLeft, totalForPhase]);

  const progressAngle = Math.min(Math.max(progressPercent, 0), 100) * 3.6;
  const displayPhase = phaseLabelMap[phase] ?? phase;

  const primaryLabel = !isRunning
    ? phase === "idle"
      ? "Mulai sesi"
      : phase === "complete"
      ? "Mulai baru"
      : "Lanjutkan"
    : "Jeda";

  const handlePrimaryAction = () => {
    if (isRunning) {
      pause();
      return;
    }
    if (phase === "idle" || phase === "complete") {
      start();
      return;
    }
    resume();
  };

  return (
    <div className="relative flex min-h-screen flex-col text-slate-100">
      <div className="pointer-events-none absolute inset-0 ai-pattern opacity-80" aria-hidden />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20">
        <header className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">AllRole Hub</span>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Pomodoro App</h1>
          </div>
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto ${
                isRunning
                  ? "border border-white/20 text-white hover:border-white/40 focus-visible:outline-white"
                  : "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 focus-visible:outline-cyan-300"
              }`}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-full border border-slate-500/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 sm:w-auto"
            >
              Reset
            </button>
            {isAlarmActive && (
              <button
                type="button"
                onClick={stopAlarm}
                className="w-full rounded-full border border-rose-500/70 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 sm:w-auto"
              >
                Hentikan Alarm
              </button>
            )}
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Pengaturan sesi</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fokus (menit)</span>
                <input
                  type="number"
                  min={MIN_MINUTES}
                  max={MAX_MINUTES}
                  value={focusMinutes}
                  onChange={(event) => updateFocusMinutes(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-center text-lg font-semibold text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-60"
                  disabled={isRunning && phase !== "idle"}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Istirahat (menit)</span>
                <input
                  type="number"
                  min={MIN_MINUTES}
                  max={MAX_MINUTES}
                  value={breakMinutes}
                  onChange={(event) => updateBreakMinutes(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-center text-lg font-semibold text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-60"
                  disabled={isRunning && phase !== "idle"}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pengulangan</span>
                <input
                  type="number"
                  min={MIN_CYCLES}
                  max={MAX_CYCLES}
                  value={cycles}
                  onChange={(event) => updateCycles(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-center text-lg font-semibold text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-60"
                  disabled={isRunning && phase !== "idle"}
                />
              </label>
            </div>

            <div className="grid gap-6">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span>
                <div className="flex items-baseline justify-between text-white">
                  <span className="text-lg font-semibold">{displayPhase}</span>
                  <span className="text-sm text-slate-400">Siklus {Math.min(currentCycle, cycles)} dari {cycles}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Waktu tersisa</h2>
            <div className="relative w-full max-w-xs">
              <div className="aspect-square rounded-full border border-cyan-500/30 bg-slate-950/80 p-10 shadow-inner shadow-black/50">
                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-slate-900/60">
                  <div className="absolute inset-0 rounded-full border-[6px] border-white/5" aria-hidden />
                  <div
                    className="absolute inset-0 origin-center rounded-full border-[6px] border-transparent border-t-cyan-400 transition-transform"
                    style={{ transform: `rotate(${progressAngle}deg)` }}
                    aria-hidden
                  />
                  <div className="relative flex flex-col items-center gap-1">
                    <span className="text-sm font-medium text-cyan-200">{displayPhase}</span>
                    <span className="text-5xl font-semibold tabular-nums text-white">{formatTime(secondsLeft)}</span>
                    <span className="text-xs text-slate-400">Durasi fase {Math.round(totalForPhase / 60)} menit</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="max-w-xs text-sm text-slate-300">
              Timer tetap berjalan meski kamu beralih ke halaman lain. Gunakan widget mini di pojok kanan bawah untuk kontrol
              cepat.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}



