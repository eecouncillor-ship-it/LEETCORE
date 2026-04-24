import { formatPercentage, getDifficultyTextClass } from "@/lib/utils";
import type { ProblemRecord, SubmissionRecord } from "@/lib/types";

type ProgressSidebarProps = {
  problems: ProblemRecord[];
  submissions: SubmissionRecord[];
};

function getSolvedProblemIds(submissions: SubmissionRecord[]) {
  return new Set(
    submissions
      .filter((submission) => submission.isCorrect)
      .map((submission) => submission.problemId),
  );
}

export function StudentProgressSidebar({
  problems,
  submissions,
}: ProgressSidebarProps) {
  const solvedProblemIds = getSolvedProblemIds(submissions);
  const solvedCount = solvedProblemIds.size;
  const totalCount = problems.length;
  const completion =
    totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  const difficultyBreakdown = ["Easy", "Medium", "Hard"].map((difficulty) => ({
    difficulty,
    count: problems.filter((problem) => problem.difficulty === difficulty).length,
  }));

  const correctCount = submissions.filter((submission) => submission.isCorrect).length;
  const incorrectCount = submissions.length - correctCount;

  return (
    <aside className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white">Your Progress</h2>
        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="text-5xl font-black leading-none text-white">
            {solvedCount}
          </p>
          <p className="text-lg text-slate-300">/ {totalCount} solved</p>
        </div>
        <div className="mt-5 h-3 rounded-full bg-slate-800/40">
          <div
            className="h-3 rounded-full bg-sky-500 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="mt-4 text-sm text-slate-300">{completion}% complete</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white">By Difficulty</h2>
        <div className="mt-6 space-y-4 text-base">
          {difficultyBreakdown.map((item) => (
            <div key={item.difficulty} className="flex items-center justify-between">
              <span className={getDifficultyTextClass(item.difficulty)}>
                {item.difficulty}
              </span>
              <span className="text-slate-300">{item.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white">Submissions</h2>
        <div className="mt-6 space-y-4 text-base">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400">Correct</span>
            <span className="text-slate-300">{correctCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-400">Incorrect</span>
            <span className="text-slate-300">{incorrectCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Accuracy</span>
            <span className="text-slate-300">
              {submissions.length === 0
                ? "0.0%"
                : formatPercentage((correctCount / submissions.length) * 100)}
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
}
