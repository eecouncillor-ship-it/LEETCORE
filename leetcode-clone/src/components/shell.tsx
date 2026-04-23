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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.12),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#08111f_35%,_#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        {/* Compact header for admin pages */}
        {roleLabel && roleLabel.toLowerCase().includes("admin") ? (
          <header className="flex items-center justify-between rounded-full border border-white/8 bg-white/4 px-6 py-3 shadow-[0_8px_30px_rgba(2,6,23,0.06)] backdrop-blur">
            <h1 className="text-2xl font-black tracking-tight text-white">{heading}</h1>

            <div className="flex items-center gap-3">
              {actions}

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                Admin
              </span>

              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign out
                </button>
              </form>
            </div>
          </header>
        ) : (
          <header className="flex flex-col gap-6 rounded-full border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(2,6,23,0.08)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">
                {roleLabel}
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
                {heading}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                {subheading}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {actions}
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                {userName}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign out
                </button>
              </form>
            </div>
          </header>
        )}

        <nav className="mt-6 flex flex-wrap gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                item.active
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
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
