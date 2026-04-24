import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateProblemForm } from "@/app/admin/create-problem-form";
import { AppShell } from "@/components/shell";
import { requireAuth } from "@/lib/auth";
import { getProblemBySlug } from "@/lib/db";

type EditQuestionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ updated?: string }>;
};

export default async function EditQuestionPage({
  params,
  searchParams,
}: EditQuestionPageProps) {
  const user = await requireAuth("admin");
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const problem = await getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  const updated = resolvedSearchParams.updated === "1";

  return (
    <AppShell
      heading={`Edit: ${problem.title}`}
      subheading="Update an existing question, change its answer options, or edit its explanation without recreating it from scratch."
      roleLabel="Admin portal"
      userName={user.name}
      actions={
        <Link
          href="/admin"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Back to questions
        </Link>
      }
      navItems={[
        { href: "/admin", label: "Questions", active: true },
        { href: "/admin/users", label: "Users" },
        { href: "/problems", label: "Student portal" },
        { href: "/admin/add", label: "Add question" },
      ]}
    >
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Edit question
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Update MCQ details
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Editing updates the existing question record and keeps it visible in
            the same admin question bank.
          </p>
        </div>

        {updated ? (
          <p className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Question updated successfully.
          </p>
        ) : null}

        <CreateProblemForm mode="edit" problem={problem} />
      </section>
    </AppShell>
  );
}
