/* ── State ─────────────────────────────────────────────────────────────────── */
let DATA   = null;
let gender = "male";

const sortState = {
  kata:        { col: "Performances", dir: "desc" },
  karateka:    { col: "Performances", dir: "desc" },
  tournaments: { col: "Tournament",   dir: "asc"  },
};

const searchQuery = { kata: "", karateka: "" };

/* ── Country → flag emoji ──────────────────────────────────────────────────── */
const ISO2 = {
  "Japan":"JP","USA":"US","Turkey":"TR","Italy":"IT","Spain":"ES","France":"FR",
  "Germany":"DE","Kuwait":"KW","England":"GB","Brazil":"BR","Venezuela":"VE",
  "Indonesia":"ID","Hong Kong":"HK","Switzerland":"CH","Algeria":"DZ",
  "Slovakia":"SK","Ukraine":"UA","Hungary":"HU","Romania":"RO","Morocco":"MA",
  "Jordan":"JO","Egypt":"EG","Sweden":"SE","Canada":"CA","Senegal":"SN",
  "Azerbaijan":"AZ","Greece":"GR","Belgium":"BE","Czech Republic":"CZ",
  "Portugal":"PT","Philippines":"PH","Australia":"AU","New Zealand":"NZ",
  "China":"CN","South Korea":"KR","Montenegro":"ME","Singapore":"SG",
  "Mexico":"MX","Colombia":"CO","Iran":"IR","Austria":"AT","Taiwan":"TW",
  "Nigeria":"NG","Argentina":"AR","Burundi":"BI","Nepal":"NP","Malaysia":"MY",
  "Dominican Republic":"DO","Burkina Faso":"BF","Slovenia":"SI",
  "Netherlands":"NL","Saudi Arabia":"SA","UAE":"AE",
};
function flagOf(country) {
  const iso = ISO2[country];
  if (!iso) return "";
  return [...iso].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
}

/* ── Tournament metadata ───────────────────────────────────────────────────── */
const TOURN_META = {
  "2024 Paris":      { city:"Paris",      country:"France",  flag:"🇫🇷", date:"Jan 11–14, 2024" },
  "2024 Antalya":    { city:"Antalya",    country:"Turkey",  flag:"🇹🇷", date:"Apr 18–21, 2024" },
  "2024 Cairo":      { city:"Cairo",      country:"Egypt",   flag:"🇪🇬", date:"Oct 17–20, 2024" },
  "2024 Casablanca": { city:"Casablanca", country:"Morocco", flag:"🇲🇦", date:"Nov  7–10, 2024" },
  "2025 Cairo":      { city:"Cairo",      country:"Egypt",   flag:"🇪🇬", date:"Jan 30–Feb 2, 2025" },
  "2025 Hangzhou":   { city:"Hangzhou",   country:"China",   flag:"🇨🇳", date:"Mar 2025"          },
  "2025 Paris":      { city:"Paris",      country:"France",  flag:"🇫🇷", date:"May 2025"          },
  "2025 Rabat":      { city:"Rabat",      country:"Morocco", flag:"🇲🇦", date:"Jun 2025"          },
  "2025 Worlds":     { city:"Abu Dhabi",  country:"UAE",     flag:"🇦🇪", date:"Oct 2025"          },
};

const charts = {};

/* ── Boot ──────────────────────────────────────────────────────────────────── */
fetch("data.json")
  .then(r => r.json())
  .then(d => { DATA = d; init(); })
  .catch(() => {
    document.body.innerHTML = "<p style='padding:40px;color:#9a1c1c'>Could not load data.json.</p>";
  });

function init() {
  setupGlobalToggle();
  setupTabs();
  setupKataTab();
  setupKaratekaTab();
  setupSortableTable("tournaments-table", "tournaments", renderTournamentsTable);
  buildMissingTables();
  renderAll();
}

function renderAll() {
  updateHeaderSub();
  renderWelcomeStats();
  renderKataTable();
  renderKaratekaTable();
  renderTournamentsTable();
  renderKataFindings();
  renderKaratekaFindings();
}

/* ── Header ────────────────────────────────────────────────────────────────── */
function updateHeaderSub() {
  const m = DATA.meta;
  const g = gender === "male";
  document.getElementById("header-sub").textContent =
    `${g ? "Male" : "Female"} Kata · 9 Tournaments · ` +
    `${g ? m.male_performances : m.female_performances} Performances · ` +
    `${g ? m.male_karateka : m.female_karateka} Athletes · ` +
    `${g ? m.male_kata : m.female_kata} Kata`;
}

