import Link from "next/link";

import { CreateProblemForm } from "@/app/admin/create-problem-form";
import { AppShell } from "@/components/shell";
import { requireAuth } from "@/lib/auth";
import { getAllProblems, getStats } from "@/lib/db";
import { formatDate } from "@/lib/utils";

type AdminPageProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [user, problems, stats, resolvedSearchParams] = await Promise.all([
    requireAuth("admin"),
    getAllProblems(),
    getStats(),
    searchParams,
  ]);

  const created = resolvedSearchParams.created === "1";

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
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Published questions</p>
              <p className="mt-2 text-4xl font-black text-slate-950">
                {stats.totalProblems}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Submissions recorded</p>
              <p className="mt-2 text-4xl font-black text-slate-950">
                {stats.totalSubmissions}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Registered students</p>
              <p className="mt-2 text-4xl font-black text-slate-950">
                {stats.totalUsers}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Admin accounts</p>
              <p className="mt-2 text-4xl font-black text-slate-950">
                {stats.totalAdmins}
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Existing catalog
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Current questions
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {problems.length} total
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        {problem.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {problem.category} - {problem.difficulty} - Created{" "}
                        {formatDate(problem.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          problem.published
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {problem.published ? "Published" : "Draft"}
                      </span>
                      <Link
                        href={`/admin/questions/${problem.slug}/edit`}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-white"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">
                    {problem.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Create question
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Add a new MCQ
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Questions you create here become the source of truth for students.
            </p>
          </div>

          {created ? (
            <p className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Question created successfully and added to the question bank.
            </p>
          ) : null}

          <CreateProblemForm />
        </section>
      </div>
    </AppShell>
  );
}
