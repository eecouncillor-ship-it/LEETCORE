import { AppShell } from "@/components/shell";
import { requireAuth } from "@/lib/auth";
import { getStudentUsers, getSubmissionsForUser, getStats } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const user = await requireAuth("admin");
  const [students, stats] = await Promise.all([getStudentUsers(), getStats()]);

  const studentsWithStats = await Promise.all(
    students.map(async (student) => {
      const submissions = await getSubmissionsForUser(student.id);
      const solvedCount = new Set(
        submissions
          .filter((submission) => submission.isCorrect)
          .map((submission) => submission.problemId),
      ).size;

      return {
        ...student,
        submissionCount: submissions.length,
        solvedCount,
      };
    }),
  );

  return (
    <AppShell
      heading="Student accounts"
      subheading="Review all registered student accounts, when they joined, and how active they are on the platform."
      roleLabel="Admin portal"
      userName={user.name}
      navItems={[
        { href: "/admin", label: "Questions" },
        { href: "/admin/users", label: "Users", active: true },
        { href: "/problems", label: "Student portal" },
      ]}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Registered students</p>
            <p className="mt-2 text-4xl font-black text-slate-950">
              {stats.totalUsers}
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Published questions</p>
            <p className="mt-2 text-4xl font-black text-slate-950">
              {stats.totalProblems}
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total submissions</p>
            <p className="mt-2 text-4xl font-black text-slate-950">
              {stats.totalSubmissions}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.4fr_1.4fr_170px_170px_220px] gap-4 border-b border-slate-200 px-6 py-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Name</span>
            <span>Email</span>
            <span>Solved</span>
            <span>Submissions</span>
            <span>Joined</span>
          </div>

          {studentsWithStats.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-[1.4fr_1.4fr_170px_170px_220px] gap-4 border-b border-slate-100 px-6 py-5"
            >
              <div>
                <p className="font-semibold text-slate-950">{student.name}</p>
                <p className="mt-1 text-sm text-slate-500">Student account</p>
              </div>
              <div className="text-sm text-slate-700">{student.email}</div>
              <div className="text-sm font-semibold text-emerald-700">
                {student.solvedCount}
              </div>
              <div className="text-sm text-slate-700">{student.submissionCount}</div>
              <div className="text-sm text-slate-500">
                {formatDate(student.createdAt)}
              </div>
            </div>
          ))}

          {studentsWithStats.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              No student accounts are registered yet.
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
