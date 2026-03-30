const fs = require('fs');
const path = require('path');

const baseDir = 'd:/MewangiWebsite/frontend/src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(baseDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Add cursor-pointer to buttons
  // Look for <button ... > tags.
  // We want to add cursor-pointer to the className if it exists, or add className="cursor-pointer"
  // This is tricky with regex. Let's try to match className="..." inside a <button tag
  
  // Strategy: Add cursor-pointer to any className inside a <button tag.
  // If no className, add it.
  
  const buttonRegex = /<button([^>]+)>/g;
  content = content.replace(buttonRegex, (match, attrs) => {
    if (attrs.includes('cursor-pointer')) return match;
    
    if (attrs.includes('className=')) {
      changed = true;
      // Add cursor-pointer to existing className
      return match.replace(/className=(["'])([^"']*)\1/, (m, quote, classes) => {
        return `className=${quote}${classes} cursor-pointer${quote}`;
      });
    } else {
      changed = true;
      // Add new className
      return `<button className="cursor-pointer"${attrs}>`;
    }
  });

  // 2. Change rounded to rounded-xl
  // Exclude rounded-full.
  // Replace rounded, rounded-sm, rounded-md, rounded-lg, rounded-2xl, rounded-3xl, rounded-[...]
  
  const roundedRegex = /\brounded(-sm|-md|-lg|-2xl|-3xl|-t-lg|-b-lg|-l-lg|-r-lg|-(?:sm|md|lg|2xl|3xl)|\[[^\]]+\]|(?!\b-full\b))\b/g;
  
  // Actually simpler: Match rounded but not rounded-full
  const safeRoundedRegex = /\brounded(?!-full)\b/g;
  const specificRoundedRegex = /\brounded-(?:sm|md|lg|2xl|3xl|\[[^\]]+\]|t-lg|b-lg|l-lg|r-lg|t-md|b-md|l-md|r-md)\b/g;

  let newContent = content.replace(specificRoundedRegex, 'rounded-xl');
  newContent = newContent.replace(safeRoundedRegex, 'rounded-xl');
  
  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file}`);
  }
});
