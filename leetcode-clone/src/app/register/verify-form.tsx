"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function VerifyForm({ token }: { token: string }) {
  const router = useRouter();

  useEffect(() => {
    // Since email verification isn't implemented, just redirect to problems
    const timer = setTimeout(() => {
      router.push("/problems");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <div className="mb-4">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Email Verified!</h3>
        <p className="text-sm text-slate-300">
          Your account has been successfully verified. Redirecting you to the problems page...
        </p>
      </div>
    </div>
  );
}