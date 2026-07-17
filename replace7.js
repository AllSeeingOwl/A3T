import fs from 'fs';
let content = fs.readFileSync('src/components/ArenaBoard.tsx', 'utf8');

content = content.replace(
  "    addScore(activeTeam, activeQuestion.points);",
  "    if (!activeQuestion) return;\n    addScore(activeTeam, activeQuestion.points);"
);

content = content.replace(
  "      if (activeCard.listQuestion && activeCard.listQuestion.enabled) {",
  "      if (activeCard?.listQuestion && activeCard.listQuestion.enabled) {"
);

content = content.replace(
  "      if (activeCard.listQuestion && activeCard.listQuestion.enabled) {",
  "      if (activeCard?.listQuestion && activeCard.listQuestion.enabled) {"
);

content = content.replace(
  "      if (activeCard.listQuestion && activeCard.listQuestion.enabled) {",
  "      if (activeCard?.listQuestion && activeCard.listQuestion.enabled) {"
);

content = content.replace(
  "    addScore(otherTeam, activeQuestion.points);",
  "    if (!activeQuestion) return;\n    addScore(otherTeam, activeQuestion.points);"
);

fs.writeFileSync('src/components/ArenaBoard.tsx', content);
