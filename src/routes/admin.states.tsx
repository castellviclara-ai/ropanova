import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { DEFAULT_STATUSES } from "@/lib/statuses";

export const Route = createFileRoute("/admin/states")({
  head: () => ({ meta: [{ title: "Estados · Admin" }] }),
  component: () => (
    <AdminShell>
      <StatesPage />
    </AdminShell>
  ),
});

function StatesPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Plantilla</p>
        <h1 className="mt-1 font-display text-5xl tracking-wide">Estados</h1>
        <p className="mt-2 text-white/50">
          Estados predeterminados aplicados a cada nuevo pedido. Puedes editar todos los estados de
          un pedido individual desde su vista de edición.
        </p>
      </div>
      <ol className="glass-strong rounded-3xl p-6 sm:p-8 space-y-3">
        {DEFAULT_STATUSES.map((s, i) => (
          <li key={i} className="flex items-center gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 font-display text-sm text-white/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
