import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Search, Package, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ParticlesBg } from "@/components/ParticlesBg";
import { TrackingTimeline, type TrackingEvent } from "@/components/TrackingTimeline";
import { trackOrder } from "@/lib/track.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ROPA NOVA · Rastreo de Pedidos" },
      {
        name: "description",
        content: "Consulta el estado de tu pedido de ROPA NOVA en tiempo real.",
      },
      { property: "og:title", content: "ROPA NOVA · Rastreo de Pedidos" },
      {
        property: "og:description",
        content: "Consulta el estado de tu pedido de ROPA NOVA en tiempo real.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [orderNumber, setOrderNumber] = useState("");
  const trackFn = useServerFn(trackOrder);
  const mutation = useMutation({
    mutationFn: (n: string) => trackFn({ data: { orderNumber: n } }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    mutation.mutate(orderNumber.trim());
  };

  const result = mutation.data;

  return (
    <div className="relative min-h-screen">
      <ParticlesBg />
      <div className="relative z-10">
        <Navbar />

        <section className="mx-auto max-w-4xl px-5 pt-24 pb-24 sm:px-8 sm:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <h1 className="font-display text-[15vw] leading-[0.9] tracking-tight text-glow sm:text-[96px]">
              ¿Dónde está
              <br />
              <span className="italic font-light">tu pedido?</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-balance text-base text-white/60 sm:text-lg">
              Consulta el estado de tu pedido de ROPA NOVA en tiempo real. Privado, premium, en
              directo.
            </p>
          </motion.div>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Introduce tu número de pedido"
                className="w-full rounded-full glass px-12 py-5 text-sm tracking-wide text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:shadow-[0_0_0_4px_oklch(1_0_0_/_0.05),0_0_40px_oklch(1_0_0_/_0.1)]"
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-black transition hover:scale-[1.02] hover:shadow-[0_0_40px_oklch(1_0_0_/_0.3)] disabled:opacity-60"
            >
              {mutation.isPending ? "Rastreando..." : "Rastrear Pedido"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </motion.form>

          <AnimatePresence mode="wait">
            {mutation.isPending && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-16 flex items-center justify-center gap-3 text-sm text-white/50"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                Consultando tu pedido…
              </motion.div>
            )}

            {result && !result.order && !mutation.isPending && (
              <motion.div
                key="notfound"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-16 mx-auto max-w-md rounded-2xl glass p-8 text-center"
              >
                <p className="font-display text-2xl tracking-wide">Pedido no encontrado</p>
                <p className="mt-2 text-sm text-white/50">
                  Verifica el número de pedido o contacta con nosotros.
                </p>
              </motion.div>
            )}

            {result?.order && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="mt-20"
              >
                <OrderHeader order={result.order} />
                <div className="mt-10">
                  <h3 className="mb-6 font-display text-2xl tracking-[0.15em] text-white/80">
                    Historial del envío
                  </h3>
                  <TrackingTimeline events={result.events as TrackingEvent[]} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="border-t border-white/5 py-10 text-center text-[10px] uppercase tracking-[0.4em] text-white/40">
          © {new Date().getFullYear()} Ropa Nova · Tienda #1 de Instagram
        </footer>
      </div>
    </div>
  );
}

function OrderHeader({ order }: { order: any }) {
  const formatUpdatedAt = (date: string) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Pedido</p>
          <p className="mt-2 font-display text-3xl tracking-wide">#{order.order_number}</p>
          <p className="mt-1 text-sm text-white/60">{order.customer_name}</p>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.62_0.22_25)]" />
            En curso
          </span>
          <p className="mt-3 max-w-[260px] text-sm font-medium text-white">
            {order.current_status}
          </p>
          {order.updated_at && (
            <p className="mt-1 text-[10px] text-white/40">
              Actualizado: {formatUpdatedAt(order.updated_at)}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/5 pt-6 sm:grid-cols-3">
        <Info icon={Package} label="Producto" value={order.product_name} />
        <Info
          icon={MapPin}
          label="Destino"
          value={[order.city, order.country].filter(Boolean).join(", ") || "—"}
        />
        <Info
          icon={Clock}
          label="Entrega estimada"
          value={order.estimated_delivery || "Por confirmar"}
        />
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
        <Icon className="h-4 w-4 text-white/70" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{label}</p>
        <p className="mt-1 text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
