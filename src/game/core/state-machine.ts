import type { GamePhase } from "./game-state";

const transitions: Record<GamePhase, GamePhase[]> = {
  IDLE: ["PENDING"],
  PENDING: ["SPINNING"],
  SPINNING: ["STOPPING"],
  STOPPING: ["WINNING", "RESULT"],
  WINNING: ["RESULT"],
  RESULT: ["IDLE"],
};

export class StateMachine {
  private currentState: GamePhase = "IDLE";

  get state(): GamePhase {
    return this.currentState;
  }

  canTransition(nextState: GamePhase): boolean {
    return transitions[this.currentState].includes(nextState);
  }

  transition(nextState: GamePhase): void {
    if (!this.canTransition(nextState)) {
      throw new Error(
        `Invalid game transition: ${this.currentState} -> ${nextState}`,
      );
    }

    this.currentState = nextState;
  }

  reset(): void {
    this.currentState = "IDLE";
  }
}