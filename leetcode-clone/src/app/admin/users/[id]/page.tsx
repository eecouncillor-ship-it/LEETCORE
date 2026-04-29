import Link from "next/link";

import { AppShell } from "@/components/shell";
import { requireAuth } from "@/lib/auth";
import { getUserById, getSubmissionsForUser, getAllProblems } from "@/lib/db";
import { formatDate, formatPercentage } from "@/lib/utils";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>
};

export default async function AdminUserDetail({ params }: Props) {
  const { id } = await params;
  const user = await requireAuth("admin");
  const target = await getUserById(id);
  
  if (!target) {
    return (
      <AppShell
        heading="User not found"
        subheading=""
        roleLabel="Admin"
        userName={user.email}
        navItems={[
          { href: "/admin", label: "Questions" },
          { href: "/admin/users", label: "Users", active: true },
        ]}
      >
        <div className="p-6">No such user.</div>
      </AppShell>
    );
  }

  const [submissions, problems] = await Promise.all([
    getSubmissionsForUser(target.email),
    getAllProblems(),
  ]);

  const totalSubmissions = submissions.length;
  const solvedProblemIds = new Set(submissions.filter((s) => s.is_correct).map((s) => s.question_id));
  const solvedCount = solvedProblemIds.size;
  const problemById = new Map(problems.map((p) => [p.id, p]));
  const topicsMap = new Map<string, number>();

  for (const pid of solvedProblemIds) {
    const prob = problemById.get(pid);
    const cat = "MCQ";
    topicsMap.set(cat, (topicsMap.get(cat) ?? 0) + 1);
  }

  const topics = Array.from(topicsMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <AppShell
      heading={`${target.email}`}
      subheading={`Performance summary for this user`}
      roleLabel="Admin"
      userName={user.email}
      navItems={[
        { href: "/admin", label: "Questions" },
        { href: "/admin/users", label: "Users", active: true },
      ]}
      actions={
        <Link href="/admin/users" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">
          Back
        </Link>
      }
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">Submissions</p>
            <p className="mt-3 text-3xl font-black text-white">{totalSubmissions}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">Problems solved</p>
            <p className="mt-3 text-3xl font-black text-white">{solvedCount}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">Topics solved</p>
            <p className="mt-3 text-3xl font-black text-white">{topics.length}</p>
          </div>
        </div>
        <section className="rounded-[20px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">Topics breakdown</h3>
          <div className="mt-4 grid gap-3">
            {topics.length === 0 ? (
              <div className="text-sm text-slate-300">No solved topics yet.</div>
            ) : (
              topics.map(([topic, count]) => (
                <div key={topic} className="flex items-center justify-between">
                  <div className="text-sm text-slate-200">{topic}</div>
                  <div className="text-sm font-semibold text-white">{count}</div>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="rounded-[20px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">Recent submissions</h3>
          <div className="mt-4 grid gap-3">
            {submissions.slice(0, 12).map((s) => {
              const prob = problemById.get(s.question_id);
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{prob?.title ?? 'Unknown problem'}</div>
                    <div className="text-xs text-slate-300">{formatDate(s.created_at)}</div>
                  </div>
                  <div className={`text-sm font-semibold ${s.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.is_correct ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
              );
            })}
            {submissions.length === 0 ? <div className="text-sm text-slate-300">No submissions yet.</div> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
