import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mall Tenant Management System | Admin Portal",
  description: "Enterprise Mall Tenant Management, Lease Evaluation, and Financial Reporting Platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.className} suppressHydrationWarning>
      <body className="antialiased min-h-screen selection:bg-slate-800 selection:text-white">{children}</body>
    </html>
  );
}
