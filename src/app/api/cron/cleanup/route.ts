import { db } from "@/db";
import { ApplicationStatus, jobApplications } from "@/db/schema";
import { session, user } from "@/db/schema/auth-schema";
import { and, eq, gte, lt, notExists, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function ignoreStaleApplications() {
  const updated = await db
    .update(jobApplications)
    .set({ status: ApplicationStatus.IGNORED })
    .where(
      and(
        eq(jobApplications.status, ApplicationStatus.APPLIED),
        lt(jobApplications.updatedAt, daysAgo(30)),
      ),
    )
    .returning({ id: jobApplications.id });

  return updated.length;
}

async function deleteInactiveGuests() {
  const cutoff = daysAgo(30);

  const deleted = await db
    .delete(user)
    .where(
      and(
        eq(user.isAnonymous, true),
        lt(user.createdAt, cutoff),
        notExists(
          db
            .select({ one: sql`1` })
            .from(session)
            .where(
              and(eq(session.userId, user.id), gte(session.updatedAt, cutoff)),
            ),
        ),
      ),
    )
    .returning({ id: user.id });

  return deleted.length;
}

const jobs = [
  { name: "ignoreStaleApplications", run: ignoreStaleApplications },
  { name: "deleteInactiveGuests", run: deleteInactiveGuests },
];

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<
    string,
    { ok: true; affected: number } | { ok: false; error: string }
  > = {};

  for (const job of jobs) {
    try {
      results[job.name] = { ok: true, affected: await job.run() };
    } catch (error) {
      console.error(`Cron job "${job.name}" failed:`, error);
      results[job.name] = {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  const allOk = Object.values(results).every((r) => r.ok);

  return NextResponse.json(
    { success: allOk, results, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 500 },
  );
}
