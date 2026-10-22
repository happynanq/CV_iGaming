"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { extend, useTick } from "@pixi/react";
import { Assets, Container, Graphics, Sprite } from "pixi.js";
import {
  REELS_COUNT,
  ROWS_COUNT,
  type GameGrid,
  type WinLine,
  type SymbolId,
} from "@/game/core/game-state";
import WinningLine from "./winning_lines/WinningLine";

extend({ Container, Graphics, Sprite });

const REEL_COUNT = REELS_COUNT;
const ROWS = ROWS_COUNT;
const CELL_WIDTH = 200;
const CELL_HEIGHT = 200;
const GAP = 8;
const REEL_GAP = 10;
const SPEED = 60;
const RANDOM_STRIP_LENGTH = 10;
const STRIP_LENGTH_INCREMENT = 1;
const MIN_STOP_TURNS = 1;
const STOP_DURATION = 130;
const STOP_STAGGER = 12;
const POSITION_EPSILON = 1e-7;


//* Нормализация - зацикливание координат
const normalizePosition = (position: number, trackCellCount: number) => {
  // высота всех ячеек
  const trackHeight = trackCellCount * CELL_HEIGHT;

  // диапазон ленты
  const wrapped =
    (((position + CELL_HEIGHT) % trackHeight) + trackHeight) %
    trackHeight -
    CELL_HEIGHT;

  // округляем до ближайшего с точностью эпсилон 
  const nearestCellPosition =
    Math.round(wrapped / CELL_HEIGHT) * CELL_HEIGHT;

  if (Math.abs(wrapped - nearestCellPosition) > POSITION_EPSILON) {
    return wrapped;
  }

  return nearestCellPosition;
};

export const REELS_WIDTH =
  REEL_COUNT * CELL_WIDTH + (REEL_COUNT - 1) * REEL_GAP;
export const REELS_HEIGHT = ROWS * CELL_HEIGHT;

const SYMBOLS: SymbolId[] = ["react", "typescript", "pixi", "wild", "scatter"];
const LABELS: Record<SymbolId, string> = {
  react: "react",
  typescript: "ts",
  pixi: "pixi",
  wild: "wild",
  scatter: "scatter",
};

type ReelProps = {
  index: number;
  spinRequested: boolean;
  spinning: boolean;
  stopRequested: boolean;
  result: GameGrid | null;
  onStopped: (index: number) => void;
};

