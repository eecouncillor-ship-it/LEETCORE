import { MockForm } from "./form";
import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";
import { getPublishedProblems, getSubmissionsForUser, getMockResultsForUser } from "@/lib/db";
import type { MockResultRecord } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function MockTestPage() {
  const user = await requireAuth();
  const [problems, submissions, results] = await Promise.all([getPublishedProblems(), getSubmissionsForUser(user.email), getMockResultsForUser(user.id)]);
  const categories = Array.from(new Set(problems.map((p) => p.topic))).sort();

  return (
    <StudentShell
      userName={user.email}
      userRole={user.role}
      navItems={[
        { href: "/problems", label: "Problems" },
        { href: "/submissions", label: "Submissions" },
        { href: "/mock-test", label: "Mock Test", active: true },
        { href: "/contact-us", label: "Contact Us" },
      ]}
    >
      <div className="mx-auto max-w-[1400px] px-0">
        <div className="mb-6 flex flex-col gap-3">
          <h1 className="text-3xl font-black text-white">Mock Test</h1>
          <p className="max-w-3xl text-slate-300">Choose a topic and start a timed mock test made of random questions. The question palette on the left shows your progress while the current question appears on the right.</p>
        </div>
        <MockForm categories={categories} />
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-3">Mock test history</h2>
          {results.length === 0 ? (
            <div className="text-sm text-slate-400">No mock tests taken yet.</div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-300">{new Date(r.createdAt).toLocaleString()}</div>
                    <div className="text-sm font-semibold text-white">Score: {r.correct}/{r.total}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </StudentShell>
  );
}
