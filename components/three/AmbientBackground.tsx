"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useApp } from "@/lib/stores/AppProvider";

// Subtle site-wide living background: floating golden dust + slow Arabic
// geometric ornaments, mouse-parallax, theme-accent aware. Performance-guarded
// (capped DPR, sparse geometry, pauses when the tab is hidden) and fully
// disabled in reduced-motion mode.
const DAYPART_DUST: Record<string, string> = {
  morning: "#F4C77B", day: "#E8C766", sunset: "#F59E5B", night: "#D4AF37",
};

export default function AmbientBackground() {
  const { activeTheme, reducedMotion, daypart, animIntensity } = useApp();
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const mount = mountRef.current;
    if (!mount) return;

    const speed = Math.max(0.3, animIntensity);
    // Blend the time-of-day tint with the seasonal accent.
    const accent = new THREE.Color(DAYPART_DUST[daypart] || activeTheme.particle || "#D4AF37");
    const accent2 = new THREE.Color(activeTheme.accent || "#E8C766");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // Floating golden dust (sparse Points — very cheap)
    const COUNT = 140;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: accent, size: 0.09, transparent: true, opacity: 0.8, depthWrite: false }));
    scene.add(dust);

    // Arabic-geometric ornaments (wireframe, slowly rotating)
    const ornaments: THREE.LineSegments[] = [];
    const addOrn = (geom: THREE.BufferGeometry, x: number, y: number, z: number, color: THREE.Color) => {
      const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geom), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }));
      wire.position.set(x, y, z);
      scene.add(wire); ornaments.push(wire);
    };
    addOrn(new THREE.OctahedronGeometry(2.2, 0), -9, 3, -2, accent2);
    addOrn(new THREE.IcosahedronGeometry(1.7, 0), 9, -4, -1, accent);
    addOrn(new THREE.TorusGeometry(1.4, 0.5, 8, 12), 7, 5, -3, accent2);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => { mouse.x = (e.clientX / window.innerWidth - 0.5); mouse.y = (e.clientY / window.innerHeight - 0.5); };
    window.addEventListener("mousemove", onMove);

    const clock = new THREE.Clock();
    let raf = 0;
    let paused = false;
    const onVis = () => { paused = document.hidden; if (!paused) loop(); };
    document.addEventListener("visibilitychange", onVis);

    const loop = () => {
      if (paused) return;
      const t = clock.getElapsedTime();
      dust.rotation.y = t * 0.02 * speed;
      dust.rotation.x = Math.sin(t * 0.1) * 0.05;
      ornaments.forEach((o, i) => { o.rotation.x = t * (0.06 + i * 0.02) * speed; o.rotation.y = t * (0.05 + i * 0.03) * speed; });
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 1.4 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      geo.dispose();
      ornaments.forEach((o) => { o.geometry.dispose(); (o.material as THREE.Material).dispose(); });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [activeTheme, reducedMotion, daypart, animIntensity]);

  if (reducedMotion) return null;
  return <div ref={mountRef} className="ambient-3d pointer-events-none fixed inset-0 z-[1] opacity-40" aria-hidden />;
}
