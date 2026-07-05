import { parseDatabaseCSV } from './src/utils/questionParser.js';

let csvData = `Deck / Theme,Sequence / Q#,Category / Domain,Difficulty,Question Type,Question,Answer,The Link,Notes / Hidden Chain,Connection Type,Franchise / IP,Status / Playtested,Safety Checks Passed,Sub-Theme\n`;
for (let i = 0; i < 10000; i++) {
  csvData += `Test Deck,Q${(i%3)+1},Animation (Anime),Casual (Level 1),Normal,Who is this?,Goku,,,,,,,\n`;
  csvData += `Test Deck,Q${(i%3)+1},Pro Wrestling,Hardcore (Level 3),Normal,Who is this?,Undertaker,,,,,,,\n`;
}

const db = parseDatabaseCSV(csvData);

const start = performance.now();
for(let i=0; i<100; i++) {
   db.filter(q => q.rawDomain.includes('Wrestling'))
}
const end = performance.now();

console.log(`String includes filter took ${(end - start).toFixed(2)} ms`);

const start2 = performance.now();
for(let i=0; i<100; i++) {
   db.filter(q => q.category === 'Pro Wrestling')
}
const end2 = performance.now();
console.log(`Strict equality filter took ${(end2 - start2).toFixed(2)} ms`);
