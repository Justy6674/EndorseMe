import {
  users,
  practiceHours,
  cpdRecords,
  documents,
  competencyAssessments,
  progressMilestones,
  activityLog,
  type User,
  type UpsertUser,
  type PracticeHours,
  type InsertPracticeHours,
  type CpdRecord,
  type InsertCpdRecord,
  type Document,
  type InsertDocument,
  type CompetencyAssessment,
  type InsertCompetencyAssessment,
  type ProgressMilestone,
  type InsertProgressMilestone,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sum, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Practice hours operations
  createPracticeHours(practiceHours: InsertPracticeHours): Promise<PracticeHours>;
  getPracticeHoursByUser(userId: string): Promise<PracticeHours[]>;
  updatePracticeHours(id: string, updates: Partial<InsertPracticeHours>): Promise<PracticeHours>;
  deletePracticeHours(id: string): Promise<void>;
  getTotalPracticeHours(userId: string): Promise<number>;
  
  // CPD operations
  createCpdRecord(cpdRecord: InsertCpdRecord): Promise<CpdRecord>;
  getCpdRecordsByUser(userId: string): Promise<CpdRecord[]>;
  updateCpdRecord(id: string, updates: Partial<InsertCpdRecord>): Promise<CpdRecord>;
  deleteCpdRecord(id: string): Promise<void>;
  getCpdHoursByPeriod(userId: string, period: string): Promise<number>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByUser(userId: string): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  getDocumentsByCategory(userId: string, category: string): Promise<Document[]>;
  
  // Competency operations
  createCompetencyAssessment(assessment: InsertCompetencyAssessment): Promise<CompetencyAssessment>;
  getCompetencyAssessmentsByUser(userId: string): Promise<CompetencyAssessment[]>;
  updateCompetencyAssessment(id: string, updates: Partial<InsertCompetencyAssessment>): Promise<CompetencyAssessment>;
  deleteCompetencyAssessment(id: string): Promise<void>;
  
  // Progress tracking
  createProgressMilestone(milestone: InsertProgressMilestone): Promise<ProgressMilestone>;
  getProgressMilestonesByUser(userId: string): Promise<ProgressMilestone[]>;
  updateProgressMilestone(id: string, updates: Partial<InsertProgressMilestone>): Promise<ProgressMilestone>;
  getProgressOverview(userId: string): Promise<{
    totalPracticeHours: number;
    cpdHours: number;
    documentsUploaded: number;
    documentsRequired: number;
    readinessPercentage: number;
  }>;
  
  // Activity logging
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(userId: string, limit?: number): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Practice hours operations
  async createPracticeHours(practiceHoursData: InsertPracticeHours): Promise<PracticeHours> {
    const [practiceHour] = await db
      .insert(practiceHours)
      .values(practiceHoursData)
      .returning();
    
    // Log activity
    await this.logActivity({
      userId: practiceHoursData.userId,
      action: "created",
      entityType: "practice_hours",
      entityId: practiceHour.id,
      description: `Added ${practiceHoursData.hours} practice hours at ${practiceHoursData.workplace}`,
    });
    
    return practiceHour;
  }

  async getPracticeHoursByUser(userId: string): Promise<PracticeHours[]> {
    return await db
      .select()
      .from(practiceHours)
      .where(eq(practiceHours.userId, userId))
      .orderBy(desc(practiceHours.startDate));
  }

  async updatePracticeHours(id: string, updates: Partial<InsertPracticeHours>): Promise<PracticeHours> {
    const [practiceHour] = await db
      .update(practiceHours)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(practiceHours.id, id))
      .returning();
    return practiceHour;
  }

  async deletePracticeHours(id: string): Promise<void> {
    await db.delete(practiceHours).where(eq(practiceHours.id, id));
  }

  async getTotalPracticeHours(userId: string): Promise<number> {
    const result = await db
      .select({ total: sum(practiceHours.hours) })
      .from(practiceHours)
      .where(and(
        eq(practiceHours.userId, userId),
        eq(practiceHours.isAdvancedPractice, true)
      ));
    return Number(result[0]?.total || 0);
  }

  // CPD operations
  async createCpdRecord(cpdRecordData: InsertCpdRecord): Promise<CpdRecord> {
    const [cpdRecord] = await db
      .insert(cpdRecords)
      .values(cpdRecordData)
      .returning();
    
    await this.logActivity({
      userId: cpdRecordData.userId,
      action: "created",
      entityType: "cpd_record",
      entityId: cpdRecord.id,
      description: `Added CPD: ${cpdRecordData.title} (${cpdRecordData.hoursEarned} hours)`,
    });
    
    return cpdRecord;
  }

  async getCpdRecordsByUser(userId: string): Promise<CpdRecord[]> {
    return await db
      .select()
      .from(cpdRecords)
      .where(eq(cpdRecords.userId, userId))
      .orderBy(desc(cpdRecords.completionDate));
  }

  async updateCpdRecord(id: string, updates: Partial<InsertCpdRecord>): Promise<CpdRecord> {
    const [cpdRecord] = await db
      .update(cpdRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cpdRecords.id, id))
      .returning();
    return cpdRecord;
  }

  async deleteCpdRecord(id: string): Promise<void> {
    await db.delete(cpdRecords).where(eq(cpdRecords.id, id));
  }

  async getCpdHoursByPeriod(userId: string, period: string): Promise<number> {
    const result = await db
      .select({ total: sum(cpdRecords.hoursEarned) })
      .from(cpdRecords)
      .where(and(
        eq(cpdRecords.userId, userId),
        eq(cpdRecords.registrationPeriod, period)
      ));
    return Number(result[0]?.total || 0);
  }

  // Document operations
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(documentData)
      .returning();
    
    await this.logActivity({
      userId: documentData.userId,
      action: "uploaded",
      entityType: "document",
      entityId: document.id,
      description: `Uploaded document: ${documentData.originalFileName}`,
    });
    
    return document;
  }

  async getDocumentsByUser(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [document] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getDocumentsByCategory(userId: string, category: Document['category']): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.userId, userId),
        eq(documents.category, category)
      ))
      .orderBy(desc(documents.createdAt));
  }

  // Competency operations
  async createCompetencyAssessment(assessmentData: InsertCompetencyAssessment): Promise<CompetencyAssessment> {
    const [assessment] = await db
      .insert(competencyAssessments)
      .values(assessmentData)
      .returning();
    
    await this.logActivity({
      userId: assessmentData.userId,
      action: "created",
      entityType: "competency_assessment",
      entityId: assessment.id,
      description: `Added competency assessment: ${assessmentData.competencyArea}`,
    });
    
    return assessment;
  }

  async getCompetencyAssessmentsByUser(userId: string): Promise<CompetencyAssessment[]> {
    return await db
      .select()
      .from(competencyAssessments)
      .where(eq(competencyAssessments.userId, userId))
      .orderBy(desc(competencyAssessments.assessmentDate));
  }

  async updateCompetencyAssessment(id: string, updates: Partial<InsertCompetencyAssessment>): Promise<CompetencyAssessment> {
    const [assessment] = await db
      .update(competencyAssessments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(competencyAssessments.id, id))
      .returning();
    return assessment;
  }

  async deleteCompetencyAssessment(id: string): Promise<void> {
    await db.delete(competencyAssessments).where(eq(competencyAssessments.id, id));
  }

  // Progress tracking
  async createProgressMilestone(milestoneData: InsertProgressMilestone): Promise<ProgressMilestone> {
    const [milestone] = await db
      .insert(progressMilestones)
      .values(milestoneData)
      .returning();
    return milestone;
  }

  async getProgressMilestonesByUser(userId: string): Promise<ProgressMilestone[]> {
    return await db
      .select()
      .from(progressMilestones)
      .where(eq(progressMilestones.userId, userId))
      .orderBy(progressMilestones.milestoneType);
  }

  async updateProgressMilestone(id: string, updates: Partial<InsertProgressMilestone>): Promise<ProgressMilestone> {
    const [milestone] = await db
      .update(progressMilestones)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(progressMilestones.id, id))
      .returning();
    return milestone;
  }

  async getProgressOverview(userId: string): Promise<{
    totalPracticeHours: number;
    cpdHours: number;
    documentsUploaded: number;
    documentsRequired: number;
    readinessPercentage: number;
  }> {
    const totalPracticeHours = await this.getTotalPracticeHours(userId);
    const cpdHours = await this.getCpdHoursByPeriod(userId, "2024-2025"); // Current period
    
    const [documentsStats] = await db
      .select({
        uploaded: count(),
        required: sum(documents.isRequired),
      })
      .from(documents)
      .where(eq(documents.userId, userId));
    
    const documentsUploaded = documentsStats?.uploaded || 0;
    const documentsRequired = Math.max(15, Number(documentsStats?.required) || 0); // Minimum 15 documents required
    
    // Calculate readiness percentage based on AHPRA requirements
    let readinessScore = 0;
    
    // Practice hours (40% weight)
    const practiceHoursProgress = Math.min(totalPracticeHours / 5000, 1);
    readinessScore += practiceHoursProgress * 40;
    
    // CPD requirements (20% weight)
    const cpdProgress = Math.min(cpdHours / 20, 1); // Minimum 20 hours per year
    readinessScore += cpdProgress * 20;
    
    // Documents (30% weight)
    const documentsProgress = Math.min(documentsUploaded / documentsRequired, 1);
    readinessScore += documentsProgress * 30;
    
    // Masters degree completion (10% weight) - simplified check
    readinessScore += 10; // Assume in progress for now
    
    return {
      totalPracticeHours,
      cpdHours,
      documentsUploaded,
      documentsRequired,
      readinessPercentage: Math.round(readinessScore),
    };
  }

  // Activity logging
  async logActivity(activityData: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db
      .insert(activityLog)
      .values(activityData)
      .returning();
    return activity;
  }

  async getRecentActivity(userId: string, limit: number = 10): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
