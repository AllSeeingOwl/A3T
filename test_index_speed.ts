import { DatabaseQuestion } from './src/utils/questionParser.js';

// Mock 10,000 questions
const questions: any[] = [];
for (let i = 0; i < 10000; i++) {
  questions.push({
    category: i % 2 === 0 ? 'Animation' : 'Pro Wrestling',
    normalizedDeckTheme: `deck-${i % 50}`
  });
}

// Without index
console.time('filter domain 100x');
for (let i=0; i<100; i++) {
  questions.filter(q => q.category === 'Animation');
}
console.timeEnd('filter domain 100x');

// With index
const byDomain: Record<string, any[]> = {};
questions.forEach(q => {
  if (!byDomain[q.category]) byDomain[q.category] = [];
  byDomain[q.category].push(q);
});

console.time('index domain 100x');
for (let i=0; i<100; i++) {
  const result = byDomain['Animation'] || [];
}
console.timeEnd('index domain 100x');
