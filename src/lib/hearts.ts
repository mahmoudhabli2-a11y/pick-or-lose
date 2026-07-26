// ============================================================
// تحدّي — hearts / lives system
// Max 5 hearts. One heart is lost per failed challenge.
// Hearts refill automatically: +1 every 20 minutes.
// ============================================================

export const MAX_HEARTS = 5;
export const REFILL_MS = 20 * 60 * 1000;

const KEY = "tahaddi-hearts";

type Stored = { hearts: number; lastRefillAt: number };

function read(): Stored {
  if (typeof window === "undefined") return { hearts: MAX_HEARTS, lastRefillAt: Date.now() };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Stored>;
      return {
        hearts: typeof s.hearts === "number" ? s.hearts : MAX_HEARTS,
        lastRefillAt: typeof s.lastRefillAt === "number" ? s.lastRefillAt : Date.now(),
      };
    }
  } catch {}
  return { hearts: MAX_HEARTS, lastRefillAt: Date.now() };
}

function write(s: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tahaddi-hearts", { detail: s }));
  }
}

/** Applies elapsed-time refills and returns the current state. */
export function loadHearts(): Stored {
  const s = read();
  if (s.hearts >= MAX_HEARTS) {
    const fresh = { hearts: MAX_HEARTS, lastRefillAt: Date.now() };
    if (s.hearts !== MAX_HEARTS) write(fresh);
    return fresh;
  }
  const elapsed = Date.now() - s.lastRefillAt;
  const gained = Math.floor(elapsed / REFILL_MS);
  if (gained <= 0) return s;
  const hearts = Math.min(MAX_HEARTS, s.hearts + gained);
  const next: Stored = {
    hearts,
    lastRefillAt: hearts >= MAX_HEARTS ? Date.now() : s.lastRefillAt + gained * REFILL_MS,
  };
  write(next);
  return next;
}

export function heartsCount(): number {
  return loadHearts().hearts;
}

/** Removes one heart (never below 0) and returns the remaining count. */
export function spendHeart(): number {
  const s = loadHearts();
  if (s.hearts <= 0) return 0;
  const hearts = s.hearts - 1;
  write({ hearts, lastRefillAt: s.hearts >= MAX_HEARTS ? Date.now() : s.lastRefillAt });
  return hearts;
}

/** Grants hearts (e.g. rewarded ad) and returns the new count. */
export function addHearts(n = 1): number {
  const s = loadHearts();
  const hearts = Math.min(MAX_HEARTS, s.hearts + n);
  write({ hearts, lastRefillAt: hearts >= MAX_HEARTS ? Date.now() : s.lastRefillAt });
  return hearts;
}

/** Milliseconds until the next automatic heart, or 0 when full. */
export function msUntilNextHeart(): number {
  const s = loadHearts();
  if (s.hearts >= MAX_HEARTS) return 0;
  return Math.max(0, s.lastRefillAt + REFILL_MS - Date.now());
}

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
