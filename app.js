/* ── State ─────────────────────────────────────────────────────────────────── */
let DATA   = null;
let gender = "male";   // global — drives all tabs and charts

const sortState = {
  kata:       { col: "Performances", dir: "desc" },
  karateka:   { col: "Performances", dir: "desc" },
  tournaments:{ col: "Tournament",   dir: "asc"  },
};

const charts = {};   // Chart.js instances keyed by id

/* ── Boot ──────────────────────────────────────────────────────────────────── */
fetch("data.json")
  .then(r => r.json())
  .then(d => { DATA = d; init(); })
  .catch(() => document.body.innerHTML = "<p style='padding:40px;color:#9a1c1c'>Could not load data.json. Make sure the server is running from the KataDataAnalysis folder.</p>");

function init() {
  updateHeaderSub();
  setupGlobalToggle();
  setupTabs();
  setupKataTab();
  setupKaratekaTab();
  setupTournamentsSortable();
  buildMissingTable();
  renderAll();
}

function renderAll() {
  renderKataTable();
  renderKaratekaTable();
  renderTournamentsTable();
  renderFindings();
}

/* ── Header sub ────────────────────────────────────────────────────────────── */
function updateHeaderSub() {
  const m = DATA.meta;
  const g = gender === "male";
  document.getElementById("header-sub").textContent =
    `${g ? "Male" : "Female"} Kata · 9 Tournaments · ${g ? m.male_performances : m.female_performances} Performances · ${g ? m.male_karateka : m.female_karateka} Athletes · ${g ? m.male_kata : m.female_kata} Kata`;
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
      document.getElementById("kata-search").value = "";
      document.getElementById("karateka-search").value = "";
      updateHeaderSub();
      renderAll();
    });
  });
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
      const col = th.dataset.col;
      if (!col) return;
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
const fmt2   = v => v != null ? v.toFixed(2) : "—";
const fmt3   = v => v != null ? v.toFixed(3) : "—";
const fmtPct = v => v != null ? (v * 100).toFixed(1) + "%" : "—";
const tierBadge = t => t ? `<span class="tier-badge tier-${t}">${t}</span>` : "";
const esc = s => s == null ? "" : String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

/* ════════════════════════════════════════════════════════════════ KATA TAB */
function setupKataTab() {
  setupSortableTable("kata-table", "kata", renderKataTable);
  document.getElementById("kata-search").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { clearCard("kata-card"); renderKataTable(); return; }
    const match = DATA.kata[gender].find(r => r.Kata && r.Kata.toLowerCase().includes(q));
    if (match) { showKataCard(match); highlightRow("kata-tbody", "data-kata", match.Kata); }
    else { clearCard("kata-card"); renderKataTable(); }
  });
}

