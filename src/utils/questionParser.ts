import Papa from 'papaparse';
import { Question, Category, QuestionStep } from '../types/game';

// Define the expected CSV row structure
interface CSVRow {
  'Deck / Theme': string;
  'Sequence / Q#': string;
  'Category / Domain': string;
  'Difficulty': string;
  'Question Type': string;
  'Question': string;
  'Answer': string;
  'The Link': string;
  'Notes / Hidden Chain': string;
  'Connection Type': string;
  'Franchise / IP': string;
  'Status / Playtested': string;
  'Safety Checks Passed': string;
  'Sub-Theme': string;
}

// 🛡️ Sentinel: Escape HTML characters to prevent XSS attacks (Defense in Depth) without destroying valid math/code text.
const sanitizeHTML = (str: string): string => {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
};

// Utility to determine points based on difficulty
const getPointsForDifficulty = (difficulty: string): number => {
  const diffUpper = difficulty.toUpperCase();
  if (diffUpper.includes('CASUAL') || diffUpper.includes('LEVEL 1')) return 1;
  if (diffUpper.includes('FAN') || diffUpper.includes('LEVEL 2')) return 2;
  if (diffUpper.includes('HARDCORE') || diffUpper.includes('LEVEL 3')) return 3;
  if (diffUpper.includes('EXPERT') || diffUpper.includes('TRIPLE THREAT')) return 5;
  return 1; // Default
};

// Map raw domain to standard Category
const mapCategory = (domain: string): Category => {
  const dUpper = domain.toUpperCase();
  if (dUpper.includes('ANIMATION')) return 'Animation';
  if (dUpper.includes('WRESTLING')) return 'Pro Wrestling';
  if (dUpper.includes('VIDEO GAMES')) return 'Video Games';
  return 'Animation'; // Fallback
};

// Map sequence string (like "Q1", "Q2", "Q3") to step index
const mapSequenceToStep = (sequence: string): QuestionStep => {
  if (sequence.includes('1')) return 0;
  if (sequence.includes('2')) return 1;
  if (sequence.includes('3')) return 2;
  return 0; // Default fallback
};

export const parseQuestionsCSV = (csvData: string): Question[] => {
  const result = Papa.parse<CSVRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    console.error('Errors parsing CSV:', result.errors);
  }

  const validQuestions: Question[] = [];

  result.data.forEach((row, index) => {
    if (!row['Question'] || !row['Answer'] || !row['Category / Domain']) {
      return;
    }

    try {
      const answer = sanitizeHTML(row['Answer']);
      const q: Question = {
        step: mapSequenceToStep(row['Sequence / Q#'] || ''),
        category: mapCategory(row['Category / Domain']),
        questionText: sanitizeHTML(row['Question']),
        answer: answer,
        acceptedVariants: answer.includes(',') ? answer.split(',').map(s => s.trim()) : [],
        points: getPointsForDifficulty(row['Difficulty'] || ''),
      };
      validQuestions.push(q);
    } catch (e) {
      console.warn(`Failed to parse row ${index}:`, row, e);
    }
  });

  return validQuestions;
};

// Extended type for the Database hook to use
export interface DatabaseQuestion extends Question {
  rawDifficulty: string;
  deckTheme: string;
  rawDomain: string;
  normalizedDifficulty: string;
  normalizedDeckTheme: string;
}

export const parseDatabaseCSV = (csvData: string): DatabaseQuestion[] => {
  const result = Papa.parse<CSVRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  const dbQuestions: DatabaseQuestion[] = [];

  result.data.forEach((row) => {
    if (!row['Question'] || !row['Answer'] || !row['Category / Domain']) return;

    const rawDifficulty = row['Difficulty'] || 'Casual (Level 1)';
    const deckTheme = row['Deck / Theme'] || 'General';

    dbQuestions.push({
      step: mapSequenceToStep(row['Sequence / Q#'] || ''),
      category: mapCategory(row['Category / Domain']),
      questionText: sanitizeHTML(row['Question']),
      answer: sanitizeHTML(row['Answer']),
      acceptedVariants: [],
      points: getPointsForDifficulty(row['Difficulty'] || ''),
      rawDifficulty: sanitizeHTML(row['Difficulty'] || 'Casual (Level 1)'),
      deckTheme: sanitizeHTML(row['Deck / Theme'] || 'General'),
      rawDomain: sanitizeHTML(row['Category / Domain']),
      rawDifficulty,
      deckTheme,
      rawDomain: row['Category / Domain'],
      normalizedDifficulty: rawDifficulty.toLowerCase(),
      normalizedDeckTheme: deckTheme.toLowerCase(),
    });
  });

  return dbQuestions;
};
