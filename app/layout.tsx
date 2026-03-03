import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";
import { AppProvider } from "@/components/AppProvider";

export const metadata: Metadata = {
  title: "Daily Disciplines 2026",
  description:
    "A 30-day accountability dashboard for a Christian men's brotherhood."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="app-shell">
        <AppProvider>
          <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            <NavBar />
            <main className="mt-8 flex-1">{children}</main>
            <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
              Daily Disciplines 2026 · 30-day pilot
            </footer>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

