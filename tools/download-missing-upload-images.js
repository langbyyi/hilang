const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'source');
const uploadsDir = path.join(sourceDir, 'wp-content', 'uploads');
const imageRe = /\/wp-content\/uploads\/[^"')\s<>\\]+?\.(?:jpg|jpeg|png|gif|webp|avif|bmp|svg)/gi;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function localPath(webPath) {
  return path.join(sourceDir, decodeURIComponent(webPath).replace(/^\//, '').replace(/\//g, path.sep));
}

function randomName(ext, seed) {
  const id = seed
    ? crypto.createHash('sha256').update(seed).digest('hex').slice(0, 12)
    : crypto.randomBytes(6).toString('hex');
  return `img-${id}${ext.toLowerCase()}`;
}

function yearFor(webPath) {
  const m = webPath.match(/\/uploads\/(\d{4})\//);
  return m ? m[1] : String(new Date().getFullYear());
}

function download(url, target) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Hexo migration' } }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume();
        return resolve(download(new URL(res.headers.location, url).toString(), target));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const file = fs.createWriteStream(target);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const mdFiles = walk(sourceDir).filter((file) => file.endsWith('.md'));
  const refs = new Set();
  for (const file of mdFiles) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(imageRe)) refs.add(match[0]);
  }

  const missing = [...refs].filter((ref) => !fs.existsSync(localPath(ref)));
  const replacements = new Map();
  let downloaded = 0;
  for (const ref of missing) {
    const ext = path.extname(ref.split('?')[0]) || '.jpg';
    const yearDir = path.join(uploadsDir, yearFor(ref));
    let target = path.join(yearDir, randomName(ext, ref));
    let i = 1;
    while (fs.existsSync(target)) target = path.join(yearDir, randomName(ext, `${ref}:${i++}`));
    const url = 'https://hilang.cloud' + encodeURI(decodeURIComponent(ref));
    try {
      await download(url, target);
      const newRef = '/' + path.relative(sourceDir, target).split(path.sep).join('/');
      replacements.set(ref, newRef);
      downloaded++;
    } catch (err) {
      console.warn(`Missing and failed: ${ref} (${err.message})`);
    }
  }

  let updated = 0;
  for (const file of mdFiles) {
    let text = fs.readFileSync(file, 'utf8');
    const before = text;
    for (const [oldRef, newRef] of replacements) text = text.split(oldRef).join(newRef);
    if (text !== before) {
      fs.writeFileSync(file, text, 'utf8');
      updated++;
    }
  }
  console.log(`Missing refs: ${missing.length}`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Updated markdown files: ${updated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
