"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/AppProvider";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/brotherhood", label: "Brotherhood" },
  { href: "/weekly", label: "Weekly Circle" },
  { href: "/signup", label: "Sign Up" }
];

export function NavBar() {
  const pathname = usePathname();
  const { currentUser, group } = useApp();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Daily Disciplines
        </h1>
        <p className="text-xs text-slate-400">
          Christian brotherhood · Spiritual · Physical · Leadership
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {currentUser ? (
            <>
              Signed in as <span className="text-slate-300">{currentUser.name}</span>
              {group ? (
                <>
                  {" "}
                  · <span className="text-slate-300">{group.name}</span>
                </>
              ) : null}
            </>
          ) : (
            <>No user selected</>
          )}
        </p>
      </div>

      <nav className="flex gap-3 text-sm">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                active
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

