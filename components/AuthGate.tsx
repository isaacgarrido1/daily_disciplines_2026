"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";

const PUBLIC_PATHS = new Set<string>(["/create-account", "/login"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser && !PUBLIC_PATHS.has(pathname)) {
      router.replace("/create-account");
    }
  }, [currentUser, pathname, router]);

  if (!currentUser && !PUBLIC_PATHS.has(pathname)) {
    return null;
  }

  return <>{children}</>;
}

