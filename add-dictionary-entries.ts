import { db } from "./server/db";
import { dictionary, type InsertDictionary } from "./shared/schema";
import { eq } from "drizzle-orm";

// A list of essential Malayalam-English word pairs
const essentialWords = [
  // Pronouns
  ["njan", "I", "pronoun"],
  ["njangal", "we (exclusive)", "pronoun"],
  ["nammal", "we (inclusive)", "pronoun"],
  ["nee", "you (singular/informal)", "pronoun"],
  ["ningal", "you (plural/formal)", "pronoun"],
  ["avan", "he", "pronoun"],
  ["aval", "she", "pronoun"],
  ["avar", "they", "pronoun"],
  ["ithu", "this", "pronoun"],
  ["athu", "that", "pronoun"],
  
  // Greetings and common phrases
  ["namaskaram", "hello", "greeting"],
  ["sughamano", "how are you", "greeting"],
  ["sugham", "fine", "adjective"],
  ["pinne", "then", "adverb"],
  ["ippo", "now", "adverb"],
  ["ennu", "that", "conjunction"],
  ["pakshe", "but", "conjunction"],
  
  // Family
  ["amma", "mother", "noun"],
  ["achan", "father", "noun"],
  ["chettan", "elder brother", "noun"],
  ["chechi", "elder sister", "noun"],
  ["ammamma", "grandmother", "noun"],
  ["kunjh", "baby", "noun"],
  ["kutty", "child", "noun"],
  
  // Food
  ["bhakshanam", "food", "noun"],
  ["choru", "rice", "noun"],
  ["chaya", "tea", "noun"],
  ["kaapi", "coffee", "noun"],
  ["veellam", "water", "noun"],
  ["paal", "milk", "noun"],
  
  // Common verbs
  ["venam", "want/need", "verb"],
  ["pokunnu", "going", "verb"],
  ["varunnu", "coming", "verb"],
  ["kazhikkunnu", "eating", "verb"],
  ["uranggunnu", "sleeping", "verb"],
  
  // Common objects and places
  ["veedu", "house", "noun"],
  ["school", "school", "noun"],
  ["bus", "bus", "noun"],
  ["cinema", "movie", "noun"],
  ["car", "car", "noun"],
  
  // Question words
  ["enthu", "what", "question"],
  ["engane", "how", "question"],
  ["evide", "where", "question"],
  ["epol", "when", "question"],
  ["ethra", "how much", "question"],
  ["aaru", "who", "question"],
  
  // Numbers
  ["onnu", "one", "number"],
  ["randu", "two", "number"],
  ["moonnu", "three", "number"],
  ["nalu", "four", "number"],
  ["anchu", "five", "number"],
  
  // Useful expressions
  ["kollam", "good/fine", "expression"],
  ["adipoli", "awesome", "expression"],
  ["kidu", "cool/great", "expression"],
  ["mathi", "enough", "expression"],
  ["sheri", "okay", "expression"]
];

// Add these essential words to the dictionary
async function addEssentialWords() {
  console.log("Adding essential words to the dictionary...");
  
  // Get existing words to avoid duplicates
  const existingEntries = await db.select({ word: dictionary.manglishWord }).from(dictionary);
  const existingWords = new Set(existingEntries.map(entry => entry.word));
  
  console.log(`Found ${existingWords.size} existing words in dictionary.`);
  let addedCount = 0;
  
  // Process each word
  for (const [manglishWord, englishWord, partOfSpeech] of essentialWords) {
    const lowerManglishWord = manglishWord.toLowerCase();
    
    // Skip if word already exists
    if (existingWords.has(lowerManglishWord)) {
      continue;
    }
    
    try {
      // Add the new word
      await db.insert(dictionary).values({
        manglishWord: lowerManglishWord,
        englishWord,
        partOfSpeech,
        examples: []
      });
      
      addedCount++;
      console.log(`Added: ${lowerManglishWord} = ${englishWord}`);
      
      // Add to existing set to avoid future duplicates
      existingWords.add(lowerManglishWord);
    } catch (error) {
      console.error(`Error adding '${manglishWord}':`, error);
    }
  }
  
  console.log(`Added ${addedCount} new essential words to the dictionary.`);
}

// Run the function
addEssentialWords()
  .then(() => {
    console.log('Dictionary update completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error updating dictionary:', error);
    process.exit(1);
  });