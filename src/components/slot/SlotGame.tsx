
"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameState } from "@/game/core/game-state";
import { GameController } from "@/game/controller/game-controller";
import SlotCanvas from "./SlotCanvas";
import { ParticleDemo } from "./effects/ParticleDemo";
import Modal from "./modal/Modal";
import { assetsLoader } from "./utils/load/assetsLoader";

const controller = new GameController();

export default function SlotGame() {
  const [state, setState] = useState<GameState>(
    controller.getState(),
  );
  const [dismissedWinId, setDismissedWinId] = useState<string | null>(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [particleTrigger, setParticleTrigger] = useState(0);

  useEffect(() => {
    return controller.subscribe(setState);
  }, []);

  const handleReelsStopped = useCallback(
    () => controller.reelsStopped(),
    [],
  );
  const handleWinAnimationsComplete = useCallback(
    () => controller.winAnimationsCompleted(),
    [],
  );

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
        showWinLines={
          state.phase === "WINNING" ||
          (state.phase === "RESULT" && Boolean(state.result?.isWin))
        }
        onReelsStopped={handleReelsStopped}
        onWinAnimationsComplete={handleWinAnimationsComplete}
      />

      <div className="relative">
        <ParticleDemo trigger={particleTrigger} />
        <button
          type="button"
          onClick={() => {
            setParticleTrigger((current) => current + 1);
            void controller.startSpin();
          }}
          disabled={
            state.phase === "PENDING" ||
            state.phase === "SPINNING" ||
            state.phase === "STOPPING" ||
            state.phase === "WINNING"
          }
          className="relative z-10 w-50 rounded-xl bg-purple-600 px-8 py-3 font-bold text-white disabled:opacity-50"
        >
          {state.phase === "PENDING"
            ? "WAITING..."
            : state.phase === "SPINNING"
              ? "SPINNING..."
              : state.phase === "STOPPING"
                ? "STOPPING..."
                : state.phase === "WINNING"
                  ? "SHOWING WIN..."
                  : "SPIN"}
        </button>
      </div>

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

      {state.phase === "RESULT" &&
        state.result?.isWin &&
        state.result.spinId !== dismissedWinId && (
          <Modal
            winTypes={[
              ...new Set(
                state.result.winLines.map((winLine) => winLine.type),
              ),
            ]}
            onClose={() => setDismissedWinId(state.result!.spinId)}
          />
        )}
    </div>
  );
}
