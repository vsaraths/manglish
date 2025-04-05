import { apiRequest } from "./queryClient";

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
    
    dictionaryEntries.forEach((entry: any) => {
      const key = entry.manglishWord.toLowerCase();
      wordMap.set(key, entry.englishWord);
      
      // Add to phrase map if it contains spaces (it's a phrase)
      if (key.includes(' ')) {
        phraseMap.set(key, entry.englishWord);
      }
    });
    
    // First, try to match entire phrases in the input text
    let workingText = manglishText.toLowerCase();
    
    // Sort phrases by length (longest first) to catch longer phrases before subphrases
    const sortedPhrases = Array.from(phraseMap.keys()).sort((a, b) => b.length - a.length);
    
    for (const phrase of sortedPhrases) {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      workingText = workingText.replace(regex, (match) => {
        // Use placeholder to prevent further replacements of this section
        return `__PHRASE_${phraseMap.get(phrase.toLowerCase())}__`;
      });
    }
    
    // Now handle individual words
    // Tokenize the input text into words and spaces
    const tokens = workingText.split(/(\s+|\b)/);
    
    // Translate each word if it exists in the dictionary
    const translatedTokens = tokens.map(token => {
      // If it's a phrase placeholder, restore it
      if (token.startsWith('__PHRASE_') && token.endsWith('__')) {
        return token.slice(9, -2); // Remove the placeholder markers
      }
      
      const cleanToken = token.toLowerCase().trim();
      
      // Skip punctuation and whitespace
      if (!cleanToken || /^[\s.,!?;:'"()[\]{}]+$/.test(cleanToken)) {
        return token;
      }
      
      // Try to find the word in our dictionary
      const translatedWord = wordMap.get(cleanToken);
      
      if (translatedWord) {
        // Preserve capitalization from original token
        if (token[0] === token[0].toUpperCase()) {
          return translatedWord.charAt(0).toUpperCase() + translatedWord.slice(1);
        }
        return translatedWord;
      }
      
      // Return original token if not found in dictionary
      return token;
    });
    
    // Join the translated words back to form a sentence
    let translatedText = translatedTokens.join('');
    
    // Apply grammar corrections and formatting
    translatedText = translatedText
      // Ensure proper spacing after punctuation
      .replace(/([.,!?;:])\s*/g, '$1 ')
      // Ensure proper sentence capitalization
      .replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase()))
      // Fix multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
      
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
