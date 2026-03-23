import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";
import { AppProvider } from "@/components/AppProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Daily Disciplines 2026",
  description:
    "A 30-day accountability dashboard for a Christian men's small group."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var r=document.documentElement,t=localStorage.getItem('daily-disciplines-theme');if(t==='light')r.classList.remove('dark');else r.classList.add('dark');})();`
          }}
        />
      </head>
      <body className={`app-shell ${inter.className}`}>
        <AuthProvider>
          <AppProvider>
          <div className="app-padding-x mx-auto flex min-h-screen w-full max-w-5xl min-w-0 flex-col py-5 sm:py-6 lg:py-8">
            <NavBar />
            <main className="mt-6 min-w-0 flex-1 sm:mt-8">{children}</main>
            <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500 sm:text-left dark:border-slate-800 dark:text-slate-500">
              Daily Disciplines 2026 · 30-day pilot
            </footer>
          </div>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

