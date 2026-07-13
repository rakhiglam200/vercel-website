"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

interface ProductCardProps {
  id: string;
  slug: string;
  src: string;
  alt: string;
  title: string;
  desc: string;
  price: number;
  originalPrice?: number;
  badge?: string;
}

export default function ProductCard({
  id,
  slug,
  src,
  alt,
  title,
  desc,
  price,
  originalPrice,
  badge,
}: ProductCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.id === id);

  return (
    <Link href={`/products/${slug}`} className="block no-underline group">
      <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]">
        <div className="relative aspect-square overflow-hidden bg-[var(--color-beige)]">
          <Image src={src} alt={alt} fill className="object-cover transition-transform duration-600 group-hover:scale-108" />
          {badge && (
            <span className="absolute top-3 left-3 bg-[var(--color-navy)] text-white px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider">
              {badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem({ id, title, price, src });
            }}
            className="absolute bottom-0 left-0 right-0 bg-[var(--color-navy)] text-white text-sm py-3 font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer border-none flex items-center justify-center gap-2 max-md:translate-y-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            {inCart ? "Add Again" : "Add to Cart"}
          </button>
        </div>
        <div className="p-4.5">
          <h4 className="font-heading text-base mb-1.5 text-[var(--color-text)] group-hover:text-[var(--color-navy)] transition-colors">
            {title}
          </h4>
          <p className="text-xs text-[var(--color-text-light)] mb-2.5 leading-relaxed">
            {desc}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-[var(--color-navy)]">
              ₹{price.toLocaleString("en-IN")}
              {originalPrice && (
                <del className="text-sm text-[var(--color-text-muted)] ml-2 font-normal">₹{originalPrice.toLocaleString("en-IN")}</del>
              )}
            </div>
            <span className="text-[10px] text-[var(--color-navy)] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 max-md:opacity-100">
              View Details
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </span>
          </div>
          {inCart && (
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-[var(--color-gold-dark)] font-medium">{inCart.quantity} in cart</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
