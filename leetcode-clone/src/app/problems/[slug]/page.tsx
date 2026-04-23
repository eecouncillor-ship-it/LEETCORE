import { notFound } from "next/navigation";

import { SubmissionForm } from "@/app/problems/[slug]/submission-form";
import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";
import {
  getProblemBySlug,
  getSubmissionsForProblem,
  getSubmissionsForUser,
} from "@/lib/db";
import { formatDate, getDifficultyTextClass } from "@/lib/utils";

type ProblemPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProblemPage({ params }: ProblemPageProps) {
  const user = await requireAuth();
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);

  if (!problem || !problem.published) {
    notFound();
  }

  const [userSubmissions, allSubmissions] = await Promise.all([
    getSubmissionsForUser(user.id),
    getSubmissionsForProblem(problem.id),
  ]);

  const filteredSubmissions = userSubmissions.filter(
    (submission) => submission.problemId === problem.id,
  );

  return (
    <StudentShell
      userName={user.name}
      navItems={[
        { href: "/problems", label: "Problems", active: true },
        { href: "/submissions", label: "Submissions" },
      ]}
    >
      <div className="grid gap-7 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-sm font-semibold ${getDifficultyTextClass(
                problem.difficulty,
              )}`}
            >
              {problem.difficulty}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              {problem.category}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              {allSubmissions.length} attempts
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-white">
            {problem.title}
          </h1>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-white">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-300">
              {problem.description}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-white">
              Constraints and Notes
            </h2>
            <ul className="mt-4 space-y-3">
              {problem.constraints.map((constraint) => (
                <li
                  key={constraint}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                >
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-sm">
            <SubmissionForm slug={problem.slug} options={problem.options} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Your attempts
            </h2>
            <div className="mt-5 space-y-4">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-semibold text-white">
                        You chose {submission.selectedOptionId}
                      </p>
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          submission.isCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      Submitted {formatDate(submission.submittedAt)}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      Correct answer: {submission.correctOptionId} - {" "}
                      {submission.correctOptionText}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Submit an answer to start your history for this question.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
