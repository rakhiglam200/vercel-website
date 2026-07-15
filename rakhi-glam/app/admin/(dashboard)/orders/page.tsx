"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: any;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_id: string | null;
  tracking_number: string | null;
  shipping_carrier: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  captured: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

function printAsPdf(title: string, html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: sans-serif; padding: 20px; font-size: 13px; color: #333; }
      h2 { font-size: 16px; margin: 16px 0 8px; color: #0D1A3C; border-bottom: 1px solid #eee; padding-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
      td { padding: 4px 8px; vertical-align: top; }
      td:first-child { font-weight: bold; white-space: nowrap; color: #555; width: 140px; }
      .timeline-item { margin-bottom: 8px; }
      .timeline-item .date { font-size: 11px; color: #999; }
      @media print { button { display: none !important; } }
    </style></head><body>
    <button onclick="window.print()" style="padding:8px 24px;background:#0D1A3C;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;margin-bottom:16px;">Print / Save PDF</button>
    <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
    ${html}</body></html>`);
  win.document.close();
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders?limit=200", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    fetchOrders();

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return;
      }
      const supabase = createClient();
      const channel = supabase
        .channel("admin-orders-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => fetchOrders()
        )
        .subscribe();

      channelRef.current = channel;

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn("Realtime subscription failed — non-critical", e);
    }
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const parseItems = (order: Order): OrderItem[] => {
    if (Array.isArray(order.items)) return order.items;
    try {
      return JSON.parse(order.items as unknown as string);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-navy)] mb-6">Orders</h1>
        <p className="text-[var(--color-text-muted)]">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Orders</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-beige)]">
              <th className="text-left px-4 py-3 font-bold text-[var(--color-navy)]">Order</th>
              <th className="text-left px-4 py-3 font-bold text-[var(--color-navy)]">Customer</th>
              <th className="text-right px-4 py-3 font-bold text-[var(--color-navy)]">Total</th>
              <th className="text-center px-4 py-3 font-bold text-[var(--color-navy)]">Payment</th>
              <th className="text-center px-4 py-3 font-bold text-[var(--color-navy)]">Status</th>
              <th className="text-center px-4 py-3 font-bold text-[var(--color-navy)]">Method</th>
              <th className="text-left px-4 py-3 font-bold text-[var(--color-navy)]">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[var(--color-text-muted)]">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-beige)]/50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="font-mono text-xs font-medium text-[var(--color-gold)] hover:underline cursor-pointer bg-transparent border-none"
                    >
                      {order.order_number}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-navy)]">{order.customer_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-navy)]">
                    ₹{order.total?.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[order.payment_status] || "bg-gray-100 text-gray-600"}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingStatus === order.id}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border-none cursor-pointer disabled:opacity-50 ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}
                    >
                      {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-[var(--color-text-muted)] capitalize">
                    {order.payment_method === "razorpay" ? "Razorpay" : order.payment_method === "whatsapp_upi" ? "WhatsApp UPI" : order.payment_method}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onWaybillClick={() => {}}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onWaybillClick,
}: {
  order: Order;
  onClose: () => void;
  onWaybillClick: (waybill: string) => void;
}) {
  const items = Array.isArray(order.items) ? order.items : (typeof order.items === "string" ? JSON.parse(order.items) : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-[var(--color-navy)] font-mono">{order.order_number}</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-navy)] cursor-pointer bg-transparent border-none text-xl leading-none"
          >
            &#10005;
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex justify-end">
            <button
              onClick={() => {
                const itemsHtml = items.map((i: any) =>
                  `<tr><td>${i.title}</td><td>Qty: ${i.quantity} × ₹${i.price}</td></tr>`
                ).join("");
                const addr = order.shipping_address || {};
                const html = `
                  <h2>Customer</h2>
                  <table><tr><td>Name</td><td>${order.customer_name}</td></tr>
                  <tr><td>Email</td><td>${order.customer_email}</td></tr>
                  <tr><td>Phone</td><td>${order.customer_phone}</td></tr></table>
                  <h2>Shipping Address</h2>
                  <table><tr><td>Address</td><td>${addr.address || "—"}, ${addr.city || "—"}, ${addr.state || "—"} - ${addr.pincode || "—"}</td></tr></table>
                  <h2>Products</h2>
                  <table>${itemsHtml}</table>
                  <h2>Payment</h2>
                  <table><tr><td>Product Amount</td><td>₹${order.subtotal?.toLocaleString("en-IN")}</td></tr>
                  <tr><td>Shipping Cost</td><td>₹${order.shipping_cost?.toLocaleString("en-IN") || "0"}</td></tr>
                  <tr><td>Total</td><td>₹${order.total?.toLocaleString("en-IN")}</td></tr>
                  <tr><td>Payment Status</td><td>${order.payment_status}</td></tr>
                  <tr><td>Order Status</td><td>${order.status}</td></tr>
                  <tr><td>Payment Method</td><td>${order.payment_method}</td></tr>
                  ${order.payment_id ? `<tr><td>Payment ID</td><td>${order.payment_id}</td></tr>` : ""}
                  </table>
                `;
                printAsPdf(`Order ${order.order_number}`, html);
              }}
              className="px-3 py-1.5 bg-[var(--color-navy)] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
            >
              Download PDF
            </button>
          </div>

          <Section title="Customer">
            <Row label="Name" value={order.customer_name} />
            <Row label="Email" value={order.customer_email} />
            <Row label="Phone" value={order.customer_phone} />
          </Section>

          <Section title="Shipping Address">
            <Row label="Address" value={order.shipping_address?.address || "—"} />
            <Row label="City" value={order.shipping_address?.city || "—"} />
            <Row label="State" value={order.shipping_address?.state || "—"} />
            <Row label="Pincode" value={order.shipping_address?.pincode || "—"} />
          </Section>

          <div>
            <h3 className="text-sm font-semibold text-[var(--color-navy)] mb-2">Products</h3>
            <div className="bg-[var(--color-beige)] rounded-lg divide-y divide-[var(--color-border)]">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-navy)] truncate">{item.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-navy)]">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] px-3 py-2.5">No items</p>
              )}
            </div>
          </div>

          <Section title="Payment">
            <Row label="Product Amount" value={`₹${order.subtotal?.toLocaleString("en-IN")}`} />
            <Row label="Shipping Cost" value={`₹${order.shipping_cost?.toLocaleString("en-IN") || "0"}`} />
            <Row label="Total" value={`₹${order.total?.toLocaleString("en-IN")}`} />
            <Row label="Payment Status" value={order.payment_status} />
            <Row label="Order Status" value={order.status} />
            <Row label="Payment Method" value={
              order.payment_method === "razorpay" ? "Razorpay" :
              order.payment_method === "whatsapp_upi" ? "WhatsApp UPI" : order.payment_method
            } />
            {order.payment_id && <Row label="Payment ID" value={order.payment_id} />}
          </Section>

          <Section title="Timeline">
            <Row label="Created" value={new Date(order.created_at).toLocaleString("en-IN", {
              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            })} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-navy)] mb-2">{title}</h3>
      <div className="bg-[var(--color-beige)] rounded-lg px-4 py-3 divide-y divide-[var(--color-border)]">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-navy)] text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
