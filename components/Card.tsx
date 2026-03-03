import { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-surface/80 p-4 shadow-sm">
      {title && (
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

