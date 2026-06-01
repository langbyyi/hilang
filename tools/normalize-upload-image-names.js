const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'source');
const uploadsDir = path.join(sourceDir, 'wp-content', 'uploads');
const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg']);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function randomName(ext, seed) {
  const id = seed
    ? crypto.createHash('sha256').update(seed).digest('hex').slice(0, 12)
    : crypto.randomBytes(6).toString('hex');
  return `img-${id}${ext.toLowerCase()}`;
}

function yearFor(file) {
  const rel = path.relative(uploadsDir, file).split(path.sep);
  const part = rel.find((x) => /^\d{4}$/.test(x));
  if (part) return part;
  return String(fs.statSync(file).mtime.getFullYear());
}

function toWebPath(file) {
  return '/' + path.relative(sourceDir, file).split(path.sep).join('/');
}

function main() {
  const map = new Map();
  let renamed = 0;
  for (const file of walk(uploadsDir)) {
    const ext = path.extname(file);
    if (!imageExts.has(ext.toLowerCase())) continue;
    const year = yearFor(file);
    const yearDir = path.join(uploadsDir, year);
    fs.mkdirSync(yearDir, { recursive: true });
    const base = path.basename(file);
    const already = path.dirname(file) === yearDir && /^img-[0-9a-f]{12}\.[a-z0-9]+$/i.test(base);
    const oldWeb = toWebPath(file);
    let target = already ? file : path.join(yearDir, randomName(ext, oldWeb));
    let i = 1;
    while (fs.existsSync(target) && target !== file) target = path.join(yearDir, randomName(ext, `${oldWeb}:${i++}`));
    const newWeb = toWebPath(target);
    if (target !== file) {
      fs.renameSync(file, target);
      renamed++;
    }
    map.set(oldWeb, newWeb);
    map.set(encodeURI(oldWeb), newWeb);
  }

  let updated = 0;
  for (const md of walk(sourceDir).filter((file) => file.endsWith('.md'))) {
    let text = fs.readFileSync(md, 'utf8');
    const before = text;
    for (const [oldPath, newPath] of map) {
      if (oldPath !== newPath) text = text.split(oldPath).join(newPath);
    }
    if (text !== before) {
      fs.writeFileSync(md, text, 'utf8');
      updated++;
    }
  }
  console.log(`Renamed ${renamed} image files.`);
  console.log(`Updated ${updated} markdown files.`);
}

main();
