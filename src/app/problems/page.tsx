import Link from "next/link";

import { StudentProgressSidebar } from "@/components/student-progress-sidebar";
import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { getAllProblems, getSubmissionsForUser } from "@/lib/db";
import { formatPercentage, getDifficultyTextClass } from "@/lib/utils";

type ProblemsPageProps = {
  searchParams: Promise<{ q?: string; difficulty?: string; category?: string }>;
};

function getSolvedProblemIds(userSubmissions: Awaited<ReturnType<typeof getSubmissionsForUser>>) {
  return new Set(
    userSubmissions
      .filter((submission) => submission.is_correct)
      .map((submission) => submission.question_id),
  );
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const user = await requireAuth();
  const [problems, submissions, resolvedSearchParams] = await Promise.all([
    getAllProblems(),
    getSubmissionsForUser(user.email),
    searchParams,
  ]);

  const search = (resolvedSearchParams.q ?? "").trim().toLowerCase();
  const solvedProblemIds = getSolvedProblemIds(submissions);

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      search.length === 0 ||
      problem.title.toLowerCase().includes(search);

    return matchesSearch;
  });

  const acceptanceByProblem = new Map(
    problems.map((problem) => {
      const attempts = submissions.filter(
        (submission) => submission.question_id === problem.id,
      );
      const accepted = attempts.filter((submission) => submission.is_correct).length;
      const acceptance = attempts.length === 0 ? 0 : (accepted / attempts.length) * 100;

      return [problem.id, acceptance];
    }),
  );

  return (
    <StudentShell
      userName={user.email}
      navItems={[
        { href: "/problems", label: "Problems", active: true },
        { href: "/submissions", label: "Submissions" },
        { href: "/mock-test", label: "Mock Test" },
      ]}
    >
      <div className="grid gap-7 xl:grid-cols-[1.72fr_0.54fr]">
        <section className="space-y-5">
          <form className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
            <input
              type="search"
              name="q"
              defaultValue={resolvedSearchParams.q ?? ""}
              placeholder="Search questions..."
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base text-slate-100 outline-none transition focus:border-sky-500"
            />
          </form>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div>{solvedProblemIds.size}/{problems.length} Solved</div>
              </div>
            </div>

            <div className="px-4 py-3">
              {filteredProblems.map((problem, index) => {
                const solved = solvedProblemIds.has(problem.id);
                const acceptance = acceptanceByProblem.get(problem.id) ?? 0;

                return (
                  <Link
                    key={problem.id}
                    href={`/problems/${problem.id}`}
                    className="group mb-3 flex items-center justify-between gap-4 rounded-full bg-white/2/5 border border-white/6 px-6 py-3 transition hover:bg-white/6 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/50 text-sm font-bold border border-white/8" aria-hidden>
                        {solved ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                          <span className="text-transparent">✓</span>
                        )}
                      </div>

                      <div>
                        <p className="text-base font-semibold text-white">
                          {index + 1}. {problem.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-sm text-slate-200">{formatPercentage(acceptance)}</div>
                      <div className="text-slate-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17a1 1 0 100-2 1 1 0 000 2z" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="7" width="18" height="11" rx="2" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 7V6a5 5 0 0110 0v1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {filteredProblems.length === 0 ? (
                <div className="px-7 py-10 text-sm text-slate-500">No questions matched your filters.</div>
              ) : null}
            </div>
          </section>
        </section>

        <StudentProgressSidebar problems={problems} submissions={submissions} />
      </div>
    </StudentShell>
  );
}
