// Luxury Travel Service — admin panel.
// Content lives in the GitHub repo (src/data/*.json + public/media). This page edits it through the
// GitHub API with the owner's access token; every publish is one commit and the host rebuilds the site.

const FILES = { settings: 'src/data/settings.json', programs: 'src/data/programs.json', services: 'src/data/services.json' };
const SECTIONS = { discover_egypt: 'Discover Egypt', romantic_escape: 'Romantic Escape', therapeutic_tours: 'Therapeutic Tours', spiritual_egypt: 'Spiritual Egypt', excursion: 'Day Excursions' };
const LOCATIONS = { cairo: 'From Cairo', hrg: 'From Hurghada', ssh: 'From Sharm El Sheikh' };
const LOC_SLUG = { cairo: 'cairo', hrg: 'hurghada', ssh: 'sharm' };
const FORMS = { generic: 'General form', 'meet-assist': 'Meet & assist', visa: 'Visa', transfer: 'Transfers', flight: 'Flight & train' };
const NAV = [
  ['Dashboard', [['overview', 'Overview', 'gauge', 'Dashboard Overview']]],
  ['Site Content', [['hero', 'Hero Section', 'image', 'Hero Section'], ['about', 'About Section', 'info', 'About Section']]],
  ['Programs', [['programs', 'Manage Programs', 'sitemap', 'Manage Programs'], ['services', 'Manage Services', 'bell', 'Manage Services']]],
  ['Other', [['contact', 'Contact & Social', 'contact', 'Contact & Social']]],
];
const TITLES = Object.fromEntries(NAV.flatMap(([, items]) => items.map(([k, , , t]) => [k, t])));
const ICONS = {
  gauge: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="m12 16 4-5"/><circle cx="12" cy="16" r="1.3"/>',
  sitemap: '<rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="4" width="7" height="5" rx="1"/><rect x="14" y="14" width="7" height="5" rx="1"/><path d="M10 7h4M12 7v9.5h2"/>',
  bell: '<path d="M4 17h16l-2-3v-3a6 6 0 0 0-12 0v3l-2 3zM10 20h4M12 5V3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  contact: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17a4 4 0 0 1 8 0"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  bus: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M8 17v2.5M16 17v2.5"/><circle cx="8" cy="14" r=".8"/><circle cx="16" cy="14" r=".8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  rocket: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  logout: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M14 17l5-5-5-5M19 12H8"/>',
  star: '<path d="m12 4 2.4 5.2 5.6.7-4.1 3.9 1.1 5.6-5-2.8-5 2.8 1.1-5.6L4 9.900l5.600-.7z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
};

// ---------- tiny DOM helpers ----------
const $ = (s, r = document) => r.querySelector(s);
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k in el && k !== 'list' && k !== 'form') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  el.append(...kids.flat(Infinity).filter((c) => c != null && c !== false));
  return el;
}
const icon = (name, size = 18) =>
  h('span', { class: 'ic', html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>` });
const clone = (o) => JSON.parse(JSON.stringify(o));
const smPath = (p) => p.replace(/\.(\w+)$/, '.sm.$1');
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

// ---------- state ----------
const store = { get: (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k), del: (k) => (localStorage.removeItem(k), sessionStorage.removeItem(k)) };
const S = {
  repo: store.get('lts.repo') || '', branch: '', token: store.get('lts.token') || '', siteUrl: '',
  head: '', shas: {}, lastCommit: null, data: null, original: {},
  pending: new Map(),  // "/media/…" -> Blob waiting to be committed
  previews: new Map(), // "/media/…" -> object URL for images not deployed yet
  removed: new Set(),  // "/media/…" paths the user removed
  view: 'overview', filter: { section: 'discover_egypt', location: 'cairo', q: '' },
};

// ---------- GitHub API ----------
async function gh(path, { method = 'GET', body, raw } = {}) {
  const res = await fetch(`https://api.github.com/repos/${S.repo}${path}`, {
    method,
    headers: {
      Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      Authorization: `Bearer ${S.token}`, 'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const msg = await res.json().then((j) => j.message, () => res.statusText);
    throw Object.assign(new Error(msg), { status: res.status });
  }
  return raw ? res.text() : res.json();
}
const explain = (e) =>
  e.status === 401 ? 'The access token is invalid or has expired.'
  : e.status === 403 ? 'This token cannot write to the repository (it needs Contents: Read and write).'
  : e.status === 404 ? 'Repository not found, or the token has no access to it.'
  : e.status === 409 || e.status === 422 ? `Could not save because of a conflicting change. Reload the page and try again. (${e.message})`
  : e instanceof TypeError ? 'Could not reach GitHub. Check your internet connection.' : e.message;

async function loadRepo() {
  const repo = await gh('');
  if (repo.permissions && !repo.permissions.push) throw Object.assign(new Error('no push'), { status: 403 });
  S.branch = S.branch || repo.default_branch;
  const ref = await gh(`/git/ref/heads/${S.branch}`);
  S.head = ref.object.sha;
  const commit = await gh(`/git/commits/${S.head}`);
  S.lastCommit = { date: commit.author.date, message: commit.message };
  const tree = await gh(`/git/trees/${commit.tree.sha}?recursive=1`);
  const data = {};
  for (const [key, path] of Object.entries(FILES)) {
    const entry = tree.tree.find((t) => t.path === path);
    if (!entry) throw new Error(`${path} is missing from the repository. Upload the new site files first.`);
    S.shas[key] = entry.sha;
    const text = await gh(`/contents/${path}?ref=${S.head}`, { raw: true });
    data[key] = JSON.parse(text);
    S.original[key] = serialize(data[key]);
  }
  S.data = data;
}
const serialize = (o) => JSON.stringify(o, null, 2) + '\n';
const dirtyFiles = () => (S.data ? Object.keys(FILES).filter((k) => serialize(S.data[k]) !== S.original[k]) : []);

function usedMedia() {
  const used = new Set();
  JSON.stringify(S.data, (k, v) => {
    if (typeof v === 'string' && v.startsWith('/media/')) { used.add(v); used.add(smPath(v)); }
    return v;
  });
  return used;
}
const toBase64 = (blob) => new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result).split(',')[1]);
  r.onerror = no; r.readAsDataURL(blob);
});

