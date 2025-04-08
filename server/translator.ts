/**
 * Advanced Manglish to English translation service
 * Uses linguistic rules, NLP, and the dictionary database for high-quality translations
 */

import natural from 'natural';
import { db } from './db';
import { dictionary } from '@shared/schema';
import { eq, like } from 'drizzle-orm';

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const NGrams = natural.NGrams;

// Caches for performance
const wordCache = new Map<string, string>();
const phraseCache = new Map<string, string>();

// Common Malayalam grammar patterns/suffixes and their English equivalents
const suffixMap: Record<string, { replace: string; prefix?: string; suffix?: string }> = {
  'anu': { replace: '', suffix: ' is' },
  'aanu': { replace: '', suffix: ' is' },
  'aan': { replace: '', suffix: ' is' },
  'aayirunnu': { replace: '', suffix: ' was' },
  'ayirunu': { replace: '', suffix: ' was' },
  'undoo': { replace: '', suffix: ' have?' },
  'undo': { replace: '', suffix: ' have?' },
  'und': { replace: '', suffix: ' have' },
  'undu': { replace: '', suffix: ' have' },
  'illa': { replace: '', suffix: ' not' },
  'ille': { replace: '', suffix: ' not?' },
  'um': { replace: '', suffix: ' also' },
  'ude': { replace: '', suffix: "'s" },
  'nte': { replace: '', suffix: "'s" },
  'il': { replace: '', suffix: ' in' },
  'inu': { replace: '', suffix: ' for' },
  'enna': { replace: '', prefix: 'called ' },
  'ennu': { replace: '', prefix: 'called ' },
  'ayi': { replace: '', suffix: ' became' },
  'aayi': { replace: '', suffix: ' became' },
  'oode': { replace: '', suffix: ' with' },
  'aal': { replace: '', suffix: ' by' },
  'kkum': { replace: '', suffix: ' will' },
};

// Common verbs and their forms
const verbForms: Record<string, Record<string, string>> = {
  'cheyy': {
    'unnu': 'doing',
    'um': 'will do',
    'thu': 'did',
  },
  'var': {
    'unnu': 'coming',
    'um': 'will come',
    'nnu': 'came',
  },
  'pok': {
    'unnu': 'going',
    'um': 'will go',
    'yi': 'went',
  },
  'par': {
    'ayunnu': 'saying',
    'ayum': 'will say',
    'anju': 'said',
  },
  'kaan': {
    'unnu': 'seeing',
    'um': 'will see',
    'du': 'saw',
  },
  'kelkk': {
    'unnu': 'hearing',
    'um': 'will hear',
    'u': 'heard',
  },
};

// Question words and phrases
const questionWords: Record<string, string> = {
  'entha': 'what is',
  'enthanu': 'what is',
  'enth': 'what',
  'enthu': 'what',
  'enthinanu': 'why is',
  'enthina': 'why',
  'evide': 'where',
  'evidey': 'where',
  'engane': 'how',
  'enganeya': 'how is',
  'eppozha': 'when',
  'eppo': 'when',
  'ethra': 'how much',
  'ethrayanu': 'how much is',
  'aara': 'who is',
  'aaranu': 'who is',
  'aaru': 'who',
};

// Enhanced translations for common words
const commonWordMap: Record<string, string> = {
  'oru': 'a',
  'njan': 'I',
  'nee': 'you',
  'avan': 'he',
  'aval': 'she',
  'athu': 'it',
  'nammal': 'we',
  'avar': 'they',
  'ente': 'my',
  'ninte': 'your',
  'avante': 'his',
  'avalude': 'her',
  'athinte': 'its',
  'njangalude': 'our',
  'ningalude': 'your',
  'avarude': 'their',
  'ivide': 'here',
  'avide': 'there',
  'ippol': 'now',
  'appol': 'then',
  'innu': 'today',
  'nale': 'tomorrow',
  'innale': 'yesterday',
  'divasam': 'day',
  'raathri': 'night',
  'pakal': 'daytime',
  'sugham': 'well',
  'nallath': 'good',
  'mosham': 'bad',
  'nanni': 'thank you',
  'swaghatham': 'welcome',
  'kshamichu': 'sorry',
  'pinneyum': 'again',
  'vishesham': 'news',
  'adipoli': 'awesome',
  'kurae': 'some',
  'ellam': 'all',
  'mathi': 'enough',
  'venam': 'want',
  'venda': 'don\'t want',
  'sheriyanu': 'correct',
  'thettanu': 'wrong',
};

