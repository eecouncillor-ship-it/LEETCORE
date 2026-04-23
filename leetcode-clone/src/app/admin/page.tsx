import Link from "next/link";

import { CreateProblemForm } from "@/app/admin/create-problem-form";
import { AppShell } from "@/components/shell";
import { requireAuth } from "@/lib/auth";
import { getAllProblems, getStats } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const [user, problems, stats] = await Promise.all([
    requireAuth("admin"),
    getAllProblems(),
    getStats(),
  ]);

  return (
    <AppShell
      heading="Admin control center"
      subheading="Manage the MCQ question bank, track platform usage, and review student accounts from one place."
      roleLabel="Admin portal"
      userName={user.name}
      actions={
        <Link
          href="/problems"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          View student side
        </Link>
      }
      navItems={[
        { href: "/admin", label: "Questions", active: true },
        { href: "/admin/users", label: "Users" },
        { href: "/problems", label: "Student portal" },
        { href: "/admin/add", label: "Add question" },
      ]}
    >
      <div className="grid gap-6">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-sm">
              <p className="text-sm text-slate-300">Published questions</p>
              <p className="mt-2 text-4xl font-black text-white">
                {stats.totalProblems}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-sm">
              <p className="text-sm text-slate-300">Submissions recorded</p>
              <p className="mt-2 text-4xl font-black text-white">
                {stats.totalSubmissions}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-sm">
              <p className="text-sm text-slate-300">Registered students</p>
              <p className="mt-2 text-4xl font-black text-white">
                {stats.totalUsers}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-sm">
              <p className="text-sm text-slate-300">Admin accounts</p>
              <p className="mt-2 text-4xl font-black text-white">
                {stats.totalAdmins}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-white/8 bg-white/4 p-0 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[140px_1fr_120px_120px] gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              <span>Created</span>
              <span>Problem</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            <div>
              {problems.map((problem, idx) => (
                <div
                  key={problem.id}
                  className={`grid grid-cols-[140px_1fr_120px_120px] gap-4 items-center px-6 py-4 ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-white/2"
                  } border-b border-white/6`}
                >
                  <div className="text-sm text-slate-300">{formatDate(problem.createdAt)}</div>
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{problem.title}</h3>
                        <p className="mt-1 text-xs text-slate-300">{problem.category} • <span className="text-amber-300">{problem.difficulty}</span></p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${problem.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {problem.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/questions/${problem.slug}/edit`}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/6"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
