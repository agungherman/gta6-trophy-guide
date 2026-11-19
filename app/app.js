// Leonida Trophy Guide — offline tracker for the 55 GTA VI trophies.
// Data lives in data/trophies.json; progress lives only in this browser
// (localStorage). No network requests are made after the first load.
const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-trophy-guide-v1';
const DEMO_EARNED = [2, 3, 4, 5, 8, 15, 19, 21, 30, 35, 42, 53];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const params = new URLSearchParams(location.search);
const demo = params.get('demo') === '1';

let data = null;
let earned = loadEarned();
let gradeFilter = 'all';
let categoryFilter = 'all';
let showSpoilers = false;
let earnedOnly = false;
let missableOnly = false;
let query = '';

function loadEarned() {
  if (demo) return new Set(DEMO_EARNED);
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (raw && Array.isArray(raw.earned)) return new Set(raw.earned.filter(Number.isInteger));
  } catch (_) { /* corrupted store: start fresh */ }
  return new Set();
}

function saveEarned() {
  if (demo) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ app: 'leonida-trophy-guide', version: 1, earned: [...earned].sort((a, b) => a - b) }));
    flashSaved('Progress saved in this browser.');
  } catch (_) { flashSaved('Could not save — browser storage is unavailable.'); }
}

let saveTimer = 0;
function flashSaved(msg) {
  const el = $('#saved-note');
  el.textContent = msg;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { el.textContent = ''; }, 2500);
}

