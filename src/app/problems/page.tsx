import Link from "next/link";

import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { getAllProblems, getSubmissionsForUser } from "@/lib/db";
import { formatPercentage, getDifficultyTextClass } from "@/lib/utils";

type ProblemsPageProps = {
  searchParams: Promise<{ q?: string; difficulty?: string; category?: string; topic?: string; sort?: string }>;
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
  const difficultyFilter = (resolvedSearchParams.difficulty ?? "").trim();
  const topicFilter = (resolvedSearchParams.topic ?? "").trim();
  const sortBy = (resolvedSearchParams.sort ?? "number").trim();
  const solvedProblemIds = getSolvedProblemIds(submissions);

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      search.length === 0 ||
      problem.title.toLowerCase().includes(search);

    const matchesDifficulty =
      difficultyFilter.length === 0 ||
      problem.difficulty === difficultyFilter;

    const matchesTopic =
      topicFilter.length === 0 ||
      problem.topic === topicFilter;

    return matchesSearch && matchesDifficulty && matchesTopic;
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

  const totalAcceptedSubmissions = submissions.filter((submission) => submission.is_correct).length;
  const acceptanceRate = submissions.length === 0 ? 0 : (totalAcceptedSubmissions / submissions.length) * 100;
  const solvedCount = solvedProblemIds.size;
  const solvedProblems = problems.filter((problem) => solvedProblemIds.has(problem.id));
  const solvedDifficultyCounts = {
    Easy: solvedProblems.filter((problem) => problem.difficulty === "Easy").length,
    Medium: solvedProblems.filter((problem) => problem.difficulty === "Medium").length,
    Hard: solvedProblems.filter((problem) => problem.difficulty === "Hard").length,
  };
  const beatRate = Math.min(
    95,
    Math.max(
      55,
      Math.round(55 + acceptanceRate / 100 * 15 + solvedCount / Math.max(1, problems.length) * 20),
    ),
  );

  // Sort problems
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (sortBy === "acceptance") {
      const acceptA = acceptanceByProblem.get(a.id) ?? 0;
      const acceptB = acceptanceByProblem.get(b.id) ?? 0;
      return acceptB - acceptA;
    }
    if (sortBy === "difficulty") {
      const diffOrder = { Easy: 0, Medium: 1, Hard: 2 };
      return diffOrder[a.difficulty as keyof typeof diffOrder] - diffOrder[b.difficulty as keyof typeof diffOrder];
    }
    return 0; // default by number
  });

  // Extract unique topics from problems
  const uniqueTopics = Array.from(new Set(problems.map((p) => p.topic))).sort();
  const topics = ["All Topics", ...uniqueTopics];

  return (
    <StudentShell
      userName={user.email}
      userRole={user.role}
      navItems={[
        { href: "/problems", label: "Problems", active: true },
        { href: "/submissions", label: "Submissions" },
        { href: "/mock-test", label: "Mock Test" },
      ]}
    >
      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr] w-full">
        <div className="space-y-5">
          {/* Topic Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-[600px]">
            {topics.map((topic) => {
              const isActive = topic === "All Topics" 
                ? topicFilter === "" 
                : topic === topicFilter;
              const topicValue = topic === "All Topics" ? "" : topic;
              const href = topicValue === ""
                ? `/problems?${new URLSearchParams([
                    ...(resolvedSearchParams.q ? [["q", resolvedSearchParams.q]] : []),
                    ...(resolvedSearchParams.difficulty ? [["difficulty", resolvedSearchParams.difficulty]] : []),
                  ]).toString()}`
                : `/problems?topic=${topicValue}${resolvedSearchParams.q ? `&q=${resolvedSearchParams.q}` : ""}${resolvedSearchParams.difficulty ? `&difficulty=${resolvedSearchParams.difficulty}` : ""}`;

              return (
                <Link
                  key={topic}
                  href={href}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                    isActive
                      ? "bg-white/20 border-white/30 text-white"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {topic}
                </Link>
              );
            })}
          </div>

          <form className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                name="q"
                defaultValue={resolvedSearchParams.q ?? ""}
                placeholder="Search questions"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 text-sm text-slate-100 outline-none transition focus:border-sky-500"
              />
            </div>
            <button type="submit" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-300 hover:bg-white/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4a1 1 0 011-1h4.586a1 1 0 01.707.293l10 10a1 1 0 010 1.414l-10 10a1 1 0 01-.707.293H4a1 1 0 01-1-1V4z" />
                <path d="M16 5l4 4m0 0l-4 4" />
              </svg>
            </button>
          </form>

          <div className="text-sm text-slate-300">{solvedProblemIds.size}/{problems.length} Solved</div>

          {/* Difficulty Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {["All", "Easy", "Medium", "Hard"].map((difficulty) => {
              const isActive = difficulty === "All" 
                ? difficultyFilter === "" 
                : difficulty === difficultyFilter;
              const difficultyColor = difficulty === "Easy" 
                ? "text-green-400 border-green-400/50 hover:bg-green-400/10" 
                : difficulty === "Medium" 
                ? "text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10" 
                : difficulty === "Hard" 
                ? "text-red-400 border-red-400/50 hover:bg-red-400/10" 
                : "text-slate-400 border-slate-400/50 hover:bg-slate-400/10";

              const href = difficulty === "All"
                ? `/problems?${new URLSearchParams([
                    ...(resolvedSearchParams.q ? [["q", resolvedSearchParams.q]] : []),
                    ...(topicFilter ? [["topic", topicFilter]] : []),
                  ]).toString()}`
                : `/problems?difficulty=${difficulty}${resolvedSearchParams.q ? `&q=${resolvedSearchParams.q}` : ""}${topicFilter ? `&topic=${topicFilter}` : ""}`;

              return (
                <Link
                  key={difficulty}
                  href={href}
                  className={`rounded-full border px-4 py-1 text-xs font-medium transition ${
                    isActive
                      ? `${difficultyColor} bg-white/10`
                      : `${difficultyColor} opacity-50`
                  }`}
                >
                  {difficulty}
                </Link>
              );
            })}
          </div>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="divide-y divide-white/10">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-white/2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-1"></div>
                <div className="col-span-6">Title</div>
                <div className="col-span-2 text-right">Acceptance</div>
                <div className="col-span-2 text-right">Difficulty</div>
                <div className="col-span-1"></div>
              </div>

              {/* Problem Rows */}
              {sortedProblems.map((problem, sortedIndex) => {
                const solved = solvedProblemIds.has(problem.id);
                const acceptance = acceptanceByProblem.get(problem.id) ?? 0;
                const originalIndex = problems.findIndex(p => p.id === problem.id) + 1;
                const difficultyColor = problem.difficulty === "Easy" 
                  ? "text-green-400" 
                  : problem.difficulty === "Medium" 
                  ? "text-yellow-400" 
                  : "text-red-400";

                return (
                  <Link
                    key={problem.id}
                    href={`/problems/${problem.slug}`}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition border-b border-white/5 last:border-b-0"
                  >
                    {/* Status Icon */}
                    <div className="col-span-1 flex justify-center">
                      {solved ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17l-5-5" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20"></div>
                      )}
                    </div>

                    {/* Problem Number and Title */}
                    <div className="col-span-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{originalIndex}.</span>
                        <div>
                          <p className="text-sm font-medium text-white hover:text-sky-300">{problem.title}</p>
                          <p className="text-xs text-slate-500">{problem.topic}</p>
                        </div>
                      </div>
                    </div>

                    {/* Acceptance Rate */}
                    <div className="col-span-2 text-right">
                      <span className="text-sm text-slate-300">{formatPercentage(acceptance)}</span>
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-2 text-right">
                      <span className={`inline-block text-sm font-semibold ${difficultyColor}`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {/* Lock Icon */}
                    <div className="col-span-1 flex justify-end">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                      </svg>
                    </div>
                  </Link>
                );
              })}

              {sortedProblems.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  No questions matched your filters.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">SOLVED</p>
                <p className="mt-1 text-2xl font-black text-white">{solvedCount}</p>
              </div>
              <div
                className="rounded-full bg-sky-500/20 px-2.5 py-1 text-xs font-semibold text-sky-300 cursor-help transition hover:bg-sky-500/30"
                title={`You are better than ${beatRate}% of students`}
              >
                {beatRate}%
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Acceptance</span>
                  <span>{formatPercentage(acceptanceRate)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-emerald-400"
                    style={{ width: `${Math.min(100, Math.round(acceptanceRate))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Solved</span>
                  <span>{problems.length === 0 ? "0%" : formatPercentage((solvedCount / problems.length) * 100)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-sky-400"
                    style={{ width: `${Math.min(100, Math.round((solvedCount / Math.max(1, problems.length)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Submissions</span>
                  <span>{submissions.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">DIFFICULTY</p>
            <div className="mt-3 flex h-8 gap-0.5 rounded-lg overflow-hidden bg-slate-950/50">
              {(["Easy", "Medium", "Hard"] as const).map((difficulty) => {
                const count = solvedDifficultyCounts[difficulty];
                const width = problems.length === 0 ? 0 : (count / Math.max(1, problems.length)) * 100;
                const color =
                  difficulty === "Easy"
                    ? "bg-emerald-500"
                    : difficulty === "Medium"
                    ? "bg-yellow-500"
                    : "bg-rose-500";

                return (
                  <div
                    key={difficulty}
                    className={`${color} transition-all`}
                    style={{ width: `${Math.max(2, width)}%` }}
                    title={`${difficulty}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              {(["Easy", "Medium", "Hard"] as const).map((difficulty) => {
                const count = solvedDifficultyCounts[difficulty];
                const color =
                  difficulty === "Easy"
                    ? "text-emerald-400"
                    : difficulty === "Medium"
                    ? "text-yellow-400"
                    : "text-rose-400";

                return (
                  <div key={difficulty} className="flex-1">
                    <span className={`font-semibold ${color}`}>{count}</span>
                    <p className="text-slate-500 text-xs">{difficulty}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </StudentShell>
  );
}
