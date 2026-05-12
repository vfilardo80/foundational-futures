// Copies production files to dist/ for Netlify deployment.
// Uses only Node built-ins — no npm install required.
const { copyFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const OUT   = 'dist';
const files = ['index.html', 'styles.css', 'script.js'];

mkdirSync(OUT, { recursive: true });

for (const file of files) {
  copyFileSync(file, join(OUT, file));
  process.stdout.write(`  copied ${file}\n`);
}

process.stdout.write(`\nBuild complete -> ${OUT}/\n`);
