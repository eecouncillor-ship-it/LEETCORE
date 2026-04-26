import Link from "next/link";

import { CreateProblemForm } from "@/app/admin/create-problem-form";
import { AppShell } from "@/components/shell";
import { requireAuth } from "@/lib/auth";
import { getStats } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function AdminAddPage() {
  const [user, stats] = await Promise.all([requireAuth("admin"), getStats()]);

  return (
    <AppShell
      heading="Add question"
      subheading="Create a new MCQ for the question bank."
      roleLabel="Admin portal"
      userName={user.email}
      actions={
        <Link
          href="/admin"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Back to questions
        </Link>
      }
      navItems={[
        { href: "/admin", label: "Questions" },
        { href: "/admin/users", label: "Users" },
        { href: "/problems", label: "Student portal" },
        { href: "/admin/add", label: "Add question", active: true },
      ]}
    >
      <div className="space-y-6">
        <section className="rounded-[20px] border border-white/10 bg-white/5 p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Create question
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Add a new MCQ</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Questions you create here become the source of truth for students.
            </p>
          </div>

          <CreateProblemForm />
        </section>
      </div>
    </AppShell>
  );
}
