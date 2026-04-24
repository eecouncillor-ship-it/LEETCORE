import { MockForm } from "./form";
import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";
import { getPublishedProblems, getSubmissionsForUser } from "@/lib/db";
import { getMockResultsForUser } from "@/lib/db";

export default async function MockTestPage() {
  const user = await requireAuth();
  const [problems, submissions, results] = await Promise.all([getPublishedProblems(), getSubmissionsForUser(user.id), getMockResultsForUser(user.id)]);
  const categories = Array.from(new Set(problems.map((p: any) => p.category))).sort();

  return (
    <StudentShell
      userName={user.name}
      navItems={[
        { href: "/problems", label: "Problems" },
        { href: "/submissions", label: "Submissions" },
        { href: "/mock-test", label: "Mock Test", active: true },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-black text-white mb-4">Mock Test</h1>
        <p className="mb-4 text-slate-300">Choose a topic and start a timed mock test made of random questions.</p>
        <MockForm categories={categories} />
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-3">Mock test history</h2>
          {results.length === 0 ? (
            <div className="text-sm text-slate-400">No mock tests taken yet.</div>
          ) : (
            <div className="space-y-3">
              {results.map((r: any) => (
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
