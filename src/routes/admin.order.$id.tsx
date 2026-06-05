import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, Check, Plus, Trash2, GripVertical } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import {
  getOrderWithEvents,
  updateOrder,
  upsertEvent,
  deleteEvent,
  setCurrentStatus,
} from "@/lib/admin.functions";
import { getAdminToken } from "@/lib/adminAuth";
import { TrackingTimeline, type TrackingEvent } from "@/components/TrackingTimeline";

export const Route = createFileRoute("/admin/order/$id")({
  head: () => ({ meta: [{ title: "Editar pedido · Admin" }] }),
  component: () => (
    <AdminShell>
      <EditOrderPage />
    </AdminShell>
  ),
});

function EditOrderPage() {
  const { id } = Route.useParams();
  const token = getAdminToken() ?? "";
  const qc = useQueryClient();
  const nav = useNavigate();
  const getFn = useServerFn(getOrderWithEvents);
  const updateFn = useServerFn(updateOrder);
  const upsert = useServerFn(upsertEvent);
  const del = useServerFn(deleteEvent);
  const setCurr = useServerFn(setCurrentStatus);

  const { data, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getFn({ data: { token, orderId: id } }),
  });

  const [draft, setDraft] = useState<any>(null);
  useEffect(() => {
    if (data?.order) setDraft(data.order);
  }, [data?.order]);

  if (!data || !draft) {
    return <p className="text-white/50">Cargando…</p>;
  }
  if (!data.order) {
    return <p className="text-white/50">Pedido no encontrado.</p>;
  }

  async function saveOrder() {
    const { id: _, created_at, updated_at, ...patch } = draft;
    await updateFn({ data: { token, id, patch } });
    qc.invalidateQueries({ queryKey: ["orders"] });
    refetch();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" /> Pedidos
          </Link>
          <h1 className="mt-2 font-display text-5xl tracking-wide">#{data.order.order_number}</h1>
          <p className="mt-1 text-white/50">
            {data.order.customer_name} — {data.order.product_name}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Order fields */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl tracking-wide">Detalles del pedido</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["customer_name", "Cliente"],
              ["customer_email", "Email"],
              ["product_name", "Producto"],
              ["estimated_delivery", "Entrega estimada"],
              ["city", "Ciudad"],
              ["country", "País"],
              ["postal_code", "C. Postal"],
              ["logistics_company", "Logística"],
              ["external_tracking", "Tracking ext."],
            ].map(([k, label]) => (
              <label key={k} className="block rounded-2xl glass px-4 py-2.5">
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">{label}</span>
                <input
                  value={draft[k] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                  className="mt-1 w-full bg-transparent text-sm text-white outline-none"
                />
              </label>
            ))}
            <label className="block sm:col-span-2 rounded-2xl glass px-4 py-2.5">
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">Dirección</span>
              <input
                value={draft.address ?? ""}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                className="mt-1 w-full bg-transparent text-sm text-white outline-none"
              />
            </label>
          </div>
          <button
            onClick={saveOrder}
            className="mt-6 w-full rounded-full bg-white py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-black transition hover:scale-[1.01] hover:shadow-[0_0_30px_oklch(1_0_0_/_0.25)]"
          >
            Guardar Cambios
          </button>
        </div>

        {/* Events editor */}
        <div className="space-y-6">
          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            <h2 className="font-display text-2xl tracking-wide">Timeline de eventos</h2>
            <p className="mt-1 text-sm text-white/50">
              Edita texto, fecha y marca el estado actual.
            </p>
            <ul className="mt-6 space-y-3">
              {data.events.map((ev: any) => (
                <EventRow
                  key={ev.id}
                  ev={ev}
                  onChange={async (patch) => {
                    await upsert({
                      data: {
                        token,
                        event: { ...ev, ...patch },
                      },
                    });
                    refetch();
                  }}
                  onDelete={async () => {
                    if (!confirm("¿Eliminar evento?")) return;
                    await del({ data: { token, id: ev.id } });
                    refetch();
                  }}
                  onSetCurrent={async () => {
                    await setCurr({
                      data: { token, orderId: id, status: ev.status, eventId: ev.id },
                    });
                    qc.invalidateQueries({ queryKey: ["orders"] });
                    refetch();
                  }}
                />
              ))}
            </ul>
            <button
              onClick={async () => {
                const status = prompt("Nuevo estado:");
                if (!status) return;
                await upsert({
                  data: {
                    token,
                    event: {
                      order_id: id,
                      status,
                      position: (data.events[data.events.length - 1]?.position ?? -1) + 1,
                      completed: false,
                    },
                  },
                });
                refetch();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/70 transition hover:border-white/30 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir evento
            </button>
          </div>

          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            <h2 className="font-display text-2xl tracking-wide">Vista previa</h2>
            <div className="mt-6">
              <TrackingTimeline events={data.events as TrackingEvent[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({
  ev,
  onChange,
  onDelete,
  onSetCurrent,
}: {
  ev: any;
  onChange: (patch: any) => void;
  onDelete: () => void;
  onSetCurrent: () => void;
}) {
  const [status, setStatus] = useState(ev.status);
  const [desc, setDesc] = useState(ev.description ?? "");
  const [date, setDate] = useState(ev.custom_date ?? "");

  return (
    <li className="rounded-2xl glass p-4">
      <div className="flex items-start gap-3">
        <GripVertical className="mt-2 h-4 w-4 text-white/30" />
        <div className="flex-1 space-y-2">
          <input
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            onBlur={() => status !== ev.status && onChange({ status })}
            className="w-full bg-transparent text-sm font-medium text-white outline-none"
          />
          <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
            <input
              placeholder="Descripción (opcional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => desc !== (ev.description ?? "") && onChange({ description: desc })}
              className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/30"
            />
            <input
              placeholder="Fecha personalizada"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={() => date !== (ev.custom_date ?? "") && onChange({ custom_date: date })}
              className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {ev.completed && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/70">
              Hecho
            </span>
          )}
          <button
            onClick={onSetCurrent}
            title="Marcar como actual"
            className="rounded-full border border-white/10 p-2 text-white/60 hover:border-white/30 hover:text-white"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-full border border-white/10 p-2 text-white/50 hover:border-[oklch(0.62_0.22_25/0.5)] hover:text-[oklch(0.8_0.18_25)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
