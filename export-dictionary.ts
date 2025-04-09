import * as XLSX from 'xlsx';
import { db } from "./server/db";
import { dictionary } from "./shared/schema";

/**
 * Script to export the entire dictionary to an Excel file
 * This is useful for backup, sharing, or transferring to another system
 */

async function exportDictionary() {
  console.log('Starting dictionary export...');
  
  try {
    // Get all entries from the dictionary
    const entries = await db.select().from(dictionary);
    
    console.log(`Found ${entries.length} entries in dictionary.`);
    
    // Format the data for Excel
    const formattedData = entries.map(entry => ({
      Manglish: entry.manglishWord,
      English: entry.englishWord,
      PartOfSpeech: entry.partOfSpeech || '',
      Examples: Array.isArray(entry.examples) ? entry.examples.join(', ') : '',
      Id: entry.id, // Include ID for reference
      CreatedAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : ''
    }));
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Add column widths for better readability
    const columnWidths = [
      { wch: 20 }, // Manglish
      { wch: 25 }, // English
      { wch: 15 }, // PartOfSpeech
      { wch: 50 }, // Examples
      { wch: 10 }, // Id
      { wch: 20 }  // CreatedAt
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dictionary');
    
    // Generate a filename with date
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filename = `artham-dictionary-export-${dateStr}.xlsx`;
    
    // Write to file
    XLSX.writeFile(workbook, filename);
    
    console.log(`Dictionary successfully exported to: ${filename}`);
    console.log(`Total entries exported: ${entries.length}`);
    
  } catch (error) {
    console.error('Error exporting dictionary:', error);
  }
}

// Run the function
exportDictionary()
  .then(() => {
    console.log('Export completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during export:', error);
    process.exit(1);
  });