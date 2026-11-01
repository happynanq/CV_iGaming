"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default function ThreeScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pointerStartRef = useRef<{
    id: number;
    x: number;
    y: number;
    dragged: boolean;
  } | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    pointerStartRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragged: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointerStart = pointerStartRef.current;
    if (!pointerStart || pointerStart.id !== event.pointerId) return;

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    if (deltaX * deltaX + deltaY * deltaY > 64) {
      pointerStart.dragged = true;
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const pointerStart = pointerStartRef.current;
    pointerStartRef.current = null;

    if (
      pointerStart?.id === event.pointerId &&
      !pointerStart.dragged
    ) {
      router.push("/slot");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    router.push("/slot");
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.set(0, 4, 10);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const matcapMaterial = new THREE.MeshMatcapMaterial();
    let matcapTexture: THREE.Texture | null = null;
    let disposed = false;
    const mixers: THREE.AnimationMixer[] = [];
    const timer = new THREE.Timer();
    timer.connect(document);

    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    new THREE.TextureLoader().load(
      "/textures/matcaps/9.png",
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        matcapTexture = texture;
        matcapMaterial.matcap = texture;
        matcapMaterial.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.error("Failed to load the Three.js matcap texture.", error);
      },
    );

    new FontLoader().load(
      "/fonts/helvetiker_regular.typeface.json",
      (font) => {
        if (disposed) return;

        const textGeometry = new TextGeometry("Kirill\nFrontend", {
          font,
          size: 0.5,
          depth: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5,
        });
        textGeometry.center();
        scene.add(new THREE.Mesh(textGeometry, matcapMaterial));
      },
      undefined,
      (error) => {
        console.error("Failed to load the Three.js font.", error);
      },
    );

    new GLTFLoader().load(
      "/models/spinning-gold-coin.glb",
      (gltf) => {
        if (disposed) {
          disposeModelResources(gltf.scene);
          return;
        }

        for (let i = 0; i < 200; i += 1) {
          const coin = gltf.scene.clone(true);
          coin.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
          );
          coin.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
          );
          coin.scale.setScalar(Math.random());
          scene.add(coin);

          const mixer = new THREE.AnimationMixer(coin);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
          mixers.push(mixer);
        }
      },
      undefined,
      (error) => {
        console.error("Failed to load the Three.js coin model.", error);
      },
    );

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    resizeObserver.observe(host);

    let animationFrame = 0;
    const render = (timestamp: number) => {
      timer.update(timestamp);
      const delta = timer.getDelta();
      mixers.forEach((mixer) => mixer.update(delta));
      controls.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      timer.dispose();
      resizeObserver.disconnect();
      controls.dispose();
      disposeModelResources(scene);
      matcapTexture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      role="link"
      tabIndex={0}
      aria-label="Open slot game"
      className="three-scene"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      onPointerCancel={() => {
        pointerStartRef.current = null;
      }}
    />
  );
}

function disposeModelResources(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    geometries.add(object.geometry);
    if (Array.isArray(object.material)) {
      object.material.forEach((material) => materials.add(material));
    } else {
      materials.add(object.material);
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
