"use client";

import { useCallback, useRef, useState } from "react";
import { useTick } from "@pixi/react";
import { Graphics } from "pixi.js";
import {
  REELS_COUNT,
  ROWS_COUNT,
  type WinLine,
} from "@/game/core/game-state";

const CELL_WIDTH = 200;
const CELL_HEIGHT = 200;
const REEL_GAP = 10;
const CELL_INSET = 4;
const OUTLINE_DURATION_MS = 500;
const OUTLINE_CORNER_RADIUS = 10;
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
  onAnimationComplete: () => void;
};

function getOutlinePoints(x: number, y: number, width: number, height: number) {
  const radius = OUTLINE_CORNER_RADIUS;
  const points = [{ x: x + radius, y }];

  const corners = [
    { x: x + width - radius, y: y + radius, start: -Math.PI / 2 },
    { x: x + width - radius, y: y + height - radius, start: 0 },
    { x: x + radius, y: y + height - radius, start: Math.PI / 2 },
    { x: x + radius, y: y + radius, start: Math.PI },
  ];

  corners.forEach(({ x: centerX, y: centerY, start }) => {
    for (let step = 0; step <= 8; step++) {
      const angle = start + (Math.PI / 2) * (step / 8);
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }
  });

  points.push(points[0]);
  return points;
}

export default function WinningLine({
  winLine,
  index,
  onAnimationComplete,
}: WinningLineProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const elapsedMsRef = useRef(0);
  const completionReported = useRef(false);

  useTick((ticker) => {
    if (elapsedMsRef.current >= OUTLINE_DURATION_MS) return;

    const nextElapsed = Math.min(
      elapsedMsRef.current + ticker.deltaMS,
      OUTLINE_DURATION_MS,
    );
    elapsedMsRef.current = nextElapsed;
    setElapsedMs(nextElapsed);

    if (
      nextElapsed === OUTLINE_DURATION_MS &&
      !completionReported.current
    ) {
      completionReported.current = true;
      onAnimationComplete();
    }
  });

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

      const outlineProgress = elapsedMs / OUTLINE_DURATION_MS;
      const cellsToDraw = outlineProgress * winLine.pos.length;

      winLine.pos.forEach((row, reel) => {
        const cellProgress = Math.min(1, Math.max(0, cellsToDraw - reel));
        if (cellProgress === 0) return;

        const outlinePoints = getOutlinePoints(
          reel * (CELL_WIDTH + REEL_GAP) + CELL_INSET,
          row * CELL_HEIGHT + CELL_INSET,
          CELL_WIDTH - CELL_INSET * 2,
          CELL_HEIGHT - CELL_INSET * 2,
        );
        const segmentLengths = outlinePoints.slice(1).map((point, index) => {
          const previous = outlinePoints[index];
          return Math.hypot(point.x - previous.x, point.y - previous.y);
        });
        const outlineLength = segmentLengths.reduce(
          (total, length) => total + length,
          0,
        );
        let remainingLength = outlineLength * cellProgress;

        graphics.moveTo(outlinePoints[0].x, outlinePoints[0].y);
        for (let pointIndex = 1; pointIndex < outlinePoints.length; pointIndex++) {
          const start = outlinePoints[pointIndex - 1];
          const end = outlinePoints[pointIndex];
          const segmentLength = segmentLengths[pointIndex - 1];
          if (remainingLength >= segmentLength) {
            graphics.lineTo(end.x, end.y);
            remainingLength -= segmentLength;
            continue;
          }

          if (remainingLength > 0) {
            const segmentProgress = remainingLength / segmentLength;
            graphics.lineTo(
              start.x + (end.x - start.x) * segmentProgress,
              start.y + (end.y - start.y) * segmentProgress,
            );
          }
          break;
        }
        graphics.stroke({ color, width: 4, alpha: 1 });
      });

      points.forEach(({ x, y }) => {
        graphics.circle(x, y, 10).fill({ color, alpha: 0.35 });
        graphics.circle(x, y, 5).fill({ color });
      });
    },
    [elapsedMs, index, winLine.pos],
  );

  return <pixiGraphics draw={draw} />;
}