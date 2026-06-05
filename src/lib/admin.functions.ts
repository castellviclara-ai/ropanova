import { createServerFn } from "@tanstack/react-start";

const ADMIN_USER = "felix";
const ADMIN_PASS = "Elsenyorf21";

function checkAuth(token: string | undefined) {
  if (token !== ADMIN_PASS) throw new Error("No autorizado");
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => {
    if (data.username !== ADMIN_USER || data.password !== ADMIN_PASS) {
      throw new Error("Credenciales inválidas");
    }
    return { token: ADMIN_PASS };
  });

export const listOrders = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    checkAuth(data.token);
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: rows, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getOrderWithEvents = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; orderId: string }) => d)
  .handler(async ({ data }) => {
    checkAuth(data.token);
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .maybeSingle();
    const { data: events } = await supabase
      .from("tracking_events")
      .select("*")
      .eq("order_id", data.orderId)
      .order("position", { ascending: true });
    return { order, events: events ?? [] };
  });

type OrderInput = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  logistics_company?: string;
  external_tracking?: string;
  estimated_delivery?: string;
  current_status?: string;
};

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; order: OrderInput; initialStatuses: string[] }) => d)
  .handler(async ({ data }) => {
    checkAuth(data.token);
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: o, error } = await supabase
      .from("orders")
      .insert({
        ...data.order,
        current_status: data.order.current_status ?? data.initialStatuses[0],
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data.initialStatuses.length) {
      const events = data.initialStatuses.map((s, i) => ({
        order_id: o.id,
        status: s,
        position: i,
        completed: i === 0,
      }));
      await supabase.from("tracking_events").insert(events);
    }
    return o;
  });

export const updateOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string; patch: Partial<OrderInput> }) => d)
  .handler(async ({ data }) => {
    checkAuth(data.token);
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase
      .from("orders")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkAuth(data.token);
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      token: string;
      event: {
        id?: string;
        order_id: string;
        status: string;
        description?: string | null;
        custom_date?: string | null;
        position: number;
        completed: boolean;
      };
    }) => d,
  )
  .handler(async ({ data }) => {
    checkAuth(data.token);
    const { supabase } = await import("@/integrations/supabase/client");
    if (data.event.id) {
      const { id, ...patch } = data.event;
      const { error } = await supabase
        .from("tracking_events")
        .update(patch)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("tracking_events")
        .insert({ ...data.event, created_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkAuth(data.token);
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("tracking_events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCurrentStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; orderId: string; status: string; eventId: string }) => d)
  .handler(async ({ data }) => {
    checkAuth(data.token);
    const { supabase } = await import("@/integrations/supabase/client");
    // mark all events up to and including this one as completed
    const { data: evs } = await supabase
      .from("tracking_events")
      .select("id,position")
      .eq("order_id", data.orderId);
    const target = evs?.find((e) => e.id === data.eventId);
    if (target) {
      const completedIds = (evs ?? [])
        .filter((e) => e.position <= target.position)
        .map((e) => e.id);
      const pendingIds = (evs ?? []).filter((e) => e.position > target.position).map((e) => e.id);
      if (completedIds.length)
        await supabase
          .from("tracking_events")
          .update({ completed: true })
          .in("id", completedIds);
      if (pendingIds.length)
        await supabase
          .from("tracking_events")
          .update({ completed: false })
          .in("id", pendingIds);
    }
    await supabase
      .from("orders")
      .update({ current_status: data.status })
      .eq("id", data.orderId);
    return { ok: true };
  });
