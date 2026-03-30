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

  // Fix rounded-xl-xl and similar double replaces
  const doubleRounded = /rounded-xl-xl/g;
  if (doubleRounded.test(content)) {
    content = content.replace(doubleRounded, 'rounded-xl');
    changed = true;
  }

  // Fix double cursor-pointer
  // 1. Double className entry: <button className="cursor-pointer" className="..."
  const doubleClassName = /<button className="cursor-pointer"([^>]*className=)/g;
  if (doubleClassName.test(content)) {
    content = content.replace(doubleClassName, '<button $1');
    changed = true;
  }

  // 2. Double cursor-pointer inside same className
  const doubleCursor = /cursor-pointer cursor-pointer/g;
  if (doubleCursor.test(content)) {
    content = content.replace(doubleCursor, 'cursor-pointer');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});
