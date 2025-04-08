import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTranslationSchema, insertDictionarySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { malayalamToManglish, manglishToMalayalam } from "./transliteration";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints
  const apiRouter = express.Router();

  // Get dictionary entries
  apiRouter.get("/dictionary", async (req, res) => {
    try {
      const entries = await storage.getDictionaryEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dictionary entries" });
    }
  });

  // Get dictionary entry
  apiRouter.get("/dictionary/:word", async (req, res) => {
    try {
      const entry = await storage.getDictionaryEntry(req.params.word);
      if (!entry) {
        return res.status(404).json({ message: "Dictionary entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dictionary entry" });
    }
  });

  // Translate text from Manglish to English
  apiRouter.post("/translate", async (req, res) => {
    try {
      const { manglishText, englishText } = insertTranslationSchema.parse(req.body);
      
      // Save the translation to history
      const translation = await storage.createTranslation({
        manglishText,
        englishText
      });
      
      res.json(translation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error translating text" });
    }
  });

  // Get translation history
  apiRouter.get("/translations", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const translations = await storage.getTranslations(limit);
      res.json(translations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching translation history" });
    }
  });

  // Add new dictionary entry
  apiRouter.post("/dictionary", async (req, res) => {
    try {
      const entry = insertDictionarySchema.parse(req.body);
      const created = await storage.createDictionaryEntry(entry);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error adding dictionary entry" });
    }
  });

  // Transliteration API endpoints
  
  // Transliterate Malayalam to Manglish
  apiRouter.post("/transliterate/malayalam-to-manglish", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required and must be a string" });
      }
      
      const manglish = await malayalamToManglish(text);
      res.json({ original: text, transliterated: manglish });
    } catch (error) {
      res.status(500).json({ message: "Error transliterating text" });
    }
  });
  
  // Transliterate Manglish to Malayalam
  apiRouter.post("/transliterate/manglish-to-malayalam", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required and must be a string" });
      }
      
      const malayalam = await manglishToMalayalam(text);
      res.json({ original: text, transliterated: malayalam });
    } catch (error) {
      res.status(500).json({ message: "Error transliterating text" });
    }
  });

  // Mount API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
