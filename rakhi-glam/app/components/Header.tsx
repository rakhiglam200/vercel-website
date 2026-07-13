"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { searchProducts, type Product } from "@/data/products";
import LoginPopup from "./LoginPopup";

const navItems = [
  {
    label: "New Arrivals",
    href: "/collections/newly-launched",
  },
  {
    label: "Necklaces",
    href: "/collections/necklaces",
    dropdown: [
      { label: "Gold Necklaces", href: "/collections/necklaces" },
      { label: "Silver Necklaces", href: "/collections/necklaces" },
      { label: "Chokers", href: "/collections/necklaces" },
      { label: "Layering Necklaces", href: "/collections/necklaces" },
    ],
  },
  {
    label: "Bracelets",
    href: "/collections/bracelets",
    dropdown: [
      { label: "Chain Bracelets", href: "/collections/bracelets" },
      { label: "Bangle Bracelets", href: "/collections/bangle-bracelets" },
      { label: "Charm Bracelets", href: "/collections/bracelets" },
    ],
  },
  {
    label: "Earrings",
    href: "/collections/earrings",
    dropdown: [
      { label: "Stud Earrings", href: "/collections/earrings" },
      { label: "Drop Earrings", href: "/collections/earrings" },
      { label: "Jhumkas", href: "/collections/jhumkas" },
    ],
  },
  {
    label: "Rings",
    href: "/collections/rings",
  },
  {
    label: "More",
    href: "/collections",
    dropdown: [
      { label: "Anklets", href: "/collections/anklets" },
      { label: "Watches", href: "/collections/watches" },
      { label: "All Collections", href: "/collections" },
    ],
  },
];

