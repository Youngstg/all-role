"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  MIN_CYCLES,
  MAX_CYCLES,
  MIN_MINUTES,
  MAX_MINUTES,
  Phase,
  clampNumber,
} from "../pomodoro/constants";

type PomodoroContextValue = {
  focusMinutes: number;
  breakMinutes: number;
  cycles: number;
  phase: Phase;
  currentCycle: number;
  secondsLeft: number;
  isRunning: boolean;
  isAlarmActive: boolean;
  totalForPhase: number;
  focusSeconds: number;
  breakSeconds: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stopAlarm: () => void;
  updateFocusMinutes: (value: number) => void;
  updateBreakMinutes: (value: number) => void;
  updateCycles: (value: number) => void;
};

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [cycles, setCycles] = useState(4);
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const alarmRef = useRef<HTMLAudioElement | null>(
    typeof Audio !== "undefined" ? Object.assign(new Audio("/alarm.wav"), { preload: "auto" }) : null,
  );

  const focusSeconds = useMemo(
    () => clampNumber(Math.round(focusMinutes * 60), MIN_MINUTES * 60, MAX_MINUTES * 60),
    [focusMinutes],
  );
  const breakSeconds = useMemo(
    () => clampNumber(Math.round(breakMinutes * 60), MIN_MINUTES * 60, MAX_MINUTES * 60),
    [breakMinutes],
  );

  const totalForPhase = phase === "break" ? breakSeconds : focusSeconds;

  const stopAlarm = useCallback(() => {
    const audio = alarmRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsAlarmActive(false);
  }, []);

  const playAlarm = useCallback(() => {
    const audio = alarmRef.current;
    if (!audio) return;
    setIsAlarmActive(true);
    audio.currentTime = 0;
    audio.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const audio = alarmRef.current;
    if (!audio) return;

    const handleEnded = () => setIsAlarmActive(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
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

  const start = useCallback(() => {
    stopAlarm();
    setCurrentCycle(1);
    setPhase("focus");
    setSecondsLeft(focusSeconds);
    setIsRunning(true);
  }, [focusSeconds, stopAlarm]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (phase === "complete") return;
    if (phase === "idle") {
      start();
      return;
    }
    setIsRunning(true);
  }, [phase, start]);

  const reset = useCallback(() => {
    stopAlarm();
    setIsRunning(false);
    setPhase("idle");
    setCurrentCycle(1);
    setSecondsLeft(focusSeconds);
  }, [focusSeconds, stopAlarm]);

  const updateFocusMinutes = useCallback((value: number) => {
    setFocusMinutes(clampNumber(Math.round(value), MIN_MINUTES, MAX_MINUTES));
  }, []);

  const updateBreakMinutes = useCallback((value: number) => {
    setBreakMinutes(clampNumber(Math.round(value), MIN_MINUTES, MAX_MINUTES));
  }, []);

  const updateCycles = useCallback((value: number) => {
    setCycles(clampNumber(Math.round(value), MIN_CYCLES, MAX_CYCLES));
  }, []);

  const value = useMemo<PomodoroContextValue>(
    () => ({
      focusMinutes,
      breakMinutes,
      cycles,
      phase,
      currentCycle,
      secondsLeft,
      isRunning,
      isAlarmActive,
      totalForPhase,
      focusSeconds,
      breakSeconds,
      start,
      pause,
      resume,
      reset,
      stopAlarm,
      updateFocusMinutes,
      updateBreakMinutes,
      updateCycles,
    }),
    [
      focusMinutes,
      breakMinutes,
      cycles,
      phase,
      currentCycle,
      secondsLeft,
      isRunning,
      isAlarmActive,
      totalForPhase,
      focusSeconds,
      breakSeconds,
      start,
      pause,
      resume,
      reset,
      stopAlarm,
      updateFocusMinutes,
      updateBreakMinutes,
      updateCycles,
    ],
  );

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro harus digunakan di dalam PomodoroProvider");
  }
  return context;
}



