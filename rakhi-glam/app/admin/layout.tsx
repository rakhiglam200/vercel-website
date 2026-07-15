import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RakhiGlam Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
