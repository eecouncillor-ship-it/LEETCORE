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
        <MockForm categories={categories} results={results} />
      </div>
    </StudentShell>
  );
}