const QUICK_LINKS = [
  { label: "Necklaces", q: "Necklaces" },
  { label: "Bracelets", q: "Bracelets" },
  { label: "Earrings", q: "Earrings" },
  { label: "Rings", q: "Rings" },
  { label: "Jhumkas", q: "Jhumkas" },
  { label: "Gold", q: "Gold" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { count, items, removeItem, updateQuantity, total } = useCart();
  const [openSubs, setOpenSubs] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [activeLiveIdx, setActiveLiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const toggleSub = (index: number) => {
    setOpenSubs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const openSearch = () => {
    setSearchOpen(true);
    setLiveResults([]);
    setActiveLiveIdx(-1);
    setSearchQuery("");
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setLiveResults([]);
    setActiveLiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const navigateWithQuery = (q: string) => {
    if (!q.trim()) return;
    closeSearch();
    router.push(`/collections?q=${encodeURIComponent(q.trim())}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeLiveIdx >= 0 && liveResults[activeLiveIdx]) {
      const p = liveResults[activeLiveIdx];
      closeSearch();
      router.push(`/products/${p.slug}`);
    } else if (searchQuery.trim()) {
      navigateWithQuery(searchQuery.trim());
    }
  };

  useEffect(() => {
    if (!searchOpen) return;
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setLiveResults([]);
      setActiveLiveIdx(-1);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLiveResults(searchProducts(q).slice(0, 5));
      setActiveLiveIdx(-1);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, searchOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { closeSearch(); return; }
    const cnt = liveResults.length;
    if (cnt === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveLiveIdx((i) => (i < cnt - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveLiveIdx((i) => (i > 0 ? i - 1 : cnt - 1));
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[var(--color-navy)] text-white text-xs py-2 overflow-hidden">
        <div className="announcement-track whitespace-nowrap inline-flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="inline-flex gap-8 px-4">
              <span>Free Shipping on Orders Above ₹999</span>
              <span>✦</span>
              <span>Cash on Delivery Available</span>
              <span>✦</span>
              <span>Easy Returns Within 7 Days</span>
              <span>✦</span>
              <span>WhatsApp Us for Custom Orders</span>
              <span>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-10 grid grid-cols-[1fr_auto_1fr] items-center h-[72px] max-md:px-5 max-md:h-16">
          {/* Hamburger + Search */}
          <div className="flex items-center gap-3 justify-self-start">
            <button
              className="flex flex-col gap-1 cursor-pointer bg-transparent border-none p-1 md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-5 h-[2px] bg-[var(--color-navy)] rounded-sm" />
              <span className="block w-5 h-[2px] bg-[var(--color-navy)] rounded-sm" />
              <span className="block w-5 h-[2px] bg-[var(--color-navy)] rounded-sm" />
            </button>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-[var(--color-navy)] no-underline hover:text-[var(--color-gold)] transition-colors"
                    >
                      {item.label}
                    </Link>
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white rounded-xl shadow-xl border border-[var(--color-border)] py-2 min-w-[180px]">
                        {item.dropdown.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="block px-4 py-2 text-sm text-[var(--color-text)] no-underline hover:bg-[var(--color-beige)] hover:text-[var(--color-navy)] transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-[var(--color-navy)] no-underline hover:text-[var(--color-gold)] transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* Logo (centered) */}
          <Link href="/" className="no-underline shrink-0">
            <span className="font-heading text-2xl font-bold tracking-[0.25em] text-[var(--color-navy)] uppercase max-md:text-lg">
              RakhiGlam
            </span>
          </Link>

          {/* Icons */}
          <div className="flex items-center gap-3 justify-self-end">
            <button
              onClick={openSearch}
              aria-label="Search"
              className="text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors cursor-pointer bg-transparent border-none p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            <Link
              href="/collections"
              className="text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors hidden md:block"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </Link>
            <button
              onClick={() => setLoginOpen(true)}
              aria-label="Account"
              className="text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors cursor-pointer bg-transparent border-none p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-9 h-9 rounded-full border border-[var(--color-border)] text-[var(--color-navy)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all cursor-pointer bg-transparent"
              aria-label="Open cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[var(--color-navy)] text-white text-[10px] font-bold inline-flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-16 max-md:pt-0 max-md:items-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeSearch} />
          <div
            className="relative bg-white w-full max-w-xl mx-4 rounded-2xl shadow-2xl overflow-hidden max-md:rounded-b-none max-md:mx-0 max-md:max-w-full animate-slide-down"
            onKeyDown={handleKeyDown}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--color-text-muted)]">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 border-none outline-none text-base text-[var(--color-text)] bg-transparent placeholder:text-[var(--color-text-muted)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setLiveResults([]); inputRef.current?.focus(); }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer bg-transparent border-none p-1 shrink-0"
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={closeSearch}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer bg-transparent border-none p-1 shrink-0 ml-1"
                aria-label="Close search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </form>

            {liveResults.length > 0 && (
              <div className="max-h-[360px] overflow-y-auto divide-y divide-[var(--color-border)]">
                {liveResults.map((p, i) => (
                  <button
                    key={p.id}
                    onMouseEnter={() => setActiveLiveIdx(i)}
                    onClick={() => {
                      closeSearch();
                      router.push(`/products/${p.slug}`);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors cursor-pointer border-none ${
                      i === activeLiveIdx ? "bg-[var(--color-beige)]" : "bg-white hover:bg-[var(--color-beige)]/60"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-beige)] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.alt} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">{p.title}</p>
                      <p className="text-xs text-[var(--color-text-light)] truncate mt-0.5">{p.description}</p>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-navy)] shrink-0">₹{p.price}</span>
                  </button>
                ))}
                <button
                  onClick={() => navigateWithQuery(searchQuery)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-[var(--color-navy)] hover:bg-[var(--color-beige)]/40 transition-colors cursor-pointer border-none bg-white"
                >
                  View all results for &ldquo;{searchQuery}&rdquo;
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {!searchQuery && (
              <div className="px-5 py-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Popular</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_LINKS.map(({ label, q }) => (
                      <button
                        key={label}
                        onClick={() => navigateWithQuery(q)}
                        className="px-3 py-1.5 text-xs bg-[var(--color-beige)] text-[var(--color-text)] rounded-full hover:bg-[var(--color-navy)] hover:text-white transition-colors cursor-pointer border-none"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-[300]">
          <div className="fixed inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="fixed top-0 h-full w-full sm:max-w-md sm:right-0 max-sm:left-0 bg-[var(--color-cream)] shadow-xl flex flex-col z-10 animate-slide-down">
            <div className="flex items-center justify-between px-7 py-6 border-b border-[var(--color-beige-dark)]">
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-navy)]">Your Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-2xl text-[var(--color-text-muted)] hover:text-[var(--color-navy)] cursor-pointer bg-transparent border-none leading-none"
              >
                &times;
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-4">
                <span className="font-heading text-xl text-[var(--color-text-muted)]">Your cart is empty</span>
                <p className="text-sm text-[var(--color-text-light)] max-w-xs">
                  Add some beautiful jewellery and it will appear here.
                </p>
                <button
                  onClick={() => { setCartOpen(false); router.push("/collections"); }}
                  className="mt-2 bg-[var(--color-navy)] text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3.5 items-center bg-white border border-[var(--color-beige-dark)] rounded-2xl p-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--color-beige)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading text-base font-semibold leading-tight text-[var(--color-navy)]">{item.title}</h4>
                        <p className="text-sm text-[var(--color-gold-dark)] font-semibold mt-1">₹{item.price}</p>
                        <div className="flex items-center gap-2.5 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-[26px] h-[26px] rounded-lg border border-[var(--color-beige-dark)] bg-[var(--color-beige)] cursor-pointer text-sm text-[var(--color-text)] flex items-center justify-center leading-none hover:bg-[var(--color-beige-dark)] transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold min-w-4 text-center text-[var(--color-navy)]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-[26px] h-[26px] rounded-lg border border-[var(--color-beige-dark)] bg-[var(--color-beige)] cursor-pointer text-sm text-[var(--color-text)] flex items-center justify-center leading-none hover:bg-[var(--color-beige-dark)] transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-xs text-[var(--color-text-muted)] underline hover:text-red-500 cursor-pointer bg-transparent border-none"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--color-beige-dark)] p-6 pb-8">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-sm text-[var(--color-text-light)]">Subtotal</span>
                    <span className="font-heading text-2xl font-bold text-[var(--color-navy)]">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    onClick={() => { setCartOpen(false); router.push("/checkout"); }}
                    className="w-full bg-[var(--color-navy)] text-white py-3.5 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Drawer ── */}
      <div
        className={`fixed inset-0 bg-black/40 z-[200] transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        className={`fixed top-0 left-[-320px] w-80 h-full bg-white z-[201] transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-lg flex flex-col ${
          drawerOpen ? "!left-0" : ""
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-[var(--color-border)] shrink-0">
          <span className="font-heading font-bold text-[var(--color-navy)]">Menu</span>
          <button
            className="bg-transparent border-none text-xl cursor-pointer text-[var(--color-text)]"
            onClick={() => setDrawerOpen(false)}
          >
            &#10005;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2.5">
          {navItems.map((item, idx) =>
            item.dropdown ? (
              <div key={item.label} className="border-b border-[var(--color-border)]">
                <button
                  className="w-full flex justify-between items-center px-5 py-3.5 text-sm font-medium text-[var(--color-text)] bg-transparent border-none cursor-pointer hover:bg-[var(--color-beige)]"
                  onClick={() => toggleSub(idx)}
                  aria-expanded={!!openSubs[idx]}
                >
                  {item.label}
                  <svg
                    className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform duration-300 ${openSubs[idx] ? "rotate-180" : ""}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" />
                  </svg>
                </button>
                <div className={`${openSubs[idx] ? "block" : "hidden"} pb-2.5 pl-5`}>
                  {item.dropdown.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block px-5 py-2 text-sm text-[var(--color-text-light)] no-underline hover:text-[var(--color-navy)]"
                      onClick={() => setDrawerOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div key={item.label} className="border-b border-[var(--color-border)]">
                <Link
                  href={item.href}
                  className="block px-5 py-3.5 text-sm font-medium text-[var(--color-text)] no-underline"
                  onClick={() => setDrawerOpen(false)}
                >
                  {item.label}
                </Link>
              </div>
            )
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--color-border)] bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => { setDrawerOpen(false); setLoginOpen(true); }} className="no-underline text-xs text-[var(--color-text)] hover:text-[var(--color-navy)] cursor-pointer bg-transparent border-none">Account</button>
            <Link href="/about" className="no-underline text-xs text-[var(--color-text)] hover:text-[var(--color-navy)]" onClick={() => setDrawerOpen(false)}>About</Link>
            <Link href="/contact" className="no-underline text-xs text-[var(--color-text)] hover:text-[var(--color-navy)]" onClick={() => setDrawerOpen(false)}>Contact</Link>
            <a href="https://wa.me/917906759725" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-light)] hover:text-[#25D366]" aria-label="WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <LoginPopup open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
