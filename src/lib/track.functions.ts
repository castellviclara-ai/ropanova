import { createServerFn } from "@tanstack/react-start";

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { orderNumber: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("order_number", data.orderNumber.trim())
      .maybeSingle();
    if (!order) return { order: null, events: [] };
    const { data: events } = await supabaseAdmin
      .from("tracking_events")
      .select("*")
      .eq("order_id", order.id)
      .order("position", { ascending: true });
    // Hide PII
    const safeOrder = {
      order_number: order.order_number,
      customer_name: order.customer_name,
      product_name: order.product_name,
      city: order.city,
      country: order.country,
      current_status: order.current_status,
      logistics_company: order.logistics_company,
      external_tracking: order.external_tracking,
      estimated_delivery: order.estimated_delivery,
      created_at: order.created_at,
    };
    return { order: safeOrder, events: events ?? [] };
  });
