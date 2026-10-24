import { createHash, randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { apiTokens } from "@/db/schema/agent-schema";

export const PERMISSIONS = ["read", "create", "update", "delete"] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const generateToken = () => `jat_${randomBytes(32).toString("base64url")}`;

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function authenticateToken(token: string, permission?: Permission) {
  const [row] = await db
    .select()
    .from(apiTokens)
    .where(eq(apiTokens.tokenHash, hashToken(token)))
    .limit(1);

  if (!row || row.revokedAt || row.expiresAt < new Date()) {
    return { ok: false as const, status: 401, error: "Invalid, expired or revoked token" };
  }

  if (permission && !row.permissions.includes(permission)) {
    return { ok: false as const, status: 403, error: `This token does not allow "${permission}"` };
  }

  void db
    .update(apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiTokens.id, row.id));

  return { ok: true as const, userId: row.userId, permissions: row.permissions };
}

export function agentJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}