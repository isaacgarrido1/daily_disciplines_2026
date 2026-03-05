import { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-surface/80">
      {title && (
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