function Reel({
  index,
  spinRequested,
  spinning,
  stopRequested: shouldStop,
  result,
  onStopped,
}: ReelProps) {


  /* 
  
  * Создание рандомной strip
  
  */
  const randomStripLength = RANDOM_STRIP_LENGTH + index * STRIP_LENGTH_INCREMENT;
  const trackCellCount = randomStripLength + ROWS;
  const trackHeight = trackCellCount * CELL_HEIGHT;
  const targetStartIndex = trackCellCount - ROWS;
  const targetStopOffset =
    ((1 - targetStartIndex + trackCellCount) % trackCellCount) * CELL_HEIGHT;
  const initialCellPositions = useMemo(
    () =>
      Array.from(
        { length: trackCellCount },
        (_, position) => (position - 1) * CELL_HEIGHT,
      ),
    [trackCellCount],
  );
  const [stripSymbols, setStripSymbols] = useState<SymbolId[]>(() =>
    Array.from(
      { length: trackCellCount },
      () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ),
  );
  const stripSymbolsRef = useRef(stripSymbols);
  const savedVisibleSymbols = useRef<SymbolId[]>([]);
  const cellContainers = useRef<(Container | null)[]>([]);
  const positions = useRef<number[]>([...initialCellPositions]);
  const frame = useRef<Graphics | null>(null);
  const track = useRef<Container | null>(null);
  const stopped = useRef(true);
  const stopRequested = useRef(false);
  const stopDelayRemaining = useRef(0);
  const decelerating = useRef(false);
  const totalDistance = useRef(0);
  const decelerationDistance = useRef(0);
  const decelerationDuration = useRef(0);
  const decelerationElapsed = useRef(0);
  const notified = useRef(false);
  const wasSpinning = useRef(false);

  /*
    * начало спина - сброс всех параметров остановки 
    * 
   */
  useEffect(() => {
    if (!spinRequested) return;

    const visibleCells = positions.current
      .map((y, cellIndex) => ({ y, cellIndex }))
      .filter(({ y }) => y >= 0 && y < REELS_HEIGHT)
      .sort((a, b) => a.y - b.y);

    savedVisibleSymbols.current = visibleCells.map(
      ({ cellIndex }) => stripSymbolsRef.current[cellIndex],
    );
  }, [spinRequested]);

  useEffect(() => {
    if (spinning && !wasSpinning.current) {
      wasSpinning.current = true;
      const nextSymbols = Array.from(
        { length: trackCellCount },
        () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      );

      for (let row = 0; row < ROWS; row++) {
        nextSymbols[row + 1] =
          savedVisibleSymbols.current[row] ?? stripSymbolsRef.current[row + 1];
        if (result) {
          nextSymbols[targetStartIndex + row] = result[index][row];
        }
      }

      stripSymbolsRef.current = nextSymbols;
      setStripSymbols(nextSymbols);
      stopped.current = false;
      stopRequested.current = false;
      stopDelayRemaining.current = 0;
      decelerating.current = false;
      totalDistance.current = 0;
      positions.current = [...initialCellPositions];
      positions.current.forEach((y, cellIndex) => {
        const cellContainer = cellContainers.current[cellIndex];
        if (cellContainer) cellContainer.y = y;
      });
      decelerationDistance.current = 0;
      decelerationDuration.current = 0;
      decelerationElapsed.current = 0;
      notified.current = false;
      // * сообщаем что пора остановится 
    } else if (!spinning) {
      wasSpinning.current = false;
      if (!shouldStop || !result || stopped.current) return;
      stopRequested.current = true;
      stopDelayRemaining.current = index * STOP_STAGGER;
    }
  }, [
    spinning,
    shouldStop,
    result,
    index,
    initialCellPositions,
    trackCellCount,
    targetStartIndex,
  ]);

  /*
  * маска для того, чтобы ограничить видимость вне frame юзеру 
  */

  useEffect(() => {
    const reelFrame = frame.current;
    const reelTrack = track.current;
    if (!reelFrame || !reelTrack) return;

    reelTrack.mask = reelFrame;
    return () => {
      reelTrack.mask = null;
    };
  }, []);


  const animate = useCallback(
    (ticker: { deltaTime: number }) => {
      //! Остановлен - не делаем лишних рендеров
      if (stopped.current) return;

      let remainingDt = Math.min(ticker.deltaTime, 2);

      // ! смещение ячеек
      const advance = (distance: number) => {
        if (distance <= 0) return;

        totalDistance.current += distance;
        for (let i = 0; i < positions.current.length; i++) {
          positions.current[i] = normalizePosition(
            positions.current[i] + distance,
            trackCellCount,
          );
          //* синхронизация
          const cellContainer = cellContainers.current[i];
          if (cellContainer) cellContainer.y = positions.current[i];
        }
      };

      const beginDeceleration = () => {
        if (!result || decelerating.current) return;

        const travelledInCycle =
          ((totalDistance.current % trackHeight) + trackHeight) % trackHeight;
        let distanceToTarget =
          ((targetStopOffset - travelledInCycle + trackHeight) %
            trackHeight);
        if (distanceToTarget <= POSITION_EPSILON) {
          distanceToTarget = trackHeight;
        }
        const minimumStopDistance =
          trackHeight * MIN_STOP_TURNS;
        const additionalTurns = Math.max(
          0,
          Math.ceil(
            (minimumStopDistance - distanceToTarget) / trackHeight,
          ),
        );
        decelerationDistance.current =
          distanceToTarget + additionalTurns * trackHeight;
        decelerationDuration.current = STOP_DURATION;
        decelerationElapsed.current = 0;
        decelerating.current = true;
      };

      if (!stopRequested.current) {
        advance(SPEED * remainingDt);
        remainingDt = 0;
      } else if (!decelerating.current) {
        const delayDt = Math.min(remainingDt, stopDelayRemaining.current);
        advance(SPEED * delayDt);
        remainingDt -= delayDt;
        stopDelayRemaining.current -= delayDt;

        if (stopDelayRemaining.current === 0) {
          beginDeceleration();
        }
      }

      if (decelerating.current && remainingDt > 0) {
        const previousElapsed = decelerationElapsed.current;
        const nextElapsed = Math.min(
          previousElapsed + remainingDt,
          decelerationDuration.current,
        );
        const duration = decelerationDuration.current;
        const startVelocityRatio =
          (SPEED * duration) / decelerationDistance.current;
        const progressAt = (elapsed: number) => {
          const t = elapsed / duration;
          return (
            startVelocityRatio * t +
            (3 - 2 * startVelocityRatio) * t ** 2 +
            (startVelocityRatio - 2) * t ** 3
          );
        };

        advance(
          decelerationDistance.current *
            (progressAt(nextElapsed) - progressAt(previousElapsed)),
        );
        decelerationElapsed.current = nextElapsed;
      }

      if (
        decelerating.current &&
        decelerationElapsed.current === decelerationDuration.current
      ) {
        for (let i = 0; i < positions.current.length; i++) {
          positions.current[i] = normalizePosition(
            Math.round(positions.current[i] / CELL_HEIGHT) * CELL_HEIGHT,
            trackCellCount,
          );
          const cellContainer = cellContainers.current[i];
          if (cellContainer) cellContainer.y = positions.current[i];
        }

        stopped.current = true;
        decelerating.current = false;

        if (!notified.current) {
          notified.current = true;
          onStopped(index);
        }
      }
    },
    [
      index,
      result,
      onStopped,
      trackCellCount,
      trackHeight,
      targetStopOffset,
    ],
  );

  useTick(animate);

  const drawFrame = useCallback((graphics: Graphics) => {
    graphics.clear();
    graphics.roundRect(0, 0, CELL_WIDTH, CELL_HEIGHT * ROWS, 12);
    graphics.fill({ color: 0x24182f });
    graphics.stroke({ color: 0x7652a5, width: 2 });
  }, []);

  const drawCell = useCallback((graphics: Graphics) => {
    graphics.clear();
    graphics.roundRect(
      GAP / 2,
      GAP / 2,
      CELL_WIDTH - GAP,
      CELL_HEIGHT - GAP,
      10,
    );
    
    graphics.fill({ color: 0x352445 });
  }, []);

  return (
    <pixiContainer x={index * (CELL_WIDTH + REEL_GAP)}>
      <pixiGraphics
        ref={(instance) => {
          frame.current = instance;
        }}
        draw={drawFrame}
      />
      <pixiContainer
        ref={(instance) => {
          track.current = instance;
        }}
      >

        
        {stripSymbols.map((symbol, i) => (
          <pixiContainer
            key={i}
            ref={(instance) => {
              cellContainers.current[i] = instance;
            }}
            y={positions.current[i] ?? initialCellPositions[i]}
          >
            <pixiGraphics draw={drawCell} x={0} y={0} />
            
            <pixiSprite
              texture={Assets.get(LABELS[symbol])}
              x={CELL_WIDTH / 2}
              y={CELL_HEIGHT / 2}
              anchor={0.5}
              width={CELL_WIDTH - GAP}
              height={CELL_HEIGHT - GAP}
            />
          </pixiContainer>
        ))}
      </pixiContainer>
    </pixiContainer>
  );
}