/**
 * Extract potential suffixes from a Malayalam word
 */
function extractSuffix(word: string): {original: string; stem: string; suffix: string} | null {
  // Try each suffix
  for (const [suffix, replacement] of Object.entries(suffixMap)) {
    if (word.endsWith(suffix) && word.length > suffix.length + 1) {
      const stem = word.slice(0, word.length - suffix.length);
      return {
        original: word,
        stem,
        suffix
      };
    }
  }
  return null;
}

/**
 * Check verb forms to see if the word is a verb with a tense marker
 */
function checkVerbForms(word: string): {verb: string; tense: string; translation: string} | null {
  for (const [verbRoot, tenses] of Object.entries(verbForms)) {
    if (word.startsWith(verbRoot)) {
      const remainder = word.slice(verbRoot.length);
      for (const [marker, translation] of Object.entries(tenses)) {
        if (remainder === marker) {
          return {
            verb: verbRoot,
            tense: marker,
            translation
          };
        }
      }
    }
  }
  return null;
}

/**
 * Find the best translation for a Manglish word
 */
async function findWordTranslation(word: string): Promise<string | null> {
  // First check the common word map
  if (commonWordMap[word]) {
    return commonWordMap[word];
  }
  
  // Check the cache
  if (wordCache.has(word)) {
    return wordCache.get(word) || null;
  }
  
  // Look for exact match in dictionary
  const exactMatch = await db.select()
    .from(dictionary)
    .where(eq(dictionary.manglishWord, word))
    .limit(1);
    
  if (exactMatch.length > 0) {
    const result = exactMatch[0].englishWord;
    wordCache.set(word, result);
    return result;
  }
  
  // Check if it's a question word
  if (questionWords[word]) {
    return questionWords[word];
  }
  
  // Check for verb forms
  const verbForm = checkVerbForms(word);
  if (verbForm) {
    return verbForm.translation;
  }
  
  // Extract suffix and look for base word
  const suffixInfo = extractSuffix(word);
  if (suffixInfo) {
    // Look for the stem word in dictionary
    const stemMatch = await db.select()
      .from(dictionary)
      .where(eq(dictionary.manglishWord, suffixInfo.stem))
      .limit(1);
      
    if (stemMatch.length > 0) {
      const stemTranslation = stemMatch[0].englishWord;
      const suffixReplacement = suffixMap[suffixInfo.suffix];
      
      // Apply the suffix transformation
      let translation = '';
      if (suffixReplacement.prefix) {
        translation = `${suffixReplacement.prefix}${stemTranslation}`;
      } else if (suffixReplacement.suffix) {
        translation = `${stemTranslation}${suffixReplacement.suffix}`;
      } else {
        translation = stemTranslation;
      }
      
      wordCache.set(word, translation);
      return translation;
    }
  }
  
  // Try fuzzy match as last resort
  const fuzzyMatch = await db.select()
    .from(dictionary)
    .where(like(dictionary.manglishWord, `%${word.slice(0, Math.max(3, word.length - 2))}%`))
    .limit(1);
    
  if (fuzzyMatch.length > 0) {
    const result = fuzzyMatch[0].englishWord;
    wordCache.set(word, result);
    return result;
  }
  
  return null;
}

/**
 * Find phrases in the dictionary that match
 */
async function findPhrases(text: string): Promise<Map<string, string>> {
  const phrases = new Map<string, string>();
  
  // Get all dictionary entries that have spaces (phrases)
  const phraseEntries = await db.select()
    .from(dictionary)
    .where(like(dictionary.manglishWord, '% %'));
  
  // Sort phrases by length (longest first)
  phraseEntries.sort((a, b) => b.manglishWord.length - a.manglishWord.length);
  
  for (const entry of phraseEntries) {
    // Check if this phrase exists in the text
    const escapedPhrase = entry.manglishWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
    
    if (regex.test(text)) {
      phrases.set(entry.manglishWord, entry.englishWord);
    }
  }
  
  return phrases;
}

/**
 * Advanced Manglish to English translation using NLP techniques
 */
