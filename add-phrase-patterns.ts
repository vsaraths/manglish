import { db } from "./server/db";
import { dictionary } from "./shared/schema";

// Malayalam sentence patterns with their translations
// These are more complex phrases that follow common patterns in Malayalam
const phrasePatterns = [
  // Possession patterns
  ["ente veedu", "my house", "phrase", ["Ente veedu valuthanu"]],
  ["ninte pusthakam", "your book", "phrase", ["Ninte pusthakam evideyanu?"]],
  ["avante car", "his car", "phrase", ["Avante car puthiyathanu"]],
  ["avalude phone", "her phone", "phrase", ["Avalude phone enthu vila?"]],
  ["avarude naadu", "their country", "phrase", ["Avarude naadu valiya kathanu"]],
  
  // Location patterns
  ["veetil aanu", "is at home", "phrase", ["Njan veetil aanu", "Amma veetil aanu"]],
  ["schoolil aanu", "is at school", "phrase", ["Kuttikal schoolil aanu"]],
  ["evideyanu", "where is", "phrase", ["Ninte veedu evideyanu?"]],
  ["ivide aanu", "is here", "phrase", ["Njan ivide aanu"]],
  ["avide aanu", "is there", "phrase", ["Avan avide aanu"]],
  
  // Want/need patterns
  ["enikku venam", "I want/need", "phrase", ["Enikku vellam venam", "Enikku sahayam venam"]],
  ["ninakku venam", "you want/need", "phrase", ["Ninakku enthu venam?"]],
  ["avannu venam", "he wants/needs", "phrase", ["Avannu paisa venam"]],
  ["avalku venam", "she wants/needs", "phrase", ["Avalku vishraamam venam"]],
  ["namukku venam", "we want/need", "phrase", ["Namukku bhakshanam venam"]],
  
  // Time patterns
  ["ippo cheyyunnu", "doing now", "phrase", ["Njan ippo padikunnu"]],
  ["nale cheyyum", "will do tomorrow", "phrase", ["Njan nale varum"]],
  ["innale cheythu", "did yesterday", "phrase", ["Avan innale poyee"]],
  ["kazhinja azhcha", "last week", "phrase", ["Kazhinja azhcha njagal Delhiyil poyee"]],
  ["aduttha masam", "next month", "phrase", ["Aduttha masam njagal Americayil pokum"]],
  
  // Being/status patterns
  ["njan aanu", "I am", "phrase", ["Njan doctor aanu", "Njan vidyarthi aanu"]],
  ["nee aanu", "you are", "phrase", ["Nee nalla kutti aanu"]],
  ["avan aanu", "he is", "phrase", ["Avan ente chettan aanu"]],
  ["aval aanu", "she is", "phrase", ["Aval ente sister aanu"]],
  ["athu aanu", "that is", "phrase", ["Athu ente car aanu"]],
  
  // Ability patterns
  ["enikku ariyaam", "I know", "phrase", ["Enikku Malayalam ariyaam"]],
  ["enikku pattum", "I can", "phrase", ["Enikku car odikkan pattum"]],
  ["enikku patilla", "I cannot", "phrase", ["Enikku innu varaana patilla"]],
  ["avannu ariyaam", "he knows", "phrase", ["Avannu paadaan ariyaam"]],
  ["avalku pattum", "she can", "phrase", ["Avalku nannaayi paadaan pattum"]],
  
  // Question patterns
  ["enthu cheyyunnu", "what are (you) doing", "phrase", ["Nee enthu cheyyunnu?"]],
  ["engane undu", "how is it", "phrase", ["Jeevitham engane undu?"]],
  ["aaranu", "who is", "phrase", ["Aaranu varunnathu?"]],
  ["enthanu", "what is", "phrase", ["Ithinte vila enthanu?"]],
  ["eppo varum", "when will (you) come", "phrase", ["Nee eppo varum?"]],
  
  // Negation patterns
  ["alla", "is not", "phrase", ["Ithu valuthalla", "Avan ente chettan alla"]],
  ["illa", "don't have/there isn't", "phrase", ["Enikku samayam illa", "Ividay aarum illa"]],
  ["venda", "don't want", "phrase", ["Enikku athu venda", "Ippo venda"]],
  ["cheyyaruth", "don't do", "phrase", ["Athu cheyyaruth"]],
  ["pokaruth", "don't go", "phrase", ["Avide pokaruth"]],
  
  // Likes/dislikes patterns
  ["enikku ishtamanu", "I like", "phrase", ["Enikku music ishtamanu"]],
  ["enikku ishtamalla", "I don't like", "phrase", ["Enikku mazha ishtamalla"]],
  ["avannu ishtamanu", "he likes", "phrase", ["Avannu cinema ishtamanu"]],
  ["avalku ishtamalla", "she doesn't like", "phrase", ["Avalku kaaram ishtamalla"]],
  ["enthu ishtamanu", "what do (you) like", "phrase", ["Ninaku enthu ishtamanu?"]],
  
  // Common conversational phrases
  ["sugham aano", "are you well", "phrase", ["Sugham aano? Enthu vishesham?"]],
  ["enthu vishesham", "what's new", "phrase", ["Enthu vishesham? Sugham aano?"]],
  ["epadi undu", "how are you", "phrase", ["Epadi undu? Sugham thanne?"]],
  ["nanni", "thank you", "phrase", ["Nanni, sugham aano?"]],
  ["pinne kaanam", "see you later", "phrase", ["Pinne kaanam, sughamaayi poyi vaa"]],
  
  // Common adjectival patterns
  ["valiya aanu", "is big", "phrase", ["Ente veedu valiya aanu"]],
  ["cheriya aanu", "is small", "phrase", ["Ente car cheriya aanu"]],
  ["nalla aanu", "is good", "phrase", ["Ee pusthaakam nalla aanu"]],
  ["sundaram aanu", "is beautiful", "phrase", ["Ee sthalam sundaram aanu"]],
  ["pazhaya aanu", "is old", "phrase", ["Ente veedu pazhaya aanu"]]
];

// Function to add phrase patterns to the dictionary
async function addPhrasePatterns() {
  console.log("Adding phrase patterns to the dictionary...");
  
  // Get existing words to avoid duplicates
  const existingEntries = await db.select({ word: dictionary.manglishWord }).from(dictionary);
  const existingWords = new Set(existingEntries.map(entry => entry.word));
  
  console.log(`Found ${existingWords.size} existing words in dictionary.`);
  let addedCount = 0;
  
  // Process each phrase
  for (const [manglishPhrase, englishPhrase, partOfSpeech, examples] of phrasePatterns) {
    const lowerManglishPhrase = manglishPhrase.toLowerCase();
    
    // Skip if phrase already exists
    if (existingWords.has(lowerManglishPhrase)) {
      continue;
    }
    
    try {
      // Add the new phrase
      await db.insert(dictionary).values({
        manglishWord: lowerManglishPhrase,
        englishWord: englishPhrase,
        partOfSpeech,
        examples: examples || []
      });
      
      addedCount++;
      
      // Add to existing set to avoid future duplicates
      existingWords.add(lowerManglishPhrase);
    } catch (error) {
      console.error(`Error adding '${manglishPhrase}':`, error);
    }
  }
  
  console.log(`Added ${addedCount} new phrase patterns to the dictionary.`);
}

// Run the function
addPhrasePatterns()
  .then(() => {
    console.log('Phrase patterns addition completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding phrase patterns:', error);
    process.exit(1);
  });