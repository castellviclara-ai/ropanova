import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Configuración · Admin" }] }),
  component: () => (
    <AdminShell>
      <SettingsPage />
    </AdminShell>
  ),
});

function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Cuenta</p>
        <h1 className="mt-1 font-display text-5xl tracking-wide">Configuración</h1>
      </div>
      <div className="glass-strong rounded-3xl p-6 sm:p-8 space-y-4">
        <Row label="Usuario" value="felix" />
        <Row label="Rol" value="Administrador" />
        <Row label="Sistema" value="Ropa Nova Tracking v1.0" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
