import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { auth } from "@/lib/auth";

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [row] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1);

  return NextResponse.json({
    shareStatusAnonymously: row?.shareStatusAnonymously ?? false,
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isAnonymous) {
    return NextResponse.json(
      { error: "Guest accounts can't opt in" },
      { status: 403 },
    );
  }

  const { shareStatusAnonymously } = await req.json();
  if (typeof shareStatusAnonymously !== "boolean") {
    return NextResponse.json(
      { error: "shareStatusAnonymously must be a boolean" },
      { status: 400 },
    );
  }

  await db
    .insert(userSettings)
    .values({ userId: session.user.id, shareStatusAnonymously })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { shareStatusAnonymously, updatedAt: new Date() },
    });

  return NextResponse.json({ shareStatusAnonymously });
}