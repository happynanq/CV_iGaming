
"use client";

import { useEffect, useState } from "react";
import type { GameState } from "@/game/core/game-state";
import { GameController } from "@/game/controller/game-controller";
import SlotCanvas from "./SlotCanvas";
import { assetsLoader } from "./utils/load/assetsLoader";

const controller = new GameController();

export default function SlotGame() {
  const [state, setState] = useState<GameState>(
    controller.getState(),
  );
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);

  useEffect(() => {
    return controller.subscribe(setState);
  }, []);

  useEffect(() => {
    let cancelled = false;

    assetsLoader()
      .then(() => {
        if (!cancelled) setAssetsReady(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAssetsError(
          error instanceof Error ? error.message : String(error),
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (assetsError) {
    return <p className="text-red-400">Failed to load slot symbols: {assetsError}</p>;
  }

  if (!assetsReady) {
    return <p className="text-neutral-400">Loading slot symbols...</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <SlotCanvas
        spinRequested={state.phase === "PENDING"}
        spinning={state.phase === "SPINNING"}
        result={state.result?.grid ?? null}
        winLines={state.result?.winLines ?? []}
        showWinLines={state.phase === "RESULT"}
        onReelsStopped={() => controller.reelsStopped()}
      />

      <button
        type="button"
        onClick={() => void controller.startSpin()}
        disabled={
          state.phase === "PENDING" ||
          state.phase === "SPINNING" ||
          state.phase === "STOPPING"
        }
        className="rounded-xl bg-purple-600 px-8 py-3 font-bold text-white disabled:opacity-50"
      >
        {state.phase === "PENDING"
          ? "WAITING..."
          : state.phase === "SPINNING"
          ? "SPINNING..."
          : state.phase === "STOPPING"
            ? "STOPPING..."
            : "SPIN"}
      </button>

      <p className="text-sm text-neutral-400">
        State: {state.phase}
      </p>

      {state.error && (
        <p className="text-red-400">{state.error}</p>
      )}

      {state.phase === "RESULT" && state.result && (
        <p className="text-white">
          {state.result.isWin
            ? `WIN: ${state.result.win}`
            : "No win"}
        </p>
      )}
    </div>
  );
}
