"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Cinematic vanilla Three.js scene: floating golden confections with
// premium lighting, real metal reflections, soft shadows and parallax.
// Lighting & background adapt to the time of day (morning/day/sunset/night).
type Daypart = "morning" | "day" | "sunset" | "night";
const DAYPART_LOOK: Record<Daypart, { bg: string; key: number; rim: number; keyI: number; ambient: number; exposure: number }> = {
  morning: { bg: "#14100a", key: 0xffe3b0, rim: 0xd4af37, keyI: 85, ambient: 0.4, exposure: 1.1 },
  day: { bg: "#0b0b0b", key: 0xfff6e0, rim: 0xe8c766, keyI: 115, ambient: 0.5, exposure: 1.2 },
  sunset: { bg: "#160d07", key: 0xffb870, rim: 0xf59e5b, keyI: 95, ambient: 0.38, exposure: 1.1 },
  night: { bg: "#05060c", key: 0xdfe6ff, rim: 0xd4af37, keyI: 70, ambient: 0.28, exposure: 1.0 },
};

export default function Hero3D({ daypart = "day", lightIntensity = 1 }: { daypart?: Daypart; lightIntensity?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const look = DAYPART_LOOK[daypart] ?? DAYPART_LOOK.day;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(look.bg);

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = look.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // Environment for realistic gold reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // Lights (time-of-day aware, scaled by admin light intensity)
    const L = Math.max(0.3, lightIntensity);
    scene.add(new THREE.AmbientLight(0xffffff, look.ambient * L));
    const key = new THREE.SpotLight(look.key, look.keyI * L, 40, 0.4, 1, 1.2);
    key.position.set(6, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.PointLight(look.rim, 60 * L, 40);
    rim.position.set(-6, -3, -4);
    scene.add(rim);
    const fill = new THREE.PointLight(0xe8c766, 30 * L, 40);
    fill.position.set(4, -4, 4);
    scene.add(fill);

    const gold = (color: number, rough = 0.18) =>
      new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: rough, envMapIntensity: 1.4 });

    type Item = { mesh: THREE.Mesh; speed: number; floatAmp: number; phase: number; baseY: number };
    const items: Item[] = [];
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], speed: number, amp: number) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      scene.add(mesh);
      items.push({ mesh, speed, floatAmp: amp, phase: Math.random() * Math.PI * 2, baseY: pos[1] });
    };

    add(new THREE.TorusGeometry(1.15, 0.42, 32, 96), gold(0xd4af37), [0, 0.2, 0], 0.35, 0.22);
    add(new THREE.IcosahedronGeometry(0.7, 0), gold(0xe8c766), [-2.4, 0.6, -0.5], 0.6, 0.32);
    add(new THREE.DodecahedronGeometry(0.72, 0), gold(0xf0e0b0), [2.5, -0.3, -0.4], 0.5, 0.3);
    add(new THREE.SphereGeometry(0.5, 48, 48), gold(0xd4af37, 0.22), [-1.6, -1.1, 0.6], 0.7, 0.4);
    add(new THREE.TorusKnotGeometry(0.36, 0.14, 128, 24), gold(0xa8842a), [1.9, 1.2, 0.4], 0.55, 0.28);

    // soft contact shadow plane
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.4 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), shadowMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.4;
    ground.receiveShadow = true;
    scene.add(ground);

    // Parallax
    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      items.forEach((it) => {
        it.mesh.rotation.x += it.speed * 0.006;
        it.mesh.rotation.y += it.speed * 0.009;
        it.mesh.position.y = it.baseY + Math.sin(t * it.speed * 1.6 + it.phase) * it.floatAmp;
      });
      // smooth camera parallax
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      items.forEach((it) => {
        it.mesh.geometry.dispose();
        (it.mesh.material as THREE.Material).dispose();
      });
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daypart, lightIntensity]);

  return <div ref={mountRef} className="h-full w-full" />;
}
