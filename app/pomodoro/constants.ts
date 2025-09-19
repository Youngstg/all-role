export const MIN_MINUTES = 1;
export const MAX_MINUTES = 180;
export const MIN_CYCLES = 1;
export const MAX_CYCLES = 12;

export const phaseLabelMap = {
  idle: "Siap",
  focus: "Fokus",
  break: "Istirahat",
  complete: "Selesai",
} as const;

export type Phase = keyof typeof phaseLabelMap;

export const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

export const formatTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};
