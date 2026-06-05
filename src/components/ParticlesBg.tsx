import { useMemo, useEffect, useState } from "react";

export function ParticlesBg() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 18,
        duration: 18 + Math.random() * 22,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [],
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 noise opacity-[0.035]" />
      <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[oklch(0.62_0.22_25/0.10)] blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[oklch(0.5_0.2_280/0.08)] blur-[140px]" />
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: 0,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            boxShadow: "0 0 6px rgba(255,255,255,0.6)",
          }}
        />
      ))}
    </div>
  );
}
