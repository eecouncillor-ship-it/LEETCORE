import { StudentShell } from "@/components/student-shell";
import { requireAuth } from "@/lib/auth";
import { getMockSessionById, getProblemById } from "@/lib/db";
import Link from "next/link";

import ClientTimer from "../timer";
import { MockSessionForm } from "../session-form";

export const dynamic = 'force-dynamic';

export default async function MockSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const session = await getMockSessionById(id);

  console.log('[SESSION_PAGE] Retrieved session for ID:', id);
  console.log('[SESSION_PAGE] Session object:', session);
  console.log('[SESSION_PAGE] Session expiresAt:', session?.expiresAt);
  console.log('[SESSION_PAGE] Session expires_at (wrong key):', session ? (session as any).expires_at : 'N/A');

  if (!session || session.userId !== user.id) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="text-white">Mock test not found or expired.</div>
        <Link href="/mock-test" className="text-sky-300">Back</Link>
      </div>
    );
  }

  const problems = await Promise.all(session.problemIds.map((id: string) => getProblemById(id)));

  // Critical debug: Check if session is already expired
  console.log('[SESSION_PAGE] Session expiresAt:', session.expiresAt);
  console.log('[SESSION_PAGE] Current time:', new Date().toISOString());
  console.log('[SESSION_PAGE] Is session already expired?', new Date(session.expiresAt).getTime() <= new Date().getTime());

  return (
    <StudentShell
      userName={user.email}
      navItems={[
        { href: "/problems", label: "Problems" },
        { href: "/submissions", label: "Submissions" },
        { href: "/mock-test", label: "Mock Test", active: true },
      ]}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Mock Test</h1>
          <div className="text-sm text-slate-300">Ends at: {new Date(session.expiresAt).toLocaleString()}</div>
        </div>

        <div className="mb-4">
          <ClientTimer endTime={session.expiresAt} />
        </div>

        <MockSessionForm sessionId={session.id} problems={problems.filter(Boolean)} />
      </div>
    </StudentShell>
  );
}