/* ── Welcome stats ─────────────────────────────────────────────────────────── */
function renderWelcomeStats() {
  const m = DATA.meta;
  const g = gender === "male";
  document.getElementById("welcome-stats").innerHTML = [
    [g ? m.male_performances : m.female_performances, "Performances"],
    [9,                                                "Tournaments"],
    [g ? m.male_karateka : m.female_karateka,          "Athletes"],
    [g ? m.male_kata : m.female_kata,                  "Unique Kata"],
  ].map(([n, label]) => `
    <div class="welcome-stat-card">
      <div class="stat-num">${n.toLocaleString()}</div>
      <div class="stat-label">${label}</div>
    </div>
  `).join("");
}

/* ── Global gender toggle ──────────────────────────────────────────────────── */
function setupGlobalToggle() {
  document.querySelectorAll("#global-gender .gender-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#global-gender .gender-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gender = btn.dataset.gender;
      clearCard("kata-card");
      clearCard("karateka-card");
      searchQuery.kata = "";
      searchQuery.karateka = "";
      document.getElementById("kata-search").value = "";
      document.getElementById("karateka-search").value = "";
      renderAll();
    });
  });
}

/* ── Tabs ──────────────────────────────────────────────────────────────────── */
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(s => {
        s.classList.remove("active"); s.classList.add("hidden");
      });
      btn.classList.add("active");
      const sec = document.getElementById("tab-" + btn.dataset.tab);
      sec.classList.remove("hidden");
      sec.classList.add("active");
    });
  });
}

/* ── Sorting ───────────────────────────────────────────────────────────────── */
function sortData(rows, col, dir) {
  return [...rows].sort((a, b) => {
    let av = a[col], bv = b[col];
    if (av == null) av = dir === "asc" ? Infinity  : -Infinity;
    if (bv == null) bv = dir === "asc" ? Infinity  : -Infinity;
    if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return dir === "asc" ? av - bv : bv - av;
  });
}

function setupSortableTable(tableId, stateKey, renderFn) {
  document.querySelectorAll(`#${tableId} thead th`).forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.col; if (!col) return;
      const s = sortState[stateKey];
      s.dir = s.col === col ? (s.dir === "asc" ? "desc" : "asc") : "asc";
      s.col = col;
      document.querySelectorAll(`#${tableId} thead th`).forEach(h => h.classList.remove("sort-asc","sort-desc"));
      th.classList.add(s.dir === "asc" ? "sort-asc" : "sort-desc");
      renderFn();
    });
  });
}

/* ── Formatting ────────────────────────────────────────────────────────────── */
const fmt2    = v => v != null ? v.toFixed(2) : "—";
const fmt3    = v => v != null ? v.toFixed(3) : "—";
const fmtPct  = v => v != null ? (v * 100).toFixed(1) + "%" : "—";
const esc     = s => s == null ? "" : String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const tierBadge = t => t ? `<span class="tier-badge tier-${t}">${t}</span>` : "";

/* ════════════════════════════════════════════════════════════════ KATA TAB */
function setupKataTab() {
  setupSortableTable("kata-table", "kata", renderKataTable);
  document.getElementById("kata-search").addEventListener("input", e => {
    searchQuery.kata = e.target.value.trim().toLowerCase();
    if (!searchQuery.kata) clearCard("kata-card");
    renderKataTable();
  });
}

function renderKataTable() {
  const s = sortState.kata;
  const q = searchQuery.kata;
  let rows = sortData(DATA.kata[gender], s.col, s.dir);
  if (q) rows = rows.filter(r => r.Kata && r.Kata.toLowerCase().includes(q));
  document.getElementById("kata-tbody").innerHTML = rows.map(r => `
    <tr data-kata="${esc(r.Kata)}">
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
    </tr>`).join("");
  document.querySelectorAll("#kata-tbody tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const row = DATA.kata[gender].find(r => r.Kata === tr.dataset.kata);
      if (row) { showKataCard(row); highlightRow("kata-tbody", "data-kata", row.Kata); }
    });
  });
}

