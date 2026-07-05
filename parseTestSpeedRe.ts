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

const CASUAL_RE = /CASUAL|LEVEL\s*1/i;
const FAN_RE = /FAN|LEVEL\s*2/i;
const HARDCORE_RE = /HARDCORE|LEVEL\s*3/i;
const EXPERT_RE = /EXPERT|TRIPLE\s*THREAT/i;
const getPointsForDifficultyRe = (difficulty: string): number => {
  if (CASUAL_RE.test(difficulty)) return 1;
  if (FAN_RE.test(difficulty)) return 2;
  if (HARDCORE_RE.test(difficulty)) return 3;
  if (EXPERT_RE.test(difficulty)) return 5;
  return 1;
};

const ANIMATION_RE = /ANIMATION/i;
const WRESTLING_RE = /WRESTLING/i;
const VIDEO_GAMES_RE = /VIDEO\s*GAMES/i;
const mapCategoryRe = (domain: string): any => {
  if (ANIMATION_RE.test(domain)) return 'Animation';
  if (WRESTLING_RE.test(domain)) return 'Pro Wrestling';
  if (VIDEO_GAMES_RE.test(domain)) return 'Video Games';
  return 'Animation';
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
    const cat = mapCategory(row['Category / Domain']);
    const pts = getPointsForDifficulty(row['Difficulty'] || '');
}
console.timeEnd('original function');


console.time('Regex function');
for (const row of result.data as any[]) {
    if (!row['Question'] || !row['Answer'] || !row['Category / Domain']) continue;
    const cat = mapCategoryRe(row['Category / Domain']);
    const pts = getPointsForDifficultyRe(row['Difficulty'] || '');
}
console.timeEnd('Regex function');
