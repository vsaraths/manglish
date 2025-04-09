import { db } from "./server/db";
import { dictionary, type InsertDictionary } from "./shared/schema";
import { eq } from "drizzle-orm";

// A comprehensive list of Manglish to English word pairs
const dictionaryEntries: [string, string, string?][] = [
  // Pronouns and possessives
  ["njan", "I"],
  ["njangal", "we all"],
  ["nammal", "we"],
  ["nee", "you"],
  ["ningal", "you all"],
  ["avan", "he"],
  ["aval", "she"],
  ["avar", "they"],
  ["ithu", "this"],
  ["athu", "that"],
  ["ente", "my"],
  ["ninte", "your"],
  ["avante", "his"],
  ["avalude", "her"],
  ["avarude", "their"],
  ["njangalude", "our"],
  ["ningalude", "your (plural)"],
  ["athinte", "its"],
  ["ee", "this"],
  ["aa", "that"],
  ["eniku", "to me"],
  ["ninaku", "to you"],
  ["avanu", "to him"],
  ["avalu", "to her"],
  ["avark", "to them"],
  ["namuk", "to us"],
  
  // Greetings and common phrases
  ["namaskaram", "hello"],
  ["sughamano", "how are you"],
  ["sugham", "fine"],
  ["pinne", "then"],
  ["ennitt", "and then"],
  ["athinu", "for that"],
  ["athinu shesham", "after that"],
  ["ippo", "now"],
  ["ennu", "that"],
  ["pakshe", "but"],
  ["allengil", "or else"],
  ["angane", "like that"],
  ["ingane", "like this"],
  ["vendathe", "unnecessarily"],
  ["swayam", "self"],
  ["padam", "picture"],
  ["cinema", "movie"],
  ["pustakam", "book"],
  ["veedu", "house"],
  ["veetil", "at home"],
  ["school", "school"],
  ["college", "college"],
  ["office", "office"],
  ["ethandu", "approximately"],
  ["avasanam", "finally"],
  ["aadhyam", "first"],
  ["randamathu", "second"],
  ["moonamathu", "third"],
  
  // Time related
  ["innu", "today"],
  ["innale", "yesterday"],
  ["nale", "tomorrow"],
  ["divasam", "day"],
  ["azhcha", "week"],
  ["masam", "month"],
  ["kollam", "year"],
  ["rathri", "night"],
  ["pakal", "day time"],
  ["udane", "immediately"],
  ["mathiyakumbozh", "noon"],
  ["vaikitt", "evening"],
  ["nerathe", "early"],
  ["samayam", "time"],
  ["ravile", "morning"],
  ["vazhi", "way"],
  ["jannal", "window"],
  ["kathu", "letter"],
  
  // Question words
  ["enthu", "what"],
  ["engane", "how"],
  ["ethra", "how much"],
  ["evide", "where"],
  ["epol", "when"],
  ["ethokke", "which all"],
  ["ethanu", "which one"],
  ["enthukondu", "why"],
  ["aaruthe", "whose"],
  ["aaru", "who"],
  
  // Places and directions
  ["naadu", "country"],
  ["pattanam", "city"],
  ["gramam", "village"],
  ["road", "road"],
  ["kaadu", "forest"],
  ["kadal", "sea"],
  ["thuramukham", "port"],
  ["mala", "mountain"],
  ["mukalilek", "upward"],
  ["thazheek", "downward"],
  ["valath", "right"],
  ["idath", "left"],
  ["aduth", "near"],
  ["akale", "far"],
  ["purathu", "outside"],
  ["akathu", "inside"],
  ["nadu", "center"],
  
  // Colors
  ["niram", "color"],
  ["chuvannu", "red"],
  ["pacha", "green"],
  ["neela", "blue"],
  ["manja", "yellow"],
  ["karuppu", "black"],
  ["veluppu", "white"],
  ["uduppu", "orange"],
  ["lavender", "purple"],
  
  // Numbers
  ["onnu", "one"],
  ["randu", "two"],
  ["moonnu", "three"],
  ["nalu", "four"],
  ["anchu", "five"],
  ["aru", "six"],
  ["ezhu", "seven"],
  ["ettu", "eight"],
  ["onpathu", "nine"],
  ["pathu", "ten"],
  ["nooru", "hundred"],
  ["aayiram", "thousand"],
  ["laksham", "hundred thousand"],
  ["kodi", "ten million"],
  
  // Common verbs
  ["cheyyunnu", "doing"],
  ["cheythu", "did"],
  ["cheyyum", "will do"],
  ["varunnu", "coming"],
  ["vannu", "came"],
  ["varum", "will come"],
  ["pokunnu", "going"],
  ["poyi", "went"],
  ["pokum", "will go"],
  ["parayunnu", "saying"],
  ["parannu", "said"],
  ["parayum", "will say"],
  ["kazhikkunnu", "eating"],
  ["kazhichu", "ate"],
  ["kazhikkum", "will eat"],
  ["kudikunnu", "drinking"],
  ["kudichu", "drank"],
  ["kudikkum", "will drink"],
  ["vaayikkunnu", "reading"],
  ["vaachichu", "read"],
  ["vaayikkum", "will read"],
  ["ezhuthunnu", "writing"],
  ["ezhuthi", "wrote"],
  ["ezhuthum", "will write"],
  ["uranggunnu", "sleeping"],
  ["urangi", "slept"],
  ["urangum", "will sleep"],
  ["odunnu", "running"],
  ["odi", "ran"],
  ["odum", "will run"],
  ["nadakkunnu", "walking"],
  ["nadannu", "walked"],
  ["nadakkum", "will walk"],
  ["chavunnu", "jumping"],
  ["chadi", "jumped"],
  ["chadum", "will jump"],
  
  // Common adjectives
  ["nalla", "good"],
  ["cheriya", "small"],
  ["valiya", "big"],
  ["puthuya", "new"],
  ["pazhaya", "old"],
  ["pazham", "fruit"],
  ["choodulla", "hot"],
  ["thannupulla", "cold"],
  ["ozhapulla", "wet"],
  ["varantta", "dry"],
  ["neralulla", "straight"],
  ["valantta", "bent"],
  ["sampoorna", "complete"],
  ["parathiyeka", "partial"],
  ["sundarmaya", "beautiful"],
  ["bheekara", "terrible"],
  ["thallakoodiya", "expensive"],
  ["vilakurantta", "cheap"],
  ["vegathill", "quick"],
  ["mangiyathaya", "dull"],
  
  // Food related
  ["bhakshanam", "food"],
  ["choru", "rice"],
  ["dosa", "dosa"],
  ["chaya", "tea"],
  ["kaapi", "coffee"],
  ["veellam", "water"],
  ["paal", "milk"],
  ["pazham", "fruit"],
  ["pachakkari", "vegetable"],
  ["erachi", "meat"],
  ["meen", "fish"],
  ["koli", "chicken"],
  ["motta", "egg"],
  ["chapathi", "chapati"],
  ["appam", "appam"],
  ["puttu", "puttu"],
  ["sambar", "sambar"],
  ["aviyal", "aviyal"],
  ["payasam", "sweet pudding"],
  
  // Family relationships
  ["amma", "mother"],
  ["achan", "father"],
  ["chettan", "elder brother"],
  ["chechi", "elder sister"],
  ["aniyan", "younger brother"],
  ["aniyathi", "younger sister"],
  ["ammamma", "grandmother (maternal)"],
  ["appupan", "grandfather (maternal)"],
  ["ammayiamma", "mother-in-law"],
  ["ammavan", "uncle (maternal)"],
  ["atthai", "aunt (maternal)"],
  ["aliyan", "brother-in-law"],
  ["kunjh", "baby"],
  ["kutty", "child"],
  ["mol", "daughter"],
  ["makan", "son"],
  ["marumakal", "daughter-in-law"],
  ["marumakan", "son-in-law"],
  
  // Common objects
  ["masha", "table"],
  ["kursi", "chair"],
  ["kattil", "bed"],
  ["vathil", "door"],
  ["jannal", "window"],
  ["visakku", "fan"],
  ["vilakku", "lamp"],
  ["phone", "phone"],
  ["computer", "computer"],
  ["tv", "television"],
  ["aduppu", "stove"],
  ["frisku", "refrigerator"],
  ["sofa", "sofa"],
  ["kallu", "stone"],
  ["manam", "sand"],
  ["kaathadi", "wind"],
  
  // Body parts
  ["thalaku", "head"],
  ["mukham", "face"],
  ["kannu", "eye"],
  ["chevy", "ear"],
  ["mookku", "nose"],
  ["vai", "mouth"],
  ["pal", "tooth"],
  ["naakku", "tongue"],
  ["thaadi", "beard"],
  ["kazhuthu", "neck"],
  ["thol", "shoulder"],
  ["kai", "hand"],
  ["kalu", "leg"],
  ["viral", "finger"],
  ["nakkam", "nail"],
  ["hrudayam", "heart"],
  ["rektham", "blood"],
  
  // Emotions
  ["santhosham", "happiness"],
  ["dhukham", "sadness"],
  ["kopam", "anger"],
  ["bhayam", "fear"],
  ["ishtam", "like"],
  ["verrupu", "hate"],
  ["asooye", "jealousy"],
  ["sneham", "love"],
  ["santoshatthodu", "happily"],
  ["dukhathodu", "sadly"],
  ["kopathodu", "angrily"],
  ["bhayathodu", "fearfully"],
  
  // Nature related
  ["prakriti", "nature"],
  ["akasham", "sky"],
  ["bhoomi", "earth"],
  ["agni", "fire"],
  ["jalam", "water"],
  ["vayu", "air"],
  ["suryan", "sun"],
  ["chandran", "moon"],
  ["nakshatram", "star"],
  ["mazha", "rain"],
  ["pookkal", "flowers"],
  ["marangal", "trees"],
  ["kadalum", "ocean"],
  ["puzha", "river"],
  ["thada", "lake"],
  ["mala", "mountain"],
  ["kunnu", "hill"],
  ["thaazhvara", "valley"],
  
  // Weather
  ["kaalavasta", "weather"],
  ["ushnam", "hot"],
  ["thannupu", "cold"],
  ["mazha", "rain"],
  ["veyil", "sunshine"],
  ["mudal", "fog"],
  ["meanam", "cloud"],
  ["minnal", "lightning"],
  ["idee", "thunder"],
  ["kodharam", "storm"],
  ["manjhu", "snow"],
  ["chavadikatt", "hail"],
  
  // Clothing
  ["vasthram", "clothes"],
  ["shirt", "shirt"],
  ["panth", "pants"],
  ["saree", "sari"],
  ["churidar", "churidar"],
  ["mundu", "dhoti"],
  ["jubbah", "long coat"],
  ["thopp", "cap/hat"],
  ["cheripu", "shoes"],
  ["udupp", "dress"],
  
  // Transportation
  ["vahanam", "vehicle"],
  ["car", "car"],
  ["bus", "bus"],
  ["train", "train"],
  ["lorry", "truck"],
  ["plane", "airplane"],
  ["kapp", "ship"],
  ["boat", "boat"],
  ["cycle", "bicycle"],
  ["auto", "auto-rickshaw"],
  ["scooter", "scooter"],
  ["bike", "motorcycle"],
  
  // Academic/Professional
  ["vidyalayam", "school"],
  ["college", "college"],
  ["university", "university"],
  ["office", "office"],
  ["jolly", "job"],
  ["vaidyan", "doctor"],
  ["adhyapakan", "teacher"],
  ["engineer", "engineer"],
  ["kachavadam", "business"],
  ["police", "police"],
  ["nurse", "nurse"],
  ["principal", "principal"],
  ["headmaster", "headmaster"],
  ["professor", "professor"],
  
  // Technology
  ["computer", "computer"],
  ["phone", "phone"],
  ["internet", "internet"],
  ["software", "software"],
  ["website", "website"],
  ["app", "app"],
  ["samketham", "technology"],
  ["battery", "battery"],
  ["charger", "charger"],
  ["camera", "camera"],
  ["radio", "radio"],
  
  // Expressions and interjections
  ["mone", "son (address)"],
  ["mole", "daughter (address)"],
  ["chetta", "brother (address)"],
  ["chechi", "sister (address)"],
  ["saar", "sir"],
  ["madame", "madam"],
  ["chekkan", "boy"],
  ["pennu", "girl"],
  ["maashe", "teacher (address)"],
  ["ayyoo", "oh no"],
  ["eda", "hey (to male)"],
  ["edi", "hey (to female)"],
  ["poda", "get lost (to male)"],
  ["podi", "get lost (to female)"],
  ["mathi", "enough"],
  ["sheri", "okay"],
  ["kollalo", "great/nice"],
  
  // Common adverbs
  ["vegam", "quickly"],
  ["enthayalum", "anyway"],
  ["pinneyum", "again"],
  ["sadharana", "usually"],
  ["kadhinam", "severely"],
  ["alpam", "slightly"],
  ["valare", "very"],
  ["kurach", "a little"],
  ["adipoli", "awesome"],
  ["kshanam", "moment"],
  ["orumich", "together"],
  ["thanichu", "alone"],
  
  // Common conjunctions and particles
  ["pinne", "then"],
  ["athava", "or"],
  ["koodathe", "moreover"],
  ["pakshe", "but"],
  ["ennalum", "nevertheless"],
  ["athukondu", "therefore"],
  ["karanam", "because"],
  ["athupole", "likewise"],
  
  // Common prepositions
  ["munpil", "in front of"],
  ["pinnil", "behind"],
  ["mukalil", "above"],
  ["adiyil", "below"],
  ["ullil", "inside"],
  ["purathu", "outside"],
  ["idakku", "between"],
  ["aduthu", "near"],
  ["doorathu", "far"],
  ["koodathe", "besides"],
  
  // Medical terms
  ["rogam", "disease"],
  ["marunnu", "medicine"],
  ["doctor", "doctor"],
  ["asupathri", "hospital"],
  ["vedana", "pain"],
  ["jwaram", "fever"],
  ["chuma", "cough"],
  ["thalvadena", "headache"],
  ["vayyavadena", "stomach ache"],
  
  // Special Kerala phrases
  ["adipoli", "awesome"],
  ["kidu", "cool/great"],
  ["scene illa", "no problem"],
  ["nannayi", "well done"],
  ["kollam", "good/fine"],
  ["shariyayi", "correct"],
  ["sughamano", "how are you"],
  ["ethrayi", "how much"],
  ["evideya", "where is"],
  ["pattuo", "is it possible"],
  
  // Modern technology and internet
  ["internet", "internet"],
  ["email", "email"],
  ["phone", "phone"],
  ["chat", "chat"],
  ["website", "website"],
  ["selfie", "selfie"],
  ["password", "password"],
  ["login", "login"],
  ["share", "share"],
  ["like", "like"],
  ["post", "post"],
  ["online", "online"],
  ["video", "video"],
  ["photo", "photo"],
  
  // Education related
  ["padikkuka", "to study"],
  ["padichu", "studied"],
  ["padanam", "study"],
  ["parasha", "exam"],
  ["school", "school"],
  ["college", "college"],
  ["teacher", "teacher"],
  ["vidyarthi", "student"],
  ["class", "class"],
  ["book", "book"],
  ["pen", "pen"],
  ["pustakam", "book"],
  ["notebook", "notebook"],
  
  // Special pattern phrases
  ["ente peru", "my name is"],
  ["ninte peru", "your name is"],
  ["enne vilikkane", "call me"],
  ["sugham ano", "are you well"],
  ["evide pokunu", "where are you going"],
  ["ethiru varum", "when will you come"],
  ["namuk pokkam", "let's go"],
  ["kandu mutt", "nice to meet you"],
  ["enthu vishesham", "what's new"],
  ["nale kayaum", "see you tomorrow"]
];

