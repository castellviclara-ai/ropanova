import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "motion/react";
import { AdminShell } from "@/components/AdminShell";
import { createOrder } from "@/lib/admin.functions";
import { getAdminToken } from "@/lib/adminAuth";
import { DEFAULT_STATUSES } from "@/lib/statuses";

export const Route = createFileRoute("/admin/new")({
  head: () => ({ meta: [{ title: "Crear pedido · Admin" }] }),
  component: () => (
    <AdminShell>
      <NewOrderPage />
    </AdminShell>
  ),
});

const fields: { name: string; label: string; ph?: string; type?: string; full?: boolean }[] = [
  { name: "customer_name", label: "Cliente", ph: "Nombre completo" },
  { name: "customer_email", label: "Email", type: "email", ph: "cliente@ejemplo.com" },
  { name: "order_number", label: "Número de pedido", ph: "RN-00123" },
  { name: "product_name", label: "Producto", ph: "Camiseta Nova Oversize" },
  { name: "address", label: "Dirección", full: true },
  { name: "city", label: "Ciudad" },
  { name: "country", label: "País" },
  { name: "postal_code", label: "Código postal" },
  { name: "logistics_company", label: "Empresa logística", ph: "SEUR, DHL…" },
  { name: "external_tracking", label: "Tracking externo" },
  { name: "estimated_delivery", label: "Entrega estimada", ph: "3-5 días" },
];

function NewOrderPage() {
  const nav = useNavigate();
  const create = useServerFn(createOrder);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set(k: string, v: string) {
    setVals((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await create({
        data: {
          token: getAdminToken() ?? "",
          order: vals as any,
          initialStatuses: DEFAULT_STATUSES,
        },
      });
      nav({ to: "/admin/orders" });
    } catch (e: any) {
      setErr(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Nuevo</p>
        <h1 className="mt-1 font-display text-5xl tracking-wide">Crear pedido</h1>
        <p className="mt-2 text-white/50">
          Se generará automáticamente la línea de seguimiento con los {DEFAULT_STATUSES.length}{" "}
          estados.
        </p>
      </div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-6 sm:p-10"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <label
              key={f.name}
              className={`block rounded-2xl glass px-5 py-3 transition focus-within:border-white/30 ${
                f.full ? "sm:col-span-2" : ""
              }`}
            >
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">{f.label}</span>
              <input
                required={[
                  "customer_name",
                  "customer_email",
                  "order_number",
                  "product_name",
                ].includes(f.name)}
                type={f.type ?? "text"}
                value={vals[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.ph}
                className="mt-1 w-full bg-transparent text-white outline-none placeholder:text-white/25"
              />
            </label>
          ))}
        </div>

        {err && (
          <p className="mt-5 rounded-xl border border-[oklch(0.62_0.22_25/0.3)] bg-[oklch(0.62_0.22_25/0.08)] px-4 py-2 text-sm text-[oklch(0.85_0.15_25)]">
            {err}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => nav({ to: "/admin/orders" })}
            className="rounded-full border border-white/10 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-white/70 transition hover:text-white"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="rounded-full bg-white px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-black transition hover:scale-[1.02] hover:shadow-[0_0_30px_oklch(1_0_0_/_0.25)] disabled:opacity-60"
          >
            {loading ? "Creando…" : "Crear Pedido"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
