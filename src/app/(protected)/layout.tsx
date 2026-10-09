import { GuestBanner } from "@/components/guest-banner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/signin");

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <GuestBanner />
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">{children}</div>
    </div>
  );
}
