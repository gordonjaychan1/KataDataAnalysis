/* ── State ─────────────────────────────────────────────────────────────────── */
let DATA   = null;
let gender = "male";

const sortState = {
  kata:        { col: "Performances", dir: "desc" },
  karateka:    { col: "Performances", dir: "desc" },
  tournaments: { col: "Tournament",   dir: "asc"  },
  countries:   { col: "Athletes",     dir: "desc" },
};

const searchQuery = { kata: "", karateka: "", countries: "" };
let compareShared   = [];   // cached for re-sort
let compareSortCol  = "Diff";
let compareSortDir  = "desc";
let lastTournCard = "";

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
function medalEmoji(medals) {
  if (!medals || !medals.length) return "";
  return medals.map(m => m.Place === 1 ? "🥇" : m.Place === 2 ? "🥈" : "🥉").join("");
}

function flagOf(country) {
  const iso = ISO2[country];
  if (!iso) return "";
  return `<img src="https://flagcdn.com/16x12/${iso.toLowerCase()}.png" width="16" height="12" alt="${iso}" style="vertical-align:middle;margin-right:4px;border-radius:1px">`;
}
function flagEmoji(country) {
  const iso = ISO2[country];
  if (!iso) return "";
  return [...iso.toUpperCase()].map(c => String.fromCodePoint(c.codePointAt(0) + 127397)).join("");
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
  "2025 Worlds":     { city:"Cairo",      country:"Egypt",   flag:"🇪🇬", date:"Oct 2025"          },
};

const charts = {};

/* ── Boot ──────────────────────────────────────────────────────────────────── */
fetch("other/data.json")
  .then(r => r.json())
  .then(d => { DATA = d; init(); })
  .catch(() => {
    document.body.innerHTML = "<p style='padding:40px;color:#9a1c1c'>Could not load data.json.</p>";
  });

function addKataDiffs() {
  for (const g of ["male", "female"]) {
    const diffMap = Object.fromEntries((DATA.kata_vs_karateka_avg[g] || []).map(d => [d.Kata, d.Diff]));
    (DATA.kata[g] || []).forEach(k => { k.Diff = diffMap[k.Kata] ?? null; });
  }
}

function init() {
  setupGlobalToggle();
  setupTabs();
  setupKataTab();
  setupKaratekaTab();
  setupSortableTable("tournaments-table", "tournaments", renderTournamentsTable);
  setupSortableTable("countries-table",   "countries",   renderCountriesTable);
  document.getElementById("countries-search").addEventListener("input", e => {
    searchQuery.countries = e.target.value.trim().toLowerCase();
    renderCountriesTable();
  });
  buildMissingTables();
  addKataDiffs();
  renderAll();
}

function renderAll() {
  updateHeaderSub();
  renderWelcomeStats();
  renderWelcomeVideo();
  renderKataTable();
  renderKaratekaTable();
  renderTournamentsTable();
  renderCountriesTable();
  renderKataFindings();
  renderKaratekaFindings();
}

function renderWelcomeVideo() {
  const videos = {
    male:   { id: "B8jNtZaZbgY", title: "2024 K1 Premier League Casablanca, Male Kata, Gold Medal Match" },
    female: { id: "NDp3JTglEKM", title: "2024 K1 Premier League Antalya, Female Kata, Gold Medal Match"  },
  };
  const v = videos[gender];
  document.getElementById("welcome-video-section").innerHTML = `
    <p class="video-header">${v.title}</p>
    <div style="display:flex;justify-content:center">
      <a href="https://www.youtube.com/watch?v=${v.id}${gender === "female" ? "&t=424s" : ""}" target="_blank" rel="noopener"
         style="display:block;width:50%;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);position:relative;aspect-ratio:16/9">
        <img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg"
             alt="Kata performance video"
             style="width:100%;height:100%;object-fit:cover;object-position:center;display:block">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                    background:rgba(0,0,0,0.65);border-radius:50%;width:52px;height:52px;
                    display:flex;align-items:center;justify-content:center">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><polygon points="9,7 19,12 9,17"/></svg>
        </div>
      </a>
    </div>`;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
function updateHeaderSub() {
  const m = DATA.meta;
  const g = gender === "male";
  const uniqueKata  = (DATA.kata[gender] || []).length;
  const countryCount = buildCountryStats().length;
  document.getElementById("header-sub").textContent =
    `${g ? "Male" : "Female"} Kata · ` +
    `${g ? m.male_performances : m.female_performances} Performances · ` +
    `${uniqueKata} Unique Kata · ` +
    `${g ? m.male_karateka : m.female_karateka} Athletes · ` +
    `9 Tournaments · ${countryCount} Countries`;
}

/* ── Tab switch helper ─────────────────────────────────────────────────────── */
function switchToTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(s => { s.classList.remove("active"); s.classList.add("hidden"); });
  const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (btn) btn.classList.add("active");
  const sec = document.getElementById(`tab-${tabId}`);
  if (sec) { sec.classList.remove("hidden"); sec.classList.add("active"); }
}

