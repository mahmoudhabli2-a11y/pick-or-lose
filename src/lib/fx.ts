// ============================================================
// تحدّي — sound effects, haptics & settings
// All sounds are synthesized with the Web Audio API, so they
// work fully offline with zero downloaded assets.
// ============================================================

export type GameSettings = { sound: boolean; vibrate: boolean };

const SETTINGS_KEY = "tahaddi-settings";
const DEFAULTS: GameSettings = { sound: true, vibrate: true };

export function loadSettings(): GameSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<GameSettings>) };
  } catch {}
  return DEFAULTS;
}

export function saveSettings(s: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tahaddi-settings", { detail: s }));
  }
}

// ---------- Web Audio ----------
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Call once from a user gesture so mobile browsers allow audio later. */
export function primeAudio() {
  audio();
}

type ToneOpts = { freq: number; dur: number; delay?: number; type?: OscillatorType; gain?: number };

function tone({ freq, dur, delay = 0, type = "sine", gain = 0.12 }: ToneOpts) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function soundOn() {
  return loadSettings().sound;
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!loadSettings().vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {}
}

export function sfxCorrect() {
  if (soundOn()) {
    tone({ freq: 660, dur: 0.12, type: "triangle" });
    tone({ freq: 880, dur: 0.16, delay: 0.09, type: "triangle" });
  }
  vibrate(35);
}

export function sfxWrong() {
  if (soundOn()) {
    tone({ freq: 220, dur: 0.18, type: "sawtooth", gain: 0.09 });
    tone({ freq: 150, dur: 0.24, delay: 0.1, type: "sawtooth", gain: 0.09 });
  }
  vibrate([50, 60, 90]);
}

export function sfxTick() {
  if (!soundOn()) return;
  tone({ freq: 1200, dur: 0.05, type: "square", gain: 0.05 });
}

export function sfxLevelUp() {
  if (soundOn()) {
    [523, 659, 784, 1046].forEach((f, i) =>
      tone({ freq: f, dur: 0.18, delay: i * 0.09, type: "triangle", gain: 0.11 }),
    );
  }
  vibrate([40, 50, 40, 50, 90]);
}

export function sfxTap() {
  if (!soundOn()) return;
  tone({ freq: 440, dur: 0.06, type: "sine", gain: 0.06 });
}

export function sfxReward() {
  if (soundOn()) {
    [392, 523, 659].forEach((f, i) => tone({ freq: f, dur: 0.15, delay: i * 0.07, type: "sine" }));
  }
  vibrate(60);
}
