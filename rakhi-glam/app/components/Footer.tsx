"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-navy)] text-white px-10 pt-15 pb-7 max-md:px-5 max-md:pt-10 max-md:pb-5">
      <div className="max-w-[1400px] mx-auto grid grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-10 mb-10 max-lg:grid-cols-2 max-md:grid-cols-1">
        {/* Brand */}
        <div>
          <h4 className="font-heading text-lg mb-5 tracking-[0.15em] uppercase">RakhiGlam</h4>
          <p className="text-sm leading-relaxed text-white/70 mb-4">
            Crafted with elegance. Delivered with trust. Discover our curated collection of gold and silver jewellery designed for the modern woman.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white no-underline hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-all" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white no-underline hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-all" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
            <a href="https://wa.me/917906759725" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white no-underline hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-all" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading text-lg mb-5">Quick Links</h4>
          <Link href="/collections/necklaces" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Necklaces</Link>
          <Link href="/collections/bracelets" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Bracelets</Link>
          <Link href="/collections/earrings" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Earrings</Link>
          <Link href="/collections/rings" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Rings</Link>
          <Link href="/collections" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">All Collections</Link>
        </div>

        {/* Information */}
        <div>
          <h4 className="font-heading text-lg mb-5">Information</h4>
          <Link href="/about" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">About Us</Link>
          <Link href="/contact" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Contact Us</Link>
          <Link href="/privacy-policy" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Privacy Policy</Link>
          <Link href="/shipping-policy" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Shipping Policy</Link>
          <Link href="/refund-policy" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Refund Policy</Link>
          <Link href="/terms-conditions" className="text-sm text-white/70 no-underline block py-1 hover:text-[var(--color-gold)] transition-colors">Terms & Conditions</Link>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-heading text-lg mb-5">Contact Us</h4>
          <div className="flex items-start gap-3 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-[var(--color-gold)]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-sm text-white/70">14, Bengali Library Road, Dehradun</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--color-gold)]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span className="text-sm text-white/70">rakhiglam200@gmail.com</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--color-gold)]"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            <span className="text-sm text-white/70">+91 7906759725</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto pt-7 border-t border-white/10 flex justify-between items-center text-xs text-white/50 max-md:flex-col max-md:gap-2 max-md:text-center">
        <span>&copy; 2026 RakhiGlam. All rights reserved.</span>
        <span>Crafted with elegance. Delivered with trust.</span>
      </div>
    </footer>
  );
}
