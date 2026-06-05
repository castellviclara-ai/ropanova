import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Package, TrendingUp, Truck, CheckCircle2, ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { listOrders } from "@/lib/admin.functions";
import { getAdminToken } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard · Admin Ropa Nova" }] }),
  component: () => (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  ),
});

function Dashboard() {
  const list = useServerFn(listOrders);
  const { data = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => list({ data: { token: getAdminToken() ?? "" } }),
  });

  const total = data.length;
  const delivered = data.filter(
    (o: any) => o.current_status === "Tu pedido ha llegado correctamente",
  ).length;
  const inTransit = data.filter((o: any) =>
    /reparto|transport|llegado y/i.test(o.current_status),
  ).length;
  const processing = total - delivered - inTransit;

  const stats = [
    { label: "Pedidos totales", value: total, icon: Package },
    { label: "En procesamiento", value: processing, icon: TrendingUp },
    { label: "En tránsito", value: inTransit, icon: Truck },
    { label: "Entregados", value: delivered, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Resumen</p>
        <h1 className="mt-1 font-display text-5xl tracking-wide sm:text-6xl">Dashboard</h1>
        <p className="mt-2 text-white/50">Estado en vivo de los envíos Ropa Nova.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-strong rounded-3xl p-6 transition hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 text-white/60" />
              <ArrowUpRight className="h-4 w-4 text-white/30" />
            </div>
            <p className="mt-6 font-display text-5xl tracking-tight">{s.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/40">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Recientes</p>
            <h2 className="font-display text-2xl tracking-wide">Últimos pedidos</h2>
          </div>
          <Link
            to="/admin/orders"
            className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Ver todos
          </Link>
        </div>
        <ul className="mt-6 divide-y divide-white/5">
          {data.slice(0, 6).map((o: any) => (
            <li key={o.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">#{o.order_number}</p>
                <p className="text-sm text-white/50">
                  {o.customer_name} — {o.product_name}
                </p>
              </div>
              <span className="hidden text-right text-xs text-white/60 sm:block max-w-[280px] truncate">
                {o.current_status}
              </span>
            </li>
          ))}
          {data.length === 0 && (
            <li className="py-10 text-center text-sm text-white/40">No hay pedidos todavía.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
