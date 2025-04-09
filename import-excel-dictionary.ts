import * as XLSX from 'xlsx';
import { db } from "./server/db";
import { dictionary } from "./shared/schema";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to import Manglish-English word pairs from an Excel file
 * Expected Excel format:
 * - Column A: Manglish word
 * - Column B: English translation
 * - Column C (optional): Part of speech
 * - Column D (optional): Example(s) separated by comma
 */

// Configuration
const EXCEL_FILE_PATH = './dictionary-import.xlsx'; // Change this to match your actual file name

async function importFromExcel() {
  console.log('Starting Excel dictionary import...');
  
  // Check if file exists
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    console.error(`File not found: ${EXCEL_FILE_PATH}`);
    console.log('Please place your Excel file in the project root directory and name it "dictionary-import.xlsx"');
    return;
  }

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} entries in Excel file.`);
    
    // Get existing words to avoid duplicates
    const existingEntries = await db.select({ word: dictionary.manglishWord }).from(dictionary);
    const existingWords = new Set(existingEntries.map(entry => entry.word));
    
    console.log(`Found ${existingWords.size} existing words in dictionary.`);
    
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each row
    for (const row of data) {
      try {
        // Expected column names from Excel
        // These might need adjustment based on your actual Excel headers
        const manglishWord = row['Manglish'] || row['manglish'] || row['MANGLISH'] || row[0];
        const englishWord = row['English'] || row['english'] || row['ENGLISH'] || row[1];
        const partOfSpeech = row['PartOfSpeech'] || row['partOfSpeech'] || row['PART_OF_SPEECH'] || row[2] || null;
        const examplesStr = row['Examples'] || row['examples'] || row['EXAMPLES'] || row[3] || '';
        
        // Skip if any required field is missing
        if (!manglishWord || !englishWord) {
          console.warn('Skipping row due to missing required fields:', row);
          skippedCount++;
          continue;
        }
        
        // Process manglish word (lowercase for consistency)
        const lowerManglishWord = manglishWord.toString().toLowerCase().trim();
        
        // Skip if word already exists
        if (existingWords.has(lowerManglishWord)) {
          skippedCount++;
          continue;
        }
        
        // Process examples if any
        let examples: string[] = [];
        if (examplesStr) {
          if (Array.isArray(examplesStr)) {
            examples = examplesStr;
          } else if (typeof examplesStr === 'string') {
            examples = examplesStr.split(',').map(ex => ex.trim());
          }
        }
        
        // Add the new word
        await db.insert(dictionary).values({
          manglishWord: lowerManglishWord,
          englishWord: englishWord.toString().trim(),
          partOfSpeech: partOfSpeech ? partOfSpeech.toString().trim() : null,
          examples
        });
        
        addedCount++;
        
        // Add to existing set to avoid future duplicates
        existingWords.add(lowerManglishWord);
        
        // Log progress every 50 words
        if (addedCount % 50 === 0) {
          console.log(`Progress: ${addedCount} words added so far...`);
        }
      } catch (error) {
        console.error(`Error processing row:`, row, error);
        errorCount++;
      }
    }
    
    console.log('\nImport completed:');
    console.log(`- Added: ${addedCount} words`);
    console.log(`- Skipped (duplicates or incomplete): ${skippedCount} words`);
    console.log(`- Errors: ${errorCount} words`);
    
  } catch (error) {
    console.error('Error importing Excel file:', error);
  }
}

// Run the function
importFromExcel()
  .then(() => {
    console.log('Excel import completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during Excel import:', error);
    process.exit(1);
  });