import Link from "next/link";
import { AppShell } from "@/components/shell";
import { requireAuth } from "@/lib/auth";
import { getStudentUsers, getSubmissionsForUser, getStats, getAllProblems } from "@/lib/db";
import { formatDate, formatPercentage } from "@/lib/utils";
import { toggleUserBlockAction } from "@/app/admin/actions";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await requireAuth("admin");
  const [students, stats] = await Promise.all([getStudentUsers(), getStats()]);

  const problems = await getAllProblems();
  const problemById = new Map(problems.map((p) => [p.id, p]));

  const studentsWithStats = await Promise.all(
    students.map(async (student) => {
      const submissions = await getSubmissionsForUser(student.id);
      const solvedCount = new Set(
        submissions
          .filter((submission) => submission.is_correct)
          .map((submission) => submission.question_id),
      ).size;

      const correctCount = submissions.filter((s) => s.is_correct).length;
      const accuracy = submissions.length === 0 ? 0 : (correctCount / submissions.length) * 100;

      return {
        ...student,
        submissionCount: submissions.length,
        solvedCount,
        correctCount,
        accuracy,
        submissions,
        solvedProblemIds: Array.from(new Set(submissions.filter((s) => s.is_correct).map((s) => s.question_id))),
      };
    }),
  );

  return (
    <AppShell
      heading="Student accounts"
      subheading="Review all registered student accounts, when they joined, and how active they are on the platform."
      roleLabel="Admin portal"
      userName={user.email}
      navItems={[
        { href: "/admin", label: "Questions" },
        { href: "/admin/users", label: "Users", active: true },
        { href: "/problems", label: "Student portal" },
        { href: "/admin/add", label: "Add question" },
      ]}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-sm">
            <p className="text-sm text-slate-300">Registered students</p>
            <p className="mt-2 text-4xl font-black text-white">
              {stats.totalUsers}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-sm">
            <p className="text-sm text-slate-300">Published questions</p>
            <p className="mt-2 text-4xl font-black text-white">
              {stats.totalProblems}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-sm">
            <p className="text-sm text-slate-300">Total submissions</p>
            <p className="mt-2 text-4xl font-black text-white">
              {stats.totalSubmissions}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-sm">
          <div className="grid grid-cols-[1.2fr_1.2fr_100px_100px_100px_160px_120px] gap-4 border-b border-white/10 px-6 py-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            <span>Name</span>
            <span>Email</span>
            <span>Solved</span>
            <span>Submissions</span>
            <span>Accuracy</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>

          {studentsWithStats.map((student) => (
            <details key={student.id} className="group border-b border-white/10">
              <summary className="list-none grid grid-cols-[1.2fr_1.2fr_100px_100px_100px_120px] gap-4 px-6 py-5 items-center cursor-pointer">
                <div>
                  <div className="font-semibold text-white">{student.email}</div>
                  <p className="mt-1 text-sm text-slate-300">Student account</p>
                </div>
                <div className="text-sm text-slate-200">{student.email}</div>
                <div className="text-sm font-semibold text-emerald-400">{student.solvedCount}</div>
                <div className="text-sm text-slate-200">{student.submissionCount}</div>
                <div className="text-sm text-slate-200">{formatPercentage(student.accuracy)}</div>
                <div>
                  <form action={toggleUserBlockAction}>
                    <input type="hidden" name="userId" value={student.id} />
                    <input type="hidden" name="block" value="0" />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-2 text-sm font-semibold transition bg-rose-500 text-white`}
                    >
                      Block
                    </button>
                  </form>
                </div>
              </summary>

              <div className="bg-white/2 px-6 pb-6">
                <div className="grid gap-4 sm:grid-cols-3 pt-4">
                  <div className="rounded-[12px] border border-white/6 bg-white/4 p-4">
                    <p className="text-sm text-slate-300">Submissions</p>
                    <p className="mt-2 text-2xl font-black text-white">{student.submissionCount}</p>
                  </div>
                  <div className="rounded-[12px] border border-white/6 bg-white/4 p-4">
                    <p className="text-sm text-slate-300">Problems solved</p>
                    <p className="mt-2 text-2xl font-black text-white">{student.solvedCount}</p>
                  </div>
                  <div className="rounded-[12px] border border-white/6 bg-white/4 p-4">
                    <p className="text-sm text-slate-300">Accuracy</p>
                    <p className="mt-2 text-2xl font-black text-white">{formatPercentage(student.accuracy)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-white">Recent submissions</h4>
                  <div className="mt-3 grid gap-2">
                    {student.submissions.slice(0, 8).map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm text-slate-200">
                        <div>{(problemById.get(s.question_id) || { title: 'Unknown' }).title}</div>
                        <div className={`font-semibold ${s.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>{s.is_correct ? 'Correct' : 'Incorrect'}</div>
                      </div>
                    ))}
                    {student.submissions.length === 0 ? <div className="text-sm text-slate-300">No submissions yet.</div> : null}
                  </div>
                </div>
              </div>
            </details>
          ))}

          {studentsWithStats.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-300">
              No student accounts are registered yet.
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
