import axios from 'axios';
import { storage } from './storage';
import { insertDictionarySchema } from '@shared/schema';
import { db } from './db';
import { dictionary } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * A utility file for handling transliteration operations between Malayalam and Manglish
 */

/**
 * Using Aksharamukha API to transliterate Malayalam text to Manglish (ISO format)
 * @param malayalamText - Text in Malayalam script
 * @returns Promise with transliterated text in Manglish (Latin/Roman script)
 */
export async function malayalamToManglish(malayalamText: string): Promise<string> {
  try {
    // Using Aksharamukha API
    const response = await axios.get('https://aksharamukha-api.appspot.com/api/public', {
      params: {
        source: 'Malayalam',
        target: 'ISO', // ISO format is a standardized romanization of Malayalam
        text: malayalamText
      }
    });
    
    return response.data || '';
  } catch (error) {
    console.error('Error transliterating Malayalam to Manglish:', error);
    return '';
  }
}

/**
 * Using Aksharamukha API to transliterate Manglish text to Malayalam script
 * @param manglishText - Text in Manglish (Latin/Roman script)
 * @returns Promise with transliterated text in Malayalam script
 */
export async function manglishToMalayalam(manglishText: string): Promise<string> {
  try {
    // Using Aksharamukha API
    const response = await axios.get('https://aksharamukha-api.appspot.com/api/public', {
      params: {
        source: 'ISO', // Assuming input is in ISO standardized format
        target: 'Malayalam',
        text: manglishText
      }
    });
    
    return response.data || '';
  } catch (error) {
    console.error('Error transliterating Manglish to Malayalam:', error);
    return '';
  }
}

/**
 * Generate dictionary entries from English-Malayalam pairs
 * @param entries - Array of [English, Malayalam] pairs
 */
