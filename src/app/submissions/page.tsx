import Link from "next/link";

import { StudentProgressSidebar } from "@/components/student-progress-sidebar";
import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { getPublishedProblems, getSubmissionsForUser } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function SubmissionsPage() {
  const user = await requireAuth();
  const [problems, submissions] = await Promise.all([
    getPublishedProblems(),
    getSubmissionsForUser(user.id),
  ]);

  const problemTitleById = new Map(
    problems.map((problem) => [problem.id, problem.title]),
  );

  return (
    <StudentShell
      userName={user.name}
      navItems={[
        { href: "/problems", label: "Problems" },
        { href: "/submissions", label: "Submissions", active: true },
        { href: "/mock-test", label: "Mock Test" },
      ]}
    >
      <div className="grid gap-7 xl:grid-cols-[1.72fr_0.54fr]">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-sm">
          <div className="border-b border-white/10 px-7 py-6">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Submissions
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Review every attempt, your selected answer, and the correct answer.
            </p>
          </div>

          <div className="grid grid-cols-[1.65fr_140px_140px_150px_220px] gap-4 border-b border-white/10 px-7 py-5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">
            <span>Question</span>
            <span>Picked</span>
            <span>Correct</span>
            <span>Status</span>
            <span>Submitted</span>
          </div>

          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="grid grid-cols-[1.65fr_140px_140px_150px_220px] items-center gap-4 border-b border-white/10 px-7 py-6"
            >
              <div>
                <p className="text-base font-semibold text-white">
                  {problemTitleById.get(submission.problemId) ?? "Question"}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {submission.selectedOptionText}
                </p>
              </div>

              <span className="text-sm text-slate-200">
                {submission.selectedOptionId}
              </span>

              <span className="text-sm text-slate-200">
                {submission.correctOptionId}
              </span>

              <span
                className={`justify-self-start rounded-full px-4 py-2 text-base font-semibold ${
                  submission.isCorrect
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {submission.status}
              </span>

              <span className="text-sm text-slate-300">
                {formatDate(submission.submittedAt)}
              </span>
            </div>
          ))}

          {submissions.length === 0 ? (
            <div className="px-7 py-10 text-sm text-slate-300">
              No submissions yet. Open the{" "}
              <Link href="/problems" className="font-semibold text-sky-300">
                Problems
              </Link>{" "}
              tab and answer your first question.
            </div>
          ) : null}
        </section>

        <StudentProgressSidebar problems={problems} submissions={submissions} />
      </div>
    </StudentShell>
  );
}
