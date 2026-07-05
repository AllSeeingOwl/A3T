import { parseDatabaseCSV } from './src/utils/questionParser.js';

let csvData = `Deck / Theme,Sequence / Q#,Category / Domain,Difficulty,Question Type,Question,Answer,The Link,Notes / Hidden Chain,Connection Type,Franchise / IP,Status / Playtested,Safety Checks Passed,Sub-Theme\n`;
for (let i = 0; i < 10000; i++) {
  csvData += `Test Deck,Q${(i%3)+1},Animation (Anime),Casual (Level 1),Normal,Who is this?,Goku,,,,,,,\n`;
  csvData += `Test Deck,Q${(i%3)+1},Pro Wrestling,Hardcore (Level 3),Normal,Who is this?,Undertaker,,,,,,,\n`;
  csvData += `Test Deck,Q${(i%3)+1},Video Games,Expert (Level 4),Normal,Who is this?,Mario,,,,,,,\n`;
}

console.time('parseDatabaseCSV');
const result = parseDatabaseCSV(csvData);
console.timeEnd('parseDatabaseCSV');
