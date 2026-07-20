"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useApp } from "@/lib/stores/AppProvider";
import Particles from "@/components/ui/Particles";
import { playIntroAudio } from "@/lib/audio/sfx";

const ACCENTS: Record<string, { rim: number; key: number; label: string; labelEn: string }> = {
  default: { rim: 0xd4af37, key: 0xfff3d6, label: "حلويات فاخرة", labelEn: "Fine Confectionery" },
  eid: { rim: 0x34d399, key: 0xfff3d6, label: "عيد مبارك", labelEn: "Eid Mubarak" },
  ramadan: { rim: 0x8b5cf6, key: 0xffe6a8, label: "رمضان كريم", labelEn: "Ramadan Kareem" },
  wedding: { rim: 0xffffff, key: 0xfff8e6, label: "لحظات لا تُنسى", labelEn: "Unforgettable Moments" },
  custom: { rim: 0xd4af37, key: 0xfff3d6, label: "حلويات فاخرة", labelEn: "Fine Confectionery" },
};

function buildScene(mount: HTMLDivElement, accentRim: number, accentKey: number, modelUrl: string, durationMs: number) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#080808");
  scene.fog = new THREE.FogExp2("#080808", 0.06); // depth-of-field feel

  const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0, 0.3, 8.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mount.appendChild(renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.SpotLight(accentKey, 120, 40, 0.4, 1, 1.1);
  key.position.set(5, 7, 6);
  scene.add(key);
  const rim = new THREE.PointLight(accentRim, 80, 40);
  rim.position.set(-6, -2, -3);
  scene.add(rim);
  const fill = new THREE.PointLight(0xe8c766, 30, 40);
  fill.position.set(4, -4, 5);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);

  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.16, envMapIntensity: 1.5 });
  const goldLight = new THREE.MeshStandardMaterial({ color: 0xf0e0b0, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 });

  // Default "oriental sweet" — a golden ring crowned with a pistachio dome & bits.
  const buildDefault = () => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.5, 48, 128), gold);
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.62, 64, 64), goldLight);
    dome.position.y = 0.35;
    group.add(dome);
    for (let i = 0; i < 10; i++) {
      const bit = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), goldLight);
      const a = (i / 10) * Math.PI * 2;
      bit.position.set(Math.cos(a) * 0.5, 0.7, Math.sin(a) * 0.5);
      group.add(bit);
    }
  };

  let disposed = false;
  if (modelUrl) {
    import("three/examples/jsm/loaders/GLTFLoader.js")
      .then(({ GLTFLoader }) => {
        new GLTFLoader().load(
          modelUrl,
          (gltf: any) => {
            if (disposed) return;
            const obj = gltf.scene;
            const box = new THREE.Box3().setFromObject(obj);
            const size = box.getSize(new THREE.Vector3()).length() || 1;
            obj.scale.setScalar(3 / size);
            box.getCenter(new THREE.Vector3()).multiplyScalar(-3 / size);
            group.add(obj);
          },
          undefined,
          () => { if (!disposed && !group.children.length) buildDefault(); }
        );
      })
      .catch(() => buildDefault());
  } else {
    buildDefault();
  }

  const clock = new THREE.Clock();
  let raf = 0;
  const tick = () => {
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.5;
    group.position.y = Math.sin(t * 1.2) * 0.08;
    // slow cinematic dolly in
    const p = Math.min(1, (t * 1000) / durationMs);
    camera.position.z = 8.5 - p * 3.3;
    camera.lookAt(0, 0.2, 0);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  const onResize = () => {
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  };
  window.addEventListener("resize", onResize);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    pmrem.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
  };
}

export default function WelcomeIntro() {
  const { lang, introEnabled, introScene, introModelUrl, introDuration, introSeen, markIntroSeen } = useApp();
  const [show, setShow] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Initial decision from storage (no SSR flash); replay watches context.
  useEffect(() => {
    let seen = false, enabled = true;
    try {
      seen = localStorage.getItem("nv_intro_seen") === "true";
      const e = localStorage.getItem("nv_intro_enabled");
      enabled = e === null ? true : e === "true";
    } catch {}
    started.current = true;
    if (enabled && !seen) setShow(true);
  }, []);

  useEffect(() => {
    if (started.current && introEnabled && !introSeen && !show) setShow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introSeen]);

  // Build the 3D scene + auto-finish timer while visible.
  useEffect(() => {
    if (!show || !mountRef.current) return;
    const accent = ACCENTS[introScene] ?? ACCENTS.default;
    const durationMs = Math.max(2, introDuration) * 1000;
    const cleanup = buildScene(mountRef.current, accent.rim, accent.key, introModelUrl, durationMs);
    playIntroAudio(durationMs); // cinematic soundtrack synced to the animation
    const timer = setTimeout(() => finish(), durationMs);
    return () => { cleanup(); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const finish = () => { markIntroSeen(); setShow(false); };
  const accent = ACCENTS[introScene] ?? ACCENTS.default;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] overflow-hidden bg-[#080808]"
        >
          <div ref={mountRef} className="absolute inset-0" />
          <Particles count={40} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]" />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1 }} className="text-center">
              <div className="mb-2 text-[11px] uppercase tracking-[0.5em] text-cream/50">{lang === "ar" ? accent.label : accent.labelEn}</div>
              <h1 className="gold-shimmer font-display text-6xl font-extrabold tracking-tight md:text-8xl">NERVANA</h1>
              <div className="mx-auto mt-4 h-px w-40 bg-gold-line" />
            </motion.div>
          </div>

          <button onClick={finish} className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-gold/40 px-5 py-2 text-xs font-semibold text-gold/80 backdrop-blur transition hover:bg-gold/10">
            {lang === "ar" ? "تخطّي ←" : "Skip →"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
