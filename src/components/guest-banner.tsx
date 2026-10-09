"use client";

import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";

export function GuestBanner() {
  const { data: session } = authClient.useSession();

  if (!session?.user.isAnonymous) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0 border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      <TriangleAlert className="h-4 w-4" />
      <AlertTitle>You're using a guest account</AlertTitle>
      <AlertDescription>
        Guest accounts are deleted after 30 days of inactivity. If you sign out,
        you can't log back in and your data will be lost.
      </AlertDescription>
    </Alert>
  );
}