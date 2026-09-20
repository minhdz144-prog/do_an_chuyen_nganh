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
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'src'));

const replacements = [
  // Backgrounds
  { regex: /bg-white\s+dark:bg-slate-950/g, replacement: 'bg-card' },
  { regex: /bg-slate-50\s+dark:bg-slate-900/g, replacement: 'bg-muted/50' },
  { regex: /bg-slate-100\s+dark:bg-slate-800/g, replacement: 'bg-muted' },
  { regex: /bg-slate-200\s+dark:bg-slate-700/g, replacement: 'bg-secondary' },
  
  // Foregrounds
  { regex: /text-slate-900\s+dark:text-slate-50/g, replacement: 'text-foreground' },
  { regex: /text-slate-800\s+dark:text-slate-200/g, replacement: 'text-foreground/90' },
  { regex: /text-slate-700\s+dark:text-slate-300/g, replacement: 'text-foreground/80' },
  { regex: /text-slate-600\s+dark:text-slate-400/g, replacement: 'text-muted-foreground' },
  { regex: /text-slate-500\s+dark:text-slate-400/g, replacement: 'text-muted-foreground' },
  { regex: /text-slate-500/g, replacement: 'text-muted-foreground' }, // standalone
  { regex: /text-slate-400/g, replacement: 'text-muted-foreground/80' }, // standalone
  
  // Borders
  { regex: /border-slate-200\s+dark:border-slate-800/g, replacement: 'border-border' },
  { regex: /border-slate-100\s+dark:border-slate-800/g, replacement: 'border-border' },
  { regex: /border-slate-300\s+dark:border-slate-700/g, replacement: 'border-input' },

  // Emerald (Primary)
  { regex: /bg-emerald-600\s+hover:bg-emerald-700/g, replacement: 'bg-primary hover:bg-primary/90' },
  { regex: /bg-emerald-600/g, replacement: 'bg-primary' },
  { regex: /bg-emerald-500/g, replacement: 'bg-primary' },
  { regex: /text-emerald-600\s+hover:text-emerald-500/g, replacement: 'text-primary hover:text-primary/80' },
  { regex: /text-emerald-600/g, replacement: 'text-primary' },
  { regex: /text-emerald-700/g, replacement: 'text-primary' },
  { regex: /text-emerald-500/g, replacement: 'text-primary/90' },
  { regex: /border-emerald-600/g, replacement: 'border-primary' },
  { regex: /border-emerald-200/g, replacement: 'border-primary/20' },
  { regex: /border-emerald-100/g, replacement: 'border-primary/20' },
  { regex: /bg-emerald-50/g, replacement: 'bg-primary/10' },
  { regex: /bg-emerald-100/g, replacement: 'bg-primary/20' },
  { regex: /dark:bg-emerald-900\/20/g, replacement: 'dark:bg-primary/20' },
  { regex: /dark:text-emerald-400/g, replacement: 'dark:text-primary' },

  // Primary buttons hardcoded to slate
  { regex: /bg-slate-900\s+hover:bg-slate-800\s+text-white/g, replacement: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
  { regex: /bg-slate-900\s+dark:bg-slate-50\s+text-white\s+dark:text-slate-900/g, replacement: 'bg-primary text-primary-foreground' }
];

let filesModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(r => {
    newContent = newContent.replace(r.regex, r.replacement);
  });
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', file);
    filesModified++;
  }
});

console.log('Total files modified:', filesModified);