function renderKataTable(highlightName) {
  const s = sortState.kata;
  const rows = sortData(DATA.kata[gender], s.col, s.dir);
  document.getElementById("kata-tbody").innerHTML = rows.map(r => `
    <tr data-kata="${esc(r.Kata)}" class="${highlightName === r.Kata ? "highlighted" : ""}">
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
      <span class="card-title">${esc(r.Kata)}</span>
      ${tierBadge(r.Kata_Tier)}
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
  document.getElementById("kata-card").classList.remove("hidden");
}

/* ══════════════════════════════════════════════════════════ KARATEKA TAB */
function setupKaratekaTab() {
  setupSortableTable("karateka-table", "karateka", renderKaratekaTable);
  document.getElementById("karateka-search").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { clearCard("karateka-card"); renderKaratekaTable(); return; }
    const match = DATA.karateka[gender].find(r => r.Karateka && r.Karateka.toLowerCase().includes(q));
    if (match) { showKaratekaCard(match); highlightRow("karateka-tbody", "data-karateka", match.Karateka); }
    else { clearCard("karateka-card"); renderKaratekaTable(); }
  });
}

function renderKaratekaTable(highlightName) {
  const s = sortState.karateka;
  const rows = sortData(DATA.karateka[gender], s.col, s.dir);
  document.getElementById("karateka-tbody").innerHTML = rows.map(r => `
    <tr data-karateka="${esc(r.Karateka)}" class="${highlightName === r.Karateka ? "highlighted" : ""}">
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
      <span class="card-subtitle">${esc(r.Country || "")}</span>
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
  document.getElementById("karateka-card").classList.remove("hidden");
}

/* ══════════════════════════════════════════════════════════ TOURNAMENTS TAB */
function setupTournamentsSortable() {
  setupSortableTable("tournaments-table", "tournaments", renderTournamentsTable);
}

function renderTournamentsTable() {
  const s = sortState.tournaments;
  const rows = sortData(
    DATA.tournaments.filter(r => r.Gender.toLowerCase() === gender),
    s.col, s.dir
  );
  document.getElementById("tournaments-tbody").innerHTML = rows.map(r => `
    <tr>
      <td class="name-cell">${esc(r.Tournament)}</td>
      <td class="num">${r.Total_Performances}</td>
      <td class="num">${r.Unique_Karateka}</td>
      <td class="num">${r.Unique_Kata}</td>
      <td class="num">${r.Avg_Score != null ? r.Avg_Score.toFixed(3) : "—"}</td>
    </tr>
  `).join("");
}

/* ══════════════════════════════════════════════════════════ FINDINGS TAB */

/* Chart.js shared defaults */
const CHART_FONT   = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const RED          = "rgba(154, 28, 28, 0.85)";
const RED_BORDER   = "rgba(154, 28, 28, 1)";
const GRID_COLOR   = "rgba(221,208,184,0.6)";

const TIER_COLORS = {
  Advanced:     { bg: "rgba(28,28,24,0.85)",  border: "rgba(28,28,24,1)"  },
  Intermediate: { bg: "rgba(120,110,90,0.75)", border: "rgba(90,80,60,1)"  },
  Beginner:     { bg: "rgba(180,165,140,0.7)", border: "rgba(150,135,110,1)" },
};

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function makeHBar(id, labels, values, xLabel, minVal) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          min: minVal,
          grid: { color: GRID_COLOR },
          ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" },
          title: { display: !!xLabel, text: xLabel, font: { family: CHART_FONT, size: 11 }, color: "#7a7060" },
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18" },
        },
      },
    },
  });
}

