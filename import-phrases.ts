#!/usr/bin/env tsx

import { importCommonPhrases, ensureDictionaryTable } from './server/transliteration';

/**
 * This script imports a set of common English-Malayalam phrases into the dictionary
 * using the Aksharamukha API for transliteration
 */
async function main() {
  console.log("Starting import of common Malayalam phrases...");
  
  try {
    // Ensure the dictionary table exists
    await ensureDictionaryTable();
    
    // Import common phrases
    await importCommonPhrases();
    
    console.log("Import completed successfully!");
  } catch (error) {
    console.error("Error during import:", error);
    process.exit(1);
  }
}

// Run the import
main();