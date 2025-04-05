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
    
    // Create a mapping for quick lookup
    const wordMap = new Map();
    dictionaryEntries.forEach((entry: any) => {
      wordMap.set(entry.manglishWord.toLowerCase(), entry.englishWord);
    });
    
    // Tokenize the input text into words
    const words = manglishText.split(/(\s+|\b)/);
    
    // Translate each word if it exists in the dictionary
    const translatedWords = words.map(word => {
      const cleanWord = word.toLowerCase().trim();
      
      // Skip punctuation and whitespace
      if (!cleanWord || /^[\s.,!?;:'"()[\]{}]+$/.test(cleanWord)) {
        return word;
      }
      
      // Try to find the word in our dictionary
      const translatedWord = wordMap.get(cleanWord);
      
      if (translatedWord) {
        // Preserve capitalization
        if (word[0] === word[0].toUpperCase()) {
          return translatedWord.charAt(0).toUpperCase() + translatedWord.slice(1);
        }
        return translatedWord;
      }
      
      // Return original word if not found in dictionary
      return word;
    });
    
    // Join the translated words back to form a sentence
    let translatedText = translatedWords.join('');
    
    // Basic grammar corrections
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