async function publish(message, progress) {
  progress('Checking the latest version…');
  const head = (await gh(`/git/ref/heads/${S.branch}`)).object.sha;
  const commit = await gh(`/git/commits/${head}`);
  const tree = await gh(`/git/trees/${commit.tree.sha}?recursive=1`);
  const remote = new Map(tree.tree.map((t) => [t.path, t.sha]));
  const dirty = dirtyFiles();
  if (dirty.some((k) => remote.get(FILES[k]) !== S.shas[k])) {
    throw new Error('The content was changed elsewhere after you opened this panel. Reload the page so those changes are not overwritten.');
  }
  const used = usedMedia();
  const entries = dirty.map((k) => ({ path: FILES[k], mode: '100644', type: 'blob', content: serialize(S.data[k]) }));
  const uploads = [...S.pending].filter(([p]) => used.has(p));
  let n = 0;
  for (const [p, blob] of uploads) {
    progress(`Uploading files (${++n} of ${uploads.length})…`);
    const { sha } = await gh('/git/blobs', { method: 'POST', body: { content: await toBase64(blob), encoding: 'base64' } });
    entries.push({ path: 'public' + p, mode: '100644', type: 'blob', sha });
  }
  for (const p of S.removed) {
    for (const q of [p, smPath(p)]) {
      if (!used.has(q) && remote.has('public' + q)) entries.push({ path: 'public' + q, mode: '100644', type: 'blob', sha: null });
    }
  }
  if (!entries.length) throw new Error('There is nothing to publish.');
  progress('Saving changes…');
  const newTree = await gh('/git/trees', { method: 'POST', body: { base_tree: commit.tree.sha, tree: entries } });
  const newCommit = await gh('/git/commits', { method: 'POST', body: { message, tree: newTree.sha, parents: [head] } });
  await gh(`/git/refs/heads/${S.branch}`, { method: 'PATCH', body: { sha: newCommit.sha } });

  S.head = newCommit.sha;
  S.lastCommit = { date: new Date().toISOString(), message };
  const fresh = await gh(`/git/trees/${newTree.sha}?recursive=1`);
  for (const k of dirty) {
    S.original[k] = serialize(S.data[k]);
    S.shas[k] = fresh.tree.find((t) => t.path === FILES[k]).sha;
  }
  S.pending.clear(); S.removed.clear();
  return newCommit.sha;
}

// ---------- images ----------
async function encode(bitmap, maxW, maxH, quality) {
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
  const canvas = Object.assign(document.createElement('canvas'), { width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale) });
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = (type) => new Promise((ok) => canvas.toBlob(ok, type, quality));
  const webp = await blob('image/webp');
  return webp && webp.type === 'image/webp' ? webp : blob('image/jpeg'); // browsers without WebP encoding
}
async function addImage(file, dir) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const full = await encode(bitmap, 1600, 1600, 0.78);
  const small = await encode(bitmap, 640, 4000, 0.72);
  bitmap.close?.();
  const ext = full.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `/media/${dir}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}.${ext}`;
  S.pending.set(path, full); S.pending.set(smPath(path), small);
  S.previews.set(path, URL.createObjectURL(small));
  return path;
}
function dropImage(path) {
  if (!path) return;
  if (S.pending.has(path)) { S.pending.delete(path); S.pending.delete(smPath(path)); } else S.removed.add(path);
}
const preview = (path) => S.previews.get(path) || smPath(path);

// ---------- UI primitives ----------
function toast(msg, type = 'ok') {
  // The container is a popover so toasts sit above open dialogs (re-showing moves it to the top).
  let box = $('#toasts');
  if (!box) document.body.append((box = h('div', { id: 'toasts', popover: 'manual' })));
  const t = h('div', { class: `toast ${type}`, role: 'status' }, msg);
  box.append(t);
  if (box.showPopover) { if (box.matches(':popover-open')) box.hidePopover(); box.showPopover(); }
  setTimeout(() => t.remove(), type === 'err' ? 8000 : 3500);
}
/** Refresh the "unpublished changes" state without re-rendering the form being typed in. */
function touch() {
  const n = dirtyFiles().length;
  const btn = $('#publish');
  if (!btn) return;
  btn.disabled = !n;
  btn.classList.toggle('pulse', !!n);
  $('#publish-label').textContent = n ? 'Publish Changes' : 'No Changes';
}
addEventListener('beforeunload', (e) => { if (S.data && dirtyFiles().length) e.preventDefault(); });

