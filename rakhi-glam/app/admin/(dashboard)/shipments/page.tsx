"use client";

import { useState, useCallback } from "react";

type Tab = "generate" | "track" | "cost" | "tat";

const TABS: { key: Tab; label: string }[] = [
  { key: "generate", label: "Generate Label" },
  { key: "track", label: "Tracking" },
  { key: "cost", label: "Shipping Cost" },
  { key: "tat", label: "Expected TAT" },
];

export default function AdminShipmentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-[var(--color-navy)] mb-4">Shipments</h1>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-[var(--color-border)] pb-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer border-none ${
              activeTab === tab.key
                ? "bg-[var(--color-navy)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-navy)] hover:bg-[var(--color-beige)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "generate" && <GenerateLabelTab />}
      {activeTab === "track" && <TrackingTab />}
      {activeTab === "cost" && <CalculateCostTab />}
      {activeTab === "tat" && <TatTab />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-navy)] text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--color-text-muted)] mb-0.5">{label}</label>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]"
      />
    </div>
  );
}

/* Generate Label Tab */
function GenerateLabelTab() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const warehouse = {
    name: "RakhiGlam",
    address: "RakhiGlam, India",
    city: "India",
    pincode: "110001",
    phone: "917906759725",
  };

  const [fromName, setFromName] = useState(warehouse.name);
  const [fromAddr, setFromAddr] = useState(warehouse.address);
  const [fromCity, setFromCity] = useState(warehouse.city);
  const [fromPin, setFromPin] = useState(warehouse.pincode);
  const [fromPhone, setFromPhone] = useState(warehouse.phone);

  const printLabel = useCallback(() => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Shipping Label</title>
      <style>
        @page { margin: 0.5cm; size: A4 portrait; }
        body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; margin: 0; padding: 16px; }
        .label-container { max-width: 210mm; margin: 0 auto; border: 1px solid #ccc; padding: 12px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
        .header h1 { font-size: 18px; margin: 0; letter-spacing: 2px; }
        .section { margin-bottom: 10px; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; }
        .section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 3px; margin: 0 0 6px; color: #333; }
        td { padding: 2px 8px; vertical-align: top; }
        td:first-child { font-weight: bold; white-space: nowrap; color: #555; }
        @media print { button, .no-print { display: none !important; } }
      </style></head><body>
      <div class="no-print" style="text-align:center;padding:12px;background:#f3f4f6;border-radius:8px;margin-bottom:16px;">
        <button onclick="window.print()" style="padding:10px 32px;background:#0D1A3C;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:15px;font-weight:600;">Print / Save PDF</button>
      </div>
      <div class="label-container">
        <div class="header"><h1>RAKHIGLAM</h1><p style="font-size:10px;color:#666;margin:2px 0 0;">Shipping Label</p></div>
        <div class="section"><h2>From</h2><table style="width:100%;"><tr><td>Name:</td><td>${fromName}</td></tr><tr><td>Address:</td><td>${fromAddr}</td></tr><tr><td>City:</td><td>${fromCity} — ${fromPin}</td></tr><tr><td>Phone:</td><td>${fromPhone}</td></tr></table></div>
        <div class="section"><h2>Order</h2><table style="width:100%;"><tr><td>Order ID:</td><td>${orderId || "—"}</td></tr><tr><td>Date:</td><td>${new Date().toLocaleDateString("en-IN")}</td></tr></table></div>
      </div></body></html>`);
    win.document.close();
  }, [fromName, fromAddr, fromCity, fromPin, fromPhone, orderId]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">
        Generate and print a shipping label for an order.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter order ID (e.g. RG-20260715-ABCD)"
          className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]"
        />
      </div>

      <button
        onClick={printLabel}
        disabled={!orderId.trim()}
        className="px-5 py-2.5 bg-[var(--color-navy)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50"
      >
        Print Shipping Label
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
}

/* Tracking Tab */
function TrackingTab() {
  const [waybill, setWaybill] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = useCallback(async () => {
    if (!waybill.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/admin/delhivery/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "track", waybill: waybill.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to track");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to track");
    } finally {
      setLoading(false);
    }
  }, [waybill]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">Track a shipment by waybill number.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={waybill}
          onChange={(e) => setWaybill(e.target.value)}
          placeholder="Enter waybill number"
          className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]"
          onKeyDown={(e) => e.key === "Enter" && track()}
        />
        <button
          onClick={track}
          disabled={loading || !waybill.trim()}
          className="px-4 py-2 bg-[var(--color-navy)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50"
        >
          {loading ? "Tracking..." : "Track"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          <div className="px-4 py-3 flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              (result.status as string)?.toLowerCase().includes("deliver") ? "bg-green-500" :
              (result.status as string)?.toLowerCase().includes("transit") ? "bg-blue-500" :
              "bg-yellow-500"
            }`} />
            <span className="font-semibold text-[var(--color-navy)]">{result.status as string}</span>
          </div>
          <div className="px-4 py-3 space-y-1">
            <Row label="Details" value={result.details as string} />
            <Row label="Last Updated" value={
              result.timestamp ? new Date(result.timestamp as string).toLocaleString("en-IN") : "—"
            } />
          </div>
        </div>
      )}
    </div>
  );
}

