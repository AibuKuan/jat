import { enumToPgEnum } from "@/lib/utils";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export enum ApplicationStatus {
  APPLIED = "applied",
  INTERVIEWING = "interviewing",
  OFFERED = "offered",
  REJECTED = "rejected",
}

export const applicationStatusEnum = pgEnum(
  "application_status",
  enumToPgEnum(ApplicationStatus),
);

export const jobApplications = pgTable(
  "job_applications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    jobTitle: varchar("job_title", { length: 255 }).notNull(),
    company: varchar("company", { length: 255 }).notNull(),
    url: text("url"),
    appliedDate: timestamp("applied_date", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    status: applicationStatusEnum("status")
      .default(ApplicationStatus.APPLIED)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("job_applications_userId_idx").on(table.userId)],
);

export type JobApplication = InferSelectModel<typeof jobApplications>;
export type NewJobApplication = InferInsertModel<typeof jobApplications>;
