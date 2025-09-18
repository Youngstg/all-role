"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MIN_MINUTES = 1;
const MAX_MINUTES = 180;
const MIN_CYCLES = 1;
const MAX_CYCLES = 12;

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

const formatTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const phaseLabelMap: Record<string, string> = {
  idle: "Siap",
  focus: "Fokus",
  break: "Istirahat",
  complete: "Selesai",
};

type Phase = keyof typeof phaseLabelMap;

export default function PomodoroPage() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [cycles, setCycles] = useState(4);
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  const alarmRef = useRef<HTMLAudioElement | null>(null);

  const focusSeconds = useMemo(
    () => clampNumber(Math.round(focusMinutes * 60), MIN_MINUTES * 60, MAX_MINUTES * 60),
    [focusMinutes],
  );
  const breakSeconds = useMemo(
    () => clampNumber(Math.round(breakMinutes * 60), MIN_MINUTES * 60, MAX_MINUTES * 60),
    [breakMinutes],
  );

  const stopAlarm = useCallback(() => {
    const audio = alarmRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const playAlarm = useCallback(() => {
    const audio = alarmRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isRunning && (phase === "idle" || phase === "complete")) {
      setSecondsLeft(focusSeconds);
    }
  }, [focusSeconds, isRunning, phase]);

  useEffect(() => {
    if (!isRunning) return;
    if (phase === "idle" || phase === "complete") return;

    if (secondsLeft <= 0) {
      playAlarm();
      if (phase === "focus") {
        if (currentCycle >= cycles) {
          setPhase("complete");
          setIsRunning(false);
          setSecondsLeft(0);
        } else {
          setPhase("break");
          setSecondsLeft(breakSeconds);
        }
      } else if (phase === "break") {
        const nextCycle = currentCycle + 1;
        if (nextCycle > cycles) {
          setPhase("complete");
          setIsRunning(false);
          setSecondsLeft(0);
        } else {
          setCurrentCycle(nextCycle);
          setPhase("focus");
          setSecondsLeft(focusSeconds);
        }
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft, isRunning, phase, currentCycle, cycles, focusSeconds, breakSeconds, playAlarm]);

  const startTimer = () => {
    stopAlarm();
    setCurrentCycle(1);
    setPhase("focus");
    setSecondsLeft(focusSeconds);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    if (phase === "complete") return;
    if (phase === "idle") {
      startTimer();
      return;
    }
    setIsRunning(true);
  };

  const resetTimer = () => {
    stopAlarm();
    setIsRunning(false);
    setPhase("idle");
    setCurrentCycle(1);
    setSecondsLeft(focusSeconds);
  };

  const handleFocusChange = (value: number) => {
    setFocusMinutes(clampNumber(value, MIN_MINUTES, MAX_MINUTES));
  };

  const handleBreakChange = (value: number) => {
    setBreakMinutes(clampNumber(value, MIN_MINUTES, MAX_MINUTES));
  };

  const handleCycleChange = (value: number) => {
    setCycles(clampNumber(Math.round(value), MIN_CYCLES, MAX_CYCLES));
  };

  const totalForPhase = phase === "break" ? breakSeconds : focusSeconds;
  const progressPercent = useMemo(() => {
    if (!totalForPhase || phase === "idle" || phase === "complete") return 0;
    return ((totalForPhase - secondsLeft) / totalForPhase) * 100;
  }, [phase, secondsLeft, totalForPhase]);

  const progressAngle = Math.min(Math.max(progressPercent, 0), 100) * 3.6;

  const displayPhase = phaseLabelMap[phase] ?? phase;

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 ai-pattern opacity-25" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" aria-hidden />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20">
        <audio ref={alarmRef} src="/alarm.wav" preload="auto" />

        <header className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
              AllRole Hub - Fokus Tracker
            </span>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Pomodoro penuh untuk ritme kerja tim
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Kelola sesi fokus dan istirahat dalam satu halaman utuh. Atur durasi, ulangi beberapa siklus, dan dengarkan alarm
              saat fase berganti. Gunakan tombol di bawah untuk mengontrol timer kapan pun.
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-end">
            {!isRunning ? (
              <button
                type="button"
                onClick={phase === "idle" ? startTimer : resumeTimer}
                className="w-full rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:w-auto"
              >
                {phase === "idle" ? "Mulai sesi" : "Lanjutkan"}
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseTimer}
                className="w-full rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
              >
                Jeda sekarang
              </button>
            )}
            <button
              type="button"
              onClick={resetTimer}
              className="w-full rounded-full border border-slate-500/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 sm:w-auto"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={stopAlarm}
              className="w-full rounded-full border border-rose-500/70 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 sm:w-auto"
            >
              Hentikan Alarm
            </button>
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
                  onChange={(event) => handleFocusChange(Number(event.target.value))}
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
                  onChange={(event) => handleBreakChange(Number(event.target.value))}
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
                  onChange={(event) => handleCycleChange(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-center text-lg font-semibold text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-60"
                  disabled={isRunning && phase !== "idle"}
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span>
                <div className="flex items-baseline justify-between text-white">
                  <span className="text-lg font-semibold">{displayPhase}</span>
                  <span className="text-sm text-slate-400">Siklus {Math.min(currentCycle, cycles)} dari {cycles}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-slate-300">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tips</span>
                <p>Gunakan tanda jeda untuk menilai progres singkat sebelum lanjut ke siklus berikutnya.</p>
                <p>Alarm dapat dihentikan tanpa menghentikan timer - berguna saat bekerja bersama.</p>
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
              Sesi otomatis berpindah dari fokus ke istirahat hingga seluruh pengulangan selesai.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

