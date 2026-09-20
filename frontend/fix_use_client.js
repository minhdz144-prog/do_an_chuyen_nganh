const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'src'));
let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("'use client';")) {
    const lines = content.split('\n');
    let hasUseClient = false;
    let newLines = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("'use client';")) {
        hasUseClient = true;
      } else {
        newLines.push(lines[i]);
      }
    }
    
    if (hasUseClient && !newLines.length || newLines[0] !== "'use client';") {
      newLines.unshift("'use client';");
      const newContent = newLines.join('\n');
      if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        fixedCount++;
        console.log('Fixed', file);
      }
    }
  }
});

console.log('Fixed', fixedCount, 'files.');