const field = (label, control, hint) => h('label', { class: 'field' }, h('span', { class: 'label' }, label), control, hint && h('small', { class: 'hint' }, hint));
function input(obj, key, { type = 'text', dir, placeholder, rows, oninput } = {}) {
  const el = rows ? h('textarea', { rows, dir, placeholder }) : h('input', { type, dir, placeholder });
  el.value = obj[key] ?? '';
  el.addEventListener('input', () => { obj[key] = el.value; oninput?.(el.value); touch(); });
  return el;
}
/** English + Arabic inputs side by side for a {en, ar} value. */
const pair = (label, obj, opts = {}) =>
  h('div', { class: 'pair' },
    field(`${label} (English)`, input(obj, 'en', { ...opts, dir: 'ltr' })),
    field(`${label} (Arabic)`, input(obj, 'ar', { ...opts, dir: 'rtl' })));
function select(obj, key, options, onchange) {
  const el = h('select', {}, Object.entries(options).map(([v, t]) => h('option', { value: v }, t)));
  el.value = obj[key];
  el.addEventListener('change', () => { obj[key] = el.value; onchange?.(el.value); touch(); });
  return el;
}
function toggle(obj, key, label, onchange) {
  const el = h('input', { type: 'checkbox', checked: !!obj[key] });
  el.addEventListener('change', () => { obj[key] = el.checked; onchange?.(); touch(); });
  return h('label', { class: 'switch', title: label ? null : 'Visible on the site' }, el, h('span', { class: 'track' }), label && h('span', {}, label));
}
function uploader(label, multiple, onfiles) {
  const inputEl = h('input', { type: 'file', accept: 'image/*', multiple, hidden: true });
  const box = h('button', { type: 'button', class: 'dropzone', onclick: () => inputEl.click() }, icon('upload', 22), h('span', {}, label), inputEl);
  const run = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    box.classList.add('busy');
    try { await onfiles(list); } catch (e) { toast('Could not process the image: ' + e.message, 'err'); }
    box.classList.remove('busy'); inputEl.value = '';
  };
  inputEl.addEventListener('change', () => run(inputEl.files));
  box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('over'); });
  box.addEventListener('dragleave', () => box.classList.remove('over'));
  box.addEventListener('drop', (e) => { e.preventDefault(); box.classList.remove('over'); run(e.dataTransfer.files); });
  return box;
}
/** Sortable multi-image gallery. First image is the cover. */
function gallery(item, dir) {
  const wrap = h('div', { class: 'gallery' });
  const draw = () => {
    wrap.replaceChildren(
      ...item.images.map((p, i) =>
        h('figure', { class: 'thumb' + (i === 0 ? ' cover' : '') },
          h('img', { src: preview(p), alt: '', loading: 'lazy' }),
          i === 0 && h('figcaption', {}, icon('star', 12), 'Cover'),
          h('div', { class: 'thumb-actions' },
            h('button', { type: 'button', title: 'Move earlier', disabled: i === 0, onclick: () => move(i, -1) }, icon('up', 14)),
            h('button', { type: 'button', title: 'Move later', disabled: i === item.images.length - 1, onclick: () => move(i, 1) }, icon('down', 14)),
            h('button', { type: 'button', title: 'Remove', class: 'danger', onclick: () => { dropImage(item.images.splice(i, 1)[0]); draw(); touch(); } }, icon('trash', 14))))),
      uploader('Add images', true, async (files) => { for (const f of files) { item.images.push(await addImage(f, dir())); draw(); } touch(); }),
    );
  };
  const move = (i, d) => { const a = item.images; [a[i], a[i + d]] = [a[i + d], a[i]]; draw(); touch(); };
  draw();
  return wrap;
}
/** Single image (hero background, about photo). */
function singleImage(obj, key, dir) {
  const wrap = h('div', { class: 'gallery' });
  const draw = () => wrap.replaceChildren(
    obj[key] && h('figure', { class: 'thumb wide' }, h('img', { src: preview(obj[key]), alt: '' }),
      h('div', { class: 'thumb-actions' }, h('button', { type: 'button', class: 'danger', title: 'Remove', onclick: () => { dropImage(obj[key]); obj[key] = ''; draw(); touch(); } }, icon('trash', 14)))),
    uploader(obj[key] ? 'Replace image' : 'Upload image', false, async ([f]) => { const old = obj[key]; obj[key] = await addImage(f, dir); dropImage(old); draw(); touch(); }),
  );
  draw();
  return wrap;
}

