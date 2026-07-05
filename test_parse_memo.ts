const mapCategoryCache = new Map<string, string>();
const mapDifficultyCache = new Map<string, number>();
const domains = ['Animation (Anime)', 'Pro Wrestling', 'Video Games (Retro)'];
const difficulties = ['Casual (Level 1)', 'Hardcore (Level 3)', 'Expert (Level 4)'];

// with map caching
console.time('memoized');
for (let i = 0; i < 1000000; i++) {
  const domain = domains[i % 3];
  const difficulty = difficulties[i % 3];

  let cat = mapCategoryCache.get(domain);
  if (cat === undefined) {
      const dUpper = domain.toUpperCase();
      if (dUpper.includes('ANIMATION')) cat = 'Animation';
      else if (dUpper.includes('WRESTLING')) cat = 'Pro Wrestling';
      else if (dUpper.includes('VIDEO GAMES')) cat = 'Video Games';
      else cat = 'Animation'; // Fallback
      mapCategoryCache.set(domain, cat);
  }

  let pts = mapDifficultyCache.get(difficulty);
  if (pts === undefined) {
      const diffUpper = difficulty.toUpperCase();
      if (diffUpper.includes('CASUAL') || diffUpper.includes('LEVEL 1')) pts = 1;
      else if (diffUpper.includes('FAN') || diffUpper.includes('LEVEL 2')) pts = 2;
      else if (diffUpper.includes('HARDCORE') || diffUpper.includes('LEVEL 3')) pts = 3;
      else if (diffUpper.includes('EXPERT') || diffUpper.includes('TRIPLE THREAT')) pts = 5;
      else pts = 1; // Default
      mapDifficultyCache.set(difficulty, pts);
  }
}
console.timeEnd('memoized');
