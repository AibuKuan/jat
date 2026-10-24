import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ApplicationStatus, jobApplications } from "@/db/schema";
import { agentJson, authenticateToken, type Permission } from "@/lib/agent-auth";

const ACTION_PERMISSION: Record<string, Permission> = {
  list: "read",
  create: "create",
  update: "update",
  delete: "delete",
};

const STATUSES = Object.values(ApplicationStatus) as string[];

function parseFields(params: URLSearchParams) {
  const fields: {
    jobTitle?: string;
    company?: string;
    url?: string | null;
    status?: ApplicationStatus;
  } = {};

  const jobTitle = params.get("jobTitle")?.trim();
  const company = params.get("company")?.trim();
  const url = params.get("url")?.trim();
  const status = params.get("status")?.trim().toLowerCase();

  if (jobTitle) fields.jobTitle = jobTitle.slice(0, 255);
  if (company) fields.company = company.slice(0, 255);
  if (url) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      fields.url = parsed.toString();
    } catch {
      return { error: "url must be a valid http(s) URL" as const };
    }
  }
  if (status) {
    if (!STATUSES.includes(status)) {
      return { error: `status must be one of: ${STATUSES.join(", ")}` as const };
    }
    fields.status = status as ApplicationStatus;
  }

  return { fields };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string; action: string }> },
) {
  const { token, action } = await params;
  const permission = ACTION_PERMISSION[action];

  if (!permission) {
    return agentJson({ error: `Unknown action "${action}"` }, 404);
  }

  const auth = await authenticateToken(token, permission);
  if (!auth.ok) return agentJson({ error: auth.error }, auth.status);

  const { userId } = auth;
  const query = new URL(req.url).searchParams;

  if (action === "list") {
    const status = query.get("status");
    const limit = Math.min(Number(query.get("limit")) || 50, 200);

    const rows = await db
      .select()
      .from(jobApplications)
      .where(
        status && STATUSES.includes(status)
          ? and(eq(jobApplications.userId, userId), eq(jobApplications.status, status as ApplicationStatus))
          : eq(jobApplications.userId, userId),
      )
      .orderBy(desc(jobApplications.appliedDate))
      .limit(limit);

    return agentJson({ applications: rows });
  }

  if (action === "create") {
    const parsed = parseFields(query);
    if ("error" in parsed) return agentJson({ error: parsed.error }, 400);

    const { jobTitle, company, url, status } = parsed.fields;
    if (!jobTitle || !company) {
      return agentJson({ error: "jobTitle and company are required" }, 400);
    }

    if (url) {
      const [existing] = await db
        .select()
        .from(jobApplications)
        .where(and(eq(jobApplications.userId, userId), eq(jobApplications.url, url)))
        .limit(1);

      if (existing) return agentJson({ application: existing, duplicate: true });
    }

    const [created] = await db
      .insert(jobApplications)
      .values({ userId, jobTitle, company, url, status })
      .returning();

    return agentJson({ application: created }, 201);
  }

  const id = query.get("id");
  if (!id) return agentJson({ error: "id is required" }, 400);

  if (action === "update") {
    const parsed = parseFields(query);
    if ("error" in parsed) return agentJson({ error: parsed.error }, 400);
    if (!Object.keys(parsed.fields).length) {
      return agentJson({ error: "Provide at least one field to update" }, 400);
    }

    const [updated] = await db
      .update(jobApplications)
      .set({ ...parsed.fields, updatedAt: new Date() })
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
      .returning();

    if (!updated) return agentJson({ error: "Not found" }, 404);
    return agentJson({ application: updated });
  }

  const [deleted] = await db
    .delete(jobApplications)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .returning({ id: jobApplications.id });

  if (!deleted) return agentJson({ error: "Not found" }, 404);
  return agentJson({ success: true, id: deleted.id });
}