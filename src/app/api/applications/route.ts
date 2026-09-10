import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const data = await db.select().from(jobApplications);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newApp = await db.insert(jobApplications).values(body).returning();
  return NextResponse.json(newApp[0]);
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  const updated = await db
    .update(jobApplications)
    .set({ status, updatedAt: new Date() })
    .where(eq(jobApplications.id, id))
    .returning();

  return NextResponse.json(updated[0]);
}

export async function PUT(req: Request) {
  const { id, jobTitle, company, url, status } = await req.json();
  const updated = await db
    .update(jobApplications)
    .set({ jobTitle, company, url, status, updatedAt: new Date() })
    .where(eq(jobApplications.id, id))
    .returning();

  return NextResponse.json(updated[0]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  await db.delete(jobApplications).where(eq(jobApplications.id, id));
  return NextResponse.json({ success: true });
}