import type { SpinResponse, SymbolId } from "../core/game-state";

const symbols: SymbolId[] = [
  "react",
  "typescript",
  "pixi",
  "wild",
  "scatter",
];

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function spin(): Promise<SpinResponse> {
  await wait(200);

  let grid = Array.from({ length: 5 }, () =>
    Array.from(
      { length: 3 },
      () => symbols[Math.floor(Math.random() * symbols.length)],
    ),
  );

  grid=[["pixi", "pixi", "pixi"], ["pixi", "pixi", "pixi"], ["pixi", "pixi", "pixi"], ["pixi", "pixi", "pixi"], ["pixi", "pixi", "pixi"]]



  let isWin = Math.random() > 0.55;
  isWin = true
  return {
    spinId: crypto.randomUUID(),
    grid,
    win: isWin ? 25 : 0,
    isWin,
    winLines: isWin ? [{ type: "test", pos: [0, 0, 0, 1, 1] }] : [],
  };
}