// ---------- rich text ----------
const ALLOWED = new Set(['P', 'H3', 'H4', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'BR', 'A']);
function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 8) { child.remove(); continue; }
      if (child.nodeType !== 1) continue;
      walk(child);
      const tag = child.tagName;
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(tag)) { child.remove(); continue; }
      if (!ALLOWED.has(tag)) {
        // unwrap unknown tags; block-level ones become paragraphs
        const block = ['DIV', 'H1', 'H2', 'H5', 'H6', 'SECTION', 'ARTICLE', 'BLOCKQUOTE'].includes(tag);
        const repl = block ? doc.createElement(/^H[1256]$/.test(tag) ? 'h4' : 'p') : doc.createDocumentFragment();
        repl.append(...child.childNodes); child.replaceWith(repl);
        continue;
      }
      const href = tag === 'A' ? child.getAttribute('href') : null;
      for (const a of [...child.attributes]) child.removeAttribute(a.name);
      if (href && /^(https?:|mailto:|tel:|\/)/i.test(href)) { child.setAttribute('href', href); if (/^https?:/i.test(href)) { child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener'); } }
    }
  };
  walk(doc.body.firstChild);
  return doc.body.firstChild.innerHTML.replace(/<p>(\s|<br>)*<\/p>/g, '').replace(/\n{3,}/g, '\n\n').trim();
}
function richText(obj, key, dir) {
  const area = h('div', { class: 'rich-area prose', contentEditable: 'true', dir, html: obj[key] || '' });
  const source = h('textarea', { class: 'rich-source', dir: 'ltr', rows: 14, hidden: true });
  const save = () => { obj[key] = sanitize(area.innerHTML); touch(); };
  const cmd = (name, arg) => () => { area.focus(); document.execCommand(name, false, arg); save(); };
  area.addEventListener('input', save);
  area.addEventListener('paste', (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, html ? sanitize(html) : text.split(/\n{2,}/).map((p) => `<p>${p.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;')).replace(/\n/g, '<br>')}</p>`).join(''));
    save();
  });
  source.addEventListener('input', () => { obj[key] = sanitize(source.value); touch(); });
  const btn = (label, title, fn, cls = '') => h('button', { type: 'button', title, class: cls, onmousedown: (e) => e.preventDefault(), onclick: fn }, label);
  const link = () => { const url = prompt('Link address (starting with https://)'); if (url) cmd('createLink', url)(); };
  const toggleSource = (e) => {
    const on = source.hidden;
    if (on) source.value = obj[key] || ''; else area.innerHTML = obj[key] || '';
    source.hidden = !on; area.hidden = on; e.currentTarget.classList.toggle('active', on);
  };
  return h('div', { class: 'rich' },
    h('div', { class: 'rich-bar' },
      btn('Heading', 'Sub-heading (e.g. DAY 1)', cmd('formatBlock', 'h4')), btn('Paragraph', 'Normal paragraph', cmd('formatBlock', 'p')),
      btn('B', 'Bold', cmd('bold'), 'b'), btn('• List', 'Bullet list', cmd('insertUnorderedList')),
      btn('Link', 'Add a link', link), btn('Clear', 'Remove formatting', cmd('removeFormat')),
      h('span', { class: 'grow' }), btn('HTML', 'Show the HTML code', toggleSource)),
    area, source);
}

