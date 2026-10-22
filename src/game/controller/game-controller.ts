
import {
  createInitialState,
  type GameState,
} from "../core/game-state";
import { StateMachine } from "../core/state-machine";
import { spin } from "../adapters/mock-game-api";

const SPIN_DURATION_MS = 1000;

type GameListener = (state: GameState) => void;

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));

export class GameController {
  private machine = new StateMachine();
  private state: GameState = createInitialState();
  private listeners = new Set<GameListener>();
  private spinInProgress = false;

  getState(): GameState {
    return this.state;
  }

  subscribe(listener: GameListener): () => void {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(patch: Partial<GameState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private transition(
    phase: GameState["phase"],
    patch: Partial<GameState> = {},
  ): void {
    this.machine.transition(phase);
    this.updateState({ ...patch, phase });
  }

  async startSpin(): Promise<void> {
    if (this.spinInProgress) return;

    this.spinInProgress = true;

    try {
      if (this.machine.state === "RESULT") {
        this.transition("IDLE");
      }

      this.updateState({
        result: null,
        error: null,
      });

      this.transition("PENDING");

      const result = await spin();

      this.transition("SPINNING", { result });

      await wait(SPIN_DURATION_MS);
      this.transition("STOPPING");
    } catch (error) {
      this.updateState({
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete spin",
      });

      this.machine.reset();
      this.updateState({ phase: "IDLE" });
      this.spinInProgress = false;
    }
  }

  reelsStopped(): void {
    if (this.machine.state !== "STOPPING") return;

    if (this.state.result?.isWin) {
      this.transition("WINNING");
      return;
    }

    this.transition("RESULT");
    this.spinInProgress = false;
  }

  winAnimationsCompleted(): void {
    if (this.machine.state !== "WINNING") return;

    this.transition("RESULT");
    this.spinInProgress = false;
  }
}
