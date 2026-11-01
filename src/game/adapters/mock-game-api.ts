import type { SpinResponse, SymbolId } from "../core/game-state";



// TODO: добавить прекалк 
const symbols: SymbolId[] = ["react", "typescript", "pixi", "wild", "scatter"];

let t = 0;

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

  switch (t) {
    case 0:
      grid = [
        ["pixi", "pixi", "pixi"],
        ["pixi", "pixi", "pixi"],
        ["pixi", "pixi", "pixi"],
        ["pixi", "pixi", "pixi"],
        ["pixi", "pixi", "pixi"],
      ];
      break
    case 1:
      grid = [
        ["react", "react", "react"],
        ["react", "react", "react"],
        ["react", "react", "react"],
        ["react", "react", "react"],
        ["react", "react", "react"],
      ];
      break
  }
  t++
  let isWin = Math.random() > 0.55;
  isWin = false;
  return {
    spinId: crypto.randomUUID(),
    grid,
    win: isWin ? 25 : 0,
    isWin,
    winLines: isWin ? [{ type: "graphics", pos: [0, 0, 0, 1, 1] }] : [],
  };
}
