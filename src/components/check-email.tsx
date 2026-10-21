"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const COOLDOWN_SECONDS = 60;

export function CheckEmail({
  email,
  onBack,
  callbackURL = "/",
}: {
  email: string;
  onBack?: () => void;
  callbackURL?: string;
}) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    setSending(true);
    setStatus(null);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL,
    });
    setSending(false);
    if (error) {
      setStatus({
        type: "error",
        text: error.message ?? "Could not send the email",
      });
      return;
    }
    setStatus({ type: "success", text: "Verification email sent." });
    setCooldown(COOLDOWN_SECONDS);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <Mail className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click
          the link to verify your account, then sign in.
        </p>
        <p className="text-xs text-muted-foreground">
          Can't find it? Check your spam folder.
        </p>
      </div>

      {status && (
        <p
          className={
            status.type === "error"
              ? "text-sm text-rose-600"
              : "text-sm text-emerald-600"
          }
        >
          {status.text}
        </p>
      )}

      <div className="flex w-full flex-col gap-2">
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={sending || cooldown > 0}
        >
          {sending && <Loader2 className="animate-spin" />}
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
        </Button>
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
      </div>
    </div>
  );
}