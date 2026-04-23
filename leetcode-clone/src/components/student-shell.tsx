import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

type StudentShellProps = {
  children: ReactNode;
  userName: string;
  navItems: Array<{ href: string; label: string; active?: boolean }>;
};

export function StudentShell({
  children,
  userName,
  navItems,
}: StudentShellProps) {
  const initial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#08111f_0%,_#0f172a_8%,_#e2e8f0_8%,_#f8fafc_100%)] text-slate-900">
      <header className="border-b border-slate-800 bg-[#08111f] text-slate-100">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href="/problems" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500 text-base font-bold text-white shadow-sm">
                &lt;/&gt;
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                CodeQuiz
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-base font-semibold transition",
                    item.active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                {initial}
              </div>
              <span className="text-sm font-medium text-slate-200">{userName}</span>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
