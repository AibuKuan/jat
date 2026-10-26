import * as schema from "./schema";
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    jobApplications: r.many.jobApplications(),
    apiTokens: r.many.apiTokens(),
    settings: r.one.userSettings({
      from: r.user.id,
      to: r.userSettings.userId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  jobApplications: {
    user: r.one.user({
      from: r.jobApplications.userId,
      to: r.user.id,
    }),
  },
  apiTokens: {
    user: r.one.user({
      from: r.apiTokens.userId,
      to: r.user.id,
    }),
  },
  userSettings: {
    user: r.one.user({
      from: r.userSettings.userId,
      to: r.user.id,
    }),
  },
}));
