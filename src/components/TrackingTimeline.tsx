import { motion } from "motion/react";
import { Check, Truck, Package, MapPin, Clock } from "lucide-react";

export type TrackingEvent = {
  id: string;
  status: string;
  description?: string | null;
  custom_date?: string | null;
  position: number;
  completed: boolean;
  created_at?: string | null;
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

  const formatTime = (date: string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-[24px] top-0 bottom-0 w-px bg-white/10" />
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${((currentIdx + 1) / sorted.length) * 100}%` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[24px] top-0 w-px bg-gradient-to-b from-white via-white/80 to-white/0"
        style={{ boxShadow: "0 0 12px rgba(255,255,255,0.6)" }}
      />

      <ul className="space-y-4">
        {sorted.map((e, i) => {
          const isDone = e.completed;
          const isCurrent = i === currentIdx;
          const Icon = iconFor(i, sorted.length);
          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isDone
                      ? "border-white bg-white text-black"
                      : isCurrent
                        ? "border-[oklch(0.62_0.22_25)] bg-[oklch(0.62_0.22_25)] text-white shadow-[0_0_20px_oklch(0.62_0.22_25/0.5)]"
                        : "border-white/20 bg-white/5 text-white/40"
                  }`}
                >
                  {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div
                  className={`flex-1 rounded-2xl p-4 transition-all ${
                    isCurrent
                      ? "bg-white/10 border border-[oklch(0.62_0.22_25/0.3)]"
                      : isDone
                        ? "bg-white/5"
                        : "bg-white/5 opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={`font-medium ${isCurrent || isDone ? "text-white" : "text-white/60"}`}>
                      {e.status}
                    </p>
                    {isCurrent && formatTime(e.created_at) && (
                      <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white/70">
                        {formatTime(e.created_at)}
                      </span>
                    )}
                  </div>
                  {e.description && (
                    <p className="mt-2 text-sm text-white/50">{e.description}</p>
                  )}
                  {e.custom_date && (
                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white/70">
                      {e.custom_date}
                    </span>
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