function gradeLetter(grade) {
  return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] || '?';
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function sourceLink(id) {
  const s = data.sources.find((x) => x.id === id);
  if (!s) return '';
  return `<a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isHidden(t) {
  return t.spoiler && !showSpoilers && !earned.has(t.id);
}

function visibleTrophies() {
  const q = query.trim().toLowerCase();
  return data.trophies.filter((t) => {
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (earnedOnly && !earned.has(t.id)) return false;
    if (missableOnly && !t.missable) return false;
    if (q) {
      if (isHidden(t)) return false;
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function cardHtml(t) {
  const isEarned = earned.has(t.id);
  const hidden = isHidden(t);
  const tags = [`<span class="tag">${escapeHtml(t.category)}</span>`];
  if (t.spoiler) tags.push('<span class="tag story">Story</span>');
  if (t.missable) tags.push('<span class="tag missable">Missable</span>');
  if (t.guide.includes('still being confirmed') || t.guide.includes('still unconfirmed') || t.guide.includes('still pinning it down'))
    tags.push('<span class="tag unconfirmed">Unconfirmed</span>');
  return `
  <article class="card ${isEarned ? 'earned' : ''} ${hidden ? 'spoiler-hidden' : ''}" data-id="${t.id}" tabindex="0">
    <div class="card-top">
      <span class="medal ${t.grade}" title="${gradeLabel(t.grade)}">${gradeLetter(t.grade)}</span>
      <div>
        <h3><span class="real">${escapeHtml(t.name)}</span><span class="spoiler-note">Story trophy — hidden</span>${isEarned ? ' <span class="earned-mark">✓ Earned</span>' : ''}</h3>
        <p class="desc"><span class="real">${escapeHtml(t.description)}</span><span class="spoiler-note">Turn on “Show story spoilers” to reveal this trophy, or tick it once you have earned it.</span></p>
      </div>
    </div>
    <div class="tags">${tags.join('')}</div>
    <div class="guide"><span class="real">${escapeHtml(t.guide)}<span class="src">Sources: ${t.sources.map(sourceLink).join(' ')}</span></span><span class="spoiler-note">Guide hidden with the spoiler setting.</span></div>
    <label class="earn"><input type="checkbox" data-earn="${t.id}" ${isEarned ? 'checked' : ''}> <span>Earned</span></label>
  </article>`;
}

function render() {
  const list = visibleTrophies();
  $('#list').innerHTML = list.map(cardHtml).join('');
  $('#empty').hidden = list.length > 0;
  const total = data.trophies.length;
  const n = earned.size;
  $('#earned-count').textContent = n;
  $('#earned-pct').textContent = `${Math.round((n / total) * 100)}%`;
  $('#progress-fill').style.width = `${(n / total) * 100}%`;
  $('#progress-bar').setAttribute('aria-valuenow', String(n));
  const counts = {};
  for (const t of data.trophies) {
    counts[t.grade] = counts[t.grade] || { got: 0, total: 0 };
    counts[t.grade].total += 1;
    if (earned.has(t.id)) counts[t.grade].got += 1;
  }
  $('#grade-counts').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `<span><b>${gradeLabel(g)}</b> ${counts[g].got}/${counts[g].total}</span>`)
    .join('');
  $('#list-note').textContent = `Showing ${list.length} of ${total} trophies${earnedOnly ? ' · earned only' : ''}${missableOnly ? ' · missable only' : ''}${showSpoilers ? '' : ' · story trophies hidden until earned or revealed'}. Click a card to read its guide.`;
}

function bind() {
  $('#search').addEventListener('input', (e) => { query = e.target.value; render(); });
  $('#grade-chips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-grade]');
    if (!btn) return;
    gradeFilter = btn.dataset.grade;
    $$('#grade-chips .chip').forEach((c) => c.classList.toggle('on', c === btn));
    render();
  });
  $('#category').addEventListener('change', (e) => { categoryFilter = e.target.value; render(); });
  $('#spoilers').addEventListener('change', (e) => { showSpoilers = e.target.checked; render(); });
  $('#earned-only').addEventListener('change', (e) => { earnedOnly = e.target.checked; render(); });
  $('#missable-only').addEventListener('change', (e) => { missableOnly = e.target.checked; render(); });

  $('#list').addEventListener('click', (e) => {
    const box = e.target.closest('[data-earn]');
    if (box) {
      const id = Number(box.dataset.earn);
      if (box.checked) earned.add(id); else earned.delete(id);
      saveEarned();
      render();
      return;
    }
    const card = e.target.closest('.card');
    if (card) card.classList.toggle('open');
  });
  $('#list').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('card')) e.target.classList.toggle('open');
  });

  $('#export').addEventListener('click', () => {
    const payload = { app: 'leonida-trophy-guide', version: 1, exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#import-btn').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result);
        const ids = Array.isArray(raw.earned) ? raw.earned : raw;
        const valid = ids.filter((id) => Number.isInteger(id) && data.trophies.some((t) => t.id === id));
        if (!valid.length && ids.length) throw new Error('no valid trophy ids');
        earned = new Set(valid);
        saveEarned();
        render();
        flashSaved(`Imported ${valid.length} earned trophies.`);
      } catch (_) {
        flashSaved('Import failed — that file is not a progress export from this guide.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });
  $('#reset').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies? This cannot be undone.')) return;
    earned = new Set();
    saveEarned();
    render();
  });
}

async function main() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`could not load ${DATA_URL}: ${res.status}`);
  data = await res.json();
  $('#source-list').innerHTML = data.sources
    .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a></li>`)
    .join('');
  bind();
  if (params.get('filter') === 'missable') { missableOnly = true; $('#missable-only').checked = true; }
  if (params.get('spoilers') === 'on') { showSpoilers = true; $('#spoilers').checked = true; }
  render();
  const focusId = Number(params.get('trophy') || 0);
  if (focusId) {
    const card = $(`.card[data-id="${focusId}"]`);
    if (card) { card.classList.add('open'); card.scrollIntoView({ block: 'center' }); }
  } else if (params.get('view') === 'roadmap') {
    $('#roadmap').scrollIntoView();
  }
}

main().catch((err) => {
  $('#list').innerHTML = `<p class="empty">Could not load the trophy list: ${escapeHtml(err.message)}</p>`;
});
