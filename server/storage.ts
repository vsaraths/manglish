import { 
  translations, type Translation, type InsertTranslation,
  dictionary, type Dictionary, type InsertDictionary,
  users, type User, type InsertUser 
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private translationEntries: Map<number, Translation>;
  private dictionaryEntries: Map<string, Dictionary>;
  userCurrentId: number;
  translationCurrentId: number;
  dictionaryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.translationEntries = new Map();
    this.dictionaryEntries = new Map();
    this.userCurrentId = 1;
    this.translationCurrentId = 1;
    this.dictionaryCurrentId = 1;
    
    // Initialize with some sample dictionary mappings
    this.initializeDictionary();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getTranslations(limit = 10): Promise<Translation[]> {
    const translations = Array.from(this.translationEntries.values())
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
    return limit ? translations.slice(0, limit) : translations;
  }
  
  async getTranslation(id: number): Promise<Translation | undefined> {
    return this.translationEntries.get(id);
  }
  
  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = this.translationCurrentId++;
    const translation: Translation = { 
      ...insertTranslation, 
      id, 
      timestamp: new Date() 
    };
    this.translationEntries.set(id, translation);
    return translation;
  }
  
  async getDictionaryEntries(): Promise<Dictionary[]> {
    return Array.from(this.dictionaryEntries.values());
  }
  
  async getDictionaryEntry(manglishWord: string): Promise<Dictionary | undefined> {
    return this.dictionaryEntries.get(manglishWord.toLowerCase());
  }
  
  async createDictionaryEntry(insertDictionary: InsertDictionary): Promise<Dictionary> {
    const id = this.dictionaryCurrentId++;
    const entry: Dictionary = { ...insertDictionary, id };
    this.dictionaryEntries.set(insertDictionary.manglishWord.toLowerCase(), entry);
    return entry;
  }
  
  private initializeDictionary() {
    const commonMappings: [string, string, string?, string[]?][] = [
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
      ["ethra", "how much", "question", ["Ithu ethra vilayanu?"]],
      ["ippol", "now", "adverb", ["Ippol enthu cheyyunnu?"]],
      ["innu", "today", "adverb", ["Innu mazha undu"]],
      ["nale", "tomorrow", "adverb", ["Njan nale varaam"]],
      ["innale", "yesterday", "adverb", ["Innale njaan cinema kannu"]]
    ];
    
    commonMappings.forEach(([manglishWord, englishWord, partOfSpeech, examples], index) => {
      this.createDictionaryEntry({
        manglishWord,
        englishWord,
        partOfSpeech: partOfSpeech || "",
        examples: examples || []
      });
    });
  }
}

export const storage = new MemStorage();
