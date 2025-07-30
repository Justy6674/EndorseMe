import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertPracticeHoursSchema, 
  insertCpdRecordSchema, 
  insertDocumentSchema,
  insertCompetencyAssessmentSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressOverview = await storage.getProgressOverview(userId);
      const recentActivity = await storage.getRecentActivity(userId, 5);
      
      res.json({
        progressOverview,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Practice Hours routes
  app.get('/api/practice-hours', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const practiceHours = await storage.getPracticeHoursByUser(userId);
      const totalHours = await storage.getTotalPracticeHours(userId);
      
      res.json({
        practiceHours,
        totalHours,
        requiredHours: 5000,
        progress: Math.min((totalHours / 5000) * 100, 100),
      });
    } catch (error) {
      console.error("Error fetching practice hours:", error);
      res.status(500).json({ message: "Failed to fetch practice hours" });
    }
  });

  app.post('/api/practice-hours', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPracticeHoursSchema.parse({
        ...req.body,
        userId,
      });
      
      const practiceHour = await storage.createPracticeHours(validatedData);
      res.status(201).json(practiceHour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating practice hours:", error);
      res.status(500).json({ message: "Failed to create practice hours" });
    }
  });

  app.put('/api/practice-hours/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertPracticeHoursSchema.partial().parse(req.body);
      
      const practiceHour = await storage.updatePracticeHours(id, updates);
      res.json(practiceHour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating practice hours:", error);
      res.status(500).json({ message: "Failed to update practice hours" });
    }
  });

  app.delete('/api/practice-hours/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePracticeHours(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting practice hours:", error);
      res.status(500).json({ message: "Failed to delete practice hours" });
    }
  });

  // CPD routes
  app.get('/api/cpd', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cpdRecords = await storage.getCpdRecordsByUser(userId);
      const currentPeriodHours = await storage.getCpdHoursByPeriod(userId, "2024-2025");
      
      res.json({
        cpdRecords,
        currentPeriodHours,
        requiredHours: 20,
        progress: Math.min((currentPeriodHours / 20) * 100, 100),
      });
    } catch (error) {
      console.error("Error fetching CPD records:", error);
      res.status(500).json({ message: "Failed to fetch CPD records" });
    }
  });

  app.post('/api/cpd', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCpdRecordSchema.parse({
        ...req.body,
        userId,
      });
      
      const cpdRecord = await storage.createCpdRecord(validatedData);
      res.status(201).json(cpdRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating CPD record:", error);
      res.status(500).json({ message: "Failed to create CPD record" });
    }
  });

  app.put('/api/cpd/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertCpdRecordSchema.partial().parse(req.body);
      
      const cpdRecord = await storage.updateCpdRecord(id, updates);
      res.json(cpdRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating CPD record:", error);
      res.status(500).json({ message: "Failed to update CPD record" });
    }
  });

  app.delete('/api/cpd/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCpdRecord(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting CPD record:", error);
      res.status(500).json({ message: "Failed to delete CPD record" });
    }
  });

  // Documents routes
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getDocumentsByUser(userId);
      
      // Group documents by category
      const documentsByCategory = documents.reduce((acc, doc) => {
        if (!acc[doc.category]) {
          acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
      }, {} as Record<string, typeof documents>);
      
      res.json({
        documents,
        documentsByCategory,
        totalDocuments: documents.length,
        requiredDocuments: 15,
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        userId,
      });
      
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertDocumentSchema.partial().parse(req.body);
      
      const document = await storage.updateDocument(id, updates);
      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocument(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Competency assessments routes
  app.get('/api/competencies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessments = await storage.getCompetencyAssessmentsByUser(userId);
      
      res.json({
        assessments,
        totalAssessments: assessments.length,
      });
    } catch (error) {
      console.error("Error fetching competency assessments:", error);
      res.status(500).json({ message: "Failed to fetch competency assessments" });
    }
  });

  app.post('/api/competencies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCompetencyAssessmentSchema.parse({
        ...req.body,
        userId,
      });
      
      const assessment = await storage.createCompetencyAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating competency assessment:", error);
      res.status(500).json({ message: "Failed to create competency assessment" });
    }
  });

  // Progress milestones
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const milestones = await storage.getProgressMilestonesByUser(userId);
      const overview = await storage.getProgressOverview(userId);
      
      res.json({
        milestones,
        overview,
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
