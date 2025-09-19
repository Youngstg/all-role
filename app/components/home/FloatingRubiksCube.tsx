"use client";

import type { CSSProperties } from "react";

type TileType = "pomodoro" | "finance" | "ideas" | "coding" | "team" | "future" | "default";

type HighlightConfig = {
  type?: TileType;
  rotZ?: number;
  rotX?: number;
  rotY?: number;
  shiftX?: number;
  shiftY?: number;
  shiftZ?: number;
};

const AXES = [-1, 0, 1] as const;

const highlightMap: Record<string, HighlightConfig> = {
  "0_0_1": { type: "pomodoro", rotZ: 6, shiftZ: 6 },
  "1_0_1": { type: "finance", rotZ: -6, shiftZ: 6 },
  "1_-1_1": { type: "finance", rotZ: -10, shiftZ: 4 },
  "0_-1_1": { type: "pomodoro", rotZ: -4 },
  "-1_1_1": { type: "ideas", rotZ: 12, shiftX: -4 },
  "1_1_0": { type: "coding", rotY: -6 },
  "-1_0_0": { type: "team", rotY: 6 },
  "0_-1_-1": { type: "future", rotZ: -12 },
};

function baseTypeForPosition(x: number, y: number, z: number): TileType {
  if (z === 1) return "ideas";
  if (z === -1) return "future";
  if (x === 1) return "coding";
  if (x === -1) return "team";
  if (y === 1) return "ideas";
  return "default";
}

export function FloatingRubiksCube() {
  const microCubes = AXES.flatMap((y) =>
    AXES.flatMap((z) =>
      AXES.map((x) => {
        const key = `${x}_${y}_${z}`;
        const highlight = highlightMap[key] ?? {};
        const type = highlight.type ?? baseTypeForPosition(x, y, z);

        const baseRotZ = y === 1 ? 16 : y === -1 ? -16 : 0;
        const rotZ = (highlight.rotZ ?? 0) + baseRotZ;
        const rotX = highlight.rotX ?? y * 4;
        const rotY = highlight.rotY ?? -x * 4;

        const style: CSSProperties = {
          "--pos-x": x,
          "--pos-y": y,
          "--pos-z": z,
          "--rot-x": `${rotX}deg`,
          "--rot-y": `${rotY}deg`,
          "--rot-z": `${rotZ}deg`,
        };

        if (highlight.shiftX) style["--shift-x"] = `${highlight.shiftX}px`;
        if (highlight.shiftY) style["--shift-y"] = `${highlight.shiftY}px`;
        if (highlight.shiftZ) style["--shift-z"] = `${highlight.shiftZ}px`;

        return { key, type, style, position: { x, y, z } };
      }),
    ),
  ).sort((a, b) => {
    if (a.position.z !== b.position.z) return a.position.z - b.position.z;
    if (a.position.y !== b.position.y) return b.position.y - a.position.y;
    return a.position.x - b.position.x;
  });

  return (
    <div className="cube-scene" aria-hidden="true">
      <div className="cube">
        {microCubes.map((cube) => (
          <div key={cube.key} className={`micro-cube micro-type-${cube.type}`} style={cube.style} />
        ))}
      </div>
    </div>
  );
}
