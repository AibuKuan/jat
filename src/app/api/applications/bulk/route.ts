import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { ApplicationStatus, jobApplications } from "@/db/schema";
import { auth } from "@/lib/auth";

const MAX_IDS = 200;
const STATUSES = Object.values(ApplicationStatus) as string[];

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

function parseIds(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_IDS) {
    return null;
  }
  if (!value.every((id) => typeof id === "string")) return null;
  return value as string[];
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids, status } = await req.json();
  const parsedIds = parseIds(ids);

  if (!parsedIds) {
    return NextResponse.json(
      { error: `ids must be 1 to ${MAX_IDS} strings` },
      { status: 400 },
    );
  }
  if (typeof status !== "string" || !STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const updated = await db
    .update(jobApplications)
    .set({ status: status as ApplicationStatus })
    .where(
      and(
        inArray(jobApplications.id, parsedIds),
        eq(jobApplications.userId, userId),
      ),
    )
    .returning({ id: jobApplications.id });

  return NextResponse.json({ updated: updated.length });
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await req.json();
  const parsedIds = parseIds(ids);

  if (!parsedIds) {
    return NextResponse.json(
      { error: `ids must be 1 to ${MAX_IDS} strings` },
      { status: 400 },
    );
  }

  const deleted = await db
    .delete(jobApplications)
    .where(
      and(
        inArray(jobApplications.id, parsedIds),
        eq(jobApplications.userId, userId),
      ),
    )
    .returning({ id: jobApplications.id });

  return NextResponse.json({ deleted: deleted.length });
}