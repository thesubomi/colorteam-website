/**
 * Colorteam Article Publisher: the publish endpoint for colorteam.io/publish.
 *
 * Takes an article from the publish page (text blocks, images and the cover card), checks it,
 * and commits it to the website repo on GitHub in a single commit. GitHub Pages then rebuilds
 * the site and the article is live at colorteam.io/blog/<slug>/ in about a minute.
 *
 * Setup (once):
 * 1. Go to script.google.com > New project, name it "Colorteam Article Publisher", paste this file.
 * 2. Project Settings > Script Properties, add:
 *      GITHUB_TOKEN      a fine-grained GitHub token for thesubomi/colorteam-website only,
 *                        with "Contents: Read and write" permission
 *      PUBLISH_PASSCODE  the team passcode typed on the publish page (at least 8 characters)
 * 3. Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.
 * 4. Put the /exec URL into PUBLISH_ENDPOINT at the top of the script in src/pages/publish.astro.
 *
 * GET  returns the published articles (slug, title, category, date) for the page's list.
 * POST publishes one article. Body: {passcode, overwrite, featured, article, entry, files}.
 */
const REPO = 'thesubomi/colorteam-website';
const BRANCH = 'main';
const INDEX_PATH = 'src/data/articles.json';
const ARTICLES_DIR = 'src/content/articles/';
const IMG_DIR = 'public/img/articles/';
const MAX_FILES = 24;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const BLOCK_TYPES = ['lead', 'p', 'h2', 'h3', 'quote', 'ul', 'ol', 'img'];
const CATEGORIES = ['Insight', 'Brand identity', 'Case study'];

