// Leonida Trophy Guide — offline tracker. No libraries, no network at run time:
// the trophy list is fetched once from data/trophies.json, progress lives in
// localStorage, and export/import move it as a plain JSON file.
const STORE_KEY = "leonida-trophy-guide-v1";
const DEMO_EARNED = [2, 3, 8, 9, 10, 11, 35, 31, 53, 51, 44, 55];

const ROADMAP = [
  {
    title: "First: the one thing that can be missed",
    text: "Before you settle into the story, do the Chapter 1 balcony meditation for Positive Mental Attitude — it is the only trophy that can be missed, and it goes away when Chapter 1 ends. Keep a manual save at the start and the end of each chapter (15 manual slots plus one autosave), and never use cheats on this run: they disable trophies and saving for the session.",
    ids: [28],
  },
  {
    title: "Play the story, Chapters 1 to 5",
    text: "Finish the story, about 60 to 80 hours. Do optional missions as they appear — you need 100 of them later, and there are 200 to 300 in the game — and scan every new vehicle with the WAiNK app and study every new animal with the binoculars as you pass them. The 12 story trophies unlock on their own, and the quest givers (Andy, Kenton, Billy, Randy, Tyrone, Bret) all stay available after the story even when they vanish for a while mid-story.",
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20, 21, 22, 23, 24, 26, 27, 29],
  },
  {
    title: "The 100% completion checklist",
    text: "After the story, the checklist appears under Progress, Stats, 100% Completion — progress made during the story already counts. It is far kinder than it sounds, closer to 60% true completion: any 70 of 80 challenges, any 100 optional missions, 200 of 277 vehicles scanned, 100 of 255 animals studied, and 300 stunts. Only robberies, underwater discoveries, shooting ranges, drone races and Bret's quests need everything. Nothing here is missable.",
    ids: [14, 15, 17, 18, 32, 33, 34, 35, 36, 40, 41, 43],
  },
  {
    title: "Cleanup, then the platinum",
    text: "Finish the stranger strands, the collectibles and the activities that are left, and the platinum pops on the last trophy you earn. The only genuinely uncertain ones are Bad Luck, I Guess (no confirmed trigger yet) and which exact animal unlocks Fair Game — check the sources again before your final cleanup, and treat anything you read about them as a rumor until a second source agrees.",
    ids: [1, 16, 19, 25, 30, 31, 37, 38, 39, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
  },
];

const params = new URLSearchParams(location.search);
const state = {
  trophies: [],
  earned: new Set(),
  kind: "all",
  query: "",
  hideSpoilers: true,
  selectedId: null,
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return new Set(JSON.parse(raw).earned || []);
  } catch (_) { /* a bad save is ignored, the list starts empty */ }
  return new Set();
}

function saveProgress() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b) }));
  } catch (_) { /* private mode or a full store: the list still works in memory */ }
}

