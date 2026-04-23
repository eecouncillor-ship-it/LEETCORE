import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

type ShellProps = {
  heading: string;
  subheading: string;
  roleLabel: string;
  userName: string;
  actions?: ReactNode;
  children: ReactNode;
  navItems: Array<{ href: string; label: string; active?: boolean }>;
};

export function AppShell({
  heading,
  subheading,
  roleLabel,
  userName,
  actions,
  children,
  navItems,
}: ShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fffaf5_0%,_#ffffff_20%,_#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-6 rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">
              {roleLabel}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              {heading}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              {subheading}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {actions}
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              {userName}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <nav className="mt-6 flex flex-wrap gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                item.active
                  ? "bg-slate-950 text-white shadow-lg"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex-1">{children}</div>
      </div>
    </div>
  );
}
