const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const extractRoot = path.resolve(root, '..', '_extract');
const sqlPath = process.argv[2] ? path.resolve(process.argv[2]) : findLatestSql(extractRoot);
const sourceDir = path.join(root, 'source');
const postsDir = path.join(sourceDir, '_posts');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function findLatestSql(dir) {
  const files = walk(dir).filter((file) => path.basename(file).toLowerCase() === 'wordpress.sql');
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0] || path.join(dir, 'wordpress.sql');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function splitSqlFields(tuple) {
  const out = [];
  let cur = '';
  let inString = false;
  let escaped = false;
  for (const ch of tuple) {
    cur += ch;
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === "'") inString = false;
      continue;
    }
    if (ch === "'") inString = true;
    else if (ch === ',') {
      out.push(mysqlValue(cur.slice(0, -1).trim()));
      cur = '';
    }
  }
  if (cur.length) out.push(mysqlValue(cur.trim()));
  return out;
}

function mysqlValue(value) {
  if (value === 'NULL') return null;
  if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
  return value.replace(/\\([0bnrtZ'"\\%_])/g, (_, ch) => {
    switch (ch) {
      case '0': return '\0';
      case 'b': return '\b';
      case 'n': return '\n';
      case 'r': return '\r';
      case 't': return '\t';
      case 'Z': return '\x1a';
      default: return ch;
    }
  });
}

function tupleStrings(valuesText) {
  const tuples = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < valuesText.length; i++) {
    const ch = valuesText[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === "'") inString = false;
      continue;
    }
    if (ch === "'") inString = true;
    else if (ch === '(') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0 && start >= 0) tuples.push(valuesText.slice(start, i));
    }
  }
  return tuples;
}