export async function translateManglishToEnglish(manglishText: string): Promise<string> {
  try {
    const normalizedText = manglishText.toLowerCase().trim();
    
    // First identify and replace phrases
    let workingText = normalizedText;
    const phrases = await findPhrases(normalizedText);
    
    // Replace phrases with placeholders
    let counter = 0;
    const replacements: Record<string, string> = {};
    
    // Convert Map.entries() to array to avoid downlevelIteration issues
    const phraseEntries = Array.from(phrases);
    
    for (const [phrase, translation] of phraseEntries) {
      const id = `__PHRASE_${counter++}__`;
      const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
      
      workingText = workingText.replace(regex, id);
      replacements[id] = translation;
    }
    
    // Custom tokenization that preserves punctuation
    const tokenRegex = /([a-z0-9']+|[.,!?;:])/gi;
    const tokens: string[] = [];
    let match;
    
    while ((match = tokenRegex.exec(workingText)) !== null) {
      tokens.push(match[0]);
    }
    
    // Translate each token
    const translatedTokens: string[] = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      // If it's a placeholder, replace with the translation
      if (token.startsWith('__PHRASE_') && token.endsWith('__')) {
        translatedTokens.push(replacements[token]);
        continue;
      }
      
      // Skip punctuation
      if (/^[.,!?;:]$/.test(token)) {
        translatedTokens.push(token);
        continue;
      }
      
      // Translate the word
      const translation = await findWordTranslation(token);
      
      if (translation) {
        // Preserve capitalization
        if (token.charAt(0) === token.charAt(0).toUpperCase()) {
          translatedTokens.push(translation.charAt(0).toUpperCase() + translation.slice(1));
        } else {
          translatedTokens.push(translation);
        }
      } else {
        // Leave unknown words out to improve readability
        translatedTokens.push('');
      }
    }
    
    // Join and clean up the translation
    let result = translatedTokens
      .join(' ')
      .replace(/\s+/g, ' ')                             // Fix multiple spaces
      .replace(/\s*([.,!?;:])\s*/g, '$1 ')              // Fix punctuation spacing
      .replace(/\s+/g, ' ')                             // Clean up any extra spacing again
      .replace(/\s*\.\s*$/g, '.')                       // Fix trailing period
      .trim();
      
    // Apply grammar rules for better readability
    result = result
      // Ensure proper spacing between words and punctuation
      .replace(/\s+([.,!?;:])/g, '$1')
      // Fix spacing after punctuation
      .replace(/([.,!?;:])(\w)/g, '$1 $2')
      // Ensure proper capitalization at sentence start
      .replace(/^([a-z])/, (match) => match.toUpperCase())
      .replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
      // Add missing articles where needed
      .replace(/\b(is|are|was|were) ([aeiou])/gi, '$1 an $2')
      .replace(/\b(is|are|was|were) ([bcdfghjklmnpqrstvwxyz])/gi, '$1 a $2')
      // Fix any irregular plurals
      .replace(/\b(\w+)s's\b/g, '$1s\'')
      // Add missing period at end if needed
      .replace(/([^.,!?;:])$/, '$1.');
      
    // Final cleanup of any weird patterns
    result = result
      .replace(/ +/g, ' ')                               // Ensure single spaces
      .replace(/\(\s+/g, '(')                           // Fix spacing in parentheses
      .replace(/\s+\)/g, ')')
      .replace(/"\s+/g, '"')                            // Fix spacing in quotes
      .replace(/\s+"/g, '"')
      .replace(/\s+([.,!?;:])/g, '$1')                  // Clean spacing before punctuation
      .trim();
      
    // Handle case when result is empty or only has punctuation
    if (!result.trim() || /^[.,!?;:\s]+$/.test(result)) {
      return "Translation not available for this text.";
    }
    
    return result;
  } catch (error) {
    console.error('Advanced translation error:', error);
    return "Error translating text.";
  }
}

/**
 * Initialize the translator module
 */
export async function initTranslator(): Promise<void> {
  try {
    // Preload common words into cache
    for (const [word, translation] of Object.entries(commonWordMap)) {
      wordCache.set(word, translation);
    }
    
    // Preload dictionary entries for better performance
    const entries = await db.select().from(dictionary);
    for (const entry of entries) {
      wordCache.set(entry.manglishWord, entry.englishWord);
      
      // Add to phrase cache if it's a phrase
      if (entry.manglishWord.includes(' ')) {
        phraseCache.set(entry.manglishWord, entry.englishWord);
      }
    }
    
    console.log(`Translator initialized with ${wordCache.size} words and ${phraseCache.size} phrases`);
  } catch (error) {
    console.error('Failed to initialize translator:', error);
  }
}