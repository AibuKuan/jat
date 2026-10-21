"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { setPasswordAction } from "@/app/actions/account";
import { CheckEmail } from "./check-email";

const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

type Message = { type: "error" | "success"; text: string } | null;

function getInitials(name?: string | null) {
  if (!name) return "G";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function providerLabel(providerId: string) {
  if (providerId === "credential") return "Email & password";
  if (providerId === "google") return "Google";
  return providerId;
}

export function AccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isGuest = Boolean(user?.isAnonymous);

  const [providers, setProviders] = useState<string[] | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState(false);
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user || isGuest) return;
    authClient.listAccounts().then(({ data }) => {
      setProviders(data?.map((account) => account.providerId) ?? []);
    });
  }, [open, user?.id, isGuest]);

  const hasPassword = providers?.includes("credential") ?? false;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setMessage(null);
      setShowSetPassword(false);
      setNewPassword("");
      setVerifyEmail(null);
    }
    onOpenChange(next);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await authClient.signUp.email({
      ...signUpForm,
      callbackURL: "/",
    });
    setBusy(false);
    if (error) {
      setMessage({ type: "error", text: error.message ?? "Sign up failed" });
      return;
    }
    setVerifyEmail(signUpForm.email);
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  }

  async function handleResetPassword() {
    if (!user) return;
    setBusy(true);
    setMessage(null);
    const { error } = await authClient.requestPasswordReset({
      email: user.email,
      redirectTo: "/reset-password",
    });
    setBusy(false);
    setMessage(
      error
        ? { type: "error", text: error.message ?? "Could not send reset email" }
        : { type: "success", text: "Check your email for a reset link." },
    );
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await setPasswordAction(newPassword);
    setBusy(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setProviders((prev) => [...(prev ?? []), "credential"]);
    setShowSetPassword(false);
    setNewPassword("");
    setMessage({ type: "success", text: "Password set." });
  }

  async function handleDelete() {
    setBusy(true);
    setMessage(null);
    const { error } = await authClient.deleteUser();
    if (error) {
      setMessage({
        type: "error",
        text: error.message ?? "Could not delete account",
      });
      setBusy(false);
      return;
    }
    router.push("/signin");
    router.refresh();
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>
            Manage your profile, password and data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>
              {getInitials(isGuest ? "Guest" : user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {isGuest ? "Guest" : user.name}
            </p>
            {!isGuest && (
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className={labelClass}>Sign-in</span>
            <div className="flex gap-1.5">
              {isGuest && <Badge variant="secondary">Guest</Badge>}
              {providers?.map((id) => (
                <Badge key={id} variant="secondary">
                  {providerLabel(id)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Member since</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {message && (
          <p
            className={
              message.type === "error"
                ? "text-sm text-rose-600"
                : "text-sm text-emerald-600"
            }
          >
            {message.text}
          </p>
        )}

        <Separator />

        {isGuest ? (
          verifyEmail ? (
            <CheckEmail
              email={verifyEmail}
              onBack={() => setVerifyEmail(null)}
            />
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Create an account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up to keep your applications. Your guest data is
                  transferred to the new account.
                </p>
              </div>
              <form onSubmit={handleSignUp} className="space-y-3">
                <Input
                  required
                  placeholder="Name"
                  value={signUpForm.name}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, name: e.target.value })
                  }
                />
                <Input
                  required
                  type="email"
                  placeholder="Email"
                  value={signUpForm.email}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, email: e.target.value })
                  }
                />
                <Input
                  required
                  type="password"
                  minLength={8}
                  placeholder="Password (min. 8 characters)"
                  value={signUpForm.password}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, password: e.target.value })
                  }
                />
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  Sign up and transfer data
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
              >
                Continue with Google
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Password</h3>
            {providers === null ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : hasPassword ? (
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={busy}
              >
                {busy && <Loader2 className="animate-spin" />}
                Reset password
              </Button>
            ) : showSetPassword ? (
              <form onSubmit={handleSetPassword} className="space-y-3">
                <Input
                  required
                  type="password"
                  minLength={8}
                  placeholder="New password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="animate-spin" />}
                    Save password
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowSetPassword(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your account uses Google sign-in. Set a password to also log
                  in with your email.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowSetPassword(true)}
                >
                  Set password
                </Button>
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-600">Danger zone</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all of your job applications.
              This can't be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              Delete account
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your account and every application you've saved will be
                  permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
