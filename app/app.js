/* Leonida Trophy Guide — offline tracker. No network, no build step. */
const KEY = 'leonida-trophy-guide-v1';
const DEMO_EARNED = [2, 3, 8, 10, 16, 21, 33, 44, 46, 51, 53, 55];
const STAGE_NAMES = {
  1: 'Stage 1 — Play the story',
  2: 'Stage 2 — Side strands and activities',
  3: 'Stage 3 — Collectibles and the open world',
  4: 'Stage 4 — The missable and the 100% sweep',
  5: 'Stage 5 — Platinum',
};
const STAGE_BLURBS = {
  1: 'Main story missions, chapters 1 to 4 and the finale. The 12 story trophies all land here.',
  2: 'Character strands, stranger missions, races, ranges, challenges and the odd jobs. The bulk of the list.',
  3: 'Cards, WAiNK spots, vehicles, areas, garages and registrations — best done while exploring.',
  4: 'Meditate at every spot before it is too late, then finish the 100% checklist.',
  5: 'One trophy left: the platinum, for everything else.',
};

const params = new URLSearchParams(location.search);
const demo = params.get('demo') === '1';
const startView = params.get('view') === 'roadmap' ? 'roadmap'
  : params.get('view') === 'missables' ? 'missables' : 'checklist';
const startTrophy = Number(params.get('trophy') || 0);

let trophies = [];
let earned = new Set();

function loadEarned() {
  if (demo) return new Set(DEMO_EARNED);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  if (demo) return;
  try { localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b))); } catch { /* storage unavailable */ }
}

function spoilerOn() {
  return document.getElementById('spoilerToggle').checked;
}

function isHidden(t) {
  return spoilerOn() && t.kind === 'story' && !earned.has(t.id);
}

function displayName(t) {
  return isHidden(t) ? 'Story trophy — hidden' : t.name;
}

function displayDesc(t) {
  return isHidden(t) ? 'Turn off “Hide story spoilers” to see this one.' : t.description;
}

function cardEl(t) {
  const li = document.createElement('li');
  li.className = 'card' + (earned.has(t.id) ? ' earned' : '');
  li.dataset.id = String(t.id);
  const top = document.createElement('div');
  top.className = 'card-top';
  const h = document.createElement('h3');
  h.textContent = displayName(t);
  const g = document.createElement('span');
  g.className = 'grade ' + t.grade;
  g.textContent = t.grade;
  top.append(h, g);
  const p = document.createElement('p');
  p.textContent = displayDesc(t);
  const tags = document.createElement('div');
  tags.className = 'tags';
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = t.kind;
  tags.append(kind);
  if (t.missable) {
    const w = document.createElement('span');
    w.className = 'tag warn';
    w.textContent = 'missable';
    tags.append(w);
  }
  if (t.unconfirmed) {
    const u = document.createElement('span');
    u.className = 'tag note';
    u.textContent = 'unconfirmed';
    tags.append(u);
  }
  const tick = document.createElement('label');
  tick.className = 'tick';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
  box.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    saveEarned();
    render();
  });
  const tickText = document.createElement('span');
  tickText.textContent = earned.has(t.id) ? 'Earned' : 'Mark earned';
  tick.append(box, tickText);
  li.append(top, p, tags, tick);
  li.addEventListener('click', () => openDetail(t));
  return li;
}

function matches(t) {
  const q = document.getElementById('search').value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  const kind = document.getElementById('kindFilter').value;
  if (kind && t.kind !== kind) return false;
  const grade = document.getElementById('gradeFilter').value;
  if (grade && t.grade !== grade) return false;
  const ef = document.getElementById('earnedFilter').value;
  if (ef === 'earned' && !earned.has(t.id)) return false;
  if (ef === 'unearned' && earned.has(t.id)) return false;
  return true;
}

function render() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  document.getElementById('progressFill').style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
  document.getElementById('progressText').textContent = `${done} / ${total} earned`;
  const list = document.getElementById('cards');
  list.replaceChildren();
  const shown = trophies.filter(matches);
  for (const t of shown) list.append(cardEl(t));
  document.getElementById('emptyNote').hidden = shown.length > 0;
  const miss = document.getElementById('missableCards');
  miss.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) miss.append(cardEl(t));
  const stages = document.getElementById('stages');
  stages.replaceChildren();
  for (let s = 1; s <= 5; s++) {
    const inStage = trophies.filter((t) => t.stage === s);
    const got = inStage.filter((t) => earned.has(t.id)).length;
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = STAGE_NAMES[s];
    const c = document.createElement('span');
    c.className = 'count';
    c.textContent = `${got}/${inStage.length}`;
    h.append(c);
    const p = document.createElement('p');
    p.textContent = STAGE_BLURBS[s];
    li.append(h, p);
    stages.append(li);
  }
}

function openDetail(t) {
  document.getElementById('detailName').textContent = isHidden(t) ? 'Story trophy — hidden' : t.name;
  document.getElementById('detailMeta').textContent = `${t.grade} · ${t.kind} · stage ${t.stage}`;
  document.getElementById('detailDesc').textContent = displayDesc(t);
  document.getElementById('detailGuide').textContent = isHidden(t) ? 'Turn off “Hide story spoilers” to read the guide.' : t.guide;
  document.getElementById('detailSource').textContent = 'Source: ' + t.source + '. Trophy list: the official 55, 2026-11-18.';
  const flag = document.getElementById('detailFlag');
  if (t.missable) {
    flag.hidden = false;
    flag.textContent = 'Missable — meditate at every spot as you find it; the Chapter 1 spot may not come back.';
  } else if (t.unconfirmed) {
    flag.hidden = false;
    flag.textContent = 'Unconfirmed — the community has not pinned this one down yet.';
  } else {
    flag.hidden = true;
  }
  document.getElementById('detail').hidden = false;
}

function setView(name) {
  for (const btn of document.querySelectorAll('.tab')) {
    btn.classList.toggle('active', btn.dataset.view === name);
  }
  document.getElementById('view-checklist').hidden = name !== 'checklist';
  document.getElementById('view-roadmap').hidden = name !== 'roadmap';
  document.getElementById('view-missables').hidden = name !== 'missables';
}

async function init() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  trophies = data.trophies.slice().sort((a, b) => a.id - b.id);
  earned = loadEarned();
  document.getElementById('demoNote').hidden = !demo;
  for (const id of ['search', 'kindFilter', 'gradeFilter', 'earnedFilter']) {
    document.getElementById(id).addEventListener('input', render);
  }
  document.getElementById('spoilerToggle').addEventListener('change', render);
  for (const btn of document.querySelectorAll('.tab')) {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  }
  document.getElementById('detailClose').addEventListener('click', () => {
    document.getElementById('detail').hidden = true;
  });
  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify([...earned].sort((a, b) => a - b), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result));
        if (Array.isArray(arr)) {
          earned = new Set(arr.filter((n) => Number.isInteger(n) && trophies.some((t) => t.id === n)));
          saveEarned();
          render();
        }
      } catch { /* bad file, ignore */ }
    };
    reader.readAsText(file);
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies?')) {
      earned = new Set();
      saveEarned();
      render();
    }
  });
  setView(startView);
  render();
  if (startTrophy) {
    const t = trophies.find((x) => x.id === startTrophy);
    if (t) {
      setView('checklist');
      openDetail(t);
    }
  }
}

init();
