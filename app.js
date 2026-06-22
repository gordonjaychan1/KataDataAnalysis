/* ── State ─────────────────────────────────────────────────────────────────── */
let DATA = null;
let state = {
  tab:              "kata",
  kata_gender:      "male",
  karateka_gender:  "male",
  tourn_gender:     "both",
  kata_sort:        { col: "Performances", dir: "desc" },
  karateka_sort:    { col: "Performances", dir: "desc" },
  tourn_sort:       { col: "Tournament",   dir: "asc"  },
};

/* ── Boot ──────────────────────────────────────────────────────────────────── */
fetch("data.json")
  .then(r => r.json())
  .then(d => { DATA = d; init(); })
  .catch(() => document.body.innerHTML = "<p style='padding:40px;color:red'>Could not load data.json</p>");

function init() {
  document.getElementById("meta-performances").textContent =
    DATA.meta.total_performances.toLocaleString();

  setupTabs();
  setupKataTab();
  setupKaratekaTab();
  setupTournamentsTab();

  renderKataTable();
  renderKaratekaTable();
  renderTournamentsTable();
}

/* ── Tabs ──────────────────────────────────────────────────────────────────── */
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(s => { s.classList.remove("active"); s.classList.add("hidden"); });
      btn.classList.add("active");
      const sec = document.getElementById("tab-" + btn.dataset.tab);
      sec.classList.remove("hidden");
      sec.classList.add("active");
      state.tab = btn.dataset.tab;
    });
  });
}

/* ── Gender toggles ────────────────────────────────────────────────────────── */
function setupGenderToggle(containerId, stateKey, onchange) {
  document.querySelectorAll(`#${containerId} .gender-btn`).forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(`#${containerId} .gender-btn`).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state[stateKey] = btn.dataset.gender;
      onchange();
    });
  });
}

/* ── Sorting helper ────────────────────────────────────────────────────────── */
function sortData(rows, col, dir) {
  return [...rows].sort((a, b) => {
    let av = a[col], bv = b[col];
    if (av == null) av = dir === "asc" ? Infinity : -Infinity;
    if (bv == null) bv = dir === "asc" ? Infinity : -Infinity;
    if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return dir === "asc" ? av - bv : bv - av;
  });
}

function setupSortableTable(tableId, stateKey, renderFn) {
  document.querySelectorAll(`#${tableId} thead th`).forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (!col) return;
      const s = state[stateKey];
      if (s.col === col) s.dir = s.dir === "asc" ? "desc" : "asc";
      else { s.col = col; s.dir = "asc"; }
      document.querySelectorAll(`#${tableId} thead th`).forEach(h => h.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(s.dir === "asc" ? "sort-asc" : "sort-desc");
      renderFn();
    });
  });
}

/* ── Formatting helpers ────────────────────────────────────────────────────── */
const fmt2  = v => v != null ? v.toFixed(2) : "—";
const fmt3  = v => v != null ? v.toFixed(3) : "—";
const fmtPct = v => v != null ? (v * 100).toFixed(1) + "%" : "—";
const tierBadge = t => `<span class="tier-badge tier-${t}">${t}</span>`;

/* ════════════════════════════════════════════════════════════════ KATA TAB */
function setupKataTab() {
  setupGenderToggle("tab-kata", "kata_gender", () => {
    clearCard("kata-card");
    document.getElementById("kata-search").value = "";
    renderKataTable();
  });
  setupSortableTable("kata-table", "kata_sort", renderKataTable);

  document.getElementById("kata-search").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { clearCard("kata-card"); renderKataTable(); return; }
    const rows = DATA.kata[state.kata_gender];
    const match = rows.find(r => r.Kata && r.Kata.toLowerCase().includes(q));
    if (match) { showKataCard(match); highlightKataRow(match.Kata); }
    else { clearCard("kata-card"); renderKataTable(); }
  });
}