// Function to insert dictionary entries in batches
async function insertDictionaryEntries() {
  console.log("Adding more entries to the dictionary...");
  
  let addedCount = 0;
  const BATCH_SIZE = 50; // Process 50 words at a time
  
  // First, get all existing words from dictionary to avoid querying repeatedly
  const existingEntries = await db.select({ word: dictionary.manglishWord }).from(dictionary);
  const existingWords = new Set(existingEntries.map(entry => entry.word));
  
  console.log(`Found ${existingWords.size} existing words in dictionary.`);
  
  // Process entries in batches
  for (let i = 0; i < dictionaryEntries.length; i += BATCH_SIZE) {
    const batch = dictionaryEntries.slice(i, i + BATCH_SIZE);
    
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(dictionaryEntries.length/BATCH_SIZE)}...`);
    
    // Prepare all inserts for the batch
    const valuesToInsert = [];
    
    for (const [manglishWord, englishWord, partOfSpeech] of batch) {
      try {
        // Get the lowercase version once
        const lowerManglishWord = manglishWord.toLowerCase();
        
        // Check if word already exists in our Set
        if (!existingWords.has(lowerManglishWord)) {
          // Add to our batch
          const newEntry: InsertDictionary = {
            manglishWord: lowerManglishWord,
            englishWord,
            partOfSpeech: partOfSpeech || null,
            examples: []
          };
          valuesToInsert.push(newEntry);
          
          // Add to our Set to avoid duplicates in future batches
          existingWords.add(lowerManglishWord);
        }
      } catch (error) {
        console.error(`Error processing '${manglishWord}':`, error);
      }
    }
    
    // Now do a bulk insert for all the new words in this batch
    if (valuesToInsert.length > 0) {
      try {
        // Insert entries one by one to avoid TypeScript issues with bulk insert
        for (const entry of valuesToInsert) {
          await db.insert(dictionary).values(entry);
          addedCount++;
        }
        console.log(`Added ${valuesToInsert.length} entries from current batch.`);
      } catch (error) {
        console.error(`Error during batch insert:`, error);
      }
    } else {
      console.log(`No new entries to add from current batch.`);
    }
  }
  
  console.log(`Total: Added ${addedCount} new entries to the dictionary.`);
}

// Run the function
insertDictionaryEntries()
  .then(() => {
    console.log('Dictionary enrichment completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error enriching dictionary:', error);
    process.exit(1);
  });