function renderFindings() {
  const kata  = DATA.kata[gender];
  const kdata = DATA.karateka[gender];
  const tourns = DATA.tournaments.filter(r => r.Gender.toLowerCase() === gender);
  const countries = DATA.countries[gender];

  /* 1. Kata Popularity */
  const popSorted = [...kata].sort((a,b) => b.Performances - a.Performances);
  const top1 = popSorted[0];
  document.getElementById("insight-popularity").textContent =
    `${top1.Kata} was the most performed ${gender} kata with ${top1.Performances} performances across ${top1.Unique_Karateka} athletes. ` +
    `The top 5 most performed kata accounted for ${popSorted.slice(0,5).reduce((s,r)=>s+r.Performances,0)} of ${DATA.meta[gender+"_performances"]} total performances.`;
  makeHBar("chart-popularity",
    popSorted.map(r => r.Kata),
    popSorted.map(r => r.Performances),
    "Performances", 0);

  /* 2. Kata Avg Score */
  const scoreSorted = [...kata].filter(r => r.Mean_Score != null).sort((a,b) => b.Mean_Score - a.Mean_Score);
  const top1s = scoreSorted[0], bot1s = scoreSorted[scoreSorted.length-1];
  document.getElementById("insight-avgscore").textContent =
    `${top1s.Kata} had the highest average score (${top1s.Mean_Score.toFixed(3)}) among ${gender} kata. ` +
    `${bot1s.Kata} had the lowest (${bot1s.Mean_Score.toFixed(3)}). ` +
    `The overall ${gender} average was ${(kata.reduce((s,r)=>s+(r.Mean_Score||0),0)/kata.filter(r=>r.Mean_Score).length).toFixed(3)}.`;
  makeHBar("chart-avgscore",
    scoreSorted.map(r => r.Kata),
    scoreSorted.map(r => r.Mean_Score),
    "Average Score", 7.0);

  /* 3. Kata Win Rate */
  const winSorted = [...kata].filter(r => r.Win_Rate != null && r.Performances >= 5).sort((a,b) => b.Win_Rate - a.Win_Rate);
  const topW = winSorted[0];
  document.getElementById("insight-winrate").textContent =
    `Among kata with at least 5 performances, ${topW.Kata} had the highest win rate (${(topW.Win_Rate*100).toFixed(1)}%). ` +
    `Note that win rate is influenced by opponent strength and athlete skill, not just kata choice.`;
  destroyChart("chart-winrate");
  const ctxWR = document.getElementById("chart-winrate");
  if (ctxWR) {
    charts["chart-winrate"] = new Chart(ctxWR, {
      type: "bar",
      data: {
        labels: winSorted.map(r => r.Kata),
        datasets: [{ data: winSorted.map(r => +(r.Win_Rate*100).toFixed(1)), backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw}%` } },
        },
        scales: {
          x: { min:0, max:100, grid:{color:GRID_COLOR}, ticks:{callback:v=>v+"%", font:{family:CHART_FONT,size:11}, color:"#7a7060"} },
          y: { grid:{display:false}, ticks:{font:{family:CHART_FONT,size:11},color:"#1c1c18"} },
        },
      },
    });
  }

  /* 4. Scatter: Performances vs Avg Score */
  document.getElementById("insight-scatter").textContent =
    `Each dot represents one kata. The x-axis shows how many times it was performed; the y-axis shows its average score. ` +
    `Dots are colored by tier. If rarer kata tend to score higher, you'd see a downward trend — explore the pattern below.`;
  destroyChart("chart-scatter");
  const ctxSc = document.getElementById("chart-scatter");
  if (ctxSc) {
    const tierOrder = ["Advanced", "Intermediate", "Beginner"];
    const datasets = tierOrder.map(tier => {
      const rows = kata.filter(r => r.Kata_Tier === tier && r.Mean_Score != null);
      return {
        label: tier,
        data: rows.map(r => ({ x: r.Performances, y: r.Mean_Score, kata: r.Kata })),
        backgroundColor: TIER_COLORS[tier].bg,
        borderColor: TIER_COLORS[tier].border,
        borderWidth: 1.5,
        pointRadius: 6,
        pointHoverRadius: 8,
      };
    });
    charts["chart-scatter"] = new Chart(ctxSc, {
      type: "scatter",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18", boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw.kata}: ${ctx.raw.x} perfs, avg ${ctx.raw.y.toFixed(3)}` } },
        },
        scales: {
          x: { title:{display:true,text:"Performances",font:{family:CHART_FONT,size:11},color:"#7a7060"}, grid:{color:GRID_COLOR}, ticks:{font:{family:CHART_FONT,size:11},color:"#7a7060"} },
          y: { title:{display:true,text:"Average Score",font:{family:CHART_FONT,size:11},color:"#7a7060"}, grid:{color:GRID_COLOR}, ticks:{font:{family:CHART_FONT,size:11},color:"#7a7060"} },
        },
      },
    });
  }

  /* 5. Tier breakdown */
  const tiers = ["Advanced", "Intermediate", "Beginner"];
  const tierPerfs = tiers.map(t => kata.filter(r=>r.Kata_Tier===t).reduce((s,r)=>s+r.Performances,0));
  const tierKata  = tiers.map(t => kata.filter(r=>r.Kata_Tier===t).length);
  const totalPerfs = tierPerfs.reduce((a,b)=>a+b,0);
  document.getElementById("insight-tier").textContent =
    `Advanced kata dominate ${gender} competition, accounting for ${((tierPerfs[0]/totalPerfs)*100).toFixed(1)}% of performances ` +
    `despite representing only ${tierKata[0]} of the ${kata.length} kata performed this season. ` +
    `Intermediate kata made up ${((tierPerfs[1]/totalPerfs)*100).toFixed(1)}%.`;
  const tierBgs = tiers.map(t => TIER_COLORS[t].bg);
  const tierBorders = tiers.map(t => TIER_COLORS[t].border);
  destroyChart("chart-tier-perfs");
  const ctxTP = document.getElementById("chart-tier-perfs");
  if (ctxTP) {
    charts["chart-tier-perfs"] = new Chart(ctxTP, {
      type: "doughnut",
      data: { labels: tiers, datasets: [{ data: tierPerfs, backgroundColor: tierBgs, borderColor: tierBorders, borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position:"bottom", labels:{font:{family:CHART_FONT,size:11},color:"#1c1c18",boxWidth:12} },
          title:  { display:true, text:"% of Total Performances", font:{family:CHART_FONT,size:12,weight:"600"}, color:"#1c1c18", padding:{bottom:8} },
          tooltip:{ callbacks:{ label: ctx => ` ${ctx.label}: ${ctx.raw} perfs (${((ctx.raw/totalPerfs)*100).toFixed(1)}%)`} },
        },
      },
    });
  }
  destroyChart("chart-tier-kata");
  const ctxTK = document.getElementById("chart-tier-kata");
  if (ctxTK) {
    charts["chart-tier-kata"] = new Chart(ctxTK, {
      type: "doughnut",
      data: { labels: tiers, datasets: [{ data: tierKata, backgroundColor: tierBgs, borderColor: tierBorders, borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position:"bottom", labels:{font:{family:CHART_FONT,size:11},color:"#1c1c18",boxWidth:12} },
          title:  { display:true, text:"Distinct Kata per Tier", font:{family:CHART_FONT,size:12,weight:"600"}, color:"#1c1c18", padding:{bottom:8} },
        },
      },
    });
  }

  /* 6. Avg Score by Tournament */
  const tSorted = [...tourns].sort((a,b) => a.Tournament.localeCompare(b.Tournament));
  const tLabels = tSorted.map(r => r.Tournament);
  const tScores = tSorted.map(r => r.Avg_Score);
  const tMin = tScores[0] != null ? Math.max(7.5, Math.min(...tScores.filter(Boolean)) - 0.1) : 7.5;
  const tHigh = tSorted.reduce((best, r) => (r.Avg_Score > (best?.Avg_Score||0) ? r : best), null);
  const tLow  = tSorted.filter(r=>r.Avg_Score).reduce((worst, r) => (r.Avg_Score < (worst?.Avg_Score||Infinity) ? r : worst), null);
  document.getElementById("insight-tournament").textContent =
    tHigh && tLow
      ? `${tHigh.Tournament} had the highest average score (${tHigh.Avg_Score.toFixed(3)}) and ${tLow.Tournament} had the lowest (${tLow.Avg_Score.toFixed(3)}) among ${gender} kata events.`
      : "";
  destroyChart("chart-tournament");
  const ctxT = document.getElementById("chart-tournament");
  if (ctxT) {
    charts["chart-tournament"] = new Chart(ctxT, {
      type: "bar",
      data: { labels: tLabels, datasets: [{ data: tScores, backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend:{display:false} },
        scales: {
          x: { grid:{display:false}, ticks:{font:{family:CHART_FONT,size:11},color:"#1c1c18", maxRotation:30} },
          y: { min: tMin, grid:{color:GRID_COLOR}, ticks:{font:{family:CHART_FONT,size:11},color:"#7a7060"} },
        },
      },
    });
  }

  /* 7. Top Karateka by Avg Score (min 5 perfs) */
  const kScoreSorted = [...kdata].filter(r => r.Mean_Score != null && r.Performances >= 5).sort((a,b) => b.Mean_Score - a.Mean_Score).slice(0,20);
  const topKS = kScoreSorted[0];
  document.getElementById("insight-k-avgscore").textContent =
    topKS ? `${topKS.Karateka} (${topKS.Country}) had the highest average score among ${gender} kata athletes with at least 5 performances: ${topKS.Mean_Score.toFixed(2)} over ${topKS.Performances} performances.` : "";
  makeHBar("chart-k-avgscore",
    kScoreSorted.map(r => r.Karateka),
    kScoreSorted.map(r => r.Mean_Score),
    "Average Score", 7.5);

  /* 8. Top Karateka by Win Rate (min 5 perfs) */
  const kWinSorted = [...kdata].filter(r => r.Win_Rate != null && r.Performances >= 5).sort((a,b) => b.Win_Rate - a.Win_Rate).slice(0,20);
  const topKW = kWinSorted[0];
  document.getElementById("insight-k-winrate").textContent =
    topKW ? `${topKW.Karateka} (${topKW.Country}) had the highest win rate among ${gender} kata athletes with at least 5 performances: ${(topKW.Win_Rate*100).toFixed(1)}% over ${topKW.Performances} performances.` : "";
  destroyChart("chart-k-winrate");
  const ctxKW = document.getElementById("chart-k-winrate");
  if (ctxKW) {
    charts["chart-k-winrate"] = new Chart(ctxKW, {
      type: "bar",
      data: { labels: kWinSorted.map(r=>r.Karateka), datasets:[{ data:kWinSorted.map(r=>+(r.Win_Rate*100).toFixed(1)), backgroundColor:RED, borderColor:RED_BORDER, borderWidth:1, borderRadius:3 }] },
      options: {
        indexAxis:"y", responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>` ${ctx.raw}%`}} },
        scales:{
          x:{ min:0, max:100, grid:{color:GRID_COLOR}, ticks:{callback:v=>v+"%", font:{family:CHART_FONT,size:11}, color:"#7a7060"} },
          y:{ grid:{display:false}, ticks:{font:{family:CHART_FONT,size:11},color:"#1c1c18"} },
        },
      },
    });
  }

  /* 9. Countries */
  const topCountries = countries.slice(0,15);
  const topC = topCountries[0];
  document.getElementById("insight-country").textContent =
    topC ? `${topC.Country} sent the most ${gender} kata athletes this season with ${topC.Athletes} unique competitor${topC.Athletes>1?"s":""}.` : "";
  makeHBar("chart-country",
    topCountries.map(r=>r.Country),
    topCountries.map(r=>r.Athletes),
    "Athletes", 0);
}

/* ══════════════════════════════════════════════════════════ IMPORTANT NOTES */
function buildMissingTable() {
  const md = DATA.missing_data;
  const rows = [
    ["Total Performances",                           md.total,              "100.00%"],
    ["Complete (Kata name + Score present)",          md.complete,           pct(md.complete, md.total)],
    ["Missing Kata Name Only (score present)",        md.missing_kata_only,  pct(md.missing_kata_only, md.total)],
    ["Missing Score Only (kata name present)",        md.missing_score_only, pct(md.missing_score_only, md.total)],
    ["Missing Both Kata Name and Score",              md.missing_both,       pct(md.missing_both, md.total)],
    ["Male Performances",                             md.male_total,         pct(md.male_total, md.total)],
    ["Female Performances",                           md.female_total,       pct(md.female_total, md.total)],
  ];
  document.getElementById("missing-tbody").innerHTML = rows.map(([label, count, percent]) => `
    <tr><td>${label}</td><td class="num">${count}</td><td class="num">${percent}</td></tr>
  `).join("");
}

/* ── Utilities ─────────────────────────────────────────────────────────────── */
function clearCard(id) {
  const c = document.getElementById(id);
  c.innerHTML = "";
  c.classList.add("hidden");
}
function highlightRow(tbodyId, attr, value) {
  document.querySelectorAll(`#${tbodyId} tr`).forEach(tr =>
    tr.classList.toggle("highlighted", tr.getAttribute(attr) === value)
  );
}
function pct(n, total) { return (n / total * 100).toFixed(2) + "%"; }
