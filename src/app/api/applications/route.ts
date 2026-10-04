import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const notFound = () =>
  NextResponse.json({ error: "Not found" }, { status: 404 });

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const data = await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .orderBy(desc(jobApplications.appliedDate));
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { jobTitle, company, url, status } = await req.json();
  const newApp = await db
    .insert(jobApplications)
    .values({ userId, jobTitle, company, url, status })
    .returning();
  return NextResponse.json(newApp[0]);
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { id, status } = await req.json();
  const [updated] = await db
    .update(jobApplications)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning();

  if (!updated) return notFound();
  return NextResponse.json(updated);
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const { id, jobTitle, company, url, status } = await req.json();

  const [updated] = await db
    .update(jobApplications)
    .set({ jobTitle, company, url, status, updatedAt: new Date() })
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning();

  if (!updated) return notFound();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const [deleted] = await db
    .delete(jobApplications)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning({ id: jobApplications.id });

  if (!deleted) return notFound();
  return NextResponse.json({ success: true });
}