function renderKataTable(highlight) {
  const s    = state.kata_sort;
  const rows = sortData(DATA.kata[state.kata_gender], s.col, s.dir);
  const tbody = document.getElementById("kata-tbody");
  tbody.innerHTML = rows.map(r => `
    <tr data-kata="${esc(r.Kata)}" class="${highlight === r.Kata ? "highlighted" : ""}">
      <td class="name-cell">${esc(r.Kata)}</td>
      <td>${tierBadge(r.Kata_Tier)}</td>
      <td class="num">${r.Performances}</td>
      <td class="num">${r.Unique_Karateka}</td>
      <td class="num">${fmt3(r.Mean_Score)}</td>
      <td class="num">${fmt2(r.Median_Score)}</td>
      <td class="num">${fmt2(r.Min_Score)}</td>
      <td class="num">${fmt2(r.Max_Score)}</td>
      <td class="num">${fmt3(r.Std_Dev)}</td>
      <td class="num">${fmtPct(r.Win_Rate)}</td>
    </tr>
  `).join("");

  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const kata = tr.dataset.kata;
      const row  = DATA.kata[state.kata_gender].find(r => r.Kata === kata);
      if (row) { showKataCard(row); highlightKataRow(kata); }
    });
  });
}

function highlightKataRow(kata) {
  document.querySelectorAll("#kata-tbody tr").forEach(tr => {
    tr.classList.toggle("highlighted", tr.dataset.kata === kata);
  });
}

function showKataCard(r) {
  const card = document.getElementById("kata-card");
  const topK = (r.Top_Karateka || []).map(k =>
    `<span class="pill">${esc(k.Karateka)}<span class="pill-count">${k.performances}x</span></span>`
  ).join("");

  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${esc(r.Kata)}</span>
      ${tierBadge(r.Kata_Tier)}
      <span class="card-subtitle">${state.kata_gender === "male" ? "Male" : "Female"}</span>
    </div>
    <div class="card-stats">
      <div class="stat-box"><div class="stat-label">Performances</div><div class="stat-value">${r.Performances}</div></div>
      <div class="stat-box"><div class="stat-label">Athletes</div><div class="stat-value">${r.Unique_Karateka}</div></div>
      <div class="stat-box"><div class="stat-label">Avg Score</div><div class="stat-value">${fmt3(r.Mean_Score)}</div></div>
      <div class="stat-box"><div class="stat-label">Median</div><div class="stat-value">${fmt2(r.Median_Score)}</div></div>
      <div class="stat-box"><div class="stat-label">Min</div><div class="stat-value">${fmt2(r.Min_Score)}</div></div>
      <div class="stat-box"><div class="stat-label">Max</div><div class="stat-value">${fmt2(r.Max_Score)}</div></div>
      <div class="stat-box"><div class="stat-label">Std Dev</div><div class="stat-value">${fmt3(r.Std_Dev)}</div></div>
      <div class="stat-box"><div class="stat-label">Win Rate</div><div class="stat-value">${fmtPct(r.Win_Rate)}</div></div>
    </div>
    ${topK ? `<div class="card-section-title">Top Athletes</div><div class="pill-list">${topK}</div>` : ""}
  `;
  card.classList.remove("hidden");
}

/* ══════════════════════════════════════════════════════════ KARATEKA TAB */
function setupKaratekaTab() {
  setupGenderToggle("tab-karateka", "karateka_gender", () => {
    clearCard("karateka-card");
    document.getElementById("karateka-search").value = "";
    renderKaratekaTable();
  });
  setupSortableTable("karateka-table", "karateka_sort", renderKaratekaTable);

  document.getElementById("karateka-search").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { clearCard("karateka-card"); renderKaratekaTable(); return; }
    const rows = DATA.karateka[state.karateka_gender];
    const match = rows.find(r => r.Karateka && r.Karateka.toLowerCase().includes(q));
    if (match) { showKaratekaCard(match); highlightKaratekaRow(match.Karateka); }
    else { clearCard("karateka-card"); renderKaratekaTable(); }
  });
}

function renderKaratekaTable(highlight) {
  const s    = state.karateka_sort;
  const rows = sortData(DATA.karateka[state.karateka_gender], s.col, s.dir);
  const tbody = document.getElementById("karateka-tbody");
  tbody.innerHTML = rows.map(r => `
    <tr data-karateka="${esc(r.Karateka)}" class="${highlight === r.Karateka ? "highlighted" : ""}">
      <td class="name-cell">${esc(r.Karateka)}</td>
      <td>${esc(r.Country || "—")}</td>
      <td class="num">${r.Performances}</td>
      <td class="num">${r.Tournaments_Attended}</td>
      <td class="num">${fmt2(r.Mean_Score)}</td>
      <td class="num">${fmt2(r.Median_Score)}</td>
      <td class="num">${fmt2(r.Min_Score)}</td>
      <td class="num">${fmt2(r.Max_Score)}</td>
      <td class="num">${fmtPct(r.Win_Rate)}</td>
    </tr>
  `).join("");

  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const name = tr.dataset.karateka;
      const row  = DATA.karateka[state.karateka_gender].find(r => r.Karateka === name);
      if (row) { showKaratekaCard(row); highlightKaratekaRow(name); }
    });
  });
}

function highlightKaratekaRow(name) {
  document.querySelectorAll("#karateka-tbody tr").forEach(tr => {
    tr.classList.toggle("highlighted", tr.dataset.karateka === name);
  });
}

function showKaratekaCard(r) {
  const card = document.getElementById("karateka-card");

  const repertoire = (r.Kata_Repertoire || []).map(k => {
    const kData = DATA.kata[state.karateka_gender]?.find(d => d.Kata === k.Kata);
    const tier   = kData ? kData.Kata_Tier : "";
    return `<span class="pill">${tierBadge(tier)} ${esc(k.Kata)}<span class="pill-count">${k.count}x</span></span>`;
  }).join("");

  const tournaments = (r.Tournament_List || []).map(t =>
    `<span class="pill">${esc(t)}</span>`
  ).join("");

  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${esc(r.Karateka)}</span>
      <span class="card-subtitle">${esc(r.Country || "")} · ${state.karateka_gender === "male" ? "Male" : "Female"}</span>
    </div>
    <div class="card-stats">
      <div class="stat-box"><div class="stat-label">Performances</div><div class="stat-value">${r.Performances}</div></div>
      <div class="stat-box"><div class="stat-label">Tournaments</div><div class="stat-value">${r.Tournaments_Attended}</div></div>
      <div class="stat-box"><div class="stat-label">Avg Score</div><div class="stat-value">${fmt2(r.Mean_Score)}</div></div>
      <div class="stat-box"><div class="stat-label">Median</div><div class="stat-value">${fmt2(r.Median_Score)}</div></div>
      <div class="stat-box"><div class="stat-label">Best Score</div><div class="stat-value">${fmt2(r.Max_Score)}</div></div>
      <div class="stat-box"><div class="stat-label">Win Rate</div><div class="stat-value">${fmtPct(r.Win_Rate)}</div></div>
    </div>
    ${repertoire ? `<div class="card-section-title">Kata Repertoire</div><div class="pill-list">${repertoire}</div>` : ""}
    ${tournaments ? `<div class="card-section-title">Tournaments Attended</div><div class="pill-list">${tournaments}</div>` : ""}
  `;
  card.classList.remove("hidden");
}

