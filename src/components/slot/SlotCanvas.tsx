"use client"
import { useCallback } from "react"
import {Container, Graphics, Sprite} from "pixi.js"
import {extend, Application} from "@pixi/react"
import MySymbol from "./MySymbol";
import Reels, { REELS_HEIGHT, REELS_WIDTH } from "./Reel";
import { GameGrid, WinLine } from "@/game/core/game-state";



extend({Container, Graphics, Sprite}); 

const CANVAS_PADDING = 24;
const CANVAS_WIDTH = REELS_WIDTH + CANVAS_PADDING * 2;
const CANVAS_HEIGHT = REELS_HEIGHT + CANVAS_PADDING * 2;

type SlotCanvasProps = {
  spinRequested: boolean;
  spinning: boolean;
  result: GameGrid | null;
  winLines: WinLine[];
  showWinLines: boolean;
  onReelsStopped: () => void;
};


export default function SlotCanvas({
  spinRequested,
  spinning,
  result,
  winLines,
  showWinLines,
  onReelsStopped,
}: SlotCanvasProps) {

  return (
    <div className="w-full overflow-hidden flex justify-center items-center">
      <Application
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        background={0x100d17}
        antialias
        autoDensity
        resolution={1}
      >
        <Reels
          x={(CANVAS_WIDTH - REELS_WIDTH) / 2}
          y={(CANVAS_HEIGHT - REELS_HEIGHT) / 2}
          spinRequested={spinRequested}
          spinning={spinning}
          result={result}
          winLines={winLines}
          showWinLines={showWinLines}
          onReelsStopped={onReelsStopped}
        />
      </Application>
    </div>
  );
}