"use client";

// ─── NERVANA luxury audio engine ────────────────────────────────────────────
// A self-contained Web Audio synthesis engine — no audio files required. It
// generates a calm, non-repetitive ambient soundtrack, a cinematic intro swell,
// and subtle UI sound effects, all professionally enveloped and mixed. Admins
// can override the music with an uploaded URL (streamed via <audio>). Respects
// browser autoplay policy: nothing sounds until `unlock()` runs on a gesture.

export type SfxType =
  | "hover" | "click" | "open" | "close" | "cart" | "add" | "remove"
  | "success" | "login" | "register" | "notify" | "coupon" | "order" | "payment" | "ai";

export interface AudioSettings {
  enabled: boolean;   // master
  musicOn: boolean;
  sfxOn: boolean;
  musicVol: number;   // 0..1
  sfxVol: number;     // 0..1
}

const KEY = "nv_audio";
const DEFAULTS: AudioSettings = { enabled: true, musicOn: true, sfxOn: true, musicVol: 0.45, sfxVol: 0.6 };

// Pentatonic scale (Hz) — warm, always-consonant ambient palette.
const PAD_NOTES = [130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 293.66];
const CHIME_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

function loadSettings(): AudioSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try { const raw = localStorage.getItem(KEY); return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }; }
  catch { return { ...DEFAULTS }; }
}

class AudioEngine {
  settings: AudioSettings = loadSettings();
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private ambient: { osc: OscillatorNode[]; gain: GainNode; lfo: OscillatorNode } | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private mood = 900;
  private chimeTimer: number | null = null;
  private padTimer: number | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private musicUrl: string | null = null;
  unlocked = false;

