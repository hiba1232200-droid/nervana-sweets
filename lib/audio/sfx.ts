"use client";
import { getEngine, type SfxType } from "./engine";

// Decoupled, safe helpers — call from anywhere (components or stores) without
// importing the React context. No-ops until the engine is unlocked.
export function playSfx(type: SfxType) {
  try { getEngine().sfx(type); } catch { /* audio never breaks the app */ }
}
export function playIntroAudio(durationMs: number) {
  try { getEngine().playIntro(durationMs); } catch {}
}
