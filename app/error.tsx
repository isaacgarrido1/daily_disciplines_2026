"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-slate-100">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-slate-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-accent/40 bg-accent/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
