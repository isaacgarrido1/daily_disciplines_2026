"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { useApp } from "@/components/AppProvider";

export default function LoginPage() {
  const router = useRouter();
  const { state, currentUser, setCurrentUserId } = useApp();

  function handleSelect(userId: string) {
    setCurrentUserId(userId);
    router.push("/");
  }

  return (
    <div className="space-y-6">
      <Card title="Log in">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Select your account to continue. Your data is stored on this device.
        </p>

        {state.users.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No accounts yet.{" "}
            <Link href="/create-account" className="text-accent hover:underline">
              Create an account
            </Link>{" "}
            first.
          </p>
        ) : (
          <ul className="space-y-2">
            {state.users.map((user) => {
              const group = state.groups.find((g) => g.id === user.groupId);
              const isCurrent = currentUser?.id === user.id;
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    className={`min-h-touch w-full rounded-md border px-3 py-3 text-left text-base transition-colors sm:text-sm ${
                      isCurrent
                        ? "border-accent/50 bg-accent/10 font-medium text-slate-900 dark:border-accent/50 dark:bg-accent/10 dark:text-slate-100"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="font-medium">{user.name}</span>
                    {user.role === "leader" ? (
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">Leader</span>
                    ) : null}
                    {group ? (
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                        {group.name}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          Need an account?{" "}
          <Link href="/create-account" className="text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
