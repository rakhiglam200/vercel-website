"use client";

import Link from "next/link";

interface CategoryCardProps {
  src: string;
  alt: string;
  title: string;
  href: string;
}

export default function CategoryCard({ src, alt, title, href }: CategoryCardProps) {
  return (
    <Link href={href} className="block no-underline group">
      <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-[var(--color-beige)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-heading text-lg font-semibold text-white mb-1">{title}</h3>
          <span className="text-xs text-white/80 flex items-center gap-1 group-hover:gap-2 transition-all">
            Shop Now
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
