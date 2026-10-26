import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, countDistinct, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { jobApplications, userSettings } from "@/db/schema";
import { user } from "@/db/schema/auth-schema";
import { auth } from "@/lib/auth";

const MIN_USERS = 5;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isAnonymous) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1);

  if (!settings?.shareStatusAnonymously) {
    return NextResponse.json(
      { error: "Opt in to see community stats" },
      { status: 403 },
    );
  }

  const [application] = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.id, id),
        eq(jobApplications.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sameJob = application.url
    ? eq(jobApplications.url, application.url)
    : and(
        sql`lower(trim(${jobApplications.company})) = ${application.company.trim().toLowerCase()}`,
        sql`lower(trim(${jobApplications.jobTitle})) = ${application.jobTitle.trim().toLowerCase()}`,
      );

  const [row] = await db
    .select({
      users: countDistinct(jobApplications.userId),
      interviewed: sql<number>`count(distinct ${jobApplications.userId}) filter (where ${jobApplications.status} in ('interviewing', 'offered'))`.mapWith(
        Number,
      ),
      ignored: sql<number>`count(distinct ${jobApplications.userId}) filter (where ${jobApplications.status} = 'ignored')`.mapWith(
        Number,
      ),
    })
    .from(jobApplications)
    .innerJoin(userSettings, eq(userSettings.userId, jobApplications.userId))
    .innerJoin(user, eq(user.id, jobApplications.userId))
    .where(
      and(
        sameJob,
        eq(userSettings.shareStatusAnonymously, true),
        eq(user.isAnonymous, false),
      ),
    );

  if (row.users < MIN_USERS) {
    return NextResponse.json({ enoughData: false, minUsers: MIN_USERS });
  }

  return NextResponse.json({
    enoughData: true,
    users: row.users,
    interviewRate: Math.round((row.interviewed / row.users) * 100),
    ignoredRate: Math.round((row.ignored / row.users) * 100),
  });
}