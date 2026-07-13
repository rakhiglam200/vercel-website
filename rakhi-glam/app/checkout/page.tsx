"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/app/context/CartContext";
import { INDIAN_STATES, CITIES_BY_STATE } from "@/data/indian-cities";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface ShippingInfo {
  shippingCost: number;
  estimatedDays: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, updateQuantity, removeItem, loaded } = useCart();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [showCustomCity, setShowCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState("");

  useEffect(() => {
    if (!loaded) return;
    if (count === 0) {
      router.push("/collections");
    } else {
      setReady(true);
    }
  }, [count, router, loaded]);

  const shippingCost = total >= 999 ? 0 : 49;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "state") {
        next.city = "";
        setShowCustomCity(false);
        setCustomCity("");
      }
      return next;
    });
    setError("");
  };

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__other__") {
      setShowCustomCity(true);
      setForm((prev) => ({ ...prev, city: "" }));
    } else {
      setShowCustomCity(false);
      setCustomCity("");
      setForm((prev) => ({ ...prev, city: val }));
    }
  };

  const getCity = () => {
    const hasCities = (CITIES_BY_STATE[form.state]?.length ?? 0) > 0;
    if (hasCities && showCustomCity) return customCity.trim();
    if (hasCities && !showCustomCity) return form.city;
    return form.city.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, address, state, pincode } = form;
    const city = getCity();

    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      const missing: string[] = [];
      if (!name) missing.push("Full Name");
      if (!email) missing.push("Email");
      if (!phone) missing.push("Phone");
      if (!address) missing.push("Address");
      if (!city) missing.push("City");
      if (!state) missing.push("State");
      if (!pincode) missing.push("Pincode");
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }

    const shippingInfo: ShippingInfo = {
      shippingCost,
      estimatedDays: "3-6 business days",
    };

    sessionStorage.setItem("checkoutForm", JSON.stringify({ name, email, phone, address, city, state, pincode }));
    sessionStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));
    router.push("/checkout/review");
  };

  if (!ready) return null;

  return (
    <>
      <Header />
      <div className="bg-[var(--color-navy)] py-12">
        <div className="max-w-[1440px] mx-auto px-10 max-md:px-5 text-center">
          <h1 className="font-heading text-3xl font-bold text-white">Checkout</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10 py-10 max-md:px-5">
        <div className="grid grid-cols-5 gap-8 max-lg:grid-cols-1">
          <div className="col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">Full Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                  placeholder="Your full name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                  placeholder="your@email.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">Phone *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} maxLength={10}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                  placeholder="10-digit mobile number" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">Shipping Address *</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors resize-none"
                  placeholder="Street, area, landmark, etc." />
              </div>

              <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">State *</label>
                  <select name="state" value={form.state} onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors bg-white">
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">City *</label>
                  {(CITIES_BY_STATE[form.state]?.length ?? 0) > 0 ? (
                    <div>
                      <select value={showCustomCity ? "__other__" : form.city} onChange={handleCitySelect}
                        className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors bg-white">
                        <option value="">Select city</option>
                        {CITIES_BY_STATE[form.state]?.map((c) => <option key={c} value={c}>{c}</option>)}
                        <option value="__other__">Other</option>
                      </select>
                      {showCustomCity && (
                        <input type="text" value={customCity} onChange={(e) => setCustomCity(e.target.value)}
                          placeholder="Enter your city"
                          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors mt-2" />
                      )}
                    </div>
                  ) : (
                    <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Enter city"
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-navy)] mb-1">Pincode *</label>
                  <input type="text" name="pincode" value={form.pincode} onChange={handleChange} maxLength={6}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-navy)] transition-colors"
                    placeholder="6-digit pincode" />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button type="submit"
                className="w-full bg-[var(--color-navy)] text-white py-3.5 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none">
                Continue to Review
              </button>
            </form>
          </div>

          <div className="col-span-2">
            <div className="bg-[var(--color-beige)] rounded-2xl p-6 sticky top-24">
              <h2 className="font-heading text-lg font-bold text-[var(--color-navy)] mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0">
                      <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-navy)] truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-navy)] text-xs cursor-pointer bg-transparent border-none">−</button>
                        <span className="text-xs text-[var(--color-text-muted)]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-navy)] text-xs cursor-pointer bg-transparent border-none">+</button>
                        <button onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 text-xs cursor-pointer bg-transparent border-none ml-2">Remove</button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-navy)]">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--color-beige-dark)] pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-light)]">Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-light)]">Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--color-beige-dark)]">
                  <span className="text-[var(--color-navy)]">Total</span>
                  <span className="text-[var(--color-navy)]">₹{(total + shippingCost).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
