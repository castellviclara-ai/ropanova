import { motion } from "motion/react";
import { Check, Truck, Package, MapPin, Clock } from "lucide-react";

export type TrackingEvent = {
  id: string;
  status: string;
  description?: string | null;
  custom_date?: string | null;
  position: number;
  completed: boolean;
};

function iconFor(idx: number, total: number) {
  if (idx === total - 1) return MapPin;
  if (idx >= total - 3) return Truck;
  if (idx >= 2) return Package;
  return Clock;
}

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  const sorted = [...events].sort((a, b) => a.position - b.position);
  const currentIdx = (() => {
    const lastCompleted = sorted.map((e) => e.completed).lastIndexOf(true);
    return lastCompleted + 1 < sorted.length ? lastCompleted + 1 : lastCompleted;
  })();

  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-[22px] top-2 bottom-2 w-px bg-white/10" />
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${((currentIdx + 1) / sorted.length) * 100}%` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[22px] top-2 w-px bg-gradient-to-b from-white via-white/80 to-white/0"
        style={{ boxShadow: "0 0 12px rgba(255,255,255,0.6)" }}
      />

      <ul className="space-y-3">
        {sorted.map((e, i) => {
          const isDone = e.completed;
          const isCurrent = i === currentIdx;
          const Icon = iconFor(i, sorted.length);
          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative pl-16"
            >
              <div className="relative">
                <div
                  className={`absolute left-0 top-1 flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                    isDone
                      ? "bg-white text-black"
                      : isCurrent
                        ? "bg-[oklch(0.18_0_0)] text-white accent-glow animate-pulse-ring"
                        : "bg-white/5 text-white/40 border border-white/10"
                  }`}
                >
                  {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div
                  className={`glass rounded-2xl p-5 transition-all hover:translate-x-0.5 hover:bg-white/[0.05] ${
                    isCurrent ? "border-white/20" : ""
                  } ${!isDone && !isCurrent ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={`font-medium ${isCurrent ? "text-white" : ""}`}>{e.status}</p>
                    {e.custom_date && (
                      <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-widest text-white/60">
                        {e.custom_date}
                      </span>
                    )}
                  </div>
                  {e.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                  )}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
