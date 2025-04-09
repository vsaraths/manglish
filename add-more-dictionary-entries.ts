import { db } from "./server/db";
import { dictionary } from "./shared/schema";

// A more comprehensive list of Malayalam-English word pairs by category
const dictionaryEntries = [
  // Emotions
  ["santhosham", "happiness", "noun"],
  ["dhukham", "sadness", "noun"],
  ["kopam", "anger", "noun"],
  ["bhayam", "fear", "noun"],
  ["ishtam", "like", "noun"],
  ["verrupu", "hate", "noun"],
  ["asooye", "jealousy", "noun"],
  ["sneham", "love", "noun"],
  
  // Time related
  ["divasam", "day", "noun"],
  ["azhcha", "week", "noun"],
  ["masam", "month", "noun"],
  ["kollam", "year", "noun"],
  ["rathri", "night", "noun"],
  ["pakal", "day time", "noun"],
  ["nerathe", "early", "adverb"],
  ["ravile", "morning", "noun"],
  ["vaikitt", "evening", "noun"],
  ["innu", "today", "adverb"],
  ["innale", "yesterday", "adverb"],
  ["nale", "tomorrow", "adverb"],
  
  // Common verbs
  ["cheyyunnu", "doing", "verb"],
  ["cheythu", "did", "verb"],
  ["cheyyum", "will do", "verb"],
  ["vannu", "came", "verb"],
  ["varum", "will come", "verb"],
  ["poyi", "went", "verb"],
  ["pokum", "will go", "verb"],
  ["parayunnu", "saying", "verb"],
  ["parannu", "said", "verb"],
  ["parayum", "will say", "verb"],
  ["kazhichu", "ate", "verb"],
  ["kazhikkum", "will eat", "verb"],
  ["kudichu", "drank", "verb"],
  ["kudikkum", "will drink", "verb"],
  
  // Common adjectives
  ["nalla", "good", "adjective"],
  ["cheriya", "small", "adjective"],
  ["valiya", "big", "adjective"],
  ["puthuya", "new", "adjective"],
  ["pazhaya", "old", "adjective"],
  ["choodulla", "hot", "adjective"],
  ["thannupulla", "cold", "adjective"],
  ["sundarmaya", "beautiful", "adjective"],
  
  // Places and directions
  ["naadu", "country", "noun"],
  ["pattanam", "city", "noun"],
  ["gramam", "village", "noun"],
  ["kaadu", "forest", "noun"],
  ["kadal", "sea", "noun"],
  ["mala", "mountain", "noun"],
  ["mukalilek", "upward", "adverb"],
  ["thazheek", "downward", "adverb"],
  ["valath", "right", "noun"],
  ["idath", "left", "noun"],
  ["aduth", "near", "adverb"],
  ["akale", "far", "adverb"],
  ["purathu", "outside", "adverb"],
  ["akathu", "inside", "adverb"],
  
  // Colors
  ["niram", "color", "noun"],
  ["chuvannu", "red", "adjective"],
  ["pacha", "green", "adjective"],
  ["neela", "blue", "adjective"],
  ["manja", "yellow", "adjective"],
  ["karuppu", "black", "adjective"],
  ["veluppu", "white", "adjective"],
  
  // Transportation
  ["vahanam", "vehicle", "noun"],
  ["train", "train", "noun"],
  ["lorry", "truck", "noun"],
  ["plane", "airplane", "noun"],
  ["kapp", "ship", "noun"],
  ["boat", "boat", "noun"],
  ["cycle", "bicycle", "noun"],
  ["auto", "auto-rickshaw", "noun"],
  ["bike", "motorcycle", "noun"],
  
  // Medical terms
  ["rogam", "disease", "noun"],
  ["marunnu", "medicine", "noun"],
  ["doctor", "doctor", "noun"],
  ["asupathri", "hospital", "noun"],
  ["vedana", "pain", "noun"],
  ["jwaram", "fever", "noun"],
  ["chuma", "cough", "noun"],
  ["thalvadena", "headache", "noun"],
  
  // Weather
  ["kaalavasta", "weather", "noun"],
  ["ushnam", "hot", "adjective"],
  ["thannupu", "cold", "adjective"],
  ["mazha", "rain", "noun"],
  ["veyil", "sunshine", "noun"],
  ["meanam", "cloud", "noun"],
  ["minnal", "lightning", "noun"],
  ["idee", "thunder", "noun"],
  
  // Body parts
  ["thalaku", "head", "noun"],
  ["mukham", "face", "noun"],
  ["kannu", "eye", "noun"],
  ["chevy", "ear", "noun"],
  ["mookku", "nose", "noun"],
  ["vai", "mouth", "noun"],
  ["pal", "tooth", "noun"],
  ["kazhuthu", "neck", "noun"],
  ["kai", "hand", "noun"],
  ["kalu", "leg", "noun"],
  ["viral", "finger", "noun"],
  
  // Academic/Professional
  ["vidyalayam", "school", "noun"],
  ["jolly", "job", "noun"],
  ["vaidyan", "doctor", "noun"],
  ["adhyapakan", "teacher", "noun"],
  ["engineer", "engineer", "noun"],
  ["kachavadam", "business", "noun"],
  ["police", "police", "noun"],
  ["nurse", "nurse", "noun"],
  
  // Technology
  ["computer", "computer", "noun"],
  ["phone", "phone", "noun"],
  ["internet", "internet", "noun"],
  ["software", "software", "noun"],
  ["website", "website", "noun"],
  ["app", "app", "noun"],
  ["battery", "battery", "noun"],
  ["camera", "camera", "noun"],
  
  // Common phrases and expressions
  ["ente peru", "my name is", "phrase"],
  ["ninte peru", "your name is", "phrase"],
  ["sugham ano", "are you well", "question"],
  ["evide pokunu", "where are you going", "question"],
  ["namuk pokkam", "let's go", "phrase"],
  ["kandu mutt", "nice to meet you", "phrase"],
  ["scene illa", "no problem", "phrase"],
  ["nannayi", "well done", "expression"],
  ["kollam", "good/fine", "expression"],
  ["sughamano", "how are you", "question"],
  ["ethrayi", "how much", "question"],
  ["evideya", "where is", "question"],
  ["pattuo", "is it possible", "question"]
];

// Function to add words to the dictionary
async function addMoreWords() {
  console.log("Adding more words to the dictionary...");
  
  // Get existing words to avoid duplicates
  const existingEntries = await db.select({ word: dictionary.manglishWord }).from(dictionary);
  const existingWords = new Set(existingEntries.map(entry => entry.word));
  
  console.log(`Found ${existingWords.size} existing words in dictionary.`);
  let addedCount = 0;
  
  // Process each word
  for (const [manglishWord, englishWord, partOfSpeech] of dictionaryEntries) {
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
      
      // Add to existing set to avoid future duplicates
      existingWords.add(lowerManglishWord);
    } catch (error) {
      console.error(`Error adding '${manglishWord}':`, error);
    }
  }
  
  console.log(`Added ${addedCount} new words to the dictionary.`);
}

// Run the function
addMoreWords()
  .then(() => {
    console.log('Dictionary update completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error updating dictionary:', error);
    process.exit(1);
  });