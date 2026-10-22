export const REELS_COUNT = 5;
export const ROWS_COUNT = 3;

export type GamePhase =
  | "IDLE"
  | "PENDING"
  | "SPINNING"
  | "STOPPING"
  | "WINNING"
  | "RESULT";

export type SymbolId =
  | "react"
  | "typescript"
  | "pixi"
  | "wild"
  | "scatter";

export type GameGrid = SymbolId[][];

export interface WinLine {
  type: string;
  pos: number[];
}

export interface SpinResponse {
  spinId: string;
  grid: GameGrid;
  win: number;
  isWin: boolean;
  winLines: WinLine[];
}

export interface GameState {
  phase: GamePhase;
  grid: GameGrid;
  result: SpinResponse | null;
  error: string | null;
}

export const createInitialGrid = (): GameGrid =>
  Array.from({ length: REELS_COUNT }, () =>
    Array.from({ length: ROWS_COUNT }, () => "react" as SymbolId),
  );

export const createInitialState = (): GameState => ({
  phase: "IDLE",
  grid: createInitialGrid(),
  result: null,
  error: null,
});