function showKataCard(r) {
  const topK = (r.Top_Karateka || []).map(k =>
    `<span class="pill">${esc(k.Karateka)}<span class="pill-count">${k.performances}x</span></span>`
  ).join("");
  document.getElementById("kata-card").innerHTML = `
    <div class="card-header">
      <span class="card-title">${esc(r.Kata)}</span>${tierBadge(r.Kata_Tier)}
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
    ${topK ? `<div class="card-section-title">Top Athletes</div><div class="pill-list">${topK}</div>` : ""}`;
  document.getElementById("kata-card").classList.remove("hidden");
}

/* ════════════════════════════════════════════════════════════════ KARATEKA TAB */
function setupKaratekaTab() {
  setupSortableTable("karateka-table", "karateka", renderKaratekaTable);
  document.getElementById("karateka-search").addEventListener("input", e => {
    searchQuery.karateka = e.target.value.trim().toLowerCase();
    if (!searchQuery.karateka) clearCard("karateka-card");
    renderKaratekaTable();
  });
}

function renderKaratekaTable() {
  const s = sortState.karateka;
  const q = searchQuery.karateka;
  let rows = sortData(DATA.karateka[gender], s.col, s.dir);
  if (q) rows = rows.filter(r => r.Karateka && r.Karateka.toLowerCase().includes(q));
  document.getElementById("karateka-tbody").innerHTML = rows.map(r => `
    <tr data-karateka="${esc(r.Karateka)}">
      <td class="name-cell">${esc(r.Karateka)}</td>
      <td>${flagOf(r.Country)} ${esc(r.Country || "—")}</td>
      <td class="num">${r.Performances}</td>
      <td class="num">${r.Tournaments_Attended}</td>
      <td class="num">${fmt2(r.Mean_Score)}</td>
      <td class="num">${fmt2(r.Median_Score)}</td>
      <td class="num">${fmt2(r.Min_Score)}</td>
      <td class="num">${fmt2(r.Max_Score)}</td>
      <td class="num">${fmtPct(r.Win_Rate)}</td>
    </tr>`).join("");
  document.querySelectorAll("#karateka-tbody tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const row = DATA.karateka[gender].find(r => r.Karateka === tr.dataset.karateka);
      if (row) { showKaratekaCard(row); highlightRow("karateka-tbody", "data-karateka", row.Karateka); }
    });
  });
}

function showKaratekaCard(r) {
  const repertoire = (r.Kata_Repertoire || []).map(k => {
    const kData = DATA.kata[gender]?.find(d => d.Kata === k.Kata);
    return `<span class="pill">${kData ? tierBadge(kData.Kata_Tier) : ""} ${esc(k.Kata)}<span class="pill-count">${k.count}x</span></span>`;
  }).join("");
  const tournaments = (r.Tournament_List || []).map(t => `<span class="pill">${esc(t)}</span>`).join("");
  document.getElementById("karateka-card").innerHTML = `
    <div class="card-header">
      <span class="card-title">${esc(r.Karateka)}</span>
      <span class="card-subtitle">${flagOf(r.Country)} ${esc(r.Country || "")}</span>
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
    ${tournaments ? `<div class="card-section-title">Tournaments Attended</div><div class="pill-list">${tournaments}</div>` : ""}`;
  document.getElementById("karateka-card").classList.remove("hidden");
}

/* ════════════════════════════════════════════════════════════════ TOURNAMENTS TAB */
function renderTournamentsTable() {
  const s = sortState.tournaments;
  const rows = sortData(DATA.tournaments.filter(r => r.Gender.toLowerCase() === gender), s.col, s.dir);
  document.getElementById("tournaments-tbody").innerHTML = rows.map(r => `
    <tr data-tourn="${esc(r.Tournament)}" style="cursor:pointer">
      <td class="name-cell">${esc(r.Tournament)}</td>
      <td class="num">${r.Total_Performances}</td>
      <td class="num">${r.Unique_Karateka}</td>
      <td class="num">${r.Unique_Kata}</td>
      <td class="num">${r.Avg_Score != null ? r.Avg_Score.toFixed(3) : "—"}</td>
    </tr>`).join("");
  document.querySelectorAll("#tournaments-tbody tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const row = DATA.tournaments.find(r => r.Tournament === tr.dataset.tourn && r.Gender.toLowerCase() === gender);
      if (row) showTournamentCard(row);
    });
  });
}

