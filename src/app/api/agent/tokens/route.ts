import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { apiTokens } from "@/db/schema/agent-schema";
import {
  PERMISSIONS,
  generateToken,
  hashToken,
  type Permission,
} from "@/lib/agent-auth";
import { and, desc, eq, isNull } from "drizzle-orm";

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokens = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      permissions: apiTokens.permissions,
      expiresAt: apiTokens.expiresAt,
      lastUsedAt: apiTokens.lastUsedAt,
      createdAt: apiTokens.createdAt,
    })
    .from(apiTokens)
    .where(and(eq(apiTokens.userId, userId), isNull(apiTokens.revokedAt)))
    .orderBy(desc(apiTokens.createdAt));

  return NextResponse.json(tokens);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name ?? "AI assistant").slice(0, 100);
  const days = Math.min(Math.max(Number(body.expiresInDays) || 30, 1), 90);
  const permissions: Permission[] = Array.isArray(body.permissions)
    ? body.permissions.filter((p: string): p is Permission =>
        (PERMISSIONS as readonly string[]).includes(p),
      )
    : ["read", "create", "update"];

  const token = generateToken();

  await db.insert(apiTokens).values({
    userId: session.user.id,
    name,
    tokenHash: hashToken(token),
    permissions,
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  });

  const origin = new URL(req.url).origin;
  return NextResponse.json({
    link: `${origin}/api/agent/${token}`,
    permissions,
  });
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const [revoked] = await db
    .update(apiTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiTokens.id, id), eq(apiTokens.userId, userId)))
    .returning({ id: apiTokens.id });

  if (!revoked) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}