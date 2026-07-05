import Papa from 'papaparse';

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
const sanitizeHTML = (str: string): string => {
  if (!str) return '';
  return str.replace(/[&<>"']/g, match => HTML_ENTITIES[match]);
};
const getPointsForDifficulty = (difficulty: string): number => {
  const diffUpper = difficulty.toUpperCase();
  if (diffUpper.includes('CASUAL') || diffUpper.includes('LEVEL 1')) return 1;
  if (diffUpper.includes('FAN') || diffUpper.includes('LEVEL 2')) return 2;
  if (diffUpper.includes('HARDCORE') || diffUpper.includes('LEVEL 3')) return 3;
  if (diffUpper.includes('EXPERT') || diffUpper.includes('TRIPLE THREAT')) return 5;
  return 1;
};
const mapCategory = (domain: string): any => {
  const dUpper = domain.toUpperCase();
  if (dUpper.includes('ANIMATION')) return 'Animation';
  if (dUpper.includes('WRESTLING')) return 'Pro Wrestling';
  if (dUpper.includes('VIDEO GAMES')) return 'Video Games';
  return 'Animation';
};
const mapSequenceToStep = (sequence: string): any => {
  if (sequence.includes('1')) return 0;
  if (sequence.includes('2')) return 1;
  if (sequence.includes('3')) return 2;
  return 0;
};

// With memoization
const pointsCache = new Map<string, number>();
const getPointsForDifficultyMemo = (diff: string) => {
  let val = pointsCache.get(diff);
  if (val !== undefined) return val;
  val = getPointsForDifficulty(diff);
  pointsCache.set(diff, val);
  return val;
};
const categoryCache = new Map<string, any>();
const mapCategoryMemo = (domain: string) => {
  let val = categoryCache.get(domain);
  if (val !== undefined) return val;
  val = mapCategory(domain);
  categoryCache.set(domain, val);
  return val;
};
const seqCache = new Map<string, any>();
const mapSequenceToStepMemo = (seq: string) => {
  let val = seqCache.get(seq);
  if (val !== undefined) return val;
  val = mapSequenceToStep(seq);
  seqCache.set(seq, val);
  return val;
};

let csvData = `Deck / Theme,Sequence / Q#,Category / Domain,Difficulty,Question Type,Question,Answer,The Link,Notes / Hidden Chain,Connection Type,Franchise / IP,Status / Playtested,Safety Checks Passed,Sub-Theme\n`;
for (let i = 0; i < 30000; i++) {
  csvData += `Test Deck,Q${(i%3)+1},Animation (Anime),Casual (Level 1),Normal,Who is this?,Goku,,,,,,,\n`;
  csvData += `Test Deck,Q${(i%3)+1},Pro Wrestling,Hardcore (Level 3),Normal,Who is this?,Undertaker,,,,,,,\n`;
  csvData += `Test Deck,Q${(i%3)+1},Video Games,Expert (Level 4),Normal,Who is this?,Mario,,,,,,,\n`;
}

const result = Papa.parse(csvData, { header: true, skipEmptyLines: true });

console.time('original function');
for (const row of result.data as any[]) {
    if (!row['Question'] || !row['Answer'] || !row['Category / Domain']) continue;

    const rawDifficulty = row['Difficulty'] || 'Casual (Level 1)';
    const deckTheme = row['Deck / Theme'] || 'General';

    const safeRawDifficulty = sanitizeHTML(rawDifficulty);
    const safeDeckTheme = sanitizeHTML(deckTheme);
    const safeRawDomain = sanitizeHTML(row['Category / Domain']);

    const x = {
      step: mapSequenceToStep(row['Sequence / Q#'] || ''),
      category: mapCategory(row['Category / Domain']),
      questionText: sanitizeHTML(row['Question']),
      answer: sanitizeHTML(row['Answer']),
      points: getPointsForDifficulty(row['Difficulty'] || ''),
      rawDifficulty: safeRawDifficulty,
      deckTheme: safeDeckTheme,
      rawDomain: safeRawDomain,
      normalizedDifficulty: safeRawDifficulty.toLowerCase(),
      normalizedDeckTheme: safeDeckTheme.toLowerCase(),
    }
}
console.timeEnd('original function');


console.time('memoized function');
for (const row of result.data as any[]) {
    if (!row['Question'] || !row['Answer'] || !row['Category / Domain']) continue;

    const rawDifficulty = row['Difficulty'] || 'Casual (Level 1)';
    const deckTheme = row['Deck / Theme'] || 'General';

    const safeRawDifficulty = sanitizeHTML(rawDifficulty);
    const safeDeckTheme = sanitizeHTML(deckTheme);
    const safeRawDomain = sanitizeHTML(row['Category / Domain']);

    const x = {
      step: mapSequenceToStepMemo(row['Sequence / Q#'] || ''),
      category: mapCategoryMemo(row['Category / Domain']),
      questionText: sanitizeHTML(row['Question']),
      answer: sanitizeHTML(row['Answer']),
      points: getPointsForDifficultyMemo(row['Difficulty'] || ''),
      rawDifficulty: safeRawDifficulty,
      deckTheme: safeDeckTheme,
      rawDomain: safeRawDomain,
      normalizedDifficulty: safeRawDifficulty.toLowerCase(),
      normalizedDeckTheme: safeDeckTheme.toLowerCase(),
    }
}
console.timeEnd('memoized function');
