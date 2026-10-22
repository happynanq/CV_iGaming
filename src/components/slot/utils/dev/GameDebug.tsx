"use client";

import { useEffect, useState } from "react";
import type { GameState } from "@/game/core/game-state";
import { GameController } from "@/game/controller/game-controller";

const controller = new GameController();

export default function GameDebug() {
  const [state, setState] = useState<GameState>(
    controller.getState(),
  );

  useEffect(() => {
    return controller.subscribe(setState);
  }, []);

  return (
    <div className="space-y-3 p-4 text-white">
      <p>State: {state.phase}</p>

      <button
        onClick={() => void controller.startSpin()}
        disabled={
          state.phase === "PENDING" ||
          state.phase === "SPINNING" ||
          state.phase === "STOPPING" ||
          state.phase === "WINNING"
        }
        className="rounded bg-purple-600 px-4 py-2 disabled:opacity-50"
      >
        Spin
      </button>

      {state.result && (
        <pre className="overflow-auto text-xs">
          {JSON.stringify(state.result, null, 2)}
        </pre>
      )}

      {state.error && <p className="text-red-400">{state.error}</p>}
    </div>
  );
}