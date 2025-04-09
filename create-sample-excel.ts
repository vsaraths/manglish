import * as XLSX from 'xlsx';
import * as fs from 'fs';

/**
 * This script creates a sample Excel template for dictionary entries
 * Users can fill this template and then import it using import-excel-dictionary.ts
 */

// Sample data to include in the template
const sampleData = [
  {
    Manglish: 'njan',
    English: 'I',
    PartOfSpeech: 'pronoun',
    Examples: 'Njan veetil aanu, Njan school il pokunnu'
  },
  {
    Manglish: 'veedu',
    English: 'house',
    PartOfSpeech: 'noun',
    Examples: 'Ente veedu valuthanu'
  },
  {
    Manglish: 'kollam',
    English: 'good/fine',
    PartOfSpeech: 'adjective',
    Examples: 'Athu kollam!'
  },
  {
    Manglish: 'sughamano',
    English: 'how are you',
    PartOfSpeech: 'question',
    Examples: 'Sughamano? Enthu vishesham?'
  },
  {
    Manglish: 'ente peru',
    English: 'my name is',
    PartOfSpeech: 'phrase',
    Examples: 'Ente peru Rahul aanu'
  }
];

// Create the workbook
function createSampleExcel() {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dictionary');
  
  // Add instructions in another sheet
  const instructionsData = [
    { Instructions: 'Fill in your Manglish-English word pairs in this template' },
    { Instructions: 'Column A (Manglish): The Manglish word or phrase' },
    { Instructions: 'Column B (English): The English translation' },
    { Instructions: 'Column C (PartOfSpeech): Optional - noun, verb, adjective, pronoun, phrase, etc.' },
    { Instructions: 'Column D (Examples): Optional - Example sentences separated by commas' },
    { Instructions: 'Save this file as "dictionary-import.xlsx" in the project root' },
    { Instructions: 'Then run: npx tsx import-excel-dictionary.ts' }
  ];
  
  const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  
  // Write to file
  const filename = 'dictionary-template.xlsx';
  XLSX.writeFile(workbook, filename);
  
  console.log(`Sample Excel template created: ${filename}`);
  console.log('Fill this template with your own dictionary entries and save as "dictionary-import.xlsx"');
  console.log('Then run: npx tsx import-excel-dictionary.ts');
}

// Run the function
createSampleExcel();