// ---------- modal ----------
function modal({ title, body, footer, wide }) {
  const dlg = h('dialog', { class: 'modal' + (wide ? ' wide' : '') },
    h('header', {}, h('h2', {}, title), h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Close', onclick: () => dlg.close() }, icon('x'))),
    h('div', { class: 'modal-body' }, body), footer && h('footer', {}, footer));
  dlg.addEventListener('close', () => dlg.remove());
  document.body.append(dlg);
  dlg.showModal();
  return dlg;
}
const confirmBox = (text, action, onyes) => {
  const dlg = modal({ title: 'Please confirm', body: h('p', {}, text),
    footer: [h('button', { class: 'btn', onclick: () => dlg.close() }, 'Cancel'), h('button', { class: 'btn danger', onclick: () => { dlg.close(); onyes(); } }, action)] });
};

// ---------- views ----------
const card = (title, ic, ...kids) => h('section', { class: 'card' }, title && h('h3', { class: 'card-title' }, ic && icon(ic, 14), h('span', {}, title)), ...kids);

function viewOverview() {
  const { programs, services } = S.data;
  const count = (fn) => programs.filter(fn).length;
  const stat = (n, label, ic, go) => h('button', { class: 'stat', onclick: go }, h('span', { class: 'stat-icon' }, icon(ic, 22)), h('span', { class: 'stat-text' }, h('b', {}, String(n)), h('small', {}, label)));
  const goProg = (section, location) => () => { S.filter.section = section; if (location) S.filter.location = location; S.filter.q = ''; setView('programs'); };
  const last = S.lastCommit;
  return [
    h('div', { class: 'stats' },
      stat(programs.length, 'Total Programs', 'sitemap', goProg('discover_egypt')),
      stat(count((p) => p.active), 'Active', 'eye', goProg('discover_egypt')),
      stat(count((p) => p.section === 'excursion'), 'Day Excursions', 'bus', goProg('excursion')),
      stat(services.length, 'Services', 'bell', () => setView('services'))),
    card('Welcome', 'info',
      h('p', {}, 'Manage your programs and site content. Changes are saved straight to GitHub when you press “Publish Changes”, and appear on the live site a minute or two later.'),
      last && h('p', { class: 'muted' }, `Last site update: ${new Date(last.date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} — ${last.message.split('\n')[0]}`)),
    card('Programs by Section', 'sitemap',
      h('ul', { class: 'rows' },
        Object.entries(SECTIONS).filter(([k]) => k !== 'excursion').map(([k, t]) =>
          h('li', {}, h('button', { class: 'row-link', onclick: goProg(k) }, h('span', {}, t), h('b', {}, String(count((p) => p.section === k)))))),
        Object.entries(LOCATIONS).map(([k, t]) =>
          h('li', {}, h('button', { class: 'row-link', onclick: goProg('excursion', k) }, h('span', {}, `Day Excursions — ${t}`), h('b', {}, String(count((p) => p.section === 'excursion' && p.location === k)))))))),
  ];
}

function viewHero() {
  const hero = S.data.settings.hero;
  return [
    card('Hero Text', 'edit', pair('Small tag above the title', hero.tag), pair('Main title', hero.title),
      pair('Subtitle', hero.subtitle, { rows: 3 }), pair('Bottom line', hero.highlight, { rows: 2 })),
    card('Hero Background', 'image',
      h('div', { class: 'field' }, h('span', { class: 'label' }, 'Background image (shown instantly, before the video loads)'), singleImage(hero, 'image', 'site')),
      field('Background video URL (optional)', input(hero, 'video', { dir: 'ltr', placeholder: '/media/site/hero.mp4' }), 'Leave empty to show the image only. Use a silent 1080p MP4.'),
      field('Smaller video for phones (optional)', input(hero, 'videoSmall', { dir: 'ltr', placeholder: '/media/site/hero-720.mp4' }), 'A lighter 720p copy used on small screens.')),
  ];
}
function viewAbout() {
  const a = S.data.settings.about;
  return [
    card('About Text', 'edit', pair('Title', a.title), pair('First paragraph', a.text, { rows: 3 }), pair('Second paragraph', a.long, { rows: 4 })),
    card('Mission & Vision', 'eye', pair('Our mission', a.mission, { rows: 3 }), pair('Our vision', a.vision, { rows: 3 })),
    card('About Image', 'image', singleImage(a, 'image', 'site')),
  ];
}
function viewContact() {
  const c = S.data.settings.contact, s = S.data.settings.social;
  const wa = h('small', { class: 'hint' });
  const showWa = () => { const n = (c.whatsapp || '').replace(/\D/g, ''); wa.textContent = n ? `https://wa.me/${n}` : 'Without a WhatsApp number the WhatsApp buttons are hidden on the site.'; };
  showWa();
  const ltr = (obj, key, placeholder, type) => input(obj, key, { dir: 'ltr', placeholder, type });
  return [
    card('Contact Details', 'contact',
      h('div', { class: 'pair' }, field('Email (booking requests are sent here)', ltr(c, 'email', 'info@example.com', 'email')), field('Phone', ltr(c, 'phone', '+20 2 0000 0000', 'tel'))),
      h('label', { class: 'field' }, h('span', { class: 'label' }, 'WhatsApp number (with country code)'), input(c, 'whatsapp', { dir: 'ltr', placeholder: '+20 100 000 0000', oninput: showWa }), wa),
      pair('Address line 1', c.address1), pair('Address line 2', c.address2)),
    card('Social Links', 'external',
      h('p', { class: 'muted' }, 'A link left empty hides its icon on the site.'),
      h('div', { class: 'pair' }, ['facebook', 'instagram', 'youtube', 'linkedin', 'tripadvisor'].map((k) => field(k[0].toUpperCase() + k.slice(1), ltr(s, k, 'https://', 'url'))))),
  ];
}

// ----- lists (programs + services share the same row UI) -----
function listRow(item, { title, sub, group, onedit, ondelete }) {
  const i = group.indexOf(item);
  const swap = (d) => () => {
    [group[i], group[i + d]] = [group[i + d], group[i]];
    group.forEach((x, n) => (x.sort = n + 1));
    touch(); render();
  };
  return h('li', { class: 'item' + (item.active ? '' : ' off') },
    h('div', { class: 'item-thumb' }, item.images[0] ? h('img', { src: preview(item.images[0]), alt: '', loading: 'lazy' }) : icon('image', 22)),
    h('button', { class: 'item-main', onclick: onedit }, h('b', {}, title), h('span', {}, sub)),
    h('div', { class: 'item-actions' },
      toggle(item, 'active', '', render),
      h('button', { class: 'icon-btn', title: 'Move up', disabled: i === 0, onclick: swap(-1) }, icon('up')),
      h('button', { class: 'icon-btn', title: 'Move down', disabled: i === group.length - 1, onclick: swap(1) }, icon('down')),
      h('button', { class: 'icon-btn', title: 'Edit', onclick: onedit }, icon('edit')),
      h('button', { class: 'icon-btn danger', title: 'Delete', onclick: ondelete }, icon('trash'))));
}
const tabs = (options, current, onpick, counts) =>
  h('div', { class: 'tabs', role: 'tablist' }, Object.entries(options).map(([k, t]) =>
    h('button', { class: 'tab' + (k === current ? ' active' : ''), role: 'tab', onclick: () => onpick(k) }, t, counts && h('i', {}, String(counts(k))))));

function viewPrograms() {
  const all = S.data.programs, f = S.filter;
  const inGroup = (p, sec = f.section, loc = f.location) => p.section === sec && (sec !== 'excursion' || p.location === loc);
  const sorted = (list) => list.sort((a, b) => a.sort - b.sort);
  const group = sorted(all.filter((p) => inGroup(p)));
  const q = f.q.trim().toLowerCase();
  const shown = q ? all.filter((p) => `${p.title.en} ${p.title.ar}`.toLowerCase().includes(q)) : group;
  const search = h('input', { type: 'search', placeholder: 'Search all programs…', value: f.q });
  search.addEventListener('input', () => {
    f.q = search.value; render();
    const again = $('.search input'); again.focus(); again.setSelectionRange(f.q.length, f.q.length);
  });
  return [
    h('div', { class: 'toolbar' },
      h('label', { class: 'search' }, icon('search'), search),
      h('button', { class: 'btn primary', onclick: () => editProgram() }, icon('plus'), 'Add Program')),
    !q && tabs(SECTIONS, f.section, (k) => { f.section = k; render(); }, (k) => all.filter((p) => p.section === k).length),
    !q && f.section === 'excursion' && tabs(LOCATIONS, f.location, (k) => { f.location = k; render(); }, (k) => all.filter((p) => inGroup(p, 'excursion', k)).length),
    shown.length
      ? h('ul', { class: 'items' }, shown.map((p) => listRow(p, {
          title: p.title.en || p.title.ar,
          sub: [p.price, p.duration.en, q && SECTIONS[p.section], p.location && q && LOCATIONS[p.location], p.title.ar].filter(Boolean).join(' · '),
          group: q ? sorted(all.filter((x) => inGroup(x, p.section, p.location))) : group,
          onedit: () => editProgram(p),
          ondelete: () => confirmBox(`Delete “${p.title.en || p.title.ar}” and its images permanently?`, 'Delete', () => { p.images.forEach(dropImage); all.splice(all.indexOf(p), 1); touch(); render(); }),
        })))
      : h('div', { class: 'empty' }, q ? 'No results.' : 'No programs in this section yet — the section stays hidden on the site until you add one.'),
  ];
}

function editProgram(existing) {
  const all = S.data.programs;
  const p = existing ? clone(existing) : {
    id: Math.max(0, ...all.map((x) => x.id)) + 1, slug: '', section: S.filter.section, location: S.filter.section === 'excursion' ? S.filter.location : '',
    sort: 999, active: true, title: { en: '', ar: '' }, excerpt: { en: '', ar: '' }, price: '', duration: { en: '', ar: '' }, images: [], content: { en: '', ar: '' },
  };
  const makeSlug = () => {
    const name = slugify(p.title.en);
    if (!name) return '';
    const base = (p.section === 'excursion' ? LOC_SLUG[p.location] + '-' : '') + name;
    let slug = base, n = 2;
    while (all.some((x) => x.slug === slug)) slug = `${base}-${n++}`;
    return slug;
  };
  const dir = () => `programs/${p.slug || (p.slug = makeSlug()) || 'new'}`;
  const locField = field('Departure city', select(p, 'location', LOCATIONS));
  const syncLoc = () => { locField.hidden = p.section !== 'excursion'; if (p.section === 'excursion' && !p.location) p.location = 'cairo'; if (p.section !== 'excursion') p.location = ''; };
  syncLoc();
  const editors = { en: richText(p.content, 'en', 'ltr'), ar: richText(p.content, 'ar', 'rtl') };
  editors.ar.hidden = true;
  const langTabs = h('div', { class: 'tabs small' }, ['en', 'ar'].map((l) =>
    h('button', { type: 'button', class: 'tab' + (l === 'en' ? ' active' : ''), onclick: (e) => {
      editors.en.hidden = l !== 'en'; editors.ar.hidden = l !== 'ar';
      [...langTabs.children].forEach((b) => b.classList.toggle('active', b === e.currentTarget));
    } }, l === 'en' ? 'English' : 'Arabic')));
  const save = () => {
    if (!p.title.en.trim()) return toast('Enter the English title first (it is used for the page address).', 'err');
    if (!p.slug) p.slug = makeSlug();
    if (!p.slug) return toast('The English title must contain Latin letters.', 'err');
    if (existing) {
      const moved = existing.section !== p.section || existing.location !== p.location;
      Object.assign(existing, p);
      if (moved) existing.sort = 999;
    } else all.push(p);
    // renumber the group so order stays 1..n
    all.filter((x) => x.section === p.section && x.location === p.location).sort((a, b) => a.sort - b.sort).forEach((x, n) => (x.sort = n + 1));
    S.filter.section = p.section; if (p.location) S.filter.location = p.location; S.filter.q = '';
    dlg.close(); touch(); render();
    toast('Saved — press “Publish Changes” to put it on the site.');
  };
  const dlg = modal({
    wide: true, title: existing ? 'Edit Program' : 'Add Program',
    body: [
      h('div', { class: 'pair' }, field('Section', select(p, 'section', SECTIONS, syncLoc)), locField),
      pair('Title', p.title),
      h('div', { class: 'pair three' },
        field('Price', input(p, 'price', { dir: 'ltr', placeholder: '$1485' }), 'Leave empty to show “Price on request”.'),
        field('Duration (English)', input(p.duration, 'en', { dir: 'ltr', placeholder: '7 Days' })),
        field('Duration (Arabic)', input(p.duration, 'ar', { dir: 'rtl', placeholder: '7 أيام' }))),
      pair('Short description (shown on the card)', p.excerpt, { rows: 3 }),
      h('div', { class: 'field' }, h('span', { class: 'label' }, 'Images — the first one is the cover'), gallery(p, dir)),
      h('div', { class: 'field' },
        h('div', { class: 'label-row' }, h('span', { class: 'label' }, 'Program details (itinerary, inclusions…)'), langTabs),
        editors.en, editors.ar, h('small', { class: 'hint' }, 'If the Arabic text is empty, the Arabic page shows the English text.')),
      h('div', { class: 'field inline' }, toggle(p, 'active', 'Active (visible on the site)')),
      existing && h('small', { class: 'hint' }, `/programs/${p.slug}/`),
    ],
    footer: [h('button', { class: 'btn', onclick: () => dlg.close() }, 'Cancel'), h('button', { class: 'btn primary', onclick: save }, icon('check'), 'Save Program')],
  });
}

function viewServices() {
  const all = S.data.services;
  const group = [...all].sort((a, b) => a.sort - b.sort);
  return [
    h('div', { class: 'toolbar' }, h('p', { class: 'muted' }, 'Services appear on the home page in this order.'),
      h('button', { class: 'btn primary', onclick: () => editService() }, icon('plus'), 'Add Service')),
    h('ul', { class: 'items' }, group.map((s) => listRow(s, {
      title: s.title.en || s.title.ar, sub: `${FORMS[s.form] || FORMS.generic} · ${s.title.ar}`, group,
      onedit: () => editService(s),
      ondelete: () => confirmBox(`Delete the service “${s.title.en || s.title.ar}” permanently?`, 'Delete', () => { s.images.forEach(dropImage); all.splice(all.indexOf(s), 1); touch(); render(); }),
    }))),
  ];
}
function editService(existing) {
  const all = S.data.services;
  const s = existing ? clone(existing) : { id: Math.max(0, ...all.map((x) => x.id)) + 1, slug: '', form: 'generic', sort: all.length + 1, active: true, title: { en: '', ar: '' }, description: { en: '', ar: '' }, images: [] };
  const makeSlug = () => { const base = slugify(s.title.en); let slug = base, n = 2; while (base && all.some((x) => x.slug === slug)) slug = `${base}-${n++}`; return slug; };
  const save = () => {
    if (!s.title.en.trim()) return toast('Enter the English service name first.', 'err');
    if (!s.slug) s.slug = makeSlug();
    if (existing) Object.assign(existing, s); else all.push(s);
    dlg.close(); touch(); render();
    toast('Saved — press “Publish Changes” to put it on the site.');
  };
  const dlg = modal({
    wide: true, title: existing ? 'Edit Service' : 'Add Service',
    body: [
      pair('Service name', s.title), pair('Description', s.description, { rows: 5 }),
      field('Booking form', select(s, 'form', FORMS), 'Decides which questions the customer is asked when requesting this service.'),
      h('div', { class: 'field' }, h('span', { class: 'label' }, 'Images — the first one is shown on the card'), gallery(s, () => `services/${s.slug || (s.slug = makeSlug()) || 'new'}`)),
      h('div', { class: 'field inline' }, toggle(s, 'active', 'Active (visible on the site)')),
    ],
    footer: [h('button', { class: 'btn', onclick: () => dlg.close() }, 'Cancel'), h('button', { class: 'btn primary', onclick: save }, icon('check'), 'Save Service')],
  });
}

// ---------- publish dialog ----------
function openPublish() {
  const dirty = dirtyFiles();
  if (!dirty.length) return;
  const used = usedMedia();
  const uploads = [...S.pending.keys()].filter((p) => used.has(p) && !p.includes('.sm.')).length;
  const names = { settings: 'Site text & contact details', programs: 'Programs', services: 'Services' };
  const msg = { value: 'Update content from the admin panel' };
  const status = h('p', { class: 'muted', role: 'status' });
  const go = h('button', { class: 'btn primary', onclick: async () => {
    go.disabled = true;
    try {
      await publish(msg.value.trim() || 'Update content', (t) => (status.textContent = t));
      dlg.close(); touch(); render();
      toast('Published. The live site updates in a minute or two.');
    } catch (e) { status.textContent = ''; go.disabled = false; toast(explain(e), 'err'); }
  } }, icon('rocket'), 'Publish Now');
  const dlg = modal({
    title: 'Publish Changes',
    body: [
      h('ul', { class: 'rows' }, dirty.map((k) => h('li', {}, h('span', {}, names[k]), h('b', {}, 'Modified'))), uploads > 0 && h('li', {}, h('span', {}, 'New images'), h('b', {}, String(uploads)))),
      field('Update note (kept in the GitHub history)', input(msg, 'value')), status,
    ],
    footer: [h('button', { class: 'btn', onclick: () => dlg.close() }, 'Cancel'), go],
  });
}

// ---------- shell ----------
function setView(v) { S.view = v; render(); $('.sidebar')?.classList.remove('open'); scrollTo(0, 0); }
function render() {
  const view = { overview: viewOverview, programs: viewPrograms, services: viewServices, hero: viewHero, about: viewAbout, contact: viewContact }[S.view];
  $('#view').replaceChildren(...view().filter(Boolean));
  $('#view-title').textContent = TITLES[S.view];
  document.querySelectorAll('.nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === S.view));
  touch();
}
const logo = () => h('div', { class: 'logo' }, h('b', {}, 'Luxury Travel'), h('span', {}, 'Service · Admin'));
function shell() {
  $('#app').replaceChildren(
    h('aside', { class: 'sidebar' },
      logo(),
      h('nav', { class: 'nav' }, NAV.map(([group, items]) => [
        h('p', { class: 'nav-group' }, group),
        items.map(([k, t, i]) => h('button', { 'data-view': k, onclick: () => setView(k) }, icon(i, 17), t)),
      ])),
      h('div', { class: 'side-foot' },
        h('a', { href: S.siteUrl || '/', target: '_blank', rel: 'noopener' }, icon('external', 15), 'View Site'),
        h('button', { onclick: logout }, icon('logout', 15), 'Logout'))),
    h('div', { class: 'main' },
      h('header', { class: 'topbar' },
        h('button', { class: 'icon-btn menu-btn', 'aria-label': 'Menu', onclick: () => $('.sidebar').classList.toggle('open') }, icon('menu', 22)),
        h('h1', { id: 'view-title' }),
        h('button', { class: 'btn primary', id: 'publish', onclick: openPublish }, icon('rocket', 16), h('span', { id: 'publish-label' }))),
      h('div', { id: 'view', class: 'view' })));
  render();
}
function logout() {
  const out = () => { store.del('lts.token'); location.reload(); };
  if (dirtyFiles().length) confirmBox('You have unpublished changes that will be lost.', 'Logout', out); else out();
}

function login(error) {
  const form = { repo: S.repo, token: '', remember: true };
  const err = h('p', { class: 'form-error', role: 'alert', hidden: !error }, error || '');
  const btn = h('button', { class: 'btn primary block', type: 'submit' }, 'Sign In');
  const submit = async (e) => {
    e.preventDefault();
    S.repo = form.repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$|\/$/g, '');
    S.token = form.token.trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(S.repo) || !S.token) { err.textContent = 'Enter the repository as owner/repo and your access token.'; err.hidden = false; return; }
    btn.disabled = true; btn.textContent = 'Checking…';
    try {
      await loadRepo();
      const where = form.remember ? localStorage : sessionStorage;
      store.del('lts.token'); where.setItem('lts.token', S.token); localStorage.setItem('lts.repo', S.repo);
      shell();
    } catch (ex) { err.textContent = explain(ex); err.hidden = false; btn.disabled = false; btn.textContent = 'Sign In'; }
  };
  $('#app').replaceChildren(
    h('main', { class: 'login' },
      h('form', { class: 'login-card', onsubmit: submit },
        logo(),
        h('p', { class: 'muted' }, 'The site content is stored in its GitHub repository. Sign in with a GitHub access token to edit it.'),
        field('Repository', input(form, 'repo', { dir: 'ltr', placeholder: 'owner/repository' })),
        field('GitHub access token', input(form, 'token', { type: 'password', dir: 'ltr', placeholder: 'github_pat_…' })),
        h('div', { class: 'field inline' }, toggle(form, 'remember', 'Remember me on this device')),
        err, btn,
        h('details', { class: 'help' }, h('summary', {}, 'How do I get an access token?'),
          h('ol', {},
            h('li', {}, 'Open ', h('a', { href: 'https://github.com/settings/personal-access-tokens/new', target: '_blank', rel: 'noopener' }, 'GitHub → Fine-grained tokens'), '.'),
            h('li', {}, 'Under Repository access choose “Only select repositories” and pick the site repository.'),
            h('li', {}, 'Under Permissions → Repository permissions set Contents to “Read and write”.'),
            h('li', {}, 'Press Generate token and paste it here. It is stored only in this browser.'))))));
}

// ---------- boot ----------
(async function boot() {
  $('#app').replaceChildren(h('div', { class: 'boot' }, 'Loading…'));
  const cfg = await fetch('config.json').then((r) => r.json()).catch(() => ({}));
  S.repo = S.repo || cfg.repo || ''; S.branch = cfg.branch || ''; S.siteUrl = cfg.siteUrl || '';
  if (!S.repo || !S.token) return login();
  try { await loadRepo(); shell(); } catch (e) { login(explain(e)); }
})();
