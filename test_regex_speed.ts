const domains = ['Animation (Anime)', 'Pro Wrestling', 'Video Games (Retro)'];

console.time('includes');
for (let i = 0; i < 1000000; i++) {
  const d = domains[i % 3];
  const dUpper = d.toUpperCase();
  if (dUpper.includes('ANIMATION')) {}
  else if (dUpper.includes('WRESTLING')) {}
  else if (dUpper.includes('VIDEO GAMES')) {}
}
console.timeEnd('includes');

const animRe = /ANIMATION/i;
const wrestRe = /WRESTLING/i;
const vgRe = /VIDEO GAMES/i;

console.time('regex');
for (let i = 0; i < 1000000; i++) {
  const d = domains[i % 3];
  if (animRe.test(d)) {}
  else if (wrestRe.test(d)) {}
  else if (vgRe.test(d)) {}
}
console.timeEnd('regex');
