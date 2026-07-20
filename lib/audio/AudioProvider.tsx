"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getEngine, type AudioSettings } from "./engine";

interface AudioState extends AudioSettings {
  ready: boolean; // audio unlocked via a user gesture
  unlock: () => void;
  set: (patch: Partial<AudioSettings>) => void;
  setMusicUrl: (url: string | null) => void;
}

const Ctx = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const engine = getEngine();
  const [settings, setSettings] = useState<AudioSettings>(engine.settings);
  const [ready, setReady] = useState(false);

  // Sync in case another tab changed prefs.
  useEffect(() => { setSettings({ ...engine.settings }); }, [engine]);

  const set = useCallback((patch: Partial<AudioSettings>) => {
    engine.setSettings(patch);
    setSettings({ ...engine.settings });
  }, [engine]);

  const unlock = useCallback(() => {
    engine.unlock();
    setReady(engine.unlocked);
  }, [engine]);

  const setMusicUrl = useCallback((url: string | null) => { engine.setMusicUrl(url); }, [engine]);

  const value: AudioState = { ...settings, ready, unlock, set, setMusicUrl };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudio must be used within AudioProvider");
  return c;
}
