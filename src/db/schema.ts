import { enumToPgEnum } from "@/lib/utils";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export enum ApplicationStatus {
    APPLIED = 'applied',
    INTERVIEWING = 'interviewing',
    OFFERED = 'offered',
    REJECTED = 'rejected',
}

export const applicationStatusEnum = pgEnum('application_status', enumToPgEnum(ApplicationStatus))

export const jobApplications = pgTable('job_applications', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    jobTitle: varchar('job_title', { length: 255 }).notNull(),
    company: varchar('company', { length: 255 }).notNull(), 
    url: text('url'),
    appliedDate: timestamp('applied_date').defaultNow().notNull(),
    status: applicationStatusEnum('status').default(ApplicationStatus.APPLIED).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type JobApplication = InferSelectModel<typeof jobApplications>
export type NewJobApplication = InferInsertModel<typeof jobApplications>