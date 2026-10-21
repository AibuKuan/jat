"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  const { data: session } = authClient.useSession();

  const signedIn = Boolean(session);
  const destination = signedIn ? "/" : "/signin";
  const backLabel = signedIn ? "Back to app" : "Back to sign in";
  const doneLabel = signedIn ? "Continue to app" : "Go to sign in";
  const doneText = signedIn
    ? "Your password has been changed."
    : "You can now sign in with your new password.";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Could not reset password");
      return;
    }

    setDone(true);
  }

  if (tokenError || !token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <TriangleAlert className="h-8 w-8 text-rose-600" />
          <CardTitle>Link expired or invalid</CardTitle>
          <CardDescription>
            This password reset link can't be used. Request a new one and try
            again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href={destination} />}
          >
            {backLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <CardTitle>Password updated</CardTitle>
          <CardDescription>{doneText}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href={destination} />}
          >
            {doneLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