type ReelsProps = {
  x: number;
  y: number;
  spinRequested: boolean;
  spinning: boolean;
  result: GameGrid | null;
  winLines: WinLine[];
  showWinLines: boolean;
  onReelsStopped: () => void;
  onWinAnimationsComplete: () => void;
};

export default function Reels({
  x,
  y,
  spinRequested,
  spinning,
  result,
  winLines,
  showWinLines,
  onReelsStopped,
  onWinAnimationsComplete,
}: ReelsProps) {
  const stoppedReels = useRef(new Set<number>());
  const completedWinLines = useRef(new Set<number>());

  useEffect(() => {
    completedWinLines.current.clear();
    if (showWinLines && winLines.length === 0) {
      onWinAnimationsComplete();
    }
  }, [showWinLines, winLines, onWinAnimationsComplete]);

  useEffect(() => {
    if (spinning) {
      stoppedReels.current.clear();
    }
  }, [spinning]);

  const handleStopped = useCallback(
    (index: number) => {
      if (stoppedReels.current.has(index)) return;
      stoppedReels.current.add(index);

      if (stoppedReels.current.size === REEL_COUNT) {
        onReelsStopped();
      }
    },
    [onReelsStopped],
  );

  const handleWinLineAnimationComplete = useCallback(
    (index: number) => {
      if (!showWinLines) return;

      completedWinLines.current.add(index);
      if (completedWinLines.current.size === winLines.length) {
        onWinAnimationsComplete();
      }
    },
    [onWinAnimationsComplete, showWinLines, winLines.length],
  );

  return (
    <pixiContainer
      x={x}
      y={y}
    >
      {Array.from({ length: REEL_COUNT }, (_, index) => (
        <Reel
          key={index}
          index={index}
          spinRequested={spinRequested}
          spinning={spinning}
          stopRequested={result !== null && !spinning}
          result={result}
          onStopped={handleStopped}
        />
      ))}
      {showWinLines &&
        winLines.map((winLine, index) => (
          <WinningLine
            key={`${winLine.type}-${index}`}
            winLine={winLine}
            index={index}
            onAnimationComplete={() =>
              handleWinLineAnimationComplete(index)
            }
          />
        ))}
    </pixiContainer>
  );
}
