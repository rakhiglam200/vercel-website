"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: Array<{ id: string; title: string; price: number; quantity: number }>;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders?limit=100");
      const data = await res.json();
      const orderList = data.orders || [];
      setOrders(orderList);

      const totalRevenue = orderList.reduce((sum: number, o: Order) => sum + (o.total || 0), 0);
      setStats({
        totalOrders: data.total || orderList.length,
        totalRevenue,
        pendingOrders: orderList.filter((o: Order) => o.status === "pending" || o.status === "confirmed").length,
        deliveredOrders: orderList.filter((o: Order) => o.status === "delivered").length,
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  return (
    <>
      <Header />

      <div className="bg-[var(--color-navy)] py-12">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="bg-[var(--color-gold)] text-[var(--color-navy)] px-5 py-2 rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity">
              Manage Products
            </Link>
            <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/admin/login"; }}
              className="bg-white/10 text-white px-5 py-2 rounded-full text-sm font-semibold cursor-pointer border border-white/20 hover:bg-white/20 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10 py-10 max-md:px-5">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[var(--color-border)]">
          {(["overview", "orders"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0 ${
                activeTab === tab ? "border-[var(--color-navy)] text-[var(--color-navy)]" : "border-transparent text-[var(--color-text-muted)]"
              }`}
            >
              {tab === "overview" ? "Overview" : `Orders (${stats.totalOrders})`}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-10 max-lg:grid-cols-2 max-md:grid-cols-1">
              {[
                { label: "Total Orders", value: stats.totalOrders, icon: "📦" },
                { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: "💰" },
                { label: "Pending", value: stats.pendingOrders, icon: "⏳" },
                { label: "Delivered", value: stats.deliveredOrders, icon: "✅" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-[var(--color-border)] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <p className="font-heading text-2xl font-bold text-[var(--color-navy)]">{stat.value}</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <h2 className="font-heading text-xl font-bold text-[var(--color-navy)] mb-4">Recent Orders</h2>
            {loading ? (
              <p className="text-[var(--color-text-muted)]">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Order</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Items</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--color-navy)]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-beige)]/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs">{order.order_number}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{order.customer_email}</p>
                        </td>
                        <td className="py-3 px-4">{order.items?.length || 0} items</td>
                        <td className="py-3 px-4 font-semibold">₹{order.total?.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border-none cursor-pointer ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}
                          >
                            {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--color-text-muted)]">
                          {new Date(order.created_at).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "orders" && (
          <>
            {loading ? (
              <p className="text-[var(--color-text-muted)]">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-[var(--color-border)] rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-mono text-xs text-[var(--color-text-muted)]">{order.order_number}</p>
                        <p className="font-heading text-lg font-semibold text-[var(--color-navy)]">{order.customer_name}</p>
                        <p className="text-sm text-[var(--color-text-light)]">{order.customer_email} | {order.customer_phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-xl font-bold text-[var(--color-navy)]">₹{order.total?.toLocaleString("en-IN")}</p>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`mt-2 px-3 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}
                        >
                          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="border-t border-[var(--color-border)] pt-3">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span className="text-[var(--color-text-light)]">{item.title} × {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
