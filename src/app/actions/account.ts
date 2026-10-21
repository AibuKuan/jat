"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function setPasswordAction(newPassword: string) {
  try {
    await auth.api.setPassword({
      body: { newPassword },
      headers: await headers(),
    });
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not set password" };
  }
}