"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/AppProvider";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/brotherhood", label: "Small Group" },
  { href: "/weekly", label: "Weekly Circle" },
  { href: "/account", label: "Account" },
  { href: "/create-account", label: "Create Account" },
  { href: "/login", label: "Log in" }
];

export function NavBar() {
  const pathname = usePathname();
  const { currentUser, group, theme, setTheme } = useApp();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Daily Disciplines
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Spiritual · Physical · Leadership
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          {currentUser ? (
            <>
              Signed in as <span className="text-slate-700 dark:text-slate-300">{currentUser.name}</span>
              {group ? (
                <>
                  {" "}
                  · <span className="text-slate-700 dark:text-slate-300">{group.name}</span>
                </>
              ) : null}
            </>
          ) : (
            <>No user selected</>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <nav className="flex gap-3 text-sm">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                active
                  ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        </nav>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

