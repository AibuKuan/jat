"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2, LogOut } from "lucide-react";

export function SignoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignout() {
    setPending(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
          router.refresh();
        },
        onError: () => setPending(false),
      },
    });
  }

  return (
    <Button variant='outline' onClick={handleSignout} disabled={pending}>
        {pending ? <Loader2 className='animate-spin' /> : <LogOut />}
        Sign out
    </Button>
  )
}
