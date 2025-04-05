import { 
  translations, type Translation, type InsertTranslation,
  dictionary, type Dictionary, type InsertDictionary,
  users, type User, type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Translation related methods
  getTranslations(limit?: number): Promise<Translation[]>;
  getTranslation(id: number): Promise<Translation | undefined>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  
  // Dictionary related methods
  getDictionaryEntries(): Promise<Dictionary[]>;
  getDictionaryEntry(manglishWord: string): Promise<Dictionary | undefined>;
  createDictionaryEntry(entry: InsertDictionary): Promise<Dictionary>;
  
  // Database initialization
  initDictionary(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Translation methods
  async getTranslations(limit = 10): Promise<Translation[]> {
    const result = await db.select().from(translations)
      .orderBy(desc(translations.timestamp))
      .limit(limit);
    return result;
  }
  
  async getTranslation(id: number): Promise<Translation | undefined> {
    const [translation] = await db.select().from(translations).where(eq(translations.id, id));
    return translation;
  }
  
  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const [translation] = await db.insert(translations).values(insertTranslation).returning();
    return translation;
  }
  
  // Dictionary methods
  async getDictionaryEntries(): Promise<Dictionary[]> {
    return await db.select().from(dictionary);
  }
  
  async getDictionaryEntry(manglishWord: string): Promise<Dictionary | undefined> {
    const [entry] = await db.select().from(dictionary)
      .where(eq(dictionary.manglishWord, manglishWord.toLowerCase()));
    return entry;
  }
  
  async createDictionaryEntry(insertDictionary: InsertDictionary): Promise<Dictionary> {
    // Ensure manglishWord is lowercase for consistency and examples is properly typed
    const entryData = {
      manglishWord: insertDictionary.manglishWord.toLowerCase(),
      englishWord: insertDictionary.englishWord,
      partOfSpeech: insertDictionary.partOfSpeech || null,
      examples: Array.isArray(insertDictionary.examples) ? insertDictionary.examples : []
    };
    
    try {
      // Type explicitly for drizzle
      const [result] = await db.insert(dictionary).values({
        manglishWord: entryData.manglishWord,
        englishWord: entryData.englishWord,
        partOfSpeech: entryData.partOfSpeech,
        examples: entryData.examples as any
      }).returning();
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        // If entry already exists, return the existing one
        const [existingEntry] = await db.select().from(dictionary)
          .where(eq(dictionary.manglishWord, entryData.manglishWord));
        return existingEntry;
      }
      throw error;
    }
  }
  
  // Initialize the dictionary with common words and phrases
  async initDictionary(): Promise<void> {
    const commonMappings: [string, string, string?, string[]?][] = [
      // Individual words
      ["njan", "I", "pronoun", ["Njan veetil aanu", "Njan school il pokunnu"]],
      ["ningal", "you", "pronoun", ["Ningal evide pokuva?", "Ningal enthu cheyyunnu?"]],
      ["avan", "he", "pronoun", ["Avan school il pokunnu"]],
      ["aval", "she", "pronoun", ["Aval nalla kutti aanu"]],
      ["avar", "they", "pronoun", ["Avar ellam school il poyee"]],
      ["nammal", "we", "pronoun", ["Nammal innu cinema kanaan pokunnu"]],
      ["enikku", "I have", "verb phrase", ["Enikku oru puthiya veedu undu"]],
      ["ente", "my", "possessive pronoun", ["Ente peru John aanu"]],
      ["adipoli", "excellent", "adjective", ["Ee padam adipoli aanu"]],
      ["kidu", "awesome", "adjective", ["Ee cinema kidu aayirunnu"]],
      ["veedu", "house", "noun", ["Ente veedu valuthanu"]],
      ["nalla", "good", "adjective", ["Ithu nalla samayam aanu"]],
      ["nanni", "thank you", "phrase", ["Nanni, sughamano?"]],
      ["sugham", "well/fine", "adjective", ["Enikku sugham aanu"]],
      ["pani", "work", "noun", ["Ente pani kazhinjitilla"]],
      ["vishakkunnu", "hungry", "verb", ["Enikku vishakkunnu"]],
      ["kuthira", "horse", "noun", ["Aa kuthira valuthanu"]],
      ["manam", "smell", "noun", ["Ee pushpathinu nalla manam undu"]],
      ["venam", "want/need", "verb", ["Enikku vellam venam"]],
      ["chetta", "brother", "noun", ["Ente chetta amerikayil aanu"]],
      ["chechi", "sister", "noun", ["Ente chechi doctor aanu"]],
      ["kaappi", "coffee", "noun", ["Oru kaappi tharumo?"]],
      ["chaya", "tea", "noun", ["Enikku oru chaya venam"]],
      ["paisa", "money", "noun", ["Ente kayyil paisa illa"]],
      ["mole", "daughter", "noun", ["Ente mole school il poyi"]],
      ["mone", "son", "noun", ["Ente mone doctor aanu"]],
      ["aana", "elephant", "noun", ["Aa aana valuthanu"]],
      ["mazha", "rain", "noun", ["Innu mazha undu"]],
      ["vellam", "water", "noun", ["Enikku vellam venam"]],
      ["puli", "tiger", "noun", ["Aa kaattil puli undu"]],
      ["samayam", "time", "noun", ["Ippo enthu samayam aayi?"]],
      ["kollam", "excellent/great", "exclamation", ["Athu kollam!"]],
      ["pattum", "possible", "verb", ["Ninakku varaana pattum?"]],
      ["patilla", "impossible/cannot", "verb", ["Enikku varaana patilla"]],
      ["enthanu", "what is", "question", ["Enthu vilayanu?", "Enthanu vishesham?"]],
      ["enthu", "what", "question", ["Enthu vishesham?"]],
      ["evide", "where", "question", ["Nee evide aanu?"]],
      ["evideyka", "where to", "question", ["Evideyka povunathu?"]],
      ["povunathu", "going", "verb", ["Njan veetileku povunathu"]],
      ["povunathe", "going", "verb", ["Avan schoolileku povunathe"]],
      ["ethra", "how much", "question", ["Ithu ethra vilayanu?"]],
      ["ippol", "now", "adverb", ["Ippol enthu cheyyunnu?"]],
      ["innu", "today", "adverb", ["Innu mazha undu"]],
      ["nale", "tomorrow", "adverb", ["Njan nale varaam"]],
      ["innale", "yesterday", "adverb", ["Innale njaan cinema kannu"]],
      
      // Common phrases
      ["evideyka povunathe", "where are you going", "phrase", ["Evideyka povunathe?", "Nee evideyka povunathe?"]],
      ["njan veedu pokuva", "I am going home", "phrase", ["Njan veedu pokuva", "Ippol njan veedu pokuva"]],
      ["eniku vishakkunnu", "I am hungry", "phrase", ["Eniku vishakkunnu", "Ippol eniku vishakkunnu"]],
      ["enthu vishesham", "what's new", "phrase", ["Enthu vishesham?", "Ippol enthu vishesham?"]],
      ["sugham aano", "how are you", "phrase", ["Sugham aano?", "Ningalku sugham aano?"]],
      ["enikku vellam venam", "I need water", "phrase", ["Enikku vellam venam", "Dayavayi enikku vellam venam"]],
      ["samayam ethra aayi", "what time is it", "phrase", ["Samayam ethra aayi?", "Ippol samayam ethra aayi?"]],
      ["vare kanam", "see you later", "phrase", ["Vare kanam", "Njan pokunnu, vare kanam"]],
      ["enne sahayikku", "help me", "phrase", ["Enne sahayikku", "Dayavayi enne sahayikku"]],
      ["enikku arinjooda", "I don't know", "phrase", ["Enikku arinjooda", "Maappu, enikku arinjooda"]],
      ["enikku manasilayilla", "I don't understand", "phrase", ["Enikku manasilayilla", "Vishamamaanu, enikku manasilayilla"]],
      ["ethrayum pettennu", "as soon as possible", "phrase", ["Ethrayum pettennu varaam", "Njan ethrayum pettennu varaam"]],
      ["nanni ariyikkunnu", "thank you very much", "phrase", ["Nanni ariyikkunnu", "Sahayathinu nanni ariyikkunnu"]]
    ];
    
    // Insert dictionary entries in batches to avoid overwhelming the database
    const batchSize = 25;
    
    for (let i = 0; i < commonMappings.length; i += batchSize) {
      const batch = commonMappings.slice(i, i + batchSize);
      
      // Map entries with proper typing
      const entries = batch.map(([manglishWord, englishWord, partOfSpeech, examples]) => {
        return {
          manglishWord: manglishWord.toLowerCase(),
          englishWord,
          partOfSpeech: partOfSpeech || null,
          examples: examples || []
        };
      });
      
      // Using a transaction to ensure all entries in a batch are inserted or none
      await db.transaction(async (tx) => {
        for (const entry of entries) {
          try {
            // Explicitly structure the data for Drizzle
            await tx.insert(dictionary).values({
              manglishWord: entry.manglishWord,
              englishWord: entry.englishWord,
              partOfSpeech: entry.partOfSpeech,
              examples: entry.examples as any
            }).onConflictDoNothing();
          } catch (error) {
            console.error(`Error inserting dictionary entry: ${entry.manglishWord}`, error);
          }
        }
      });
    }
  }
}

// Create and export a storage instance
export const storage = new DatabaseStorage();