function doGet() {
  try {
    const head = getHead_();
    const index = readJson_(INDEX_PATH, head.commitSha);
    const articles = (index.articles || []).map(function (a) {
      return { slug: a.slug, title: a.title, category: a.category || '', date: a.date || '' };
    });
    return json_({ ok: true, articles: articles });
  } catch (err) {
    return json_({ ok: false, error: 'github', detail: String(err.message || err).slice(0, 300) });
  }
}

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'invalid', detail: 'The request could not be read.' });
  }
  const props = PropertiesService.getScriptProperties();
  const passcode = String(props.getProperty('PUBLISH_PASSCODE') || '');
  if (passcode.length < 8 || String(d.passcode || '') !== passcode) {
    Utilities.sleep(1500); // slow down guessing
    return json_({ ok: false, error: 'bad_passcode' });
  }

  let clean;
  try {
    clean = validate_(d);
  } catch (err) {
    return json_({ ok: false, error: 'invalid', detail: String(err.message || err) });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return json_({ ok: false, error: 'github', detail: 'Another article is publishing. Try again in a minute.' });
  try {
    let result;
    for (let attempt = 0; attempt < 2; attempt++) {
      result = publish_(clean, !!d.overwrite, !!d.featured);
      if (result.ok || result.error !== 'retry') break;
    }
    if (result.error === 'retry') result = { ok: false, error: 'github', detail: 'The site changed while publishing. Try again.' };
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: 'github', detail: String(err.message || err).slice(0, 300) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- checks ---------- */

function str_(v, max, name, required) {
  const s = String(v == null ? '' : v).replace(/\r\n?/g, '\n').trim();
  if (required && !s) throw new Error('Missing ' + name + '.');
  if (s.length > max) throw new Error(name + ' is too long.');
  return s;
}

function validate_(d) {
  const a = d.article || {};
  const en = d.entry || {};
  const slug = String(a.slug || '');
  if (!/^[a-z0-9][a-z0-9-]{2,89}$/.test(slug)) throw new Error('The web address can only use lowercase letters, numbers and dashes.');
  if (en.slug !== slug) throw new Error('Article and card do not match.');

  const files = Array.isArray(d.files) ? d.files : [];
  if (!files.length || files.length > MAX_FILES) throw new Error('Expected between 1 and ' + MAX_FILES + ' images.');
  const names = {};
  const cleanFiles = files.map(function (f) {
    const name = String(f.name || '');
    if (!/^[a-z0-9-]{1,60}\.(webp|jpg|png)$/.test(name)) throw new Error('Bad image name: ' + name);
    const bytes = Utilities.base64Decode(String(f.base64 || ''));
    if (!bytes.length || bytes.length > MAX_FILE_BYTES) throw new Error('Image ' + name + ' is empty or too large.');
    names[name] = true;
    return { name: name, base64: String(f.base64) };
  });

  const imgBase = '/img/articles/' + slug + '/';
  const src_ = function (s, what) {
    s = String(s || '');
    if (s.indexOf(imgBase) !== 0 || !names[s.slice(imgBase.length)]) throw new Error(what + ' does not point at an uploaded image.');
    return s;
  };

  const blocks = (Array.isArray(a.blocks) ? a.blocks : []).map(function (b) {
    if (BLOCK_TYPES.indexOf(b.type) < 0) throw new Error('Unknown block type: ' + b.type);
    if (b.type === 'img') {
      const out = { type: 'img', src: src_(b.src, 'An image'), alt: str_(b.alt, 300, 'Image description', true) };
      const cap = str_(b.caption, 300, 'Caption', false);
      if (cap) out.caption = cap;
      return out;
    }
    if (b.type === 'ul' || b.type === 'ol') {
      const items = (Array.isArray(b.items) ? b.items : []).map(function (x) { return str_(x, 2000, 'List item', true); });
      if (!items.length) throw new Error('A list is empty.');
      return { type: b.type, items: items };
    }
    return { type: b.type, text: str_(b.text, 6000, 'A paragraph', true) };
  });
  if (!blocks.some(function (b) { return b.type !== 'img'; })) throw new Error('The article has no text.');
  if (blocks.length > 400) throw new Error('The article has too many blocks.');

  const category = CATEGORIES.indexOf(a.category) >= 0 ? a.category : 'Insight';
  const title = str_(a.title, 160, 'Title', true);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(a.date)) ? String(a.date) : Utilities.formatDate(new Date(), 'Europe/Warsaw', 'yyyy-MM-dd');
  const article = {
    slug: slug,
    title: title,
    description: str_(a.description, 300, 'Description', true),
    dek: str_(a.dek, 400, 'Subtitle', false),
    category: category,
    tags: (Array.isArray(a.tags) ? a.tags : []).slice(0, 4).map(function (t) { return str_(t, 40, 'Tag', true); }),
    author: str_(a.author, 80, 'Author', true),
    readTime: str_(a.readTime, 20, 'Read time', true),
    cover: src_(a.cover, 'The cover card'),
    blocks: blocks,
    cta: {
      title: str_(a.cta && a.cta.title, 120, 'Call to action headline', false) || 'Ready to build a brand people remember?',
      text: str_(a.cta && a.cta.text, 300, 'Call to action text', false) || 'Book a call and we will show you how Colorteam can help.'
    },
    date: date
  };
  if (a.hero && a.hero.src) article.hero = { src: src_(a.hero.src, 'The main image'), alt: str_(a.hero.alt, 300, 'Main image description', true) };

  const f = en.feature || {};
  const entry = {
    slug: slug,
    title: title,
    category: category,
    cover: article.cover,
    card: str_(en.card, 220, 'Card summary', true),
    homepage: !!en.homepage,
    date: date,
    feature: {
      title: str_(f.title, 160, 'Featured title', false) || title,
      dek: str_(f.dek, 400, 'Featured subtitle', false) || article.dek,
      readTime: article.readTime,
      stats: (Array.isArray(f.stats) ? f.stats : []).slice(0, 3).map(function (s) {
        return { label: str_(s.label, 30, 'Highlight label', true), text: str_(s.text, 60, 'Highlight text', true) };
      }),
      cta: str_(f.cta, 40, 'Featured button', false) || 'Read the article'
    }
  };
  return { article: article, entry: entry, files: cleanFiles };
}

/* ---------- publishing ---------- */

function publish_(c, overwrite, featured) {
  const slug = c.article.slug;
  const head = getHead_();
  const index = readJson_(INDEX_PATH, head.commitSha);
  index.articles = index.articles || [];

  const exists = index.articles.some(function (a) { return a.slug === slug; });
  if (exists && !overwrite) return { ok: false, error: 'exists' };
  if (pathExists_('src/pages/blog/' + slug + '.astro', head.commitSha)) {
    return { ok: false, error: 'invalid', detail: 'That address belongs to a hand-built article. Choose a different address.' };
  }

  // Update the index: newest first, featured and homepage flags.
  index.articles = index.articles.filter(function (a) { return a.slug !== slug; });
  index.articles.unshift(c.entry);
  if (featured) index.featured = slug;

  const tree = [];
  // Replacing an article: remove its old images so the folder only holds the new ones.
  if (exists) {
    listDir_(IMG_DIR + slug, head.commitSha).forEach(function (path) {
      tree.push({ path: path, mode: '100644', type: 'blob', sha: null });
    });
  }
  c.files.forEach(function (f) {
    tree.push({ path: IMG_DIR + slug + '/' + f.name, mode: '100644', type: 'blob', sha: blob_(f.base64, 'base64') });
  });
  tree.push({ path: ARTICLES_DIR + slug + '.json', mode: '100644', type: 'blob', sha: blob_(JSON.stringify(c.article, null, 2) + '\n', 'utf-8') });
  tree.push({ path: INDEX_PATH, mode: '100644', type: 'blob', sha: blob_(JSON.stringify(index, null, 2) + '\n', 'utf-8') });

  const newTree = gh_('post', '/git/trees', { base_tree: head.treeSha, tree: tree });
  const message = (exists ? 'Update article: ' : 'Publish article: ') + c.article.title +
    '\n\nPublished by ' + c.article.author + ' via colorteam.io/publish';
  const commit = gh_('post', '/git/commits', { message: message, tree: newTree.sha, parents: [head.commitSha] });
  const moved = gh_('patch', '/git/refs/heads/' + BRANCH, { sha: commit.sha, force: false }, true);
  if (moved.__status === 422) return { ok: false, error: 'retry' };
  if (moved.__status >= 300) throw new Error('Could not update the branch (' + moved.__status + ').');
  return { ok: true, slug: slug, url: 'https://colorteam.io/blog/' + slug + '/', commit: commit.sha };
}

/* ---------- GitHub helpers ---------- */

function gh_(method, path, body, allowError) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('GITHUB_TOKEN is not set in Script Properties.');
  const res = UrlFetchApp.fetch('https://api.github.com/repos/' + REPO + path, {
    method: method,
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    payload: body ? JSON.stringify(body) : undefined,
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  let data = {};
  try { data = JSON.parse(res.getContentText() || '{}'); } catch (err) { data = {}; }
  if (code >= 300 && !allowError) throw new Error('GitHub ' + method.toUpperCase() + ' ' + path + ' failed (' + code + '): ' + (data.message || ''));
  if (Array.isArray(data)) return { __status: code, items: data };
  data.__status = code;
  return data;
}

function getHead_() {
  const ref = gh_('get', '/git/ref/heads/' + BRANCH);
  const commit = gh_('get', '/git/commits/' + ref.object.sha);
  return { commitSha: ref.object.sha, treeSha: commit.tree.sha };
}

function readJson_(path, ref) {
  const file = gh_('get', '/contents/' + path + '?ref=' + ref);
  const text = Utilities.newBlob(Utilities.base64Decode(String(file.content).replace(/\s/g, ''))).getDataAsString('UTF-8');
  return JSON.parse(text);
}

function pathExists_(path, ref) {
  return gh_('get', '/contents/' + path + '?ref=' + ref, null, true).__status === 200;
}

function listDir_(path, ref) {
  const res = gh_('get', '/contents/' + path + '?ref=' + ref, null, true);
  if (res.__status !== 200 || !res.items) return [];
  return res.items.filter(function (x) { return x.type === 'file'; }).map(function (x) { return x.path; });
}

function blob_(content, encoding) {
  return gh_('post', '/git/blobs', { content: content, encoding: encoding }).sha;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