export async function generateDictionaryEntries(entries: [string, string, string?][]): Promise<void> {
  const batchSize = 10;
  let successCount = 0;
  let failureCount = 0;
  
  console.log(`Starting to generate ${entries.length} dictionary entries...`);
  
  for (let i = 0; i < entries.length; i += batchSize) {
    const currentBatch = entries.slice(i, i + batchSize);
    
    // Process each entry in the batch
    const batchPromises = currentBatch.map(async ([english, malayalam, partOfSpeech]) => {
      try {
        // Convert Malayalam to Manglish
        const manglish = await malayalamToManglish(malayalam);
        
        if (!manglish) {
          console.warn(`Failed to transliterate Malayalam: ${malayalam}`);
          failureCount++;
          return;
        }
        
        // Add to dictionary
        const entry = {
          manglishWord: manglish.toLowerCase(),
          englishWord: english,
          partOfSpeech: partOfSpeech || '',
          examples: [] as string[]
        };
        
        // Check if entry already exists
        const existingEntry = await storage.getDictionaryEntry(entry.manglishWord);
        
        if (!existingEntry) {
          await storage.createDictionaryEntry(entry);
          successCount++;
          console.log(`Created entry: ${manglish} -> ${english}`);
        } else {
          console.log(`Entry for "${manglish}" already exists, skipping.`);
        }
      } catch (error) {
        console.error(`Error processing entry [${english}, ${malayalam}]:`, error);
        failureCount++;
      }
    });
    
    // Wait for all promises in the batch to complete
    await Promise.all(batchPromises);
    
    // Small delay between batches to prevent overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Dictionary generation complete: ${successCount} entries added, ${failureCount} failed.`);
}

/**
 * Import common English-Malayalam word pairs from various categories
 */
export async function importCommonPhrases(): Promise<void> {
  // Common English-Malayalam word pairs [English, Malayalam, Part of Speech?]
  const commonPhrases: [string, string, string?][] = [
    // Greetings and common phrases
    ["hello", "ഹലോ", "greeting"],
    ["thank you", "നന്ദി", "greeting"],
    ["please", "ദയവായി", "greeting"],
    ["sorry", "ക്ഷമിക്കണം", "greeting"],
    ["good morning", "സുപ്രഭാതം", "greeting"],
    ["good evening", "ശുഭ സന്ധ്യ", "greeting"],
    ["good night", "ശുഭ രാത്രി", "greeting"],
    ["how are you", "സുഖമാണോ", "greeting"],
    
    // Common verbs
    ["go", "പോകുക", "verb"],
    ["come", "വരിക", "verb"],
    ["eat", "കഴിക്കുക", "verb"],
    ["drink", "കുടിക്കുക", "verb"],
    ["sleep", "ഉറങ്ങുക", "verb"],
    ["speak", "സംസാരിക്കുക", "verb"],
    ["read", "വായിക്കുക", "verb"],
    ["write", "എഴുതുക", "verb"],
    ["see", "കാണുക", "verb"],
    ["hear", "കേൾക്കുക", "verb"],
    
    // Common nouns
    ["house", "വീട്", "noun"],
    ["food", "ഭക്ഷണം", "noun"],
    ["water", "വെള്ളം", "noun"],
    ["book", "പുസ്തകം", "noun"],
    ["school", "സ്കൂൾ", "noun"],
    ["work", "ജോലി", "noun"],
    ["city", "നഗരം", "noun"],
    ["village", "ഗ്രാമം", "noun"],
    ["friend", "സുഹൃത്ത്", "noun"],
    ["family", "കുടുംബം", "noun"],
    
    // Common adjectives
    ["good", "നല്ല", "adjective"],
    ["bad", "മോശം", "adjective"],
    ["big", "വലിയ", "adjective"],
    ["small", "ചെറിയ", "adjective"],
    ["hot", "ചൂട്", "adjective"],
    ["cold", "തണുപ്പ്", "adjective"],
    ["new", "പുതിയ", "adjective"],
    ["old", "പഴയ", "adjective"],
    
    // Time expressions
    ["today", "ഇന്ന്", "time"],
    ["tomorrow", "നാളെ", "time"],
    ["yesterday", "ഇന്നലെ", "time"],
    ["now", "ഇപ്പോൾ", "time"],
    ["later", "പിന്നീട്", "time"],
    
    // Question words
    ["what", "എന്ത്", "question"],
    ["where", "എവിടെ", "question"],
    ["when", "എപ്പോൾ", "question"],
    ["who", "ആര്", "question"],
    ["why", "എന്തിന്", "question"],
    ["how", "എങ്ങനെ", "question"],
    
    // Common phrases
    ["I don't understand", "എനിക്ക് മനസിലായില്ല", "phrase"],
    ["help me", "എന്നെ സഹായിക്കൂ", "phrase"],
    ["I need water", "എനിക്ക് വെള്ളം വേണം", "phrase"],
    ["I am hungry", "എനിക്ക് വിശക്കുന്നു", "phrase"],
    ["where is the bathroom", "ബാത്റൂം എവിടെയാണ്", "phrase"],
    ["how much does it cost", "ഇത് എത്ര വിലയാണ്", "phrase"],
    ["I like it", "എനിക്കിത് ഇഷ്ടമാണ്", "phrase"],
    ["I don't like it", "എനിക്കിത് ഇഷ്ടമല്ല", "phrase"]
  ];
  
  await generateDictionaryEntries(commonPhrases);
}

// Function to check and create the dictionary table
export async function ensureDictionaryTable(): Promise<void> {
  try {
    // Check if dictionary table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dictionary'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('Creating dictionary table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS dictionary (
          id SERIAL PRIMARY KEY,
          manglish_word TEXT NOT NULL UNIQUE,
          english_word TEXT NOT NULL,
          part_of_speech TEXT,
          examples JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Dictionary table created.');
    } else {
      console.log('Dictionary table already exists.');
    }
  } catch (error) {
    console.error('Error ensuring dictionary table:', error);
  }
}