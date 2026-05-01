import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function DashboardRedirectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(user.role === "admin" ? "/admin" : "/problems");
}
