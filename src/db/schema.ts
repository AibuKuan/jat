import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum('application_status', [
    'applied',
    'interviewing',
    'offered',
    'rejected',
])

export const jobApplications = pgTable('job_applications', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    jobTitle: varchar('job_title', { length: 255 }).notNull(),
    company: varchar('company', { length: 255 }).notNull(), 
    url: text('url'),
    appliedDate: timestamp('applied_date').defaultNow().notNull(),
    status: applicationStatusEnum('status').default('applied').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})