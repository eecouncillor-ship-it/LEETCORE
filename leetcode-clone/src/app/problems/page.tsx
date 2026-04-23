import Link from "next/link";

import { StudentProgressSidebar } from "@/components/student-progress-sidebar";
import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";
import { getPublishedProblems, getSubmissionsForUser } from "@/lib/db";
import { formatPercentage, getDifficultyTextClass } from "@/lib/utils";

type ProblemsPageProps = {
  searchParams: Promise<{ q?: string; difficulty?: string; category?: string }>;
};

function getSolvedProblemIds(userSubmissions: Awaited<ReturnType<typeof getSubmissionsForUser>>) {
  return new Set(
    userSubmissions
      .filter((submission) => submission.isCorrect)
      .map((submission) => submission.problemId),
  );
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const user = await requireAuth();
  const [problems, submissions, resolvedSearchParams] = await Promise.all([
    getPublishedProblems(),
    getSubmissionsForUser(user.id),
    searchParams,
  ]);

  const search = (resolvedSearchParams.q ?? "").trim().toLowerCase();
  const difficultyFilter = (resolvedSearchParams.difficulty ?? "").trim();
  const categoryFilter = (resolvedSearchParams.category ?? "").trim();
  const solvedProblemIds = getSolvedProblemIds(submissions);
  const categories = Array.from(new Set(problems.map((problem) => problem.category))).sort();

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      search.length === 0 ||
      problem.title.toLowerCase().includes(search) ||
      problem.category.toLowerCase().includes(search) ||
      problem.tags.some((tag) => tag.toLowerCase().includes(search));

    const matchesDifficulty =
      difficultyFilter.length === 0 || problem.difficulty === difficultyFilter;

    const matchesCategory =
      categoryFilter.length === 0 || problem.category === categoryFilter;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const acceptanceByProblem = new Map(
    problems.map((problem) => {
      const attempts = submissions.filter(
        (submission) => submission.problemId === problem.id,
      );
      const accepted = attempts.filter((submission) => submission.isCorrect).length;
      const acceptance = attempts.length === 0 ? 0 : (accepted / attempts.length) * 100;

      return [problem.id, acceptance];
    }),
  );

  return (
    <StudentShell
      userName={user.name}
      navItems={[
        { href: "/problems", label: "Problems", active: true },
        { href: "/submissions", label: "Submissions" },
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
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-700 outline-none transition focus:border-sky-500"
            />

            <select
              name="difficulty"
              defaultValue={difficultyFilter}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-700 outline-none transition focus:border-sky-500"
            >
              <option value="">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              name="category"
              defaultValue={categoryFilter}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-700 outline-none transition focus:border-sky-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </form>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[110px_1.9fr_180px_180px_170px] gap-4 border-b border-slate-200 px-7 py-5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              <span>Status</span>
              <span>Title</span>
              <span>Acceptance</span>
              <span>Difficulty</span>
              <span>Category</span>
            </div>

            {filteredProblems.map((problem, index) => {
              const solved = solvedProblemIds.has(problem.id);
              const acceptance = acceptanceByProblem.get(problem.id) ?? 0;

              return (
                <Link
                  key={problem.id}
                  href={`/problems/${problem.slug}`}
                  className="grid grid-cols-[110px_1.9fr_180px_180px_170px] items-center gap-4 border-b border-slate-100 px-7 py-6 transition hover:bg-slate-50"
                >
                  <div className="flex items-center">
                    <span
                      className={`flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold ${
                        solved
                          ? "border-emerald-500 text-emerald-500"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {index + 1}. {problem.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {problem.tags.join(", ") || "General"}
                    </p>
                  </div>

                  <span className="text-sm text-slate-700">
                    {formatPercentage(acceptance)}
                  </span>

                  <span
                    className={`text-sm font-semibold ${getDifficultyTextClass(
                      problem.difficulty,
                    )}`}
                  >
                    {problem.difficulty}
                  </span>

                  <span className="justify-self-start rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                    {problem.category}
                  </span>
                </Link>
              );
            })}

            {filteredProblems.length === 0 ? (
              <div className="px-7 py-10 text-sm text-slate-500">
                No questions matched your filters.
              </div>
            ) : null}
          </section>
        </section>

        <StudentProgressSidebar problems={problems} submissions={submissions} />
      </div>
    </StudentShell>
  );
}