/* Calculate Shipping Cost Tab */
function CalculateCostTab() {
  const [pincode, setPincode] = useState("");
  const [weightGrams, setWeightGrams] = useState("500");
  const [amount, setAmount] = useState("0");
  const [mode, setMode] = useState<"Surface" | "Express">("Surface");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculate = useCallback(async () => {
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/admin/delhivery/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "calculate-shipping-cost", pincode: pincode.trim(), weightGrams: Number(weightGrams) || 500, amount: Number(amount) || 0, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to calculate");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate");
    } finally {
      setLoading(false);
    }
  }, [pincode, weightGrams, amount, mode]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">Calculate shipping cost from your warehouse to a destination pincode.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Destination Pincode</label>
          <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="411014" className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Weight (grams)</label>
          <input value={weightGrams} onChange={(e) => setWeightGrams(e.target.value.replace(/\D/g, ""))} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Invoice Amount (₹)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Delivery Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as "Surface" | "Express")} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)] bg-white">
            <option value="Surface">Surface</option>
            <option value="Express">Express</option>
          </select>
        </div>
      </div>
      <button onClick={calculate} disabled={loading || !pincode.trim()} className="px-5 py-2.5 bg-[var(--color-navy)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50">
        {loading ? "Calculating..." : "Calculate Shipping Cost"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">Shipping Cost</span>
            <span className="text-lg font-bold text-[var(--color-navy)]">
              ₹{(result as { shippingCost?: number }).shippingCost?.toLocaleString("en-IN") ?? "—"}
            </span>
          </div>
          {(result as { estimatedDays?: string }).estimatedDays && (
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-muted)]">Estimated Delivery</span>
              <span className="text-sm font-semibold text-[var(--color-navy)]">{(result as { estimatedDays: string }).estimatedDays}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Expected TAT Tab */
function TatTab() {
  const [pincode, setPincode] = useState("");
  const [mode, setMode] = useState<"Surface" | "Express">("Surface");

  const surfaceDays = "5–8 business days";
  const expressDays = "4–5 business days";

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-muted)]">Estimated delivery time from your warehouse to a destination pincode.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter destination pincode" className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]" />
        <select value={mode} onChange={(e) => setMode(e.target.value as "Surface" | "Express")} className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]">
          <option value="Surface">Surface</option>
          <option value="Express">Express</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">Delivery Mode</span>
          <span className="text-sm font-semibold text-[var(--color-navy)]">{mode}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">Estimated Delivery</span>
          <span className="text-sm font-semibold text-[var(--color-navy)]">
            {mode === "Express" ? expressDays : surfaceDays}
          </span>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            Based on standard transit times from your warehouse pincode to <strong>{pincode || "—"}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
