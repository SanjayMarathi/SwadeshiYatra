import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwadeshiYatra - Travel Tour Planner",
  description: "Your personal AI-driven travel tour planner and analyser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-transparent text-slate-900 antialiased`}
      >
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 pt-24 pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
