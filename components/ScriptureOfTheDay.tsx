"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";

type Scripture = { reference: string; text: string } | null;

export function ScriptureOfTheDay() {
  const [scripture, setScripture] = useState<Scripture>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/scripture")
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d?.error ?? res.statusText));
        return res.json();
      })
      .then((data: { reference?: string; text?: string }) => {
        if (cancelled) return;
        setScripture({
          reference: data.reference ?? "Scripture",
          text: data.text ?? ""
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(typeof err === "string" ? err : err?.message ?? "Could not load scripture.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card title="Scripture of the Day">
      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      )}
      {error && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {error}
        </p>
      )}
      {!loading && !error && scripture && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-100">
          {scripture.text}
        </p>
      )}
    </Card>
  );
}
