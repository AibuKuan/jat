import { db } from "@/db";
import { ApplicationStatus, jobApplications } from "@/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await db
      .update(jobApplications)
      .set({ status: ApplicationStatus.REJECTED })
      .where(
        and(
          eq(jobApplications.status, ApplicationStatus.APPLIED),
          lt(jobApplications.appliedDate, thirtyDaysAgo),
        ),
      );

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await db
    .delete(jobApplications)
    .where(
        and(
            eq(jobApplications.status, ApplicationStatus.REJECTED),
            lt(jobApplications.appliedDate, ninetyDaysAgo)
        )
    )

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to execute cron job" },
      { status: 500 },
    );
  }
}
