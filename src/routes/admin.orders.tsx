import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Eye, Plus } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { listOrders, deleteOrder } from "@/lib/admin.functions";
import { getAdminToken } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Pedidos · Admin Ropa Nova" }] }),
  component: () => (
    <AdminShell>
      <OrdersPage />
    </AdminShell>
  ),
});

function OrdersPage() {
  const qc = useQueryClient();
  const list = useServerFn(listOrders);
  const del = useServerFn(deleteOrder);
  const { data = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => list({ data: { token: getAdminToken() ?? "" } }),
  });

  async function remove(id: string) {
    if (!confirm("¿Eliminar este pedido?")) return;
    await del({ data: { token: getAdminToken() ?? "", id } });
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Gestión</p>
          <h1 className="mt-1 font-display text-5xl tracking-wide">Pedidos</h1>
        </div>
        <Link
          to="/admin/new"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-black transition hover:scale-[1.02] hover:shadow-[0_0_30px_oklch(1_0_0_/_0.25)]"
        >
          <Plus className="h-4 w-4" /> Nuevo pedido
        </Link>
      </div>

      <div className="glass-strong overflow-hidden rounded-3xl">
        <div className="hidden grid-cols-[1fr_1.4fr_2fr_1fr_1fr] gap-4 border-b border-white/5 px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-white/40 lg:grid">
          <span>Pedido</span>
          <span>Cliente</span>
          <span>Estado</span>
          <span>Tracking</span>
          <span className="text-right">Acciones</span>
        </div>
        <ul className="divide-y divide-white/5">
          {data.map((o: any) => (
            <li
              key={o.id}
              className="grid grid-cols-1 gap-3 px-6 py-5 transition hover:bg-white/[0.03] lg:grid-cols-[1fr_1.4fr_2fr_1fr_1fr] lg:items-center lg:gap-4"
            >
              <div>
                <p className="font-medium">#{o.order_number}</p>
                <p className="text-xs text-white/40 lg:hidden">{o.customer_name}</p>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm">{o.customer_name}</p>
                <p className="text-xs text-white/40">{o.product_name}</p>
              </div>
              <p className="text-sm text-white/70 line-clamp-2">{o.current_status}</p>
              <p className="text-xs text-white/40">{o.external_tracking || "—"}</p>
              <div className="flex items-center gap-2 lg:justify-end">
                <Link
                  to="/admin/order/$id"
                  params={{ id: o.id }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" /> Editar
                </Link>
                <button
                  onClick={() => remove(o.id)}
                  className="rounded-full border border-white/10 p-2 text-white/60 transition hover:border-[oklch(0.62_0.22_25/0.5)] hover:text-[oklch(0.8_0.18_25)]"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {data.length === 0 && (
            <li className="py-16 text-center text-sm text-white/40">No hay pedidos todavía.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
