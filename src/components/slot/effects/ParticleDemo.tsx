"use client";

import { useEffect, useRef } from "react";
import { Application, Container, Graphics, type Ticker } from "pixi.js";
import {
  type EmitterConfigV3,
  Emitter,
  registerAllBehaviors,
} from "pixi-v8-particles";

type ParticleDemoProps = {
  trigger: number;
};

const PARTICLE_CANVAS_WIDTH = 256;
const PARTICLE_CANVAS_HEIGHT = 160;

export function ParticleDemo({ trigger }: ParticleDemoProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const emitterRef = useRef<Emitter | null>(null);
  const latestTriggerRef = useRef(trigger);
  const handledTriggerRef = useRef(0);

  latestTriggerRef.current = trigger;

  useEffect(() => {
    let disposed = false;
    let app: Application | undefined;
    let parent: Container | undefined;
    let emitter: Emitter | undefined;
    let tickerCallback: ((ticker: Ticker) => void) | undefined;
    let particleTexture:
      | ReturnType<Application["renderer"]["generateTexture"]>
      | undefined;

    async function init() {
      const instance = new Application();

      await instance.init({
        width: PARTICLE_CANVAS_WIDTH,
        height: PARTICLE_CANVAS_HEIGHT,
        backgroundAlpha: 0,
        antialias: true,
      });

      if (disposed) {
        instance.destroy(true);
        return;
      }

      app = instance;
      hostRef.current?.appendChild(instance.canvas);

      registerAllBehaviors();

      parent = new Container();
      parent.position.set(PARTICLE_CANVAS_WIDTH / 2, PARTICLE_CANVAS_HEIGHT - 8);
      instance.stage.addChild(parent);

      const particleGraphic = new Graphics().circle(8, 8, 8).fill(0xffffff);
      particleTexture = instance.renderer.generateTexture(particleGraphic);
      particleGraphic.destroy();

      const goldenBurstConfig: EmitterConfigV3 = {
        lifetime: {
          min: 0.45,
          max: 0.9,
        },

        frequency: 0.02,
        emitterLifetime: 0.08,
        maxParticles: 48,
        particlesPerWave: 12,
        spawnChance: 1,

        pos: {
          x: 0,
          y: 0,
        },

        addAtBack: false,
        emit: false,

        behaviors: [
          {
            type: "textureSingle",
            config: {
              texture: particleTexture,
            },
          },
          {
            type: "alpha",
            config: {
              alpha: {
                list: [
                  { value: 1, time: 0 },
                  { value: 0, time: 1 },
                ],
              },
            },
          },
          {
            type: "scale",
            config: {
              scale: {
                list: [
                  { value: 0.5, time: 0 },
                  { value: 0.1, time: 1 },
                ],
              },
            },
          },
          {
            type: "color",
            config: {
              color: {
                list: [
                  { value: "FFD700", time: 0 },
                  { value: "FF6600", time: 1 },
                ],
              },
            },
          },
          {
            type: "moveSpeed",
            config: {
              speed: {
                list: [
                  { value: 210, time: 0 },
                  { value: 45, time: 1 },
                ],
              },
              minMult: 0.5,
            },
          },
          {
            type: "rotation",
            config: {
              minStart: 220,
              maxStart: 320,
              minSpeed: -120,
              maxSpeed: 120,
              accel: 0,
            },
          },
          {
            type: "spawnShape",
            config: {
              type: "torus",
              data: {
                x: 0,
                y: 0,
                radius: 2,
                innerRadius: 0,
                affectRotation: false,
              },
            },
          },
        ],
      };

      emitter = new Emitter(parent, goldenBurstConfig);
      emitterRef.current = emitter;

      if (latestTriggerRef.current > handledTriggerRef.current) {
        emitter.emitNow();
        handledTriggerRef.current = latestTriggerRef.current;
      }

      tickerCallback = (ticker) => {
        emitter?.update(ticker.deltaMS / 1000);
      };
      instance.ticker.add(tickerCallback);
    }

    void init();

    return () => {
      disposed = true;

      if (app && tickerCallback) {
        app.ticker.remove(tickerCallback);
      }

      emitterRef.current = null;

      if (emitter) {
        emitter.destroy();
      }

      particleTexture?.destroy(true);
      app?.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (trigger <= handledTriggerRef.current) return;

    const emitter = emitterRef.current;
    if (!emitter) return;

    emitter.emitNow();
    handledTriggerRef.current = trigger;
  }, [trigger]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-40 w-64 -translate-x-1/2"
    />
  );
}