  // Build the audio graph on first user gesture (autoplay-safe).
  private ensure() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.reverb = this.ctx.createConvolver();
      this.reverb.buffer = this.makeImpulse(2.4, 2.6);
      this.master.connect(this.ctx.destination);
      this.musicGain.connect(this.reverb).connect(this.master);
      this.sfxGain.connect(this.master);
      this.applyGains();
    }
    this.ctx.resume?.();
  }

  // Enable SFX after any user gesture (does NOT start background music).
  primeSfx() { try { this.ensure(); } catch {} }

  // Smoothly warm/brighten the ambient tone with the time of day.
  setMood(daypart: "morning" | "day" | "sunset" | "night") {
    const map = { morning: 1050, day: 1400, sunset: 820, night: 640 };
    this.mood = map[daypart] ?? 900;
    if (this.ambientFilter && this.ctx) this.ambientFilter.frequency.setTargetAtTime(this.mood, this.ctx.currentTime, 3);
  }

  // Explicitly activate the full experience incl. background music.
  unlock() {
    try {
      this.ensure();
      this.unlocked = true;
      if (this.settings.enabled && this.settings.musicOn) this.startMusic();
    } catch { /* ignore */ }
  }

  private makeImpulse(seconds: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  private applyGains() {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.settings.enabled ? 1 : 0, t, 0.2);
    this.musicGain?.gain.setTargetAtTime(this.settings.musicOn ? this.settings.musicVol : 0, t, 0.3);
    this.sfxGain?.gain.setTargetAtTime(this.settings.sfxVol, t, 0.05);
    if (this.musicEl) this.musicEl.volume = this.settings.musicOn ? this.settings.musicVol : 0;
  }

  setSettings(patch: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(this.settings)); } catch {}
    this.applyGains();
    if (this.unlocked) {
      if (this.settings.enabled && this.settings.musicOn) this.startMusic();
      else this.stopMusic();
    }
  }

  // ── Ambient music (synth pad + spatial chimes), or an uploaded URL ──
  private startMusic() {
    if (!this.ctx || !this.musicGain) return;
    if (this.musicUrl) { this.startUrlMusic(); return; }
    if (this.ambient) return; // already running
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.gain.setTargetAtTime(0.22, ctx.currentTime, 3);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = this.mood;
    this.ambientFilter = filter;
    const o1 = ctx.createOscillator(); o1.type = "sine";
    const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.detune.value = 6;
    o1.frequency.value = PAD_NOTES[2]; o2.frequency.value = PAD_NOTES[2];
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain).connect(gain.gain);
    o1.connect(filter); o2.connect(filter); filter.connect(gain).connect(this.musicGain);
    o1.start(); o2.start(); lfo.start();
    this.ambient = { osc: [o1, o2], gain, lfo };

    // slowly wander the root note (non-repetitive)
    const wander = () => {
      if (!this.ambient || !this.ctx) return;
      const n = PAD_NOTES[Math.floor(Math.random() * PAD_NOTES.length)];
      this.ambient.osc[0].frequency.setTargetAtTime(n, this.ctx.currentTime, 4);
      this.ambient.osc[1].frequency.setTargetAtTime(n, this.ctx.currentTime, 4);
      this.padTimer = window.setTimeout(wander, 8000 + Math.random() * 6000);
    };
    this.padTimer = window.setTimeout(wander, 6000);

    // occasional soft, panned chimes (subtle spatial audio)
    const chime = () => {
      this.playChime(CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)], (Math.random() - 0.5) * 1.4);
      this.chimeTimer = window.setTimeout(chime, 9000 + Math.random() * 12000);
    };
    this.chimeTimer = window.setTimeout(chime, 5000);
  }

  private stopMusic() {
    if (this.padTimer) { clearTimeout(this.padTimer); this.padTimer = null; }
    if (this.chimeTimer) { clearTimeout(this.chimeTimer); this.chimeTimer = null; }
    if (this.ambient && this.ctx) {
      const g = this.ambient.gain, t = this.ctx.currentTime;
      g.gain.setTargetAtTime(0.0001, t, 1);
      const nodes = this.ambient; this.ambient = null;
      setTimeout(() => { try { nodes.osc.forEach((o) => o.stop()); nodes.lfo.stop(); } catch {} }, 2500);
    }
    if (this.musicEl) { try { this.musicEl.pause(); } catch {} }
  }

  private startUrlMusic() {
    if (!this.ctx || !this.musicGain || !this.musicUrl) return;
    if (!this.musicEl) {
      this.musicEl = new Audio(this.musicUrl);
      this.musicEl.loop = true; this.musicEl.crossOrigin = "anonymous"; this.musicEl.preload = "none";
      try { const src = this.ctx.createMediaElementSource(this.musicEl); src.connect(this.musicGain); } catch {}
    }
    this.musicEl.volume = this.settings.musicOn ? this.settings.musicVol : 0;
    this.musicEl.play().catch(() => {});
  }

  setMusicUrl(url: string | null) {
    if (url === this.musicUrl) return;
    this.stopMusic();
    this.ambient = null;
    this.musicUrl = url || null;
    if (this.musicEl) { try { this.musicEl.pause(); } catch {} this.musicEl = null; }
    if (this.unlocked && this.settings.enabled && this.settings.musicOn) this.startMusic();
  }

  private playChime(freq: number, pan = 0) {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const t = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
    o.connect(g);
    if (panner) { panner.pan.value = pan; g.connect(panner).connect(this.musicGain); }
    else g.connect(this.musicGain);
    o.start(t); o.stop(t + 3.1);
  }

  // ── Cinematic intro swell, synced to the 3D intro duration ──
  playIntro(durationMs: number) {
    this.unlock();
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx, dur = durationMs / 1000;
    const bus = ctx.createGain(); bus.gain.value = 0.0001; bus.connect(this.reverb || this.musicGain);
    bus.gain.setTargetAtTime(0.3, ctx.currentTime, dur * 0.4);
    bus.gain.setTargetAtTime(0.0001, ctx.currentTime + dur * 0.8, 0.6);
    // layered rising pad
    [PAD_NOTES[1], PAD_NOTES[3], PAD_NOTES[4]].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = i === 0 ? "triangle" : "sine"; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = 0.08;
      o.connect(g).connect(bus); o.start(); o.stop(ctx.currentTime + dur + 1);
    });
    // ascending chime arpeggio
    [0, 1, 2, 3, 4].forEach((i) => setTimeout(() => this.playChime(CHIME_NOTES[i], (i - 2) * 0.4), (durationMs / 6) * i));
  }

  // ── UI sound effects ──
  sfx(type: SfxType) {
    if (!this.ctx || !this.sfxGain || !this.settings.enabled || !this.settings.sfxOn) return;
    const ctx = this.ctx;
    const blip = (freq: number, dur: number, gainPeak: number, type2: OscillatorType = "sine", delay = 0) => {
      const o = ctx.createOscillator(); o.type = type2; o.frequency.value = freq;
      const g = ctx.createGain(); const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gainPeak, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.sfxGain!);
      o.start(t); o.stop(t + dur + 0.02);
    };
    switch (type) {
      case "hover": blip(1320, 0.09, 0.05, "sine"); break;
      case "click": blip(660, 0.09, 0.09, "triangle"); break;
      case "open": blip(523, 0.12, 0.08); blip(784, 0.14, 0.07, "sine", 0.06); break;
      case "close": blip(523, 0.12, 0.08); blip(392, 0.16, 0.07, "sine", 0.06); break;
      case "cart":
      case "add": blip(659, 0.12, 0.1); blip(988, 0.22, 0.09, "sine", 0.07); break;
      case "remove": blip(392, 0.14, 0.09, "triangle"); blip(294, 0.2, 0.07, "sine", 0.06); break;
      case "coupon": [784, 988, 1319].forEach((f, i) => blip(f, 0.16, 0.07, "sine", i * 0.05)); break;
      case "notify": blip(880, 0.14, 0.09); blip(1174, 0.3, 0.08, "sine", 0.09); break;
      case "ai": blip(1046, 0.1, 0.06, "sine"); blip(1318, 0.14, 0.05, "sine", 0.05); break;
      case "login":
      case "register": blip(523, 0.16, 0.09); blip(784, 0.28, 0.08, "sine", 0.09); break;
      case "success":
      case "order":
      case "payment": [659, 880, 1319].forEach((f, i) => blip(f, 0.3, 0.09, "sine", i * 0.11)); break;
      default: blip(660, 0.1, 0.07);
    }
  }
}

let engine: AudioEngine | null = null;
export function getEngine(): AudioEngine {
  if (!engine) engine = new AudioEngine();
  return engine;
}
