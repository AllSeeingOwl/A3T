import Papa from 'papaparse';

const result = Papa.parse(`Deck / Theme,Sequence / Q#,Category / Domain,Difficulty,Question Type,Question,Answer,The Link,Notes / Hidden Chain,Connection Type,Franchise / IP,Status / Playtested,Safety Checks Passed,Sub-Theme
Test Deck,Q1,Animation,Casual,Normal,Q?,A,,,,,,,,
Test Deck,Q2,Pro Wrestling,Hardcore,Normal,Q?,A,,,,,,,,
`.repeat(10000), { header: true, skipEmptyLines: true });
console.log(result.data.length);
