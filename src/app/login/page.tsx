import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/problems");
  }

  redirect("/");
}