function showTournamentCard(r) {
  const meta = TOURN_META[r.Tournament] || {};
  const missingTotal = (r.Missing_Kata || 0) + (r.Missing_Score || 0) + (r.Missing_Both || 0);
  let missingHtml = "";
  if (missingTotal === 0) {
    missingHtml = `<p style="font-size:13px;color:var(--text-muted);margin-top:14px">No missing data for this tournament.</p>`;
  } else {
    const lines = [];
    if (r.Missing_Kata)  lines.push(`${r.Missing_Kata} row${r.Missing_Kata>1?"s":""} missing kata name (score present)`);
    if (r.Missing_Score) lines.push(`${r.Missing_Score} row${r.Missing_Score>1?"s":""} missing score (kata name present)`);
    if (r.Missing_Both)  lines.push(`${r.Missing_Both} row${r.Missing_Both>1?"s":""} missing both kata name and score`);
    missingHtml = `<div class="card-section-title" style="margin-top:14px">Missing Data</div>
      <ul style="font-size:13px;color:var(--text-muted);padding-left:18px;line-height:1.8">${lines.map(l=>`<li>${l}</li>`).join("")}</ul>`;
  }
  document.getElementById("tournaments-card").innerHTML = `
    <div class="card-header">
      <span class="card-title">${esc(r.Tournament)}</span>
      ${meta.date ? `<span class="card-subtitle">${esc(meta.date)}</span>` : ""}
    </div>
    ${meta.city ? `<p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">${meta.flag || ""} ${esc(meta.city)}, ${esc(meta.country)}</p>` : ""}
    <div class="card-stats">
      <div class="stat-box"><div class="stat-label">Performances</div><div class="stat-value">${r.Total_Performances}</div></div>
      <div class="stat-box"><div class="stat-label">Athletes</div><div class="stat-value">${r.Unique_Karateka}</div></div>
      <div class="stat-box"><div class="stat-label">Unique Kata</div><div class="stat-value">${r.Unique_Kata}</div></div>
      <div class="stat-box"><div class="stat-label">Avg Score</div><div class="stat-value">${r.Avg_Score != null ? r.Avg_Score.toFixed(3) : "—"}</div></div>
    </div>
    ${missingHtml}`;
  document.getElementById("tournaments-card").classList.remove("hidden");
}

/* ════════════════════════════════════════════════════════════════ CHART HELPERS */
const CHART_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const RED        = "rgba(154,28,28,0.85)";
const RED_BORDER = "rgba(154,28,28,1)";
const GRID       = "rgba(221,208,184,0.55)";

// Advanced = black, Intermediate = warm brown
const TIER_COLORS = {
  Advanced:     { bg: "rgba(0,0,0,0.82)",        border: "rgba(0,0,0,1)"          },
  Intermediate: { bg: "rgba(130,75,25,0.82)",    border: "rgba(110,60,15,1)"      },
};

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function makeHBar(id, labels, values, xLabel, minVal) {
  destroyChart(id);
  const ctx = document.getElementById(id); if (!ctx) return;
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { min: minVal, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, title: { display: !!xLabel, text: xLabel, font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        y: { grid: { display: false }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18" } },
      },
    },
  });
}

function makeWinRateHBar(id, labels, values) {
  destroyChart(id);
  const ctx = document.getElementById(id); if (!ctx) return;
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw}%` } } },
      scales: {
        x: { min: 0, max: 100, grid: { color: GRID }, ticks: { callback: v => v + "%", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        y: { grid: { display: false }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18" } },
      },
    },
  });
}