function gradeLabel(grade) {
  return { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" }[grade] || grade;
}

function trophyById(id) {
  return state.trophies.find((t) => t.id === id);
}

function isHidden(t) {
  return state.hideSpoilers && t.kind === "story" && !state.earned.has(t.id);
}

function visibleTrophies() {
  return state.trophies.filter((t) => {
    if (state.kind !== "all" && t.kind !== state.kind) return false;
    if (state.query) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const earned = state.earned.size;
  document.getElementById("earnedCount").textContent = earned;
  document.getElementById("progressFill").style.width = (earned / 55 * 100).toFixed(1) + "%";
  const counts = { platinum: [0, 1], gold: [0, 2], silver: [0, 6], bronze: [0, 46] };
  for (const t of state.trophies) if (state.earned.has(t.id)) counts[t.grade][0]++;
  document.getElementById("progressGrades").textContent =
    "Platinum " + counts.platinum[0] + "/1 · Gold " + counts.gold[0] + "/2 · Silver " + counts.silver[0] + "/6 · Bronze " + counts.bronze[0] + "/46";
}

function renderList() {
  const list = document.getElementById("trophyList");
  const shown = visibleTrophies();
  document.getElementById("listMeta").textContent =
    "Showing " + shown.length + " of 55 trophies" +
    (state.earned.size ? " · " + state.earned.size + " earned" : "") +
    (state.hideSpoilers ? " · story spoilers hidden until earned" : "");
  list.innerHTML = "";
  for (const t of shown) {
    const li = document.createElement("li");
    li.className = "trophy-row" + (state.earned.has(t.id) ? " earned" : "") + (state.selectedId === t.id ? " selected" : "");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = state.earned.has(t.id);
    box.setAttribute("aria-label", "Mark " + t.name + " as earned");
    box.addEventListener("change", (e) => {
      e.stopPropagation();
      if (box.checked) state.earned.add(t.id); else state.earned.delete(t.id);
      saveProgress();
      renderProgress();
      renderList();
      if (state.selectedId === t.id) renderDetail();
    });
    const main = document.createElement("div");
    main.className = "trophy-main";
    const name = document.createElement("div");
    name.className = "trophy-name";
    name.textContent = isHidden(t) ? "Hidden — a story trophy (spoiler)" : t.name;
    const desc = document.createElement("div");
    desc.className = "trophy-desc";
    desc.textContent = isHidden(t) ? "Earn it to reveal its name and description." : t.description;
    const tags = document.createElement("div");
    tags.className = "trophy-tags";
    const gradeTag = document.createElement("span");
    gradeTag.className = "tag grade-" + t.grade;
    gradeTag.textContent = gradeLabel(t.grade);
    tags.appendChild(gradeTag);
    const kindTag = document.createElement("span");
    kindTag.className = "tag kind";
    kindTag.textContent = t.kind;
    tags.appendChild(kindTag);
    if (t.missable) {
      const m = document.createElement("span");
      m.className = "tag missable";
      m.textContent = "Missable";
      tags.appendChild(m);
    }
    if (t.unconfirmed) {
      const u = document.createElement("span");
      u.className = "tag unconfirmed";
      u.textContent = "Unconfirmed";
      tags.appendChild(u);
    }
    if (t.target != null) {
      const c = document.createElement("span");
      c.className = "tag";
      c.textContent = "Target: " + t.target.toLocaleString("en-US");
      tags.appendChild(c);
    }
    main.appendChild(name);
    main.appendChild(desc);
    main.appendChild(tags);
    li.appendChild(box);
    li.appendChild(main);
    li.addEventListener("click", () => {
      state.selectedId = t.id;
      renderList();
      renderDetail();
    });
    list.appendChild(li);
  }
}

function renderDetail() {
  const pane = document.getElementById("detail");
  const t = state.selectedId == null ? null : trophyById(state.selectedId);
  if (!t) {
    pane.innerHTML = '<p class="detail-empty">Pick a trophy on the left to read its guide and its sources.</p>';
    return;
  }
  pane.innerHTML = "";
  const h = document.createElement("h3");
  h.textContent = t.name;
  const grade = document.createElement("div");
  grade.className = "detail-grade";
  grade.textContent = gradeLabel(t.grade) + " · " + t.kind + (t.target != null ? " · target " + t.target.toLocaleString("en-US") : "");
  const desc = document.createElement("p");
  desc.textContent = t.description;
  const guide = document.createElement("p");
  guide.className = "guide-text";
  guide.textContent = t.guide;
  pane.appendChild(h);
  pane.appendChild(grade);
  pane.appendChild(desc);
  if (t.missable) {
    const warn = document.createElement("div");
    warn.className = "warn-box";
    warn.textContent = "Missable: do the Chapter 1 balcony meditation before Chapter 1 ends. See the Missables tab for the exact steps.";
    pane.appendChild(warn);
  }
  if (t.unconfirmed) {
    const note = document.createElement("div");
    note.className = "note-box";
    note.textContent = "Unconfirmed: part of this guide is still being checked by the community. Treat it as the best current information, not a certainty.";
    pane.appendChild(note);
  }
  pane.appendChild(guide);
  const src = document.createElement("div");
  src.className = "sources";
  src.innerHTML = "<b>Sources:</b> ";
  src.appendChild(document.createTextNode(t.source + "."));
  pane.appendChild(src);
}

function renderRoadmap() {
  const ol = document.getElementById("roadmap");
  ol.innerHTML = "";
  for (const stage of ROADMAP) {
    const li = document.createElement("li");
    const h = document.createElement("h3");
    h.textContent = stage.title;
    const p = document.createElement("p");
    p.textContent = stage.text;
    const names = document.createElement("p");
    names.className = "stage-trophies";
    names.textContent = "Trophies in this stage: " + stage.ids.map((id) => trophyById(id).name).join(" · ");
    li.appendChild(h);
    li.appendChild(p);
    li.appendChild(names);
    ol.appendChild(li);
  }
}

function renderMissables() {
  const box = document.getElementById("missableList");
  box.innerHTML = "";
  for (const t of state.trophies.filter((x) => x.missable)) {
    const card = document.createElement("div");
    card.className = "missable-card";
    const h = document.createElement("h3");
    h.textContent = t.name + " — " + gradeLabel(t.grade);
    const desc = document.createElement("p");
    desc.textContent = t.description;
    const guide = document.createElement("p");
    guide.className = "guide-text";
    guide.textContent = t.guide;
    const src = document.createElement("p");
    src.className = "sources";
    src.textContent = "Sources: " + t.source + ".";
    card.appendChild(h);
    card.appendChild(desc);
    card.appendChild(guide);
    card.appendChild(src);
    box.appendChild(card);
  }
}

function setView(view) {
  for (const btn of document.querySelectorAll("#tabs .tab")) {
    btn.classList.toggle("active", btn.dataset.view === view);
  }
  document.getElementById("view-checklist").hidden = view !== "checklist";
  document.getElementById("view-roadmap").hidden = view !== "roadmap";
  document.getElementById("view-missables").hidden = view !== "missables";
}

function wireControls() {
  for (const btn of document.querySelectorAll("#tabs .tab")) {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  }
  document.getElementById("search").addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    renderList();
  });
  for (const btn of document.querySelectorAll("#filters .filter")) {
    btn.addEventListener("click", () => {
      for (const b of document.querySelectorAll("#filters .filter")) b.classList.toggle("active", b === btn);
      state.kind = btn.dataset.kind;
      renderList();
    });
  }
  document.getElementById("spoilerToggle").addEventListener("change", (e) => {
    state.hideSpoilers = e.target.checked;
    renderList();
    if (state.selectedId != null) renderDetail();
  });
  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ game: "Grand Theft Auto VI", earned: [...state.earned].sort((a, b) => a - b) }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leonida-trophy-progress.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const ids = new Set((data.earned || []).filter((id) => Number.isInteger(id) && id >= 1 && id <= 55));
        state.earned = ids;
        saveProgress();
        renderProgress();
        renderList();
      } catch (_) {
        alert("That file is not a Leonida progress export.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Clear all earned trophies?")) {
      state.earned = new Set();
      saveProgress();
      renderProgress();
      renderList();
    }
  });
}

async function boot() {
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  state.trophies = data.trophies;
  state.earned = loadProgress();
  if (params.get("demo") === "1" && state.earned.size === 0) {
    state.earned = new Set(DEMO_EARNED);
    saveProgress();
  }
  const view = params.get("view");
  if (view === "roadmap" || view === "missables" || view === "checklist") setView(view);
  const trophyParam = Number(params.get("trophy"));
  if (Number.isInteger(trophyParam) && trophyById(trophyParam)) {
    state.selectedId = trophyParam;
    setView("checklist");
  }
  wireControls();
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

boot();
