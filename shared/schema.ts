import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  pathway: varchar("pathway", { enum: ["A", "B"] }), // A = NMBA-approved, B = Equivalent
  currentRole: varchar("current_role"),
  workplace: varchar("workplace"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Practice hours tracking
export const practiceHours = pgTable("practice_hours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  hours: decimal("hours", { precision: 6, scale: 2 }).notNull(),
  workplace: varchar("workplace").notNull(),
  department: varchar("department"),
  position: varchar("position").notNull(),
  supervisorName: varchar("supervisor_name").notNull(),
  supervisorEmail: varchar("supervisor_email"),
  supervisorPhone: varchar("supervisor_phone"),
  description: text("description"),
  isAdvancedPractice: boolean("is_advanced_practice").default(true),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CPD (Continuing Professional Development) records
export const cpdRecords = pgTable("cpd_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  provider: varchar("provider"),
  category: varchar("category", { 
    enum: ["mandatory", "continuing_competence", "education", "other"] 
  }).notNull(),
  activityType: varchar("activity_type", {
    enum: ["course", "conference", "workshop", "webinar", "reading", "research", "other"]
  }).notNull(),
  hoursEarned: decimal("hours_earned", { precision: 4, scale: 2 }).notNull(),
  completionDate: date("completion_date").notNull(),
  expiryDate: date("expiry_date"),
  description: text("description"),
  learningOutcomes: text("learning_outcomes"),
  reflection: text("reflection"),
  certificateUrl: varchar("certificate_url"),
  evidenceUrl: varchar("evidence_url"),
  registrationPeriod: varchar("registration_period").notNull(), // e.g., "2024-2025"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document management
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: varchar("category", {
    enum: [
      "academic_transcripts",
      "certificates",
      "cv_resume",
      "statement_of_service",
      "cpd_evidence",
      "supervisor_references",
      "identity_documents",
      "criminal_history_check",
      "english_proficiency",
      "portfolio_evidence",
      "other"
    ]
  }).notNull(),
  fileName: varchar("file_name").notNull(),
  originalFileName: varchar("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileUrl: varchar("file_url").notNull(),
  description: text("description"),
  isRequired: boolean("is_required").default(false),
  isSubmitted: boolean("is_submitted").default(false),
  submittedAt: timestamp("submitted_at"),
  expiryDate: date("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competency assessments
export const competencyAssessments = pgTable("competency_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  competencyArea: varchar("competency_area").notNull(),
  evidenceDescription: text("evidence_description").notNull(),
  reflectiveStatement: text("reflective_statement"),
  competencyLevel: varchar("competency_level", {
    enum: ["developing", "proficient", "advanced", "expert"]
  }).notNull(),
  assessmentDate: date("assessment_date").notNull(),
  assessorName: varchar("assessor_name"),
  assessorRole: varchar("assessor_role"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Progress tracking milestones
export const progressMilestones = pgTable("progress_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  milestoneType: varchar("milestone_type", {
    enum: [
      "registration_current",
      "masters_enrolled",
      "masters_completed",
      "practice_hours_started",
      "practice_hours_50_percent",
      "practice_hours_completed",
      "cpd_requirements_met",
      "documents_uploaded",
      "portfolio_completed",
      "supervisor_verification",
      "ready_for_submission",
      "application_submitted",
      "endorsement_received"
    ]
  }).notNull(),
  status: varchar("status", { enum: ["not_started", "in_progress", "completed"] }).default("not_started"),
  completedAt: timestamp("completed_at"),
  dueDate: date("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  practiceHours: many(practiceHours),
  cpdRecords: many(cpdRecords),
  documents: many(documents),
  competencyAssessments: many(competencyAssessments),
  progressMilestones: many(progressMilestones),
  activityLog: many(activityLog),
}));

export const practiceHoursRelations = relations(practiceHours, ({ one }) => ({
  user: one(users, {
    fields: [practiceHours.userId],
    references: [users.id],
  }),
}));

export const cpdRecordsRelations = relations(cpdRecords, ({ one }) => ({
  user: one(users, {
    fields: [cpdRecords.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export const competencyAssessmentsRelations = relations(competencyAssessments, ({ one }) => ({
  user: one(users, {
    fields: [competencyAssessments.userId],
    references: [users.id],
  }),
}));

export const progressMilestonesRelations = relations(progressMilestones, ({ one }) => ({
  user: one(users, {
    fields: [progressMilestones.userId],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPracticeHoursSchema = createInsertSchema(practiceHours).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCpdRecordSchema = createInsertSchema(cpdRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompetencyAssessmentSchema = createInsertSchema(competencyAssessments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgressMilestoneSchema = createInsertSchema(progressMilestones).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPracticeHours = z.infer<typeof insertPracticeHoursSchema>;
export type PracticeHours = typeof practiceHours.$inferSelect;
export type InsertCpdRecord = z.infer<typeof insertCpdRecordSchema>;
export type CpdRecord = typeof cpdRecords.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertCompetencyAssessment = z.infer<typeof insertCompetencyAssessmentSchema>;
export type CompetencyAssessment = typeof competencyAssessments.$inferSelect;
export type InsertProgressMilestone = z.infer<typeof insertProgressMilestoneSchema>;
export type ProgressMilestone = typeof progressMilestones.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