/* ════════════════════════════════════════════════════════════════ KATA FINDINGS */
function renderKataFindings() {
  const kata   = DATA.kata[gender];
  const tourns = DATA.tournaments.filter(r => r.Gender.toLowerCase() === gender);

  /* 1. Popularity */
  const popSorted = [...kata].sort((a, b) => b.Performances - a.Performances);
  const top1 = popSorted[0];
  document.getElementById("insight-popularity").textContent =
    `${top1.Kata} was the most performed ${gender} kata with ${top1.Performances} performances across ${top1.Unique_Karateka} athletes. ` +
    `The top 5 accounted for ${popSorted.slice(0,5).reduce((s,r) => s + r.Performances, 0)} of ${DATA.meta[gender+"_performances"]} total performances.`;
  makeHBar("chart-popularity", popSorted.map(r => r.Kata), popSorted.map(r => r.Performances), "Performances", 0);

  /* 2. Avg Score */
  const scoreSorted = [...kata].filter(r => r.Mean_Score != null).sort((a, b) => b.Mean_Score - a.Mean_Score);
  const top1s = scoreSorted[0], bot1s = scoreSorted[scoreSorted.length - 1];
  const overallAvg = kata.filter(r => r.Mean_Score).reduce((s,r) => s + r.Mean_Score, 0) / kata.filter(r => r.Mean_Score).length;
  document.getElementById("insight-avgscore").textContent =
    `${top1s.Kata} had the highest average score (${top1s.Mean_Score.toFixed(3)}); ` +
    `${bot1s.Kata} had the lowest (${bot1s.Mean_Score.toFixed(3)}). ` +
    `The overall ${gender} average across all performances was ${overallAvg.toFixed(3)}.`;
  makeHBar("chart-avgscore", scoreSorted.map(r => r.Kata), scoreSorted.map(r => r.Mean_Score), "Average Score", 7.0);

  /* 3. Win Rate */
  const winSorted = [...kata].filter(r => r.Win_Rate != null && r.Performances >= 5).sort((a, b) => b.Win_Rate - a.Win_Rate);
  document.getElementById("insight-winrate").textContent =
    `Among kata with at least 5 performances, ${winSorted[0].Kata} had the highest win rate ` +
    `(${(winSorted[0].Win_Rate*100).toFixed(1)}%) and ${winSorted[winSorted.length-1].Kata} had the lowest ` +
    `(${(winSorted[winSorted.length-1].Win_Rate*100).toFixed(1)}%). Win rate is influenced by opponent strength and athlete skill, not kata choice alone.`;
  makeWinRateHBar("chart-winrate", winSorted.map(r => r.Kata), winSorted.map(r => +(r.Win_Rate*100).toFixed(1)));

  /* 4. Scatter: Performances vs Avg Score — Advanced & Intermediate only */
  document.getElementById("insight-scatter").textContent =
    `Each dot is one kata. If rarer kata tend to score higher, you'd see a downward-sloping pattern. ` +
    `Dots are colored by tier: black = Advanced, brown = Intermediate.`;
  destroyChart("chart-scatter");
  const ctxSc = document.getElementById("chart-scatter"); if (ctxSc) {
    const datasets = ["Advanced", "Intermediate"].map(tier => {
      const rows = kata.filter(r => r.Kata_Tier === tier && r.Mean_Score != null);
      if (!rows.length) return null;
      return {
        label: tier,
        data: rows.map(r => ({ x: r.Performances, y: r.Mean_Score, kata: r.Kata })),
        backgroundColor: TIER_COLORS[tier].bg,
        borderColor: TIER_COLORS[tier].border,
        borderWidth: 1.5, pointRadius: 6, pointHoverRadius: 8,
      };
    }).filter(Boolean);
    charts["chart-scatter"] = new Chart(ctxSc, {
      type: "scatter", data: { datasets },
      options: {
        responsive: true, maintainAspectRatio: true, aspectRatio: 5 / 3,
        plugins: {
          legend: { position: "bottom", labels: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18", boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw.kata}: ${ctx.raw.x} perfs, avg ${ctx.raw.y.toFixed(3)}` } },
        },
        scales: {
          x: { title: { display: true, text: "Performances", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
          y: { title: { display: true, text: "Average Score", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        },
      },
    });
  }

  /* 5. Tier breakdown */
  const tiers = ["Advanced", "Intermediate"];
  const tierPerfs = tiers.map(t => kata.filter(r => r.Kata_Tier === t).reduce((s,r) => s + r.Performances, 0));
  const tierKata  = tiers.map(t => kata.filter(r => r.Kata_Tier === t).length);
  const totalPerfs = tierPerfs.reduce((a,b) => a+b, 0);
  const tierBgs = ["rgba(0,0,0,0.82)", "rgba(130,75,25,0.82)"];
  const tierBorders = ["rgba(0,0,0,1)", "rgba(110,60,15,1)"];
  document.getElementById("insight-tier").textContent =
    `Advanced kata account for ${((tierPerfs[0]/totalPerfs)*100).toFixed(1)}% of ${gender} performances ` +
    `despite being just ${tierKata[0]} of the ${kata.length} kata performed. ` +
    `Intermediate kata make up ${((tierPerfs[1]/totalPerfs)*100).toFixed(1)}%.`;

  destroyChart("chart-tier-perfs");
  const ctxTP = document.getElementById("chart-tier-perfs"); if (ctxTP) {
    charts["chart-tier-perfs"] = new Chart(ctxTP, {
      type: "doughnut",
      data: { labels: tiers, datasets: [{ data: tierPerfs, backgroundColor: tierBgs, borderColor: tierBorders, borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18", boxWidth: 12 } },
          title:  { display: true, text: "% of Performances by Tier", font: { family: CHART_FONT, size: 12, weight: "600" }, color: "#1c1c18", padding: { bottom: 8 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} (${((ctx.raw/totalPerfs)*100).toFixed(1)}%)` } },
        },
      },
    });
  }
  destroyChart("chart-tier-kata");
  const ctxTK = document.getElementById("chart-tier-kata"); if (ctxTK) {
    charts["chart-tier-kata"] = new Chart(ctxTK, {
      type: "doughnut",
      data: { labels: tiers, datasets: [{ data: tierKata, backgroundColor: tierBgs, borderColor: tierBorders, borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18", boxWidth: 12 } },
          title:  { display: true, text: "Distinct Kata Count by Tier", font: { family: CHART_FONT, size: 12, weight: "600" }, color: "#1c1c18", padding: { bottom: 8 } },
        },
      },
    });
  }

  /* 7–10. New tables (rendered after charts) */
  renderTierCountsTable();
  renderPerformedKata();
  renderKataVsKaratekaAvg();
  renderKataStdDev();

  /* 6. Tournament avg score */
  const tSorted = [...tourns].sort((a,b) => a.Tournament.localeCompare(b.Tournament));
  const tHigh = tSorted.reduce((best,r) => (r.Avg_Score > (best?.Avg_Score||0) ? r : best), null);
  const tLow  = tSorted.filter(r=>r.Avg_Score).reduce((worst,r) => (r.Avg_Score < (worst?.Avg_Score||Infinity) ? r : worst), null);
  document.getElementById("insight-tournament").textContent =
    tHigh && tLow
      ? `${tHigh.Tournament} had the highest average score (${tHigh.Avg_Score.toFixed(3)}) and ${tLow.Tournament} the lowest (${tLow.Avg_Score.toFixed(3)}).`
      : "";
  const tMin = Math.max(7.5, Math.min(...tSorted.map(r=>r.Avg_Score).filter(Boolean)) - 0.05);
  destroyChart("chart-tournament");
  const ctxT = document.getElementById("chart-tournament"); if (ctxT) {
    charts["chart-tournament"] = new Chart(ctxT, {
      type: "bar",
      data: { labels: tSorted.map(r=>r.Tournament), datasets: [{ data: tSorted.map(r=>r.Avg_Score), backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18", maxRotation: 30 } },
          y: { min: tMin, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        },
      },
    });
  }
}

/* ════════════════════════════════════════════════════════════════ NEW KATA TABLES */
function renderTierCountsTable() {
  const ts = DATA.tier_summary[gender];
  document.getElementById("insight-tier-counts").textContent =
    `Of the ${ts.adv_kata_count} Advanced kata in the WKF list, ${ts.adv_performed.length} were performed ` +
    `(${ts.adv_unperformed.length} were not). Of the ${ts.interm_kata_count} Intermediate kata, ` +
    `${ts.interm_performed.length} were performed (${ts.interm_unperformed.length} were not).`;
  document.getElementById("tier-counts-tbody").innerHTML = [
    ["Advanced",     ts.adv_kata_count,   ts.adv_performed.length,   ts.adv_unperformed.length,   ts.adv_performances],
    ["Intermediate", ts.interm_kata_count, ts.interm_performed.length, ts.interm_unperformed.length, ts.interm_performances],
  ].map(([tier, total, perf, unperf, perfs]) => `
    <tr>
      <td>${tierBadge(tier)}</td>
      <td class="num">${total}</td>
      <td class="num">${perf}</td>
      <td class="num">${unperf}</td>
      <td class="num">${perfs}</td>
    </tr>`).join("");
}

function renderPerformedKata() {
  const ts = DATA.tier_summary[gender];
  document.getElementById("insight-performed").textContent =
    `Lists which Advanced and Intermediate kata were and were not performed during the ${gender} ${gender === "male" ? "Male" : "Female"} competition this season.`;
  const makePills = arr => arr.length
    ? arr.map(k => `<span class="pill">${esc(k)}</span>`).join("")
    : `<span style="color:var(--text-muted);font-size:12px">None</span>`;
  document.getElementById("performed-kata-grid").innerHTML = `
    <div class="performed-kata-section">
      <h4>Advanced — Performed (${ts.adv_performed.length})</h4>
      <div class="pill-list">${makePills(ts.adv_performed)}</div>
    </div>
    <div class="performed-kata-section">
      <h4>Advanced — Not Performed (${ts.adv_unperformed.length})</h4>
      <div class="pill-list">${makePills(ts.adv_unperformed)}</div>
    </div>
    <div class="performed-kata-section">
      <h4>Intermediate — Performed (${ts.interm_performed.length})</h4>
      <div class="pill-list">${makePills(ts.interm_performed)}</div>
    </div>
    <div class="performed-kata-section">
      <h4>Intermediate — Not Performed (${ts.interm_unperformed.length})</h4>
      <div class="pill-list">${makePills(ts.interm_unperformed)}</div>
    </div>`;
}

function renderKataVsKaratekaAvg() {
  const rows = DATA.kata_vs_karateka_avg[gender];
  const top = rows[0], bot = rows[rows.length - 1];
  if (top && bot) {
    document.getElementById("insight-kk-avg").textContent =
      `${top.Kata} is performed most above athletes' own averages (+${top.Diff.toFixed(3)}); ` +
      `${bot.Kata} is performed most below (${bot.Diff.toFixed(3)}). ` +
      `Kata with very few performances may have skewed results.`;
  }
  const sign = v => v > 0 ? `+${v.toFixed(3)}` : v.toFixed(3);
  const color = v => v > 0 ? "color:#3a6e3a" : v < 0 ? "color:var(--red)" : "";
  document.getElementById("kata-kk-avg-tbody").innerHTML = rows.map(r => `
    <tr>
      <td class="name-cell">${esc(r.Kata)}</td>
      <td class="num" style="${color(r.Diff)}">${sign(r.Diff)}</td>
      <td class="num">${r.Performances}</td>
    </tr>`).join("");

  /* diverging horizontal bar chart — highest diff at top */
  destroyChart("chart-kk-avg");
  const ctx = document.getElementById("chart-kk-avg"); if (!ctx) return;
  // Chart.js horizontal bar: labels[0] = top row. Sort desc so highest diff is first = top.
  const sorted = [...rows].sort((a, b) => b.Diff - a.Diff);
  const bgColors = sorted.map(r => r.Diff >= 0 ? "rgba(58,110,58,0.8)" : RED);
  const bdColors = sorted.map(r => r.Diff >= 0 ? "rgba(40,85,40,1)" : RED_BORDER);
  charts["chart-kk-avg"] = new Chart(ctx, {
    type: "bar",
    data: { labels: sorted.map(r => r.Kata), datasets: [{ data: sorted.map(r => r.Diff), backgroundColor: bgColors, borderColor: bdColors, borderWidth: 1, borderRadius: 3 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw >= 0 ? "+" : ""}${ctx.raw.toFixed(3)}` } },
      },
      scales: {
        x: { grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, title: { display: true, text: "Score Diff vs Athlete Avg", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        y: { grid: { display: false }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18" } },
      },
    },
  });
}

function renderKataStdDev() {
  const rows = DATA.kata_std_dev[gender];
  document.getElementById("insight-stddev").textContent =
    `Kata performed by more athletes tend to show higher score variance, since a wider ability range is represented. ` +
    `Kata with only 1–2 performers have no meaningful standard deviation.`;
  document.getElementById("kata-stddev-tbody").innerHTML = rows.map(r => `
    <tr>
      <td class="name-cell">${esc(r.Kata)}</td>
      <td class="num">${r.Unique_Karateka}</td>
      <td class="num">${r.Std_Dev != null ? r.Std_Dev.toFixed(3) : "—"}</td>
    </tr>`).join("");

  /* scatter: x = unique performers, y = std dev — colored by tier */
  destroyChart("chart-stddev");
  const ctx = document.getElementById("chart-stddev"); if (!ctx) return;
  const kataLookup = Object.fromEntries((DATA.kata[gender] || []).map(k => [k.Kata, k.Kata_Tier]));
  const validRows = rows.filter(r => r.Std_Dev != null);
  const tierDatasets = ["Advanced", "Intermediate"].map(tier => {
    const subset = validRows.filter(r => kataLookup[r.Kata] === tier);
    if (!subset.length) return null;
    return {
      label: tier,
      data: subset.map(r => ({ x: r.Unique_Karateka, y: r.Std_Dev, kata: r.Kata })),
      backgroundColor: TIER_COLORS[tier].bg,
      borderColor: TIER_COLORS[tier].border,
      borderWidth: 1.5, pointRadius: 6, pointHoverRadius: 8,
    };
  }).filter(Boolean);
  charts["chart-stddev"] = new Chart(ctx, {
    type: "scatter",
    data: { datasets: tierDatasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18", boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw.kata}: ${ctx.raw.x} performers, σ = ${ctx.raw.y.toFixed(3)}` } },
      },
      scales: {
        x: { title: { display: true, text: "Unique Performers", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        y: { title: { display: true, text: "Score Std Dev (σ)", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
      },
    },
  });
}

/* ════════════════════════════════════════════════════════════════ KARATEKA FINDINGS */
function renderKaratekaFindings() {
  const kdata     = DATA.karateka[gender];
  const countries = DATA.countries[gender];

  /* 7. Top 20 by avg score (min 5 perfs) */
  const kScoreSorted = [...kdata].filter(r => r.Mean_Score != null && r.Performances >= 5).sort((a,b) => b.Mean_Score - a.Mean_Score).slice(0, 20);
  document.getElementById("insight-k-avgscore").textContent =
    kScoreSorted[0]
      ? `${kScoreSorted[0].Karateka} (${kScoreSorted[0].Country}) led ${gender} kata athletes with at least 5 performances in average score: ${kScoreSorted[0].Mean_Score.toFixed(2)} over ${kScoreSorted[0].Performances} performances.`
      : "";
  makeHBar("chart-k-avgscore", kScoreSorted.map(r => r.Karateka), kScoreSorted.map(r => r.Mean_Score), "Average Score", 7.5);

  /* 8. Top 20 by win rate (min 5 perfs) */
  const kWinSorted = [...kdata].filter(r => r.Win_Rate != null && r.Performances >= 5).sort((a,b) => b.Win_Rate - a.Win_Rate).slice(0, 20);
  document.getElementById("insight-k-winrate").textContent =
    kWinSorted[0]
      ? `${kWinSorted[0].Karateka} (${kWinSorted[0].Country}) had the highest win rate among ${gender} athletes with at least 5 performances: ${(kWinSorted[0].Win_Rate*100).toFixed(1)}% over ${kWinSorted[0].Performances} performances.`
      : "";
  makeWinRateHBar("chart-k-winrate", kWinSorted.map(r => r.Karateka), kWinSorted.map(r => +(r.Win_Rate*100).toFixed(1)));

  /* 9. Countries */
  const topCountries = countries.slice(0, 15);
  document.getElementById("insight-country").textContent =
    topCountries[0]
      ? `${topCountries[0].Country} sent the most ${gender} kata athletes with ${topCountries[0].Athletes} competitor${topCountries[0].Athletes > 1 ? "s" : ""} this season.`
      : "";
  makeHBar("chart-country", topCountries.map(r => r.Country), topCountries.map(r => r.Athletes), "Athletes", 0);
}

/* ════════════════════════════════════════════════════════════════ NOTES */
function buildMissingTables() {
  const md = DATA.missing_data;
  ["male", "female"].forEach(g => {
    const gd = md[g];
    const rows = [
      ["Total Performances",                    gd.total,              "100.00%"],
      ["Complete (Kata + Score present)",        gd.complete,           pct(gd.complete, gd.total)],
      ["Missing Kata Name (score present)",      gd.missing_kata_only,  pct(gd.missing_kata_only, gd.total)],
      ["Missing Score (kata name present)",      gd.missing_score_only, pct(gd.missing_score_only, gd.total)],
      ["Missing Both",                           gd.missing_both,       pct(gd.missing_both, gd.total)],
    ];
    document.getElementById(`missing-tbody-${g}`).innerHTML = rows.map(([label, count, percent]) =>
      `<tr><td>${label}</td><td class="num">${count}</td><td class="num">${percent}</td></tr>`
    ).join("");
  });
}

/* ── Utilities ─────────────────────────────────────────────────────────────── */
function clearCard(id) {
  const c = document.getElementById(id); c.innerHTML = ""; c.classList.add("hidden");
}
function highlightRow(tbodyId, attr, value) {
  document.querySelectorAll(`#${tbodyId} tr`).forEach(tr =>
    tr.classList.toggle("highlighted", tr.getAttribute(attr) === value)
  );
}
function pct(n, total) { return (n / total * 100).toFixed(2) + "%"; }
