import { useMemo } from "react";

/** خفيف وبدون مكتبات: قصاصات ملوّنة تتساقط لبضع ثوانٍ. */
export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.4,
        size: 6 + Math.random() * 8,
        rot: Math.random() * 360,
        tint: ["var(--fun-1)", "var(--fun-2)", "var(--fun-3)", "var(--fun-4)", "var(--fun-5)", "var(--primary)"][i % 6],
        round: i % 3 === 0,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-12%] animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 1.6),
            background: p.tint,
            borderRadius: p.round ? "9999px" : "2px",
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
