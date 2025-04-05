import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  manglishText: text("manglish_text").notNull(),
  englishText: text("english_text").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTranslationSchema = createInsertSchema(translations).pick({
  manglishText: true,
  englishText: true,
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

export const dictionary = pgTable("dictionary", {
  id: serial("id").primaryKey(),
  manglishWord: text("manglish_word").notNull().unique(),
  englishWord: text("english_word").notNull(),
  partOfSpeech: text("part_of_speech"),
  examples: jsonb("examples").$type<string[]>(),
});

export const insertDictionarySchema = createInsertSchema(dictionary).pick({
  manglishWord: true,
  englishWord: true,
  partOfSpeech: true,
  examples: true,
});

export type InsertDictionary = z.infer<typeof insertDictionarySchema>;
export type Dictionary = typeof dictionary.$inferSelect;
