"use client";

import { useCallback } from "react";
import { Graphics } from "pixi.js";
import {
  REELS_COUNT,
  ROWS_COUNT,
  type WinLine,
} from "@/game/core/game-state";

const CELL_WIDTH = 200;
const CELL_HEIGHT = 200;
const REEL_GAP = 10;
const LINE_COLORS = [
  0xffd700,
  0x00ffff,
  0xff69b4,
  0x7fff00,
  0xff6347,
  0x9370db,
];

type WinningLineProps = {
  winLine: WinLine;
  index: number;
};

export default function WinningLine({ winLine, index }: WinningLineProps) {
  const draw = useCallback(
    (graphics: Graphics) => {
      graphics.clear();

      if (
        winLine.pos.length !== REELS_COUNT ||
        !winLine.pos.every(
          (row) => Number.isInteger(row) && row >= 0 && row < ROWS_COUNT,
        )
      ) {
        return;
      }

      const color = LINE_COLORS[index % LINE_COLORS.length];
      const points = winLine.pos.map((row, reel) => ({
        x: reel * (CELL_WIDTH + REEL_GAP) + CELL_WIDTH / 2,
        y: row * CELL_HEIGHT + CELL_HEIGHT / 2,
      }));

      graphics.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(({ x, y }) => graphics.lineTo(x, y));
      graphics.stroke({
        color,
        width: 12,
        alpha: 0.28,
        cap: "round",
        join: "round",
      });

      graphics.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(({ x, y }) => graphics.lineTo(x, y));
      graphics.stroke({
        color,
        width: 5,
        alpha: 0.95,
        cap: "round",
        join: "round",
      });

      points.forEach(({ x, y }) => {
        graphics.circle(x, y, 10).fill({ color, alpha: 0.35 });
        graphics.circle(x, y, 5).fill({ color });
      });
    },
    [index, winLine.pos],
  );

  return <pixiGraphics draw={draw} />;
}