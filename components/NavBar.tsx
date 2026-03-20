"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { useAuth } from "@/components/AuthProvider";

const authedLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/brotherhood", label: "Small Group" },
  { href: "/weekly", label: "Weekly Circle" },
  { href: "/account", label: "Account" },
  { href: "/create-account", label: "Join group" }
];

const guestLinks = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" }
];

function linkClass(active: boolean) {
  return `flex min-h-touch w-full items-center rounded-md px-3 py-2 text-base font-medium transition-colors lg:w-auto lg:min-h-0 lg:py-1 lg:text-sm ${
    active
      ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
  }`;
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { currentUser, group, theme, setTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const links = user ? authedLinks : guestLinks;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 pb-4 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl dark:text-slate-50">
            Daily Disciplines
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Spiritual · Physical · Leadership
          </p>
          <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-500">
            {authLoading ? (
              "…"
            ) : user && currentUser ? (
              <>
                Signed in as{" "}
                <span className="text-slate-700 dark:text-slate-300">{currentUser.name}</span>
                {group ? (
                  <>
                    {" "}
                    · <span className="text-slate-700 dark:text-slate-300">{group.name}</span>
                  </>
                ) : null}
              </>
            ) : user ? (
              <>Signed in</>
            ) : (
              <>Not signed in</>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="touch-target flex items-center justify-center rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="touch-target flex items-center justify-center rounded-md p-2 text-slate-600 lg:hidden dark:text-slate-300"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <nav
        id={menuId}
        className={
          menuOpen
            ? "mt-4 flex max-h-[min(70vh,calc(100dvh-8rem))] flex-col gap-0.5 overflow-y-auto border-t border-slate-200 pt-3 dark:border-slate-800 lg:mt-0 lg:max-h-none lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-2 lg:overflow-visible lg:border-t-0 lg:pt-0"
            : "mt-4 hidden border-t border-slate-200 pt-3 dark:border-slate-800 lg:mt-0 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-2 lg:border-t-0 lg:pt-0"
        }
        aria-label="Main"
      >
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(active)}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
        {user ? (
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex min-h-touch w-full items-center rounded-md px-3 py-2 text-left text-base font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:ml-2 lg:w-auto lg:min-h-0 lg:py-1 lg:text-sm"
          >
            Sign out
          </button>
        ) : null}
      </nav>
    </header>
  );
}