/* ══════════════════════════════════════════════════════════ TOURNAMENTS TAB */
function setupTournamentsTab() {
  setupGenderToggle("tab-tournaments", "tourn_gender", renderTournamentsTable);
  setupSortableTable("tournaments-table", "tourn_sort", renderTournamentsTable);
}

function renderTournamentsTable() {
  const s    = state.tourn_sort;
  let rows   = DATA.tournaments;
  if (state.tourn_gender !== "both")
    rows = rows.filter(r => r.Gender.toLowerCase() === state.tourn_gender);
  rows = sortData(rows, s.col, s.dir);

  document.getElementById("tournaments-tbody").innerHTML = rows.map(r => `
    <tr>
      <td class="name-cell">${esc(r.Tournament)}</td>
      <td>${esc(r.Gender)}</td>
      <td class="num">${r.Total_Performances}</td>
      <td class="num">${r.Unique_Karateka}</td>
      <td class="num">${r.Unique_Kata}</td>
      <td class="num">${r.Avg_Score != null ? r.Avg_Score.toFixed(3) : "—"}</td>
    </tr>
  `).join("");
}

/* ── Utilities ─────────────────────────────────────────────────────────────── */
function clearCard(id) {
  const c = document.getElementById(id);
  c.innerHTML = "";
  c.classList.add("hidden");
}

function esc(s) {
  if (s == null) return "";
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