/* ── Welcome stats ─────────────────────────────────────────────────────────── */
function renderWelcomeStats() {
  const m = DATA.meta;
  const g = gender === "male";
  document.getElementById("welcome-stats").innerHTML = [
    [g ? m.male_performances : m.female_performances, "Performances", "kata"],
    [g ? m.male_karateka : m.female_karateka,         "Athletes",     "karateka"],
    [9,                                               "Tournaments",  "tournaments"],
  ].map(([n, label, tab]) => `
    <button class="welcome-stat-card" onclick="switchToTab('${tab}')">
      <div class="stat-num">${n.toLocaleString()}</div>
      <div class="stat-label">${label}</div>
    </button>
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
      /* close any open detail cards when switching tabs */
      ["kata-card", "karateka-card", "tournaments-card"].forEach(id => clearCard(id));
      if (btn.dataset.tab === "compare") renderCompareTab();
    });
  });
}

function renderCompareTab() {
  const mkata = DATA.kata.male   || [];
  const fkata = DATA.kata.female || [];
  const mSet = new Set(mkata.map(k => k.Kata));
  const fSet = new Set(fkata.map(k => k.Kata));

  const mOnly = mkata.filter(k => !fSet.has(k.Kata)).sort((a,b) => b.Performances - a.Performances);
  const fOnly = fkata.filter(k => !mSet.has(k.Kata)).sort((a,b) => b.Performances - a.Performances);

  const mTop5 = [...mkata].sort((a,b) => b.Performances - a.Performances).slice(0,5);
  const fTop5 = [...fkata].sort((a,b) => b.Performances - a.Performances).slice(0,5);

  /* avg score comparison for shared kata */
  compareShared = mkata.filter(k => fSet.has(k.Kata) && k.Mean_Score != null).map(mk => {
    const fk = fkata.find(k => k.Kata === mk.Kata);
    return fk && fk.Mean_Score != null
      ? { Kata: mk.Kata, Male: mk.Mean_Score, Female: fk.Mean_Score, Diff: mk.Mean_Score - fk.Mean_Score }
      : null;
  }).filter(Boolean);
  compareSortCol = "Diff"; compareSortDir = "desc";

  const sign = v => (v >= 0 ? "+" : "") + v.toFixed(3);
  const diffColor = v => v > 0 ? "#3a6e3a" : v < 0 ? "var(--red)" : "inherit";

  const top5Row = (k, i) => `<tr><td>${i+1}</td><td class="name-cell">${esc(k.Kata)}</td><td class="num">${k.Performances}</td><td class="num">${k.Mean_Score != null ? k.Mean_Score.toFixed(3) : "—"}</td></tr>`;
  const onlyPills = arr => arr.map(k => `<span class="pill">${tierBadge(k.Kata_Tier)} ${esc(k.Kata)} <span class="pill-count">${k.Performances}×</span></span>`).join("");

  document.getElementById("compare-content").innerHTML = `
    <!-- Top 5 side by side -->
    <div class="compare-grid">
      <div class="compare-col">
        <h3 class="compare-head">Top 5 Most Performed — Male</h3>
        <table class="data-table"><thead><tr><th>#</th><th>Kata</th><th class="num">Performances</th><th class="num">Avg Score</th></tr></thead>
        <tbody>${mTop5.map((k,i) => top5Row(k,i)).join("")}</tbody></table>
      </div>
      <div class="compare-col">
        <h3 class="compare-head">Top 5 Most Performed — Female</h3>
        <table class="data-table"><thead><tr><th>#</th><th>Kata</th><th class="num">Performances</th><th class="num">Avg Score</th></tr></thead>
        <tbody>${fTop5.map((k,i) => top5Row(k,i)).join("")}</tbody></table>
      </div>
    </div>

    <!-- Exclusive kata -->
    <div class="compare-grid" style="margin-top:48px">
      <div class="compare-col">
        <h3 class="compare-head">Performed by Males Only (${mOnly.length})</h3>
        <div class="pill-list">${onlyPills(mOnly) || "<em style='color:var(--text-muted)'>None</em>"}</div>
      </div>
      <div class="compare-col">
        <h3 class="compare-head">Performed by Females Only (${fOnly.length})</h3>
        <div class="pill-list">${onlyPills(fOnly) || "<em style='color:var(--text-muted)'>None</em>"}</div>
      </div>
    </div>

    <!-- Avg score comparison -->
    <div style="margin-top:48px">
      <h3 class="compare-head">Average Score Comparison — Shared Kata (${compareShared.length})</h3>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Click any column header to sort. Diff = Male − Female.</p>
      <div class="table-wrapper table-wrapper--sticky">
        <table class="data-table" id="compare-shared-table">
          <thead><tr>
            <th data-ccol="Kata"   style="cursor:pointer" onclick="sortCompareTable('Kata')">Kata</th>
            <th data-ccol="Male"   class="num" style="cursor:pointer" onclick="sortCompareTable('Male')">Male Avg</th>
            <th data-ccol="Female" class="num" style="cursor:pointer" onclick="sortCompareTable('Female')">Female Avg</th>
            <th data-ccol="Diff"   class="num" style="cursor:pointer" onclick="sortCompareTable('Diff')">Diff (M−F) ↓</th>
          </tr></thead>
          <tbody id="compare-shared-tbody"></tbody>
        </table>
      </div>
    </div>`;
  renderCompareSharedTable();
}

function sortCompareTable(col) {
  if (compareSortCol === col) {
    compareSortDir = compareSortDir === "asc" ? "desc" : "asc";
  } else {
    compareSortCol = col;
    compareSortDir = col === "Kata" ? "asc" : "desc";
  }
  /* update header arrows */
  document.querySelectorAll("#compare-shared-table th[data-ccol]").forEach(th => {
    const base = th.textContent.replace(/ [↑↓]$/, "");
    th.textContent = th.dataset.ccol === col ? base + (compareSortDir === "asc" ? " ↑" : " ↓") : base;
  });
  renderCompareSharedTable();
}

function renderCompareSharedTable() {
  const sign      = v => (v >= 0 ? "+" : "") + v.toFixed(3);
  const diffColor = v => v > 0 ? "#3a6e3a" : v < 0 ? "var(--red)" : "inherit";
  const sorted = [...compareShared].sort((a, b) => {
    const av = a[compareSortCol], bv = b[compareSortCol];
    if (typeof av === "string") return compareSortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return compareSortDir === "asc" ? av - bv : bv - av;
  });
  const tbody = document.getElementById("compare-shared-tbody");
  if (!tbody) return;
  tbody.innerHTML = sorted.map(r => `<tr>
    <td class="name-cell">${esc(r.Kata)}</td>
    <td class="num">${r.Male.toFixed(3)}</td>
    <td class="num">${r.Female.toFixed(3)}</td>
    <td class="num" style="color:${diffColor(r.Diff)};font-weight:600">${sign(r.Diff)}</td>
  </tr>`).join("");
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
  document.getElementById("kata-tbody").innerHTML = rows.map((r, i) => `
    <tr data-kata="${esc(r.Kata)}">
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${esc(r.Kata)}</td>
      <td>${tierBadge(r.Kata_Tier)}</td>
      <td class="num">${r.Performances}</td>
      <td class="num">${r.Unique_Karateka}</td>
      <td class="num">${fmt3(r.Mean_Score)}</td>
      <td class="num">${fmt2(r.Median_Score)}</td>
      <td class="num">${fmt2(r.Min_Score)}</td>
      <td class="num">${fmt2(r.Max_Score)}</td>
      <td class="num">${r.Max_Score != null && r.Min_Score != null ? fmt2(r.Max_Score - r.Min_Score) : "—"}</td>
      <td class="num">${fmt3(r.Std_Dev)}</td>
      <td class="num">${fmtPct(r.Win_Rate)}</td>
      <td class="num" style="${r.Diff != null ? (r.Diff >= 0 ? 'color:#3a6e3a' : 'color:var(--red)') : ''}">${r.Diff != null ? (r.Diff >= 0 ? '+' : '') + r.Diff.toFixed(3) : '—'}</td>
    </tr>`).join("");
  /* averages row */
  const allKata = DATA.kata[gender];
  const avg = field => {
    const vals = allKata.map(r => r[field]).filter(v => v != null);
    return vals.length ? vals.reduce((s,v) => s+v, 0) / vals.length : null;
  };
  const medianOf = vals => {
    if (!vals.length) return null;
    const s = [...vals].sort((a,b) => a-b);
    const m = Math.floor(s.length/2);
    return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
  };
  const medianPerfsKata = medianOf(allKata.map(r => r.Performances).filter(v => v != null));
  const absMin = allKata.map(r => r.Min_Score).filter(v => v != null).reduce((m,v) => Math.min(m,v), Infinity);
  const absMax = allKata.map(r => r.Max_Score).filter(v => v != null).reduce((m,v) => Math.max(m,v), -Infinity);
  const totalPerfsK = allKata.reduce((s,r) => s + (r.Performances || 0), 0);
  const totalWinsK  = allKata.reduce((s,r) => s + (r.Win_Rate != null ? r.Win_Rate * r.Performances : 0), 0);
  const weightedWR  = totalPerfsK ? totalWinsK / totalPerfsK : null;
  const avgDiff = (() => {
    const vals = allKata.map(r => r.Diff).filter(v => v != null);
    return vals.length ? vals.reduce((s,v) => s+v, 0) / vals.length : null;
  })();
  document.getElementById("kata-tfoot").innerHTML = `
    <tr class="avg-row">
      <td></td>
      <td class="name-cell" style="font-weight:700;color:var(--text)">Average</td>
      <td></td>
      <td class="num" title="Median performances per kata across all kata">${medianPerfsKata ?? "—"}</td>
      <td class="num">${fmt2(avg("Unique_Karateka"))}</td>
      <td class="num">${fmt3(avg("Mean_Score"))}</td>
      <td class="num">${fmt2(avg("Median_Score"))}</td>
      <td class="num">${fmt2(isFinite(absMin) ? absMin : null)}</td>
      <td class="num">${fmt2(isFinite(absMax) ? absMax : null)}</td>
      <td class="num">${fmt2(avg("Max_Score") != null && avg("Min_Score") != null ? avg("Max_Score") - avg("Min_Score") : null)}</td>
      <td class="num">${fmt3(avg("Std_Dev"))}</td>
      <td class="num">${fmtPct(weightedWR)}</td>
      <td class="num" style="${avgDiff != null ? (avgDiff >= 0 ? 'color:#3a6e3a' : 'color:var(--red)') : ''}">${avgDiff != null ? (avgDiff >= 0 ? '+' : '') + avgDiff.toFixed(3) : '—'}</td>
    </tr>`;
  document.querySelectorAll("#kata-tbody tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const row = DATA.kata[gender].find(r => r.Kata === tr.dataset.kata);
      if (row) { showKataCard(row); highlightRow("kata-tbody", "data-kata", row.Kata); }
    });
  });
}

function showKataCard(r) {
  const allDiffs  = [...(DATA.kata_vs_karateka_avg[gender] || [])].sort((a, b) => b.Diff - a.Diff);
  const diffEntry = allDiffs.find(d => d.Kata === r.Kata);
  const diffVal   = diffEntry ? diffEntry.Diff : null;
  const myDiff    = diffVal;
  const diffBetter = myDiff != null ? allDiffs.filter(d => d.Diff > myDiff).length : 0;
  const diffTied   = myDiff != null ? allDiffs.filter(d => d.Diff === myDiff).length : 0;
  const rank       = diffBetter + 1;
  const total     = allDiffs.length;
  const diffColor = diffVal != null ? (diffVal >= 0 ? "#3a6e3a" : "var(--red)") : "inherit";
  const diffNum   = diffVal != null
    ? `<span style="color:${diffColor};font-weight:700">${diffVal >= 0 ? "+" : ""}${diffVal.toFixed(3)}</span>`
    : "—";
  const rankStr   = rank > 0 ? ` &nbsp;·&nbsp; ${rank}/${total} among all kata` : "";
  /* find karateka who got the min and max score for this kata */
  let minK = null, maxK = null, minS = Infinity, maxS = -Infinity;
  for (const k of (DATA.karateka[gender] || [])) {
    for (const p of (k.Performances_Detail || [])) {
      if (p.Kata === r.Kata && p.Avg_Score != null) {
        if (p.Avg_Score < minS) { minS = p.Avg_Score; minK = k.Karateka; }
        if (p.Avg_Score > maxS) { maxS = p.Avg_Score; maxK = k.Karateka; }
      }
    }
  }

  /* rank helper: competition-style (tied values share the same rank) */
  const kataAll = DATA.kata[gender] || [];
  const rankOf = (field, asc = false) => {
    const vals = kataAll.filter(d => d[field] != null);
    const total = vals.length;
    const myVal = r[field];
    if (myVal == null || !total) return null;
    const better = vals.filter(d => asc ? d[field] < myVal : d[field] > myVal).length;
    const tied   = vals.filter(d => d[field] === myVal).length;
    const suffix = tied > 1 ? " (T)" : "";
    return `${better + 1}/${total}${suffix}`;
  };
  const rk = (field, asc) => { const v = rankOf(field, asc); return v ? `<div class="stat-rank">${v}</div>` : ""; };

  /* country lookup for athlete table */
  const karCountry = Object.fromEntries((DATA.karateka[gender] || []).map(k => [k.Karateka, k.Country]));

  const athletes  = (r.All_Karateka || []);
  const athleteRows = athletes.map(k => `
    <tr>
      <td class="name-cell">${flagOf(karCountry[k.Karateka])} ${esc(k.Karateka)}</td>
      <td class="num">${k.Performances}</td>
      <td class="num">${k.Avg_Score != null ? k.Avg_Score.toFixed(3) : "—"}</td>
    </tr>`).join("");

  const diffStat = diffVal != null ? `
    <div class="stat-box">
      <div class="stat-label">
        <a href="#" onclick="switchToTab('kata-findings');setTimeout(()=>document.getElementById('finding-kk-avg')?.scrollIntoView({behavior:'smooth'}),60);return false;"
           style="color:inherit;text-decoration:none" title="Go to chart">Score Diff ↗</a>
      </div>
      <div class="stat-value" style="color:${diffColor};font-size:16px">${diffVal >= 0 ? "+" : ""}${diffVal.toFixed(3)}</div>
      ${rank > 0 ? `<div class="stat-rank">${rank}/${total}${diffTied > 1 ? " (T)" : ""}</div>` : ""}
    </div>` : "";

  document.getElementById("kata-card").innerHTML = `
    <button class="card-close-btn" onclick="document.getElementById('kata-card').classList.add('hidden')" title="Close">✕</button>
    <div class="card-header">
      <span class="card-title">${esc(r.Kata)}</span>${tierBadge(r.Kata_Tier)}
    </div>
    <div class="card-stats">
      <div class="stat-box">
        <div class="stat-label">Performances</div><div class="stat-value">${r.Performances}</div>${rk('Performances')}
      </div>
      <div class="stat-box">
        <div class="stat-label">Athletes</div><div class="stat-value">${r.Unique_Karateka}</div>${rk('Unique_Karateka')}
      </div>
      <div class="stat-box">
        <div class="stat-label">Avg Score</div><div class="stat-value">${fmt3(r.Mean_Score)}</div>${rk('Mean_Score')}
      </div>
      <div class="stat-box">
        <div class="stat-label">Median</div><div class="stat-value">${fmt2(r.Median_Score)}</div>${rk('Median_Score')}
      </div>
      <div class="stat-box">
        <div class="stat-label">Min</div><div class="stat-value">${fmt2(r.Min_Score)}</div>${rk('Min_Score')}
        ${minK ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Athlete: ${esc(minK)}</div>` : ""}
      </div>
      <div class="stat-box">
        <div class="stat-label">Max</div><div class="stat-value">${fmt2(r.Max_Score)}</div>${rk('Max_Score')}
        ${maxK ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Athlete: ${esc(maxK)}</div>` : ""}
      </div>
      <div class="stat-box">
        <div class="stat-label">Std Dev</div><div class="stat-value">${fmt3(r.Std_Dev)}</div>${rk('Std_Dev', true)}
      </div>
      <div class="stat-box">
        <div class="stat-label">Win Rate</div><div class="stat-value">${fmtPct(r.Win_Rate)}</div>${rk('Win_Rate')}
      </div>
      ${diffStat}
    </div>
    ${athleteRows ? `
    <div class="card-section-title">All Athletes</div>
    <div class="card-table-wrap">
      <table class="data-table">
        <thead><tr><th>Karateka</th><th class="num">Performances</th><th class="num">Avg Score</th></tr></thead>
        <tbody>${athleteRows}</tbody>
      </table>
    </div>` : ""}`;
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
  DATA.karateka[gender].forEach(r => {
    r.Range = (r.Max_Score != null && r.Min_Score != null) ? r.Max_Score - r.Min_Score : null;
  });
  let rows = sortData(DATA.karateka[gender], s.col, s.dir);
  if (q) rows = rows.filter(r => r.Karateka && r.Karateka.toLowerCase().includes(q));
  document.getElementById("karateka-tbody").innerHTML = rows.map((r, i) => `
    <tr data-karateka="${esc(r.Karateka)}">
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${esc(r.Karateka)}</td>
      <td>${flagOf(r.Country)} ${esc(r.Country || "—")}</td>
      <td class="num">${medalEmoji(r.Medals)}</td>
      <td class="num">${r.Performances}</td>
      <td class="num">${r.Tournaments_Attended}</td>
      <td class="num">${fmt2(r.Mean_Score)}</td>
      <td class="num">${fmt2(r.Median_Score)}</td>
      <td class="num">${fmt2(r.Min_Score)}</td>
      <td class="num">${fmt2(r.Max_Score)}</td>
      <td class="num">${r.Max_Score != null && r.Min_Score != null ? fmt2(r.Max_Score - r.Min_Score) : "—"}</td>
      <td class="num">${fmtPct(r.Win_Rate)}</td>
    </tr>`).join("");
  /* averages row */
  const allKar = DATA.karateka[gender];
  const avgK = field => {
    const vals = allKar.map(r => r[field]).filter(v => v != null);
    return vals.length ? vals.reduce((s,v) => s+v, 0) / vals.length : null;
  };
  const medianOfK = vals => {
    if (!vals.length) return null;
    const s = [...vals].sort((a,b) => a-b);
    const m = Math.floor(s.length/2);
    return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
  };
  const medianPerfsKar = medianOfK(allKar.map(r => r.Performances).filter(v => v != null));
  const absMinK = allKar.map(r => r.Min_Score).filter(v => v != null).reduce((m,v) => Math.min(m,v), Infinity);
  const absMaxK = allKar.map(r => r.Max_Score).filter(v => v != null).reduce((m,v) => Math.max(m,v), -Infinity);
  const totPerfsKar  = allKar.reduce((s,r) => s + (r.Performances || 0), 0);
  const totWinsKar   = allKar.reduce((s,r) => s + (r.Win_Rate != null ? r.Win_Rate * r.Performances : 0), 0);
  const wWRKar       = totPerfsKar ? totWinsKar / totPerfsKar : null;
  document.getElementById("karateka-tfoot").innerHTML = `
    <tr class="avg-row">
      <td></td>
      <td class="name-cell" style="font-weight:700;color:var(--text)">Average</td>
      <td></td>
      <td></td>
      <td class="num" title="Median performances per athlete across all athletes">${medianPerfsKar ?? "—"}</td>
      <td class="num">${fmt2(avgK("Tournaments_Attended"))}</td>
      <td class="num">${fmt2(avgK("Mean_Score"))}</td>
      <td class="num">${fmt2(avgK("Median_Score"))}</td>
      <td class="num">${fmt2(isFinite(absMinK) ? absMinK : null)}</td>
      <td class="num">${fmt2(isFinite(absMaxK) ? absMaxK : null)}</td>
      <td class="num">${isFinite(absMinK) && isFinite(absMaxK) ? fmt2(absMaxK - absMinK) : "—"}</td>
      <td class="num">${fmtPct(wWRKar)}</td>
    </tr>`;
  document.querySelectorAll("#karateka-tbody tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const row = DATA.karateka[gender].find(r => r.Karateka === tr.dataset.karateka);
      if (row) { showKaratekaCard(row); highlightRow("karateka-tbody", "data-karateka", row.Karateka); }
    });
  });
}

function showKaratekaCard(r) {
  const perfs = r.Performances_Detail || [];
  const scoredPerfs = perfs.filter(p => p.Avg_Score != null && p.Kata);
  const bestPerf  = scoredPerfs.reduce((best, p)  => (p.Avg_Score > (best?.Avg_Score  ?? -Infinity) ? p : best),  null);
  const worstPerf = scoredPerfs.reduce((worst, p) => (p.Avg_Score < (worst?.Avg_Score ??  Infinity) ? p : worst), null);
  const roundLabel = { rr:"Round Robin", r1:"Round 1", r2:"Round 2", r3:"Round 3", rpc:"Repechage" };
  const perfRows = perfs.map(p => `
    <tr>
      <td>${esc(p.Tournament || "—")}</td>
      <td>${esc(roundLabel[p.Round] || p.Round || "—")}</td>
      <td class="name-cell">${esc(p.Kata || "—")}</td>
      <td class="num">${p.Avg_Score != null ? p.Avg_Score.toFixed(2) : "—"}</td>
      <td class="num" style="color:${p.Won ? "#3a6e3a" : "var(--red)"}; font-weight:600">${p.Won == null ? "—" : p.Won ? "Win" : "Loss"}</td>
    </tr>`).join("");
  /* avg score per kata from Performances_Detail */
  const kataAvgMap = {};
  for (const p of (r.Performances_Detail || [])) {
    if (p.Kata && p.Avg_Score != null) {
      if (!kataAvgMap[p.Kata]) kataAvgMap[p.Kata] = { sum: 0, n: 0 };
      kataAvgMap[p.Kata].sum += p.Avg_Score;
      kataAvgMap[p.Kata].n++;
    }
  }
  const repertoireRows = (r.Kata_Repertoire || []).map(k => {
    const kData = DATA.kata[gender]?.find(d => d.Kata === k.Kata);
    const winEntry = kataAvgMap[k.Kata];
    const avgScore = winEntry ? (winEntry.sum / winEntry.n).toFixed(2) : "—";
    const kWins = (r.Performances_Detail || []).filter(p => p.Kata === k.Kata && p.Won === true).length;
    const kPerfs = k.count;
    const kWR = kPerfs ? fmtPct(kWins / kPerfs) : "—";
    return `<tr>
      <td>${kData ? tierBadge(kData.Kata_Tier) : ""} ${esc(k.Kata)}</td>
      <td class="num">${kPerfs}</td>
      <td class="num">${avgScore}</td>
      <td class="num">${kWR}</td>
    </tr>`;
  }).join("");
  const repertoire = repertoireRows ? `
    <table class="data-table" style="margin-top:4px">
      <thead><tr><th>Kata</th><th class="num">Performances</th><th class="num">Avg Score</th><th class="num">Win Rate</th></tr></thead>
      <tbody>${repertoireRows}</tbody>
    </table>` : "";

  /* medal count summary */
  const medalCounts = { 1: 0, 2: 0, 3: 0 };
  (r.Medals || []).forEach(m => medalCounts[m.Place] = (medalCounts[m.Place] || 0) + 1);
  const medalSummaryParts = [];
  if (medalCounts[1]) medalSummaryParts.push(`${medalCounts[1]}× Gold`);
  if (medalCounts[2]) medalSummaryParts.push(`${medalCounts[2]}× Silver`);
  if (medalCounts[3]) medalSummaryParts.push(`${medalCounts[3]}× Bronze`);

  /* rank among all karateka — competition-style (ties share same rank) */
  const karAll = DATA.karateka[gender] || [];
  const rkK = (field, asc = false) => {
    const vals  = karAll.filter(d => d[field] != null);
    const total = vals.length;
    const myVal = r[field];
    if (myVal == null || !total) return "";
    const better = vals.filter(d => asc ? d[field] < myVal : d[field] > myVal).length;
    const tied   = vals.filter(d => d[field] === myVal).length;
    const suffix = tied > 1 ? " (T)" : "";
    return `<div class="stat-rank">${better + 1}/${total}${suffix}</div>`;
  };

  document.getElementById("karateka-card").innerHTML = `
    <button class="card-close-btn" onclick="document.getElementById('karateka-card').classList.add('hidden')" title="Close">✕</button>
    <div class="card-header">
      <span class="card-title">${esc(r.Karateka)}</span>
      <span class="card-subtitle">${flagOf(r.Country)} ${esc(r.Country || "")}</span>
    </div>
    <div class="card-stats">
      <div class="stat-box"><div class="stat-label">Performances</div><div class="stat-value">${r.Performances}</div>${rkK('Performances')}</div>
      <div class="stat-box"><div class="stat-label">Tournaments</div><div class="stat-value">${r.Tournaments_Attended}</div>${rkK('Tournaments_Attended')}</div>
      <div class="stat-box"><div class="stat-label">Avg Score</div><div class="stat-value">${fmt2(r.Mean_Score)}</div>${rkK('Mean_Score')}</div>
      <div class="stat-box"><div class="stat-label">Median</div><div class="stat-value">${fmt2(r.Median_Score)}</div>${rkK('Median_Score')}</div>
      <div class="stat-box"><div class="stat-label">Worst Score</div><div class="stat-value">${fmt2(r.Min_Score)}</div>${rkK('Min_Score', true)}${worstPerf ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Kata: ${esc(worstPerf.Kata)}</div>` : ""}</div>
      <div class="stat-box"><div class="stat-label">Best Score</div><div class="stat-value">${fmt2(r.Max_Score)}</div>${rkK('Max_Score')}${bestPerf ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Kata: ${esc(bestPerf.Kata)}</div>` : ""}</div>
      <div class="stat-box"><div class="stat-label">Win Rate</div><div class="stat-value">${fmtPct(r.Win_Rate)}</div>${rkK('Win_Rate')}</div>
    </div>
    ${r.Medals && r.Medals.length ? `
    <div class="card-section-title">Medals</div>
    ${medalSummaryParts.length ? `<p style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px">${medalSummaryParts.join(" &nbsp;·&nbsp; ")}</p>` : ""}
    <div class="pill-list" style="margin-bottom:14px">
      ${r.Medals.map(m => `<span class="pill">${m.Place === 1 ? "🥇" : m.Place === 2 ? "🥈" : "🥉"} ${esc(m.Tournament)}</span>`).join("")}
    </div>` : ""}
    ${repertoire ? `<div class="card-section-title">Kata Repertoire</div><div style="margin-bottom:14px">${repertoire}</div>` : ""}
    ${perfRows ? `
    <div class="card-section-title">All Performances</div>
    <div class="card-table-wrap">
      <table class="data-table">
        <thead><tr><th>Tournament</th><th>Round</th><th>Kata</th><th class="num">Score</th><th class="num">Result</th></tr></thead>
        <tbody>${perfRows}</tbody>
      </table>
    </div>` : ""}`;
  document.getElementById("karateka-card").classList.remove("hidden");
}

/* ════════════════════════════════════════════════════════════════ TOURNAMENTS TAB */
function buildCountryStats() {
  const karAll = DATA.karateka[gender] || [];
  const map = {};
  for (const k of karAll) {
    const c = k.Country;
    if (!c) continue;
    if (!map[c]) map[c] = { Country: c, athletes: [], performances: 0, tournaments: new Set(), scoreSum: 0, scoredPerfs: 0, wins: 0, winPerfs: 0, bestScore: -Infinity, golds: 0, silvers: 0, bronzes: 0 };
    const m = map[c];
    m.athletes.push(k.Karateka);
    m.performances += k.Performances || 0;
    if (k.Tournaments_Attended) {
      (k.Performances_Detail || []).forEach(p => { if (p.Tournament) m.tournaments.add(p.Tournament); });
    }
    if (k.Mean_Score != null && k.Performances) { m.scoreSum += k.Mean_Score * k.Performances; m.scoredPerfs += k.Performances; }
    if (k.Win_Rate != null && k.Performances)   { m.wins += k.Win_Rate * k.Performances; m.winPerfs += k.Performances; }
    if (k.Max_Score != null && k.Max_Score > m.bestScore) m.bestScore = k.Max_Score;
    (k.Medals || []).forEach(med => {
      if (med.Place === 1) m.golds++;
      else if (med.Place === 2) m.silvers++;
      else m.bronzes++;
    });
  }
  return Object.values(map).map(m => ({
    Country:     m.Country,
    Athletes:    m.athletes.length,
    Performances: m.performances,
    Tournaments: m.tournaments.size,
    Avg_Score:   m.scoredPerfs ? m.scoreSum / m.scoredPerfs : null,
    Best_Score:  isFinite(m.bestScore) ? m.bestScore : null,
    Win_Rate:    m.winPerfs ? m.wins / m.winPerfs : null,
    Medals:      m.golds + m.silvers + m.bronzes,
    _medals:     { gold: m.golds, silver: m.silvers, bronze: m.bronzes },
  }));
}

function renderCountriesTable() {
  const s = sortState.countries;
  const q = searchQuery.countries;
  let all = buildCountryStats();
  if (q) all = all.filter(r => r.Country.toLowerCase().includes(q));
  const rows = sortData(all, s.col, s.dir);
  document.getElementById("countries-tbody").innerHTML = rows.map((r, i) => `
    <tr>
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${flagOf(r.Country)} ${esc(r.Country)}</td>
      <td class="num">${r.Athletes}</td>
      <td class="num">${r.Performances}</td>
      <td class="num">${r.Tournaments}</td>
      <td class="num">${fmt2(r.Avg_Score)}</td>
      <td class="num">${fmt2(r.Best_Score)}</td>
      <td class="num">${fmtPct(r.Win_Rate)}</td>
      <td class="num">${r._medals.gold ? "🥇".repeat(r._medals.gold) : ""}${r._medals.silver ? "🥈".repeat(r._medals.silver) : ""}${r._medals.bronze ? "🥉".repeat(r._medals.bronze) : ""}${!r.Medals ? "—" : ""}</td>
    </tr>`).join("");
}

function renderTournamentsTable() {
  const s = sortState.tournaments;
  const rows = sortData(DATA.tournaments.filter(r => r.Gender.toLowerCase() === gender), s.col, s.dir);
  const tmeta = t => TOURN_META[t] || {};
  document.getElementById("tournaments-tbody").innerHTML = rows.map((r, i) => `
    <tr data-tourn="${esc(r.Tournament)}" style="cursor:pointer">
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${flagOf(tmeta(r.Tournament).country)} ${esc(r.Tournament)}</td>
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

function tournamentShowList(type) {
  const tourn = lastTournCard;
  const panel = document.getElementById("tourn-list-panel");
  if (!panel) return;
  if (type === "athletes") {
    const athletes = (DATA.karateka[gender] || [])
      .filter(k => (k.Tournament_List || []).includes(tourn))
      .sort((a, b) => a.Karateka.localeCompare(b.Karateka));
    panel.innerHTML = `
      <div class="card-section-title">Athletes at this Tournament (${athletes.length})</div>
      <div class="pill-list">${athletes.map(k => `<span class="pill">${flagOf(k.Country)} ${esc(k.Karateka)}</span>`).join("")}</div>`;
  } else {
    const kataSet = new Set();
    for (const k of (DATA.karateka[gender] || [])) {
      for (const p of (k.Performances_Detail || [])) {
        if (p.Tournament === tourn && p.Kata) kataSet.add(p.Kata);
      }
    }
    const kataArr = [...kataSet].sort();
    const kataLookup = Object.fromEntries((DATA.kata[gender] || []).map(d => [d.Kata, d]));
    panel.innerHTML = `
      <div class="card-section-title">Kata Performed at this Tournament (${kataArr.length})</div>
      <div class="pill-list">${kataArr.map(k => {
        const kd = kataLookup[k];
        return `<span class="pill">${kd ? tierBadge(kd.Kata_Tier) : ""} ${esc(k)}</span>`;
      }).join("")}</div>`;
  }
}

function showTournamentCard(r) {
  lastTournCard = r.Tournament;
  const meta = TOURN_META[r.Tournament] || {};
  /* collect medalists for this tournament */
  const medalists = [];
  for (const k of (DATA.karateka[gender] || [])) {
    for (const m of (k.Medals || [])) {
      if (m.Tournament === r.Tournament) medalists.push({ name: k.Karateka, country: k.Country, place: m.Place });
    }
  }
  medalists.sort((a, b) => a.place - b.place);
  const medalistHtml = medalists.length ? `
    <div class="card-section-title" style="margin-top:14px">Medalists</div>
    <div class="pill-list">${medalists.map(m => `<span class="pill">${m.place===1?"🥇":m.place===2?"🥈":"🥉"} ${flagOf(m.country)} ${esc(m.name)}</span>`).join("")}</div>` : "";
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
    <button class="card-close-btn" onclick="document.getElementById('tournaments-card').classList.add('hidden')" title="Close">✕</button>
    <div class="card-header">
      <span class="card-title">${esc(r.Tournament)}</span>
      ${meta.date ? `<span class="card-subtitle">${esc(meta.date)}</span>` : ""}
    </div>
    ${meta.city ? `<p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">${flagOf(meta.country)} ${esc(meta.city)}, ${esc(meta.country)}</p>` : ""}
    <div class="card-stats">
      <div class="stat-box"><div class="stat-label">Performances</div><div class="stat-value">${r.Total_Performances}</div></div>
      <div class="stat-box clickable" onclick="tournamentShowList('athletes')" title="Click to see athlete list">
        <div class="stat-label">Athletes ↓</div><div class="stat-value">${r.Unique_Karateka}</div>
      </div>
      <div class="stat-box clickable" onclick="tournamentShowList('kata')" title="Click to see kata list">
        <div class="stat-label">Unique Kata ↓</div><div class="stat-value">${r.Unique_Kata}</div>
      </div>
      <div class="stat-box"><div class="stat-label">Avg Score</div><div class="stat-value">${r.Avg_Score != null ? r.Avg_Score.toFixed(3) : "—"}</div></div>
    </div>
    ${medalistHtml}
    <div id="tourn-list-panel" style="margin-top:8px"></div>
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

function makeHBar(id, labels, values, xLabel, minVal, perfs = null) {
  destroyChart(id);
  const ctx = document.getElementById(id); if (!ctx) return;
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx2 => perfs
          ? ` ${ctx2.raw}  (${perfs[ctx2.dataIndex]} performances)`
          : ` ${ctx2.raw}` } },
      },
      scales: {
        x: { min: minVal, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, title: { display: !!xLabel, text: xLabel, font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        y: { grid: { display: false }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18" } },
      },
    },
  });
}

function makeWinRateHBar(id, labels, values, axisTitle = "Win Rate (%)", perfs = null) {
  destroyChart(id);
  const ctx = document.getElementById(id); if (!ctx) return;
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx2 => perfs
          ? ` ${ctx2.raw}%  (${perfs[ctx2.dataIndex]} performances)`
          : ` ${ctx2.raw}%` } },
      },
      scales: {
        x: { min: 0, max: 100, grid: { color: GRID }, ticks: { callback: v => v + "%", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, title: { display: true, text: axisTitle, font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
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
  const top5Perfs = popSorted.slice(0,5).reduce((s,r) => s + r.Performances, 0);
  const totalPerfsAll = DATA.meta[gender+"_performances"];
  document.getElementById("insight-popularity").textContent =
    `${top1.Kata} was the most performed ${gender === "male" ? "Male" : "Female"} kata with ${top1.Performances} performances across ${top1.Unique_Karateka} athletes. ` +
    `The top 5 kata accounted for ${top5Perfs} of ${totalPerfsAll}, or ${(top5Perfs/totalPerfsAll*100).toFixed(1)}% of, total performances.`;
  makeHBar("chart-popularity", popSorted.map(r => r.Kata), popSorted.map(r => r.Performances), "Performances", 0);

  /* 2. Avg Score */
  const scoreSorted = [...kata].filter(r => r.Mean_Score != null).sort((a, b) => b.Mean_Score - a.Mean_Score);
  const top1s = scoreSorted[0], bot1s = scoreSorted[scoreSorted.length - 1];
  const overallAvg = kata.filter(r => r.Mean_Score).reduce((s,r) => s + r.Mean_Score, 0) / kata.filter(r => r.Mean_Score).length;
  document.getElementById("insight-avgscore").textContent =
    `${top1s.Kata} had the highest average score (${top1s.Mean_Score.toFixed(3)}); ` +
    `${bot1s.Kata} had the lowest (${bot1s.Mean_Score.toFixed(3)}). ` +
    `The overall ${gender} average across all performances was ${overallAvg.toFixed(3)}.`;
  makeHBar("chart-avgscore", scoreSorted.map(r => r.Kata), scoreSorted.map(r => r.Mean_Score), "Average Score", 7.0, scoreSorted.map(r => r.Performances));

  /* 3. Win Rate */
  const winSorted = [...kata].filter(r => r.Win_Rate != null && r.Performances >= 5).sort((a, b) => b.Win_Rate - a.Win_Rate);
  document.getElementById("insight-winrate").textContent =
    `Among kata with at least 5 performances, ${winSorted[0].Kata} had the highest win rate ` +
    `(${(winSorted[0].Win_Rate*100).toFixed(1)}%) and ${winSorted[winSorted.length-1].Kata} had the lowest ` +
    `(${(winSorted[winSorted.length-1].Win_Rate*100).toFixed(1)}%). Win rate is influenced by opponent strength and athlete skill, not kata choice alone.`;
  makeWinRateHBar("chart-winrate", winSorted.map(r => r.Kata), winSorted.map(r => +(r.Win_Rate*100).toFixed(1)), "Win Rate (%)", winSorted.map(r => r.Performances));

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
    const scatterLabelPlugin = {
      id: "scatterLabels",
      afterDatasetsDraw(chart) {
        const ctx2 = chart.ctx;
        ctx2.save();
        ctx2.font = `9px ${CHART_FONT}`;
        ctx2.fillStyle = "#7a7060";
        ctx2.textBaseline = "middle";
        ctx2.textAlign = "left";
        chart.data.datasets.forEach((ds, di) => {
          const meta = chart.getDatasetMeta(di);
          (ds.data || []).forEach((pt, i) => {
            const el = meta.data[i];
            if (el && pt.kata) ctx2.fillText(pt.kata, el.x + 6, el.y);
          });
        });
        ctx2.restore();
      },
    };
    charts["chart-scatter"] = new Chart(ctxSc, {
      type: "scatter", data: { datasets },
      options: {
        responsive: true, maintainAspectRatio: true, aspectRatio: 11 / 6,
        layout: { padding: { right: 100 } },
        plugins: {
          legend: { position: "bottom", labels: { font: { family: CHART_FONT, size: 11 }, color: "#1c1c18", boxWidth: 12 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.raw.kata}: ${ctx.raw.x} perfs, avg ${ctx.raw.y.toFixed(3)}` } },
          scatterLabels: {},
        },
        scales: {
          x: { title: { display: true, text: "Performances", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
          y: { title: { display: true, text: "Average Score", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        },
      },
      plugins: [scatterLabelPlugin],
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
    `${tierKata[1]} of the ${kata.length} kata performed (${Math.round(tierKata[1]/kata.length*100)}%) are Intermediate kata, ` +
    `but they only account for ${((tierPerfs[1]/totalPerfs)*100).toFixed(1)}% of kata performances. ` +
    `The ${tierKata[0]} Advanced kata performed account for ${((tierPerfs[0]/totalPerfs)*100).toFixed(1)}% of ${gender} performances.`;

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
  const tTotalPerfs = tSorted.filter(r => r.Avg_Score && r.Performances).reduce((s,r) => s + r.Performances, 0);
  const tWeightedSum = tSorted.filter(r => r.Avg_Score && r.Performances).reduce((s,r) => s + r.Avg_Score * r.Performances, 0);
  const tOverallMean = tTotalPerfs ? tWeightedSum / tTotalPerfs : null;
  const tPerfCounts  = tSorted.map(r => r.Performances ?? null);
  document.getElementById("insight-tournament").textContent =
    tHigh && tLow
      ? `${tHigh.Tournament} had the highest average score (${tHigh.Avg_Score.toFixed(3)}) and ${tLow.Tournament} the lowest (${tLow.Avg_Score.toFixed(3)}). ` +
        (tOverallMean ? `The overall mean score across all ${gender} performances this season was ${tOverallMean.toFixed(3)}.` : "")
      : "";
  const tMin = Math.max(7.5, Math.min(...tSorted.map(r=>r.Avg_Score).filter(Boolean)) - 0.05);
  destroyChart("chart-tournament");
  const ctxT = document.getElementById("chart-tournament"); if (ctxT) {
    charts["chart-tournament"] = new Chart(ctxT, {
      type: "bar",
      data: { labels: tSorted.map(r=>r.Tournament), datasets: [{ data: tSorted.map(r=>r.Avg_Score), backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx2 => {
            const p = tPerfCounts[ctx2.dataIndex];
            return p != null
              ? ` ${ctx2.raw.toFixed(3)}  (${p} performances)`
              : ` ${ctx2.raw.toFixed(3)}`;
          }}},
        },
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
    `Lists which Advanced and Intermediate kata were and were not performed during ${gender === "male" ? "Male" : "Female"} kata competition in the 2024–25 season.`;
  const kataPerfsMap = {};
  (DATA.kata[gender] || []).forEach(k => { kataPerfsMap[k.Kata] = k.Performances; });
  const makePills = arr => arr.length
    ? arr.map(k => {
        const cnt = kataPerfsMap[k];
        return `<span class="pill">${esc(k)}${cnt != null ? ` <span class="pill-count">${cnt}×</span>` : ""}</span>`;
      }).join("")
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
  const kkLabelPlugin = {
    id: "kkLabels",
    afterDatasetsDraw(chart) {
      const ctx2 = chart.ctx;
      ctx2.save();
      ctx2.font = `9px ${CHART_FONT}`;
      ctx2.textBaseline = "middle";
      const meta = chart.getDatasetMeta(0);
      sorted.forEach((row, i) => {
        const el = meta.data[i];
        if (!el) return;
        if (row.Diff >= 0) {
          ctx2.textAlign = "left";
          ctx2.fillStyle = "#3a6e3a";
          ctx2.fillText(row.Kata, el.x + 5, el.y);
        } else {
          ctx2.textAlign = "right";
          ctx2.fillStyle = "#c0392b";
          ctx2.fillText(row.Kata, el.x - 5, el.y);
        }
      });
      ctx2.restore();
    },
  };
  charts["chart-kk-avg"] = new Chart(ctx, {
    type: "bar",
    data: { labels: sorted.map(r => r.Kata), datasets: [{ data: sorted.map(r => r.Diff), backgroundColor: bgColors, borderColor: bdColors, borderWidth: 1, borderRadius: 3 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      layout: { padding: { left: 160, right: 160 } },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw >= 0 ? "+" : ""}${ctx.raw.toFixed(3)}` } },
        kkLabels: {},
      },
      scales: {
        x: { grid: { color: ctx => ctx.tick.value === 0 ? "rgba(0,0,0,0.75)" : GRID, lineWidth: ctx => ctx.tick.value === 0 ? 1.5 : 1 }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, title: { display: true, text: "Score Diff vs Athlete Avg", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        y: { grid: { display: false }, ticks: { display: false } },
      },
    },
    plugins: [kkLabelPlugin],
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

  /* line of best fit */
  const allPts = tierDatasets.flatMap(ds => ds.data);
  const n = allPts.length;
  if (n >= 2) {
    const sumX  = allPts.reduce((s, p) => s + p.x, 0);
    const sumY  = allPts.reduce((s, p) => s + p.y, 0);
    const sumXY = allPts.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = allPts.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const xMin = Math.min(...allPts.map(p => p.x));
    const xMax = Math.max(...allPts.map(p => p.x));
    tierDatasets.push({
      label: "Trend",
      data: [{ x: xMin, y: slope * xMin + intercept }, { x: xMax, y: slope * xMax + intercept }],
      type: "line",
      borderColor: RED,
      borderWidth: 1.5,
      borderDash: [5, 4],
      pointRadius: 0,
      fill: false,
      tension: 0,
    });
  }

  const kataLabelPlugin = {
    id: "kataLabels",
    afterDatasetsDraw(chart) {
      const ctx2 = chart.ctx;
      ctx2.save();
      ctx2.font = `9px ${CHART_FONT}`;
      ctx2.fillStyle = "#7a7060";
      ctx2.textBaseline = "middle";
      chart.data.datasets.forEach((dataset, di) => {
        if (dataset.type === "line") return;
        const meta = chart.getDatasetMeta(di);
        (dataset.data || []).forEach((point, i) => {
          const el = meta.data[i];
          if (el && point.kata) ctx2.fillText(point.kata, el.x + 7, el.y);
        });
      });
      ctx2.restore();
    },
  };

  charts["chart-stddev"] = new Chart(ctx, {
    type: "scatter",
    data: { datasets: tierDatasets },
    plugins: [kataLabelPlugin],
    options: {
      responsive: true, maintainAspectRatio: false,
      layout: { padding: { right: 130 } },
      plugins: {
        legend: { position: "bottom", labels: {
          filter: item => item.text !== "Trend",
          font: { family: CHART_FONT, size: 11 }, color: "#1c1c18", boxWidth: 12,
        } },
        tooltip: { callbacks: { label: ctx => ctx.raw.kata ? ` ${ctx.raw.kata}: ${ctx.raw.x} performers, σ = ${ctx.raw.y.toFixed(3)}` : "" } },
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
      ? `${kScoreSorted[0].Karateka} (${kScoreSorted[0].Country}) led ${gender} kata athletes in average score: ${kScoreSorted[0].Mean_Score.toFixed(2)} over ${kScoreSorted[0].Performances} performances.`
      : "";
  makeHBar("chart-k-avgscore", kScoreSorted.map(r => r.Karateka), kScoreSorted.map(r => r.Mean_Score), "Average Score", 7.5);

  /* 8. Top 20 by win rate (min 5 perfs) */
  const kWinSorted = [...kdata].filter(r => r.Win_Rate != null && r.Performances >= 5).sort((a,b) => b.Win_Rate - a.Win_Rate).slice(0, 20);
  document.getElementById("insight-k-winrate").textContent =
    kWinSorted[0]
      ? `${kWinSorted[0].Karateka} (${kWinSorted[0].Country}) had the highest win rate among ${gender} athletes: ${(kWinSorted[0].Win_Rate*100).toFixed(1)}% over ${kWinSorted[0].Performances} performances.`
      : "";
  makeWinRateHBar("chart-k-winrate", kWinSorted.map(r => r.Karateka), kWinSorted.map(r => +(r.Win_Rate*100).toFixed(1)));

  /* 9. Countries */
  const topCountries = countries.filter(r => r.Athletes >= 2).slice(0, 15);
  const multiCountries = countries.filter(r => r.Athletes >= 2);
  document.getElementById("insight-country").textContent =
    topCountries[0]
      ? `${countries.length} countries sent ${gender} kata athletes this season; ${multiCountries.length} sent 2 or more. ${topCountries[0].Country} sent the most with ${topCountries[0].Athletes} competitors.`
      : "";
  makeHBar("chart-country", topCountries.map(r => `${flagEmoji(r.Country)} ${r.Country}`), topCountries.map(r => r.Athletes), "Athletes", 0);
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
