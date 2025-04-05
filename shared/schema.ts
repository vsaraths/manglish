import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  translations: many(translations)
}));

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
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' })
});

export const translationsRelations = relations(translations, ({ one }) => ({
  user: one(users, {
    fields: [translations.userId],
    references: [users.id]
  })
}));

export const insertTranslationSchema = createInsertSchema(translations).pick({
  manglishText: true,
  englishText: true,
  userId: true
}).extend({
  userId: z.number().optional()
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

export const dictionary = pgTable("dictionary", {
  id: serial("id").primaryKey(),
  manglishWord: text("manglish_word").notNull().unique(),
  englishWord: text("english_word").notNull(),
  partOfSpeech: text("part_of_speech"),
  examples: jsonb("examples").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertDictionarySchema = createInsertSchema(dictionary).pick({
  manglishWord: true,
  englishWord: true,
  partOfSpeech: true,
  examples: true,
});

export type InsertDictionary = z.infer<typeof insertDictionarySchema>;
export type Dictionary = typeof dictionary.$inferSelect;
