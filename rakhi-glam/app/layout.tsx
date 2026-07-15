import type { Metadata } from "next";
import { Mulish, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { ToastProvider } from "@/app/context/ToastContext";
import WhatsAppButton from "@/app/components/WhatsAppButton";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "RakhiGlam - Jewellery for the Modern Woman",
  description:
    "Discover RakhiGlam's curated collection of gold and silver jewellery - necklaces, bracelets, earrings and more. Timeless pieces crafted for every occasion.",
  keywords: ["jewellery", "gold jewellery", "silver jewellery", "necklaces", "bracelets", "earrings", "bangles", "rings"],
  openGraph: {
    title: "RakhiGlam - Jewellery for the Modern Woman",
    description: "Curated collection of gold and silver jewellery. Timeless pieces crafted for every occasion.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mulish.variable} ${instrumentSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <CartProvider>
            {children}
            <div className="fixed bottom-6 right-6 z-50">
              <WhatsAppButton />
            </div>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
