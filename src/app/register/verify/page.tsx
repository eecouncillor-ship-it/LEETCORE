import { VerifyForm } from "../verify-form";

export const dynamic = 'force-dynamic';

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token: tokenParam } = await searchParams;
  const token = tokenParam ?? "";

  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-2xl font-black text-white mb-4">Verify your email</h2>
      {token ? (
        <VerifyForm token={token} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          Missing token. Please use the link provided after registration.
        </div>
      )}
    </div>
  );
}
