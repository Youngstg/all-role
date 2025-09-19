"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { usePomodoro } from "../../providers/PomodoroProvider";
import { formatTime, phaseLabelMap } from "../../pomodoro/constants";

export function FloatingPomodoroWidget() {
  const pathname = usePathname();
  const {
    phase,
    secondsLeft,
    isRunning,
    resume,
    pause,
    reset,
    isAlarmActive,
    stopAlarm,
  } = usePomodoro();

  const shouldDisplay = useMemo(() => {
    if (pathname === "/pomodoro") return false;
    if (phase === "idle" && !isRunning) return false;
    return true;
  }, [pathname, phase, isRunning]);

  if (!shouldDisplay) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2 sm:right-6">
      {isAlarmActive && (
        <button
          type="button"
          onClick={stopAlarm}
          className="rounded-full bg-rose-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-rose-500/40 transition hover:bg-rose-500"
        >
          Hentikan alarm
        </button>
      )}
      <div className="flex w-60 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-slate-400">Pomodoro</span>
          <span className="text-2xl font-semibold tabular-nums">{formatTime(secondsLeft)}</span>
          <span className="text-xs text-slate-400">{phaseLabelMap[phase]}</span>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={isRunning ? pause : resume}
            className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {isRunning ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
