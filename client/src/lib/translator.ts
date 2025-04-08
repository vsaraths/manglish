import { apiRequest } from "./queryClient";

// Define response interface outside the functions to avoid duplication
interface TransliterationResponse {
  original: string;
  transliterated: string;
}

// Function to transliterate Malayalam to Manglish using the API
export async function transliterateMalayalamToManglish(malayalamText: string): Promise<string> {
  try {
    const response = await apiRequest<TransliterationResponse>('/api/transliterate/malayalam-to-manglish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: malayalamText })
    });
    
    return response.transliterated || '';
  } catch (error) {
    console.error('Transliteration error:', error);
    return '';
  }
}

// Function to transliterate Manglish to Malayalam using the API
export async function transliterateManglishToMalayalam(manglishText: string): Promise<string> {
  try {
    const response = await apiRequest<TransliterationResponse>('/api/transliterate/manglish-to-malayalam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: manglishText })
    });
    
    return response.transliterated || '';
  } catch (error) {
    console.error('Transliteration error:', error);
    return '';
  }
}

// Function to translate Manglish to English
export async function translateManglishToEnglish(manglishText: string): Promise<string> {
  try {
    // First fetch dictionary entries to use for translation
    const response = await fetch('/api/dictionary');
    if (!response.ok) {
      throw new Error('Failed to fetch dictionary data');
    }
    
    const dictionaryEntries = await response.json();
    
    // Create mappings for words and phrases
    const wordMap = new Map();
    const phraseMap = new Map(); // For multi-word phrases
    const partialWordMap = new Map(); // For approximate matching
    
    // Map for common connectors and their replacements in English
    const connectorMap = new Map([
      // Verbs of being
      ['aanu', 'is'],
      ['anu', 'is'],
      ['annu', 'is'],
      ['aan', 'is'],
      ['aayirunnu', 'was'],
      ['ayirunu', 'was'],
      ['aayirikum', 'will be'],
      ['ayirikum', 'will be'],
      ['avum', 'will be'],
      
      // Questions and confirmations
      ['alle', 'right'],
      ['alley', 'right'],
      ['alloo', 'right?'],
      ['anoo', '?'],
      ['ano', '?'],
      ['aano', '?'],
      
      // Have/possession
      ['undoo', 'have?'],
      ['undo', 'have?'],
      ['und', 'have'],
      ['undu', 'have'],
      ['und.', 'have.'],
      ['illallo', 'don\'t have'],
      ['illa', 'no'],
      ['illatha', 'without'],
      ['ullathu', 'with'],
      ['ullath', 'with'],
      ['ille', 'no?'],
      
      // Question words
      ['entha', 'what is'],
      ['enthu', 'what'],
      ['enthanu', 'what is'],
      ['enthina', 'why'],
      ['enth', 'what'],
      ['engane', 'how'],
      ['enganeya', 'how is'],
      ['enthukond', 'why'],
      ['eppo', 'when'],
      ['eppozha', 'when'],
      ['evide', 'where'],
      ['evidey', 'where'],
      ['aara', 'who is'],
      ['aaranu', 'who is'],
      ['aaru', 'who'],
      ['ethra', 'how much'],
      
      // Movement verbs
      ['vann', 'came'],
      ['varunnath', 'coming'],
      ['varunnu', 'coming'],
      ['varum', 'will come'],
      ['varilla', 'will not come'],
      ['vannilla', 'did not come'],
      ['poy', 'went'],
      ['poyi', 'went'],
      ['poyilla', 'did not go'],
      ['pokum', 'will go'],
      ['pokilla', 'will not go'],
      ['pokuva', 'going'],
      ['pokunnu', 'going'],
      ['vannu', 'came'],
      
      // Action verbs
      ['cheythu', 'did'],
      ['cheyunnu', 'doing'],
      ['cheyyunnu', 'doing'],
      ['cheyyum', 'will do'],
      ['kazhinjittu', 'after'],
      ['kazhiyumbol', 'when finished'],
      ['kazhinju', 'finished'],
      ['theernn', 'finished'],
      ['kandilla', 'did not see'],
      ['kandu', 'saw'],
      ['kaanum', 'will see'],
      ['kaanunnu', 'seeing'],
      ['kettilla', 'did not hear'],
      ['kettu', 'heard'],
      ['kelkum', 'will hear'],
      ['kelkkunnu', 'hearing'],
      
      // Common prepositions and connectors
      ['oru', 'a'],
      ['athe', 'that'],
      ['ithu', 'this'],
      ['athil', 'in that'],
      ['ithil', 'in this'],
      ['pinne', 'then'],
      ['athinu', 'for that'],
      ['ithinu', 'for this'],
      ['adheham', 'he/him (respectful)'],
      ['avar', 'they/them'],
      ['avaru', 'they'],
      ['avan', 'he/him'],
      ['aval', 'she/her'],
      ['athinte', 'its'],
      ['avante', 'his'],
      ['avalude', 'her'],
      ['ente', 'my'],
      ['ende', 'my'],
      ['ninte', 'your'],
      ['ningalude', 'your (plural/formal)'],
      ['namude', 'our'],
      ['thante', 'his/her (respectful)'],
      ['ivide', 'here'],
      ['avide', 'there'],
      ['ellam', 'all'],
      ['vishesham', 'news'],
      ['sugham', 'well'],
      ['adipoli', 'awesome'],
      ['mathi', 'enough'],
      ['venda', 'don\'t want'],
      ['veno', 'want?'],
      ['venam', 'want'],
      ['kurae', 'some'],
    ]);
    
    dictionaryEntries.forEach((entry: any) => {
      const key = entry.manglishWord.toLowerCase();
      wordMap.set(key, entry.englishWord);
      
      // Add to phrase map if it contains spaces (it's a phrase)
      if (key.includes(' ')) {
        phraseMap.set(key, entry.englishWord);
      } else {
        // Create partial word match index
        partialWordMap.set(key, entry.englishWord);
      }
    });
    
    // First, try to match entire phrases in the input text
    let workingText = manglishText.toLowerCase();
    
    // Sort phrases by length (longest first) to catch longer phrases before subphrases
    const sortedPhrases = Array.from(phraseMap.keys()).sort((a, b) => b.length - a.length);
    
    // Replace full phrases
    for (const phrase of sortedPhrases) {
      const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
      workingText = workingText.replace(regex, (match) => {
        // Use placeholder to prevent further replacements of this section
        return `__PHRASE_${phraseMap.get(phrase.toLowerCase())}__`;
      });
    }
    
    // Define helper function outside the block (to fix strict mode error)
    const findBestMatch = (word: string, wordMap: Map<string, string>, connectorMap: Map<string, string>, partialWordMap: Map<string, string>): string | null => {
      // Exact match
      if (wordMap.has(word)) {
        const result = wordMap.get(word);
        return result !== undefined ? result : null;
      }
      
      // Check connectors
      if (connectorMap.has(word)) {
        const result = connectorMap.get(word);
        return result !== undefined ? result : null;
      }
      
      // Check for common suffixes in Malayalam
      const commonSuffixes = ['um', 'ude', 'nte', 'il', 'inu', 'u', 'th', 'thil', 'thill', 'innu', 'enna', 'athe', 'aanu', 'ayi', 'aayi', 'aal', 'aayi', 'athil', 'kku', 'kkum', 'kkum', 'kkunu', 'nnu', 'unnu', 'kunnu', 'oode', 'aam', 'am', 'oo', 'o', 'ee', 'e', 'an', 'en', 'in', 'odu', 'oodu'];
      
      // Try removing common suffixes
      for (const suffix of commonSuffixes) {
        if (word.endsWith(suffix) && word.length > suffix.length + 2) {
          const stem = word.slice(0, -suffix.length);
          if (partialWordMap.has(stem)) {
            const translation = partialWordMap.get(stem);
            return translation !== undefined ? translation : null;
          }
        }
      }
      
      // No match found
      return null;
    };
    
    // Better tokenization to handle Manglish words
    // This regex splits on whitespace and punctuation but keeps them as separate tokens
    const tokens = workingText.split(/([.,!?;:'"()[\]{}\s]+)/);
    
    // Translate each word/token
    const translatedTokens = tokens.map(token => {
      // Skip empty tokens
      if (!token.trim()) {
        return token;
      }
      
      // If it's a phrase placeholder, restore it
      if (token.startsWith('__PHRASE_') && token.endsWith('__')) {
        return token.slice(9, -2); // Remove the placeholder markers
      }
      
      const cleanToken = token.toLowerCase().trim();
      
      // Skip punctuation and whitespace
      if (!cleanToken || /^[\s.,!?;:'"()[\]{}]+$/.test(cleanToken)) {
        return token;
      }
      
      // Try to find the best match for the word
      const translatedWord = findBestMatch(cleanToken, wordMap, connectorMap, partialWordMap);
      
      if (translatedWord) {
        // Preserve capitalization from original token
        if (token[0] === token[0].toUpperCase()) {
          return translatedWord.charAt(0).toUpperCase() + translatedWord.slice(1);
        }
        return translatedWord;
      }
      
      // Replace with [unknown] to indicate untranslated words
      // Uncommenting this would show [unknown] for untranslated words
      // return '[unknown]';
      
      // Or return an empty string to remove untranslated Manglish words
      return '';
    });
    
    // Join the translated tokens
    let translatedText = translatedTokens.join(' ');
    
    // Apply comprehensive grammar corrections and formatting
    translatedText = translatedText
      // Ensure proper spacing around punctuation
      .replace(/\s*([.,!?;:])\s*/g, '$1 ')
      // Fix spacing after close parenthesis and quotes
      .replace(/([)\]}"])\s*/g, '$1 ')
      // Fix spacing before open parenthesis and quotes
      .replace(/\s*([([{"])/g, ' $1')
      // Ensure sentence capitalization
      .replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase()))
      // Fix multiple spaces
      .replace(/\s+/g, ' ')
      // Fix spaces before punctuation
      .replace(/\s+([.,!?;:])/g, '$1')
      // Clean up empty brackets that might be left
      .replace(/\[\s*\]/g, '')
      // Clean up any remaining special markers
      .replace(/__[A-Z_]+__/g, '')
      // Remove multiple consecutive unknown words markers
      .replace(/\[unknown\]\s+\[unknown\]/g, '[unknown]')
      
      // Grammar improvements
      // Fix common article issues - add "a" or "an" where appropriate
      .replace(/\b(is|was|be|been|being|am|are|were) ([aeiou])/gi, '$1 an $2')
      .replace(/\b(is|was|be|been|being|am|are|were) ([^aeiou])/gi, '$1 a $2')
      
      // Fix common verb tense issues
      .replace(/\b(will) ([a-z]+ed)\b/gi, (match, will, verb) => {
        // Remove 'ed' from verbs after 'will'
        return `${will} ${verb.replace(/ed$/, '')}`;
      })
      .replace(/\b(will) ([a-z]+ing)\b/gi, (match, will, verb) => {
        // Remove 'ing' from verbs after 'will'
        return `${will} ${verb.replace(/ing$/, '')}`;
      })
      // Fix "have" with verbs
      .replace(/\b(have|has|had) ([a-z]+[^ed|en|t])\b/gi, '$1 $2ed')
      
      // Fix repeated words
      .replace(/\b(\w+)(\s+\1)+\b/gi, '$1')
      
      // Improve question formation 
      .replace(/\b(what|who|when|where|why|how)(.+)\?/gi, (match) => match.charAt(0).toUpperCase() + match.slice(1))
      
      // Final trim and clean up
      .trim()
      
      // Fix any doubled punctuation
      .replace(/([.,!?;:])+/g, '$1')
      
      // Add a proper period at the end of sentences if missing
      .replace(/([^.,!?;:]$)/, '$1.');
    
    // If result is empty or only has punctuation, return a fallback message
    if (!translatedText.trim() || /^[\s.,!?;:'"()[\]{}]+$/.test(translatedText)) {
      return "Translation not available for this text.";
    }
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
}

// Utility function to get word count
export function getWordCount(text: string): number {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

// Utility function to get character count
export function getCharacterCount(text: string): number {
  return text ? text.length : 0;
}
