import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BrandHeader from "@/components/brand/BrandHeader";
import BrandFooter from "@/components/brand/BrandFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pension Projection Dashboard",
  description: "Secure your financial future with dynamic projections and withdrawals.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col bg-brand-bg text-slate-100">
          <BrandHeader />
          <main className="flex-grow">
            {children}
          </main>
          <BrandFooter />
        </div>
      </body>
    </html>
  );
}