function parseInsertTable(sql, table, columns) {
  const rows = [];
  const prefix = 'INSERT INTO `' + table + '` VALUES ';
  for (const line of sql.split(/\r?\n/)) {
    if (!line.startsWith(prefix)) continue;
    const values = line.slice(prefix.length).replace(/;$/, '');
    for (const tuple of tupleStrings(values)) {
      const fields = splitSqlFields(tuple);
      const row = {};
      columns.forEach((name, i) => { row[name] = fields[i] ?? ''; });
      rows.push(row);
    }
  }
  return rows;
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function safeSegment(input, fallback) {
  let s = decodeURIComponentSafe(String(input || '').trim()) || fallback;
  s = s.replace(/[\\/:*?"<>|#%{}^~[\]`;]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
  return s.replace(/^-|-$/g, '') || fallback;
}

function decodeURIComponentSafe(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fenceFor(code) {
  const longest = Math.max(2, ...[...String(code).matchAll(/`+/g)].map((m) => m[0].length));
  return '`'.repeat(longest + 1);
}

function preToFence(attrs, inner) {
  const lang = (
    attrs.match(/\blang=["']([^"']+)["']/i)?.[1]
    || attrs.match(/\blanguage-([a-z0-9_-]+)/i)?.[1]
    || ''
  ).trim();
  const code = decodeEntities(String(inner || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/span>\s*<span\b[^>]*role=["']presentation["'][^>]*>/gi, '\n')
    .replace(/<\/?span\b[^>]*>/gi, '')
  ).replace(/\r\n/g, '\n').trim();
  const fence = fenceFor(code);
  return `\n\n${fence}${lang}\n${code}\n${fence}\n\n`;
}

function escapeInlineCode(html) {
  return String(html || '').replace(/<code\b([^>]*)>([\s\S]*?)<\/code>/gi, (_, attrs, inner) => {
    return `<code${attrs}>${escapeHtml(decodeEntities(inner))}</code>`;
  });
}

function cleanContent(html) {
  return escapeInlineCode(decodeEntities(String(html || ''))
    .replace(/<!--\s*\/?wp:[\s\S]*?-->/g, '')
    .replace(/https?:\/\/(?:hilang\.cloud|47\.109\.195\.148)\/wp-content\/uploads/gi, '/wp-content/uploads')
    .replace(/<pre\b([^>]*)>([\s\S]*?)<\/pre>/gi, (_, attrs, inner) => preToFence(attrs, inner))
    .replace(/\r\n/g, '\n')
    .trim());
}

function firstImage(content) {
  const m = String(content || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1].replace(/https?:\/\/(?:hilang\.cloud|47\.109\.195\.148)\/wp-content\/uploads/gi, '/wp-content/uploads') : '';
}

function yamlScalar(value) {
  if (value === null || value === undefined) return '""';
  return JSON.stringify(String(value));
}

function yamlArray(values) {
  const filtered = [...new Set((values || []).filter(Boolean))];
  return `[${filtered.map(yamlScalar).join(', ')}]`;
}

function frontMatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) lines.push(`${key}: ${yamlArray(value)}`);
    else if (typeof value === 'boolean') lines.push(`${key}: ${value}`);
    else lines.push(`${key}: ${yamlScalar(value)}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function writeMarkdown(file, data, body) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, frontMatter(data) + body + '\n', 'utf8');
}

function main() {
  if (!fs.existsSync(sqlPath)) throw new Error(`SQL not found: ${sqlPath}`);
  ensureDir(postsDir);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`Using SQL: ${sqlPath}`);

  const posts = parseInsertTable(sql, 'wp_posts', [
    'ID', 'post_author', 'post_date', 'post_date_gmt', 'post_content', 'post_title', 'post_excerpt',
    'post_status', 'comment_status', 'ping_status', 'post_password', 'post_name', 'to_ping', 'pinged',
    'post_modified', 'post_modified_gmt', 'post_content_filtered', 'post_parent', 'guid', 'menu_order',
    'post_type', 'post_mime_type', 'comment_count',
  ]);
  const postmeta = parseInsertTable(sql, 'wp_postmeta', ['meta_id', 'post_id', 'meta_key', 'meta_value']);
  const terms = parseInsertTable(sql, 'wp_terms', ['term_id', 'name', 'slug', 'term_group']);
  const tax = parseInsertTable(sql, 'wp_term_taxonomy', ['term_taxonomy_id', 'term_id', 'taxonomy', 'description', 'parent', 'count']);
  const rels = parseInsertTable(sql, 'wp_term_relationships', ['object_id', 'term_taxonomy_id', 'term_order']);
  const options = parseInsertTable(sql, 'wp_options', ['option_id', 'option_name', 'option_value', 'autoload']);

  const siteTitle = options.find((o) => o.option_name === 'blogname')?.option_value;
  if (siteTitle) console.log(`Detected site title: ${decodeEntities(siteTitle)}`);

  const postsById = new Map(posts.map((p) => [String(p.ID), p]));
  const termsById = new Map(terms.map((t) => [String(t.term_id), t]));
  const taxById = new Map(tax.map((t) => [String(t.term_taxonomy_id), t]));
  const metaByPost = new Map();
  for (const m of postmeta) {
    const id = String(m.post_id);
    if (!metaByPost.has(id)) metaByPost.set(id, new Map());
    if (!metaByPost.get(id).has(m.meta_key)) metaByPost.get(id).set(m.meta_key, m.meta_value);
  }
  const relByPost = new Map();
  for (const r of rels) {
    const id = String(r.object_id);
    if (!relByPost.has(id)) relByPost.set(id, []);
    relByPost.get(id).push(r);
  }

  let postCount = 0;
  let pageCount = 0;
  for (const post of posts) {
    if (post.post_status !== 'publish') continue;
    if (!['post', 'page'].includes(post.post_type)) continue;

    const id = String(post.ID);
    const slug = safeSegment(post.post_name, `post-${id}`);
    const meta = metaByPost.get(id) || new Map();
    const relList = relByPost.get(id) || [];
    const categories = [];
    const tags = [];
    for (const rel of relList) {
      const tx = taxById.get(String(rel.term_taxonomy_id));
      const term = tx ? termsById.get(String(tx.term_id)) : null;
      if (!term) continue;
      if (tx.taxonomy === 'category') categories.push(decodeEntities(term.name));
      if (tx.taxonomy === 'post_tag') tags.push(decodeEntities(term.name));
    }

    const content = cleanContent(post.post_content);
    const thumbnailId = meta.get('_thumbnail_id');
    const attachedFile = thumbnailId ? metaByPost.get(String(thumbnailId))?.get('_wp_attached_file') : '';
    const thumbnailPost = thumbnailId ? postsById.get(String(thumbnailId)) : null;
    const thumbnail = attachedFile
      ? `/wp-content/uploads/${attachedFile}`
      : (thumbnailPost?.guid || firstImage(content)).replace(/https?:\/\/(?:hilang\.cloud|47\.109\.195\.148)\/wp-content\/uploads/gi, '/wp-content/uploads');

    const data = {
      title: decodeEntities(post.post_title || slug),
      date: post.post_date,
      updated: post.post_modified,
      categories,
      tags,
      thumbnail,
      first_image_as_thumbnail: !thumbnail,
      excerpt: decodeEntities(post.post_excerpt || meta.get('_yoast_wpseo_metadesc') || ''),
      after_post: meta.get('argon_after_post') || '',
      comments: post.comment_status === 'open',
      wp_id: id,
    };

    if (post.post_type === 'post') {
      const datePrefix = String(post.post_date || '').slice(0, 10);
      writeMarkdown(path.join(postsDir, `${datePrefix}-${slug}.md`), data, content);
      postCount++;
    } else {
      writeMarkdown(path.join(sourceDir, slug, 'index.md'), { ...data, layout: 'page' }, content);
      pageCount++;
    }
  }
  console.log(`Generated ${postCount} posts and ${pageCount} pages.`);
}

main();
