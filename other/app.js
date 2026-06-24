/* ── Navigation confirmation modal ─────────────────────────────────────────── */
let _pendingNav = null;

function confirmNav(type, name) {
  _pendingNav = { type, name };
  const existing = document.getElementById("nav-modal");
  if (existing) existing.remove();
  const labels = { kata: "Kata", karateka: "Athlete", tournament: "Tournament", country: "Country" };
  const overlay = document.createElement("div");
  overlay.id = "nav-modal";
  overlay.className = "nav-modal-overlay";
  overlay.innerHTML = `<div class="nav-modal-box">
    <p class="nav-modal-msg">Navigate to <strong>${name}</strong> ${labels[type] || ""} Details?</p>
    <div class="nav-modal-btns">
      <button class="nav-modal-cancel" onclick="document.getElementById('nav-modal').remove()">Cancel</button>
      <button class="nav-modal-go" onclick="document.getElementById('nav-modal').remove();_doNav()">Go</button>
    </div>
  </div>`;
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function _doNav() {
  if (!_pendingNav) return;
  const { type, name } = _pendingNav;
  _pendingNav = null;
  /* save current state to history */
  const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
  _navHistory.push({ tab: activeTab, card: _currentCard ? { ..._currentCard } : null });
  _updateBackBtn();
  if (type === "kata") {
    switchToTab("kata");
    setTimeout(() => {
      const row = DATA.kata[gender].find(r => r.Kata === name);
      if (row) { showKataCard(row); highlightRow("kata-tbody", "data-kata", name); scrollToCard("kata-card"); }
    }, 80);
  } else if (type === "karateka") {
    switchToTab("karateka");
    setTimeout(() => {
      const row = DATA.karateka[gender].find(r => r.Karateka === name);
      if (row) { showKaratekaCard(row); highlightRow("karateka-tbody", "data-karateka", name); scrollToCard("karateka-card"); }
    }, 80);
  } else if (type === "tournament") {
    switchToTab("tournaments");
    setTimeout(() => {
      const row = (DATA.tournaments || []).find(r => r.Tournament === name);
      if (row) { showTournamentCard(row); scrollToCard("tournaments-card"); }
    }, 80);
  } else if (type === "country") {
    switchToTab("countries");
    setTimeout(() => {
      const all = buildCountryStats();
      const row = all.find(r => r.Country === name);
      if (row) { showCountryCard(row, all); highlightRow("countries-tbody", "data-country", name); scrollToCard("countries-card"); }
    }, 80);
  }
  /* update hash */
  window.location.hash = `${type}/${encodeURIComponent(name)}`;
}

function _updateBackBtn() {
  const btn = document.getElementById("nav-back-btn");
  if (btn) btn.style.display = _navHistory.length > 0 ? "block" : "none";
}

function scrollToCard(cardId) {
  const el = document.getElementById(cardId);
  if (!el || el.classList.contains("hidden")) return;
  const sticky = document.querySelector(".sticky-top");
  const offset = sticky ? sticky.offsetHeight + 12 : 80;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function _navBack() {
  if (!_navHistory.length) return;
  const prev = _navHistory.pop();
  _updateBackBtn();
  switchToTab(prev.tab);
  if (prev.card) {
    setTimeout(() => {
      const { type, name } = prev.card;
      if (type === "kata") {
        const row = DATA.kata[gender].find(r => r.Kata === name);
        if (row) { showKataCard(row); highlightRow("kata-tbody", "data-kata", name); scrollToCard("kata-card"); }
      } else if (type === "karateka") {
        const row = DATA.karateka[gender].find(r => r.Karateka === name);
        if (row) { showKaratekaCard(row); highlightRow("karateka-tbody", "data-karateka", name); scrollToCard("karateka-card"); }
      } else if (type === "tournament") {
        const row = (DATA.tournaments || []).find(r => r.Tournament === name && r.Gender.toLowerCase() === gender);
        if (row) { showTournamentCard(row); scrollToCard("tournaments-card"); }
      } else if (type === "country") {
        const all = buildCountryStats();
        const row = all.find(r => r.Country === name);
        if (row) { showCountryCard(row, all); highlightRow("countries-tbody", "data-country", name); scrollToCard("countries-card"); }
      }
    }, 80);
  }
  /* update hash */
  if (prev.card) {
    window.location.hash = `${prev.card.type}/${encodeURIComponent(prev.card.name)}`;
  } else {
    window.location.hash = prev.tab ? `tab/${prev.tab}` : "";
  }
}

function navLink(type, name, display) {
  const d = display !== undefined ? display : esc(name);
  return `<a class="nav-link" data-nav-type="${type}" data-nav-name="${esc(name)}">${d}</a>`;
}

document.addEventListener("click", e => {
  const link = e.target.closest(".nav-link");
  if (!link || !link.dataset.navType) return;
  const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
  const sameTab = { kata: "kata", karateka: "karateka", tournaments: "tournament", countries: "country" };
  // Only skip modal for same-type links in the main table, not inside detail cards
  const inCard = !!e.target.closest(".card-table-wrap, .card-section, .card-body");
  if (!inCard && sameTab[activeTab] === link.dataset.navType) return;
  e.stopPropagation();
  e.preventDefault();
  confirmNav(link.dataset.navType, link.dataset.navName);
});

/* ── State ─────────────────────────────────────────────────────────────────── */
let DATA   = null;
let gender = "male";
let _navHistory  = [];
let _currentCard = null;
let _kataHistChart = null;
let _karHistChart  = null;
let _timelineRendered = "";
let _mapRendered = "";

const sortState = {
  kata:        { col: "Performances", dir: "desc" },
  karateka:    { col: "Performances", dir: "desc" },
  tournaments: { col: "Tourn_Order",  dir: "asc"  },
  countries:   { col: "Athletes",     dir: "desc" },
};

const searchQuery = { kata: "", karateka: "", countries: "" };
let compareShared     = [];   // cached for re-sort
let compareIncomplete = [];   // shared kata missing a score for one gender
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
  return `<img src="https://flagcdn.com/16x12/${iso.toLowerCase()}.png" width="16" height="12" alt="${iso}" title="${country}" style="vertical-align:middle;margin-right:4px;border-radius:1px">`;
}
function flagEmoji(country) {
  const iso = ISO2[country];
  if (!iso) return "";
  return [...iso.toUpperCase()].map(c => String.fromCodePoint(c.codePointAt(0) + 127397)).join("");
}

/* ── Tournament metadata ───────────────────────────────────────────────────── */
const TOURN_META = {
  "2024 Paris":      { city:"Paris",      country:"France",  flag:"🇫🇷", date:"Jan 26–28, 2024"    },
  "2024 Antalya":    { city:"Antalya",    country:"Turkey",  flag:"🇹🇷", date:"Mar 15–17, 2024"    },
  "2024 Cairo":      { city:"Cairo",      country:"Egypt",   flag:"🇪🇬", date:"Apr 19–21, 2024"    },
  "2024 Casablanca": { city:"Casablanca", country:"Morocco", flag:"🇲🇦", date:"May 31–Jun 2, 2024"  },
  "2025 Paris":      { city:"Paris",      country:"France",  flag:"🇫🇷", date:"Jan 24–26, 2025"    },
  "2025 Hangzhou":   { city:"Hangzhou",   country:"China",   flag:"🇨🇳", date:"Mar 14–16, 2025"    },
  "2025 Cairo":      { city:"Cairo",      country:"Egypt",   flag:"🇪🇬", date:"Apr 18–20, 2025"    },
  "2025 Rabat":      { city:"Rabat",      country:"Morocco", flag:"🇲🇦", date:"May 30–Jun 1, 2025"  },
  "2025 Worlds":     { city:"Cairo",      country:"Egypt",   flag:"🇪🇬", date:"Nov 27–30, 2025"    },
};

/* Chronological index for each tournament name (0 = earliest) */
const TOURN_ORDER = Object.fromEntries(Object.keys(TOURN_META).map((k, i) => [k, i]));

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
  setupBackButton();
  setupGlobalSearch();
  renderAll();
  renderWelcomeTimeline();
  initHowToCards();
  parseDeepLink();
}

function splitTableScroll(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const wrapper = table.closest('.table-wrapper--sticky, .card-table-wrap');
  if (!wrapper || wrapper.dataset.split === tableId) return;
  const thead = table.querySelector('thead');
  if (!thead) return;

  const ths = Array.from(thead.querySelectorAll('th'));
  const widths = ths.map(th => th.getBoundingClientRect().width);
  if (widths.every(w => w === 0)) return; // not yet laid out

  const totalW = widths.reduce((s, w) => s + w, 0);
  const makeColGroup = () => {
    const cg = document.createElement('colgroup');
    widths.forEach(w => { const c = document.createElement('col'); c.style.width = (w / totalW * 100).toFixed(3) + '%'; cg.appendChild(c); });
    return cg;
  };

  // Build non-scrolling header table (move actual thead to keep onclick handlers)
  const headerTable = document.createElement('table');
  headerTable.className = table.className;
  headerTable.style.cssText = `width:100%;table-layout:fixed;border-collapse:collapse;`;
  headerTable.appendChild(makeColGroup());
  headerTable.appendChild(thead);

  const headerWrap = document.createElement('div');
  headerWrap.className = 'dt-fixed-header';
  headerWrap.appendChild(headerTable);

  // Body table keeps colgroup for alignment
  table.insertBefore(makeColGroup(), table.firstChild);
  table.style.cssText += `width:100%;table-layout:fixed;`;

  const bodyWrap = document.createElement('div');
  bodyWrap.className = 'dt-scroll-body';
  bodyWrap.appendChild(table);

  // Sync horizontal scroll: body → header
  bodyWrap.addEventListener('scroll', () => { headerWrap.scrollLeft = bodyWrap.scrollLeft; });

  wrapper.insertBefore(headerWrap, wrapper.firstChild);
  wrapper.appendChild(bodyWrap);
  wrapper.dataset.split = tableId;
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
  /* re-render gender-dependent tabs if currently active */
  _timelineRendered = "";
  _mapRendered = "";
  const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
  if (activeTab === "tournaments") renderTournamentTimeline();
  if (activeTab === "countries")   renderWorldMap();
  if (activeTab === "medals")      renderMedalsTab();
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
  const mKata = (DATA.kata.male || []).length;
  const fKata = (DATA.kata.female || []).length;
  const mCountries = new Set((DATA.karateka.male || []).map(k => k.Country)).size;
  const fCountries = new Set((DATA.karateka.female || []).map(k => k.Country)).size;
  const mText = `Male Kata · ${m.male_performances} Performances · ${mKata} Unique Kata · ${m.male_karateka} Athletes · 9 Tournaments · ${mCountries} Countries`;
  const fText = `Female Kata · ${m.female_performances} Performances · ${fKata} Unique Kata · ${m.female_karateka} Athletes · 9 Tournaments · ${fCountries} Countries`;
  const mBtn = document.querySelector('#global-gender .gender-btn[data-gender="male"]');
  const fBtn = document.querySelector('#global-gender .gender-btn[data-gender="female"]');
  if (mBtn) mBtn.title = mText;
  if (fBtn) fBtn.title = fText;
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
      clearCard("countries-card");
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
      ["kata-card", "karateka-card", "tournaments-card", "countries-card"].forEach(id => clearCard(id));
      _currentCard = null;
      _navHistory = []; _updateBackBtn();
      /* update URL so reload stays on the current tab */
      const tabId = btn.dataset.tab;
      history.replaceState(null, "", tabId === "welcome" ? window.location.pathname : `#tab/${tabId}`);
      if (btn.dataset.tab === "compare") renderCompareTab();
      if (btn.dataset.tab === "medals") renderMedalsTab();
      if (btn.dataset.tab === "tournaments") renderTournamentTimeline();
      if (btn.dataset.tab === "countries") renderWorldMap();
      const tabTableMap = {
        kata: "kata-table", karateka: "karateka-table",
        tournaments: "tournaments-table", countries: "countries-table",
        compare: "compare-shared-table"
      };
      const tid = tabTableMap[btn.dataset.tab];
      if (tid) setTimeout(() => splitTableScroll(tid), 0);
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

  const mTop10 = [...mkata].sort((a,b) => b.Performances - a.Performances).slice(0,10);
  const fTop10 = [...fkata].sort((a,b) => b.Performances - a.Performances).slice(0,10);

  const mKarAll = DATA.karateka.male || [];
  const fKarAll = DATA.karateka.female || [];
  const wtAvgKata = kataArr => {
    const scored = kataArr.filter(r => r.Mean_Score != null);
    const tw = scored.reduce((s,r) => s + r.Performances, 0);
    return tw ? scored.reduce((s,r) => s + r.Mean_Score * r.Performances, 0) / tw : null;
  };
  const mAvgScore = wtAvgKata(mkata);
  const fAvgScore = wtAvgKata(fkata);

  /* derived counts for findings */
  const trueSharedCount = mkata.length - mOnly.length;  // shared by set membership (before score filter)
  const mTop1 = mTop10[0];
  const fTop1 = fTop10[0];
  const mTotalPerfs = mKarAll.reduce((s,k) => s + (k.Performances||0), 0);
  const fTotalPerfs = fKarAll.reduce((s,k) => s + (k.Performances||0), 0);

  /* athlete spotlight */
  const minPerfs = 3;
  const mByScore = [...mKarAll].filter(k => k.Mean_Score != null && k.Performances >= minPerfs).sort((a,b) => b.Mean_Score - a.Mean_Score);
  const fByScore = [...fKarAll].filter(k => k.Mean_Score != null && k.Performances >= minPerfs).sort((a,b) => b.Mean_Score - a.Mean_Score);
  const mKakeru = mKarAll.find(k => k.Karateka === "Kakeru Nishiyama");
  const fGrace  = fKarAll.find(k => k.Karateka === "Grace Lau");
  const fMaho   = fKarAll.find(k => k.Karateka === "Maho Ono");
  const mNo2    = mByScore.find(k => k.Karateka !== "Kakeru Nishiyama");
  const medalCount = k => (k?.Medals || []).length;
  const goldCount  = k => (k?.Medals || []).filter(m => m.Place === 1).length;
  const fmtWR = k => k?.Win_Rate != null ? (k.Win_Rate * 100).toFixed(1) + "%" : "—";

  /* avg score comparison for shared kata */
  compareShared = mkata.filter(k => fSet.has(k.Kata) && k.Mean_Score != null).map(mk => {
    const fk = fkata.find(k => k.Kata === mk.Kata);
    return fk && fk.Mean_Score != null
      ? { Kata: mk.Kata, Male: mk.Mean_Score, Female: fk.Mean_Score, Diff: mk.Mean_Score - fk.Mean_Score }
      : null;
  }).filter(Boolean);
  compareIncomplete = mkata.filter(k => fSet.has(k.Kata)).filter(mk => {
    const fk = fkata.find(k => k.Kata === mk.Kata);
    return mk.Mean_Score == null || !fk || fk.Mean_Score == null;
  }).map(mk => {
    const fk = fkata.find(k => k.Kata === mk.Kata);
    return { Kata: mk.Kata, Male: mk.Mean_Score ?? null, Female: fk?.Mean_Score ?? null, Diff: null };
  });
  compareSortCol = "Diff"; compareSortDir = "desc";

  /* min/max findings */
  const fSortedByMin = [...fkata].filter(k => k.Min_Score != null).sort((a,b) => a.Min_Score - b.Min_Score);
  const mSortedByMin = [...mkata].filter(k => k.Min_Score != null).sort((a,b) => a.Min_Score - b.Min_Score);
  const fMin1 = fSortedByMin[0], fMin2 = fSortedByMin[1], fMin3 = fSortedByMin[2];
  const mMin1 = mSortedByMin[0];
  const fMaxKata = [...fkata].filter(k => k.Max_Score != null).sort((a,b) => b.Max_Score - a.Max_Score)[0];
  const mMaxKata = [...mkata].filter(k => k.Max_Score != null).sort((a,b) => b.Max_Score - a.Max_Score)[0];
  const fTop2 = fTop10[1];

  /* IQR-based outlier detection on individual performance scores */
  const iqrOutliers = (karArr) => {
    const entries = karArr.flatMap(k =>
      (k.Performances_Detail || []).filter(p => p.Avg_Score != null)
        .map(p => ({ score: p.Avg_Score, kata: p.Kata, karateka: k.Karateka }))
    );
    const scores = entries.map(e => e.score).sort((a,b) => a-b);
    const n = scores.length;
    const q1 = scores[Math.floor(n * 0.25)];
    const q3 = scores[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr;
    const hi = q3 + 1.5 * iqr;
    const low  = entries.filter(e => e.score < lo).sort((a,b) => a.score - b.score);
    const high = entries.filter(e => e.score > hi).sort((a,b) => a.score - b.score);
    return { low, high };
  };
  const mOut = iqrOutliers(mKarAll);
  const fOut = iqrOutliers(fKarAll);
  const fmtOutList = arr => arr.map(e => `<strong style="color:var(--text)">${e.score.toFixed(2)}</strong>`).join(", ");

  const sign = v => (v >= 0 ? "+" : "") + v.toFixed(3);
  const diffColor = v => v > 0 ? "#3a6e3a" : v < 0 ? "var(--red)" : "inherit";

  const top5Row = (k, i) => `<tr><td>${i+1}</td><td class="name-cell">${navLink("kata", k.Kata)}</td><td class="num">${k.Performances}</td><td class="num">${k.Mean_Score != null ? k.Mean_Score.toFixed(3) : "—"}</td></tr>`;
  const onlyPills = arr => arr.map(k => `<span class="pill nav-link" data-nav-type="kata" data-nav-name="${esc(k.Kata)}" style="cursor:pointer">${tierBadge(k.Kata_Tier)} ${esc(k.Kata)} <span class="pill-count">${k.Performances}×</span></span>`).join("");

  document.getElementById("compare-content").innerHTML = `
    <!-- Findings -->
    <div>
      <div class="finding-block" style="margin-top:0">
      <h3 class="compare-head">Findings</h3>
        <ul style="font-size:13px;color:var(--text-muted);line-height:2.2;padding-left:20px">
          <li>Male athletes performed <strong style="color:var(--text)">${mkata.length}</strong> unique kata across the 2024–25 season. Female athletes performed the same number: <strong style="color:var(--text)">${fkata.length}</strong> unique kata.</li>
          <li>Of those, <strong style="color:var(--text)">${trueSharedCount}</strong> kata were performed by both genders. <strong style="color:var(--text)">${mOnly.length}</strong> kata were performed exclusively by males, and <strong style="color:var(--text)">${fOnly.length}</strong> exclusively by females. See <em>Figure G-2</em> for the full breakdown and <em>Figure G-3</em> for the exclusive kata.</li>
          <li>The most performed kata among male athletes was <strong style="color:var(--text)">${mTop1 ? esc(mTop1.Kata) : "—"}</strong>${mTop1 ? ` with <strong style="color:var(--text)">${mTop1.Performances}</strong> performances` : ""}. For female athletes it was <strong style="color:var(--text)">${fTop1 ? esc(fTop1.Kata) : "—"}</strong>${fTop1 ? ` with <strong style="color:var(--text)">${fTop1.Performances}</strong> performances` : ""}${fTop1 && fTop2 ? `, significantly more than the second most performed female kata, <strong style="color:var(--text)">${esc(fTop2.Kata)}</strong>, at <strong style="color:var(--text)">${fTop2.Performances}</strong> performances. The male top kata are closer together (${mTop10.slice(0,3).map(k => k.Performances).join(" / ")} for the top three)` : ""}. See <em>Figure G-1</em> below.</li>
          <li>The average score given to any male kata performance was <strong style="color:var(--text)">${mAvgScore != null ? mAvgScore.toFixed(3) : "—"}</strong>. For female kata performances, it was <strong style="color:var(--text)">${fAvgScore != null ? fAvgScore.toFixed(3) : "—"}</strong>.</li>
          <li>Using the IQR method, male kata performance scores have <strong style="color:var(--text)">${mOut.low.length}</strong> low ${mOut.low.length === 1 ? "outlier" : "outliers"} and <strong style="color:var(--text)">${mOut.high.length}</strong> high ${mOut.high.length === 1 ? "outlier" : "outliers"}; female scores have <strong style="color:var(--text)">${fOut.low.length}</strong> low ${fOut.low.length === 1 ? "outlier" : "outliers"} and <strong style="color:var(--text)">${fOut.high.length}</strong> high ${fOut.high.length === 1 ? "outlier" : "outliers"}. The female dataset contains more extreme lows, while male scores cluster more tightly at the bottom but reach higher peaks at the top.</li>
          <li>The single highest score recorded in female competition was <strong style="color:var(--text)">${fMaxKata ? fMaxKata.Max_Score.toFixed(2) : "—"}</strong> (${fMaxKata ? esc(fMaxKata.Kata) : "—"}), nearly matching the male peak of <strong style="color:var(--text)">${mMaxKata ? mMaxKata.Max_Score.toFixed(2) : "—"}</strong> (${mMaxKata ? esc(mMaxKata.Kata) : "—"}).</li>
          <li>Across the season, male athletes recorded <strong style="color:var(--text)">${mTotalPerfs.toLocaleString()}</strong> total kata performances, compared to <strong style="color:var(--text)">${fTotalPerfs.toLocaleString()}</strong> for female athletes.</li>
        </ul>

        <p style="font-size:13px;font-weight:700;color:var(--text);margin:20px 0 6px">Athlete Spotlight</p>
        <ul style="font-size:13px;color:var(--text-muted);line-height:2.2;padding-left:20px">
          ${mKakeru ? `<li>Male kata competition was largely dominated by <strong style="color:var(--text)">Kakeru Nishiyama</strong> (Japan), who averaged <strong style="color:var(--text)">${mKakeru.Mean_Score?.toFixed(3) ?? "—"}</strong> across <strong style="color:var(--text)">${mKakeru.Performances}</strong> performances, with a win rate of <strong style="color:var(--text)">${fmtWR(mKakeru)}</strong> and <strong style="color:var(--text)">${medalCount(mKakeru)}</strong> medal${medalCount(mKakeru) !== 1 ? "s" : ""} on the season, including <strong style="color:var(--text)">${goldCount(mKakeru)}</strong> gold${goldCount(mKakeru) !== 1 ? "s" : ""}. The next-highest averaging male athlete${mNo2 ? `, <strong style="color:var(--text)">${esc(mNo2.Karateka)}</strong>, averaged <strong style="color:var(--text)">${mNo2.Mean_Score.toFixed(3)}</strong>, a gap of <strong style="color:var(--text)">${(mKakeru.Mean_Score - mNo2.Mean_Score).toFixed(3)}</strong> below Nishiyama` : " also posted a strong season"}.</li>` : ""}
          ${fGrace && fMaho ? `<li>Female kata saw a more competitive dynamic at the top, with <strong style="color:var(--text)">Grace Lau</strong> (Hong Kong) and <strong style="color:var(--text)">Maho Ono</strong> (Japan) as the two clear frontrunners. Lau averaged <strong style="color:var(--text)">${fGrace.Mean_Score?.toFixed(3) ?? "—"}</strong> across <strong style="color:var(--text)">${fGrace.Performances}</strong> performances (win rate: <strong style="color:var(--text)">${fmtWR(fGrace)}</strong>; <strong style="color:var(--text)">${medalCount(fGrace)}</strong> medal${medalCount(fGrace) !== 1 ? "s" : ""}, <strong style="color:var(--text)">${goldCount(fGrace)}</strong> gold${goldCount(fGrace) !== 1 ? "s" : ""}). Ono averaged <strong style="color:var(--text)">${fMaho.Mean_Score?.toFixed(3) ?? "—"}</strong> across <strong style="color:var(--text)">${fMaho.Performances}</strong> performances (win rate: <strong style="color:var(--text)">${fmtWR(fMaho)}</strong>; <strong style="color:var(--text)">${medalCount(fMaho)}</strong> medal${medalCount(fMaho) !== 1 ? "s" : ""}, <strong style="color:var(--text)">${goldCount(fMaho)}</strong> gold${goldCount(fMaho) !== 1 ? "s" : ""}). ${fGrace.Mean_Score != null && fMaho.Mean_Score != null ? `The gap between them was <strong style="color:var(--text)">${Math.abs(fGrace.Mean_Score - fMaho.Mean_Score).toFixed(3)}</strong> in average score, with ${fGrace.Mean_Score > fMaho.Mean_Score ? "Lau" : "Ono"} leading.` : ""}</li>` : ""}
        </ul>
      </div>
    </div>

    <!-- Top 10 side by side -->
    <div style="margin-top:64px">
      <span class="fig-label">Figure G-1</span>
      <div class="compare-grid">
        <div class="compare-col">
          <h3 class="compare-head">Top 10 Most Performed — Male</h3>
          <div class="table-wrapper">
            <table class="data-table"><thead><tr><th>#</th><th>Kata</th><th class="num">Performances</th><th class="num">Avg Score</th></tr></thead>
            <tbody>${mTop10.map((k,i) => top5Row(k,i)).join("")}</tbody></table>
          </div>
        </div>
        <div class="compare-col">
          <h3 class="compare-head">Top 10 Most Performed — Female</h3>
          <div class="table-wrapper">
            <table class="data-table"><thead><tr><th>#</th><th>Kata</th><th class="num">Performances</th><th class="num">Avg Score</th></tr></thead>
            <tbody>${fTop10.map((k,i) => top5Row(k,i)).join("")}</tbody></table>
          </div>
        </div>
      </div>
    </div>

    <!-- Kata status + exclusive kata (combined G-2) -->
    ${(() => {
      const mts = DATA.tier_summary.male   || {};
      const fts = DATA.tier_summary.female || {};
      const mAdvSet  = new Set(mts.adv_performed   || []);
      const fAdvSet  = new Set(fts.adv_performed   || []);
      const mIntSet  = new Set(mts.interm_performed || []);
      const fIntSet  = new Set(fts.interm_performed || []);
      const allAdv   = [...new Set([...(mts.adv_performed || []), ...(mts.adv_unperformed || [])])].sort();
      const allInt   = [...new Set([...(mts.interm_performed || []), ...(fts.interm_performed || [])])].sort();
      const mid      = Math.ceil(allAdv.length / 2);
      const pill = (inM, inF) => {
        if (inM && inF) return '<span class="ks-pill ks-pill-both">Both</span>';
        if (inM)        return '<span class="ks-pill ks-pill-male">Men only</span>';
        if (inF)        return '<span class="ks-pill ks-pill-female">Women only</span>';
        return '<span class="ks-pill ks-pill-none">Not performed</span>';
      };
      const rows = (list, mSet, fSet, offset = 0) => list.map((k, i) =>
        `<tr><td class="num row-num">${offset + i + 1}</td><td>${navLink("kata", k)}</td><td>${pill(mSet.has(k), fSet.has(k))}</td></tr>`
      ).join("");
      const col = (header, bodyRows) => `<div class="table-wrapper"><table class="data-table">
        <thead><tr><th class="num row-num">#</th><th>${header}</th><th>Status</th></tr></thead>
        <tbody>${bodyRows}</tbody></table></div>`;
      return `<div id="fig-g2" style="margin-top:64px">
        <span class="fig-label">Figure G-2</span>
        <h3 class="compare-head">Kata Performed by Gender</h3>
        <div class="ks-legend">
          <span class="ks-pill ks-pill-both">Both</span>
          <span class="ks-pill ks-pill-male">Men only</span>
          <span class="ks-pill ks-pill-female">Women only</span>
          <span class="ks-pill ks-pill-none">Not performed</span>
        </div>
        <div class="ks-three-col">
          ${col('Advanced', rows(allAdv.slice(0, mid), mAdvSet, fAdvSet, 0))}
          ${col('Advanced (cont.)', rows(allAdv.slice(mid), mAdvSet, fAdvSet, mid))}
          ${col('Intermediate (performed only)', rows(allInt, mIntSet, fIntSet, 0))}
        </div>
      </div>`;
    })()}

    <!-- Exclusive kata + Venn diagram -->
    <div style="margin-top:64px">
      <span class="fig-label">Figure G-3</span>
      <h3 class="compare-head">Exclusive Kata by Gender</h3>
      <p style="text-align:center;font-size:13px;color:var(--text-muted);margin:0 0 12px">Total unique kata performed: <strong style="color:var(--text)">${mOnly.length + fOnly.length + trueSharedCount}</strong></p>
      <svg viewBox="0 0 480 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;display:block;margin:0 auto 32px">
        <circle cx="185" cy="105" r="100" fill="#bfdbfe" fill-opacity="0.65" stroke="#2563eb" stroke-width="1.5"/>
        <circle cx="295" cy="105" r="100" fill="#e9d5ff" fill-opacity="0.65" stroke="#9333ea" stroke-width="1.5"/>
        <text x="135" y="98" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="#1e40af">Men only</text>
        <text x="135" y="128" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" font-weight="700" fill="#1e40af">${mOnly.length}</text>
        <text x="240" y="98" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="#374151">Both</text>
        <text x="240" y="128" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" font-weight="700" fill="#374151">${trueSharedCount}</text>
        <text x="345" y="98" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="#6b21a8">Women only</text>
        <text x="345" y="128" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" font-weight="700" fill="#6b21a8">${fOnly.length}</text>
      </svg>
      <div class="compare-grid">
        <div class="compare-col">
          <h3 class="compare-head">Performed by Males Only (${mOnly.length})</h3>
          ${mOnly.length ? `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th class="num row-num">#</th><th>Kata</th><th>Tier</th><th class="num">Performances</th></tr></thead>
            <tbody>${mOnly.map((k, i) => `<tr>
              <td class="num row-num">${i + 1}</td>
              <td class="name-cell">${navLink("kata", k.Kata)}</td>
              <td>${tierBadge(k.Kata_Tier)}</td>
              <td class="num">${k.Performances}</td>
            </tr>`).join("")}</tbody>
          </table></div>` : "<em style='color:var(--text-muted)'>None</em>"}
        </div>
        <div class="compare-col">
          <h3 class="compare-head">Performed by Females Only (${fOnly.length})</h3>
          ${fOnly.length ? `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th class="num row-num">#</th><th>Kata</th><th>Tier</th><th class="num">Performances</th></tr></thead>
            <tbody>${fOnly.map((k, i) => `<tr>
              <td class="num row-num">${i + 1}</td>
              <td class="name-cell">${navLink("kata", k.Kata)}</td>
              <td>${tierBadge(k.Kata_Tier)}</td>
              <td class="num">${k.Performances}</td>
            </tr>`).join("")}</tbody>
          </table></div>` : "<em style='color:var(--text-muted)'>None</em>"}
        </div>
      </div>
    </div>

    <!-- Avg score comparison -->
    <div style="margin-top:64px">
      <span class="fig-label">Figure G-4</span>
      <h3 class="compare-head">Average Score Comparison — Shared Kata (${compareShared.length + compareIncomplete.length})</h3>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Click any column header to sort. Diff = Male − Female. Green = males scored higher; red = females scored higher.</p>
      <div style="position:relative;height:${Math.max(300, compareShared.length * 22)}px;margin-bottom:24px">
        <canvas id="chart-compare-diff"></canvas>
      </div>
      <div class="table-wrapper table-wrapper--sticky">
        <table class="data-table" id="compare-shared-table">
          <thead><tr>
            <th class="num row-num">#</th>
            <th data-ccol="Kata"   style="cursor:pointer" onclick="sortCompareTable('Kata')">Kata</th>
            <th data-ccol="Male"   class="num" style="cursor:pointer" onclick="sortCompareTable('Male')">Male Avg</th>
            <th data-ccol="Female" class="num" style="cursor:pointer" onclick="sortCompareTable('Female')">Female Avg</th>
            <th data-ccol="Diff"   class="num" style="cursor:pointer" onclick="sortCompareTable('Diff')">Diff (M−F) ↓</th>
          </tr></thead>
          <tbody id="compare-shared-tbody"></tbody>
        </table>
      </div>
    </div>

    `;
  renderCompareSharedTable();
  renderCompareDiffChart();
}

function renderCompareDiffChart() {
  destroyChart("chart-compare-diff");
  const ctx = document.getElementById("chart-compare-diff"); if (!ctx) return;
  const sorted = [...compareShared].sort((a, b) => b.Diff - a.Diff);
  const bgColors = sorted.map(r => r.Diff >= 0 ? "rgba(58,110,58,0.8)" : RED);
  const bdColors = sorted.map(r => r.Diff >= 0 ? "rgba(40,85,40,1)"   : RED_BORDER);
  const diffLabelPlugin = {
    id: "diffLabels",
    afterDatasetsDraw(chart) {
      const c = chart.ctx;
      c.save();
      c.font = `9px ${CHART_FONT}`;
      c.textBaseline = "middle";
      const meta = chart.getDatasetMeta(0);
      sorted.forEach((row, i) => {
        const el = meta.data[i]; if (!el) return;
        if (row.Diff >= 0) {
          c.textAlign = "left"; c.fillStyle = "#3a6e3a";
          c.fillText(row.Kata, el.x + 5, el.y);
        } else {
          c.textAlign = "right"; c.fillStyle = "#c0392b";
          c.fillText(row.Kata, el.x - 5, el.y);
        }
      });
      c.restore();
    },
  };
  charts["chart-compare-diff"] = new Chart(ctx, {
    type: "bar",
    data: { labels: sorted.map(r => r.Kata), datasets: [{ data: sorted.map(r => r.Diff), backgroundColor: bgColors, borderColor: bdColors, borderWidth: 1, borderRadius: 3 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      layout: { padding: { left: 160, right: 160 } },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.raw >= 0 ? "+" : ""}${c.raw.toFixed(3)} (M ${(compareShared.find(r=>r.Kata===sorted[c.dataIndex]?.Kata)?.Male??0).toFixed(3)} / F ${(compareShared.find(r=>r.Kata===sorted[c.dataIndex]?.Kata)?.Female??0).toFixed(3)})` } },
        diffLabels: {},
      },
      scales: {
        x: { grid: { color: c => c.tick.value === 0 ? "rgba(0,0,0,0.75)" : GRID, lineWidth: c => c.tick.value === 0 ? 1.5 : 1 }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, title: { display: true, text: "Male Avg − Female Avg", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        y: { grid: { display: false }, ticks: { display: false } },
      },
    },
    plugins: [diffLabelPlugin],
  });
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
  const missingTip = gender => `title="No average score recorded for ${gender} performances of this kata"`;
  const diffTip = `title="Score differential not available — average score is missing for one gender"`;
  const incompleteRows = compareIncomplete.map((r, j) => `<tr>
    <td class="num row-num" style="color:var(--text-muted)">${sorted.length + j + 1}</td>
    <td class="name-cell">${navLink("kata", r.Kata)}</td>
    <td class="num">${r.Male != null ? r.Male.toFixed(3) : `<span style="color:var(--text-muted);cursor:help" ${missingTip("male")}>—</span>`}</td>
    <td class="num">${r.Female != null ? r.Female.toFixed(3) : `<span style="color:var(--text-muted);cursor:help" ${missingTip("female")}>—</span>`}</td>
    <td class="num"><span style="color:var(--text-muted);cursor:help" ${diffTip}>—</span></td>
  </tr>`).join("");
  tbody.innerHTML = sorted.map((r, i) => `<tr>
    <td class="num row-num">${i + 1}</td>
    <td class="name-cell">${navLink("kata", r.Kata)}</td>
    <td class="num">${r.Male.toFixed(3)}</td>
    <td class="num">${r.Female.toFixed(3)}</td>
    <td class="num" style="color:${diffColor(r.Diff)};font-weight:600">${sign(r.Diff)}</td>
  </tr>`).join("") + incompleteRows;
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

/* ── Sortable card tables ────────────────────────────────────────────────── */
const _cardSort = {};
const _cardData = {};

function _refreshCardTable(tableId) {
  const entry = _cardData[tableId]; if (!entry) return;
  const { rows, renderRow } = entry;
  const { col, dir } = _cardSort[tableId];
  const sorted = [...rows].sort((a, b) => {
    let av = a[col], bv = b[col];
    if (av == null) av = dir === "asc" ?  Infinity : -Infinity;
    if (bv == null) bv = dir === "asc" ?  Infinity : -Infinity;
    if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return dir === "asc" ? av - bv : bv - av;
  });
  const tbl = document.getElementById(tableId); if (!tbl) return;
  tbl.querySelectorAll("thead th[data-sort]").forEach(th => {
    th.textContent = th.dataset.sort === col
      ? th.dataset.label + (dir === "asc" ? " ↑" : " ↓")
      : th.dataset.label;
  });
  const tbody = tbl.querySelector("tbody");
  if (tbody) tbody.innerHTML = sorted.map((r, i) => renderRow(r, i)).join("");
}

function sortCardTable(tableId, col) {
  const s = _cardSort[tableId]; if (!s) return;
  const firstVal = (_cardData[tableId]?.rows ?? []).find(r => r[col] != null)?.[col];
  const isStr = typeof firstVal === "string";
  s.dir = s.col === col ? (s.dir === "asc" ? "desc" : "asc") : (isStr ? "asc" : "desc");
  s.col = col;
  _refreshCardTable(tableId);
}

function initCardTable(tableId, rows, defaultCol, defaultDir, renderRow) {
  _cardData[tableId] = { rows, renderRow };
  _cardSort[tableId] = { col: defaultCol, dir: defaultDir };
  _refreshCardTable(tableId);
  setTimeout(() => splitTableScroll(tableId), 0);
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
  if (!rows.length) {
    document.getElementById("kata-tbody").innerHTML = `<tr><td colspan="13" style="text-align:center;padding:32px;color:var(--text-muted)">No kata match "${esc(q)}"</td></tr>`;
    return;
  }
  document.getElementById("kata-tbody").innerHTML = rows.map((r, i) => `
    <tr data-kata="${esc(r.Kata)}">
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${navLink("kata", r.Kata)}</td>
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
  const avgRange = avg("Max_Score") != null && avg("Min_Score") != null ? fmt2(avg("Max_Score") - avg("Min_Score")) : "—";
  const diffDisp = avgDiff != null ? (avgDiff >= 0 ? "+" : "") + avgDiff.toFixed(3) : "—";
  const stb = document.getElementById("kata-summary-tbody"); if (stb) stb.innerHTML = `<tr>
    <td class="num row-num"></td>
    <td class="name-cell">Average Statistics Across All Kata</td>
    <td></td>
    <td class="num" title="Median performances per kata — half of all kata were performed more than this, half fewer">${medianPerfsKata ?? "—"}</td>
    <td class="num" title="Mean number of unique athletes who performed each kata">${fmt2(avg("Unique_Karateka"))}</td>
    <td class="num" title="Performance-weighted average score across all kata and performances">${fmt3((() => { const sp = allKata.filter(r => r.Mean_Score != null); const tw = sp.reduce((s,r) => s + r.Performances, 0); return tw ? sp.reduce((s,r) => s + r.Mean_Score * r.Performances, 0) / tw : null; })())}</td>
    <td class="num" title="Mean of each kata's median score">${fmt2(avg("Median_Score"))}</td>
    <td class="num" title="Absolute lowest score recorded for any kata this season">${fmt2(isFinite(absMin) ? absMin : null)}</td>
    <td class="num" title="Absolute highest score recorded for any kata this season">${fmt2(isFinite(absMax) ? absMax : null)}</td>
    <td class="num" title="Mean of each kata's range (Max − Min) — average spread of scores within a kata">${avgRange}</td>
    <td class="num" title="Mean standard deviation across all kata — average score consistency">${fmt3(avg("Std_Dev"))}</td>
    <td class="num" title="Weighted win rate across all kata — always near 50% since every match has a winner and a loser">${fmtPct(weightedWR)}</td>
    <td class="num" title="Mean score differential — how much kata scores deviate from their performers' personal averages, on average (kata avg score − athlete avg score)">${diffDisp}</td>
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
  const rkFig = (field, asc, tab, figId) => {
    const v = rankOf(field, asc);
    return v ? `<div class="stat-rank"><a href="#" onclick="switchToTab('${tab}');setTimeout(()=>document.getElementById('${figId}')?.scrollIntoView({behavior:'smooth',block:'start'}),80);return false;" style="color:var(--red);text-decoration:none;font-weight:700;font-size:13px" title="See Figure ${figId.replace('finding-','').toUpperCase()}">${v}</a></div>` : "";
  };

  const scoreMissing = r.Performances > 0 && r.Mean_Score == null;
  const dash = scoreMissing
    ? `<span title="Score missing" style="cursor:help">—</span>`
    : "—";
  const fmtS3 = v => v != null ? fmt3(v) : dash;
  const fmtS2 = v => v != null ? fmt2(v) : dash;

  /* country lookup for athlete table */
  const karCountry = Object.fromEntries((DATA.karateka[gender] || []).map(k => [k.Karateka, k.Country]));

  const athleteFlat = (r.All_Karateka || []).map(k => ({
    _name:    k.Karateka,
    _country: karCountry[k.Karateka] || "",
    Karateka:     k.Karateka,
    Country:      karCountry[k.Karateka] || "",
    Performances: k.Performances,
    Avg_Score:    k.Avg_Score,
  }));

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
    ${scoreMissing ? `<p style="font-size:12px;color:var(--text-muted);background:var(--bg);border:1px solid var(--border);border-left:3px solid var(--red);border-radius:var(--radius);padding:8px 12px;margin-bottom:12px">The score for this kata's performance${r.Performances === 1 ? "" : "s"} was not recorded and is missing from the dataset. Score-related statistics are unavailable and shown as —.</p>` : ""}
    <div class="card-stats">
      <div class="stat-box">
        <div class="stat-label">Performances</div><div class="stat-value">${r.Performances}</div>${rkFig('Performances', false, 'kata-findings', 'finding-k1')}
      </div>
      <div class="stat-box">
        <div class="stat-label">Athletes</div><div class="stat-value">${r.Unique_Karateka}</div>${rk('Unique_Karateka')}
      </div>
      <div class="stat-box">
        <div class="stat-label">Avg Score</div><div class="stat-value">${fmtS3(r.Mean_Score)}</div>${rkFig('Mean_Score', false, 'kata-findings', 'finding-k2')}
      </div>
      <div class="stat-box">
        <div class="stat-label">Median</div><div class="stat-value">${fmtS2(r.Median_Score)}</div>${rk('Median_Score')}
      </div>
      <div class="stat-box">
        <div class="stat-label">Min</div><div class="stat-value">${fmtS2(r.Min_Score)}</div>${rk('Min_Score')}
        ${minK ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Athlete: <strong>${navLink("karateka", minK)}</strong></div>` : ""}
      </div>
      <div class="stat-box">
        <div class="stat-label">Max</div><div class="stat-value">${fmtS2(r.Max_Score)}</div>${rk('Max_Score')}
        ${maxK ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Athlete: <strong>${navLink("karateka", maxK)}</strong></div>` : ""}
      </div>
      <div class="stat-box">
        <div class="stat-label">Std Dev</div><div class="stat-value">${fmtS3(r.Std_Dev)}</div>${rk('Std_Dev', true)}
      </div>
      <div class="stat-box">
        <div class="stat-label">Win Rate</div><div class="stat-value">${fmtPct(r.Win_Rate)}</div>${rkFig('Win_Rate', false, 'kata-findings', 'finding-k3')}
      </div>
      ${diffStat}
    </div>
    ${r.Mean_Score != null ? `
    <div class="card-section-title">Score Distribution</div>
    <div style="height:140px;position:relative;margin-bottom:14px"><canvas id="chart-kata-histogram"></canvas></div>` : ""}
    ${athleteFlat.length ? `
    <div class="card-section-title">All Athletes</div>
    <div class="card-table-wrap">
      <table class="data-table" id="card-kata-athletes">
        <thead><tr>
          <th class="num row-num">#</th>
          <th data-sort="Karateka" data-label="Karateka" style="cursor:pointer" onclick="sortCardTable('card-kata-athletes','Karateka')">Karateka</th>
          <th data-sort="Performances" data-label="Performances" class="num" style="cursor:pointer" onclick="sortCardTable('card-kata-athletes','Performances')">Performances</th>
          <th data-sort="Avg_Score" data-label="Avg Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-kata-athletes','Avg_Score')">Avg Score ↓</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>` : ""}`;
  if (athleteFlat.length) initCardTable("card-kata-athletes", athleteFlat, "Avg_Score", "desc",
    (k, i) => `<tr>
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${flagOf(k._country)} ${navLink("karateka", k.Karateka)}</td>
      <td class="num">${k.Performances}</td>
      <td class="num">${k.Avg_Score != null ? k.Avg_Score.toFixed(3) : dash}</td>
    </tr>`);
  document.getElementById("kata-card").classList.remove("hidden");
  _currentCard = { type: "kata", name: r.Kata };
  window.location.hash = `kata/${encodeURIComponent(r.Kata)}`;
  scrollToCard("kata-card");
  /* score histogram */
  const allScores = [];
  for (const k of (DATA.karateka[gender] || [])) {
    for (const p of (k.Performances_Detail || [])) {
      if (p.Kata === r.Kata && p.Avg_Score != null) allScores.push(p.Avg_Score);
    }
  }
  renderScoreHistogram("chart-kata-histogram", allScores, "_kataHistChart");
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
  if (!rows.length) {
    document.getElementById("karateka-tbody").innerHTML = `<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text-muted)">No athletes match "${esc(q)}"</td></tr>`;
    return;
  }
  document.getElementById("karateka-tbody").innerHTML = rows.map((r, i) => `
    <tr data-karateka="${esc(r.Karateka)}">
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${navLink("karateka", r.Karateka)}</td>
      <td>${flagOf(r.Country)} ${navLink("country", r.Country)}</td>
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
  const absRangeK = isFinite(absMinK) && isFinite(absMaxK) ? fmt2(absMaxK - absMinK) : "—";
  const kstb = document.getElementById("karateka-summary-tbody"); if (kstb) kstb.innerHTML = `<tr>
    <td class="num row-num"></td>
    <td class="name-cell">Average Statistics Across All Athletes</td>
    <td></td>
    <td></td>
    <td class="num" title="Median performances per athlete — half of all athletes competed more than this, half fewer">${medianPerfsKar ?? "—"}</td>
    <td class="num" title="Mean number of tournaments attended per athlete">${fmt2(avgK("Tournaments_Attended"))}</td>
    <td class="num" title="Mean of each athlete's average score — the overall average score across all athletes">${fmt2(avgK("Mean_Score"))}</td>
    <td class="num" title="Mean of each athlete's median score">${fmt2(avgK("Median_Score"))}</td>
    <td class="num" title="Absolute lowest score recorded by any athlete in any single performance this season">${fmt2(isFinite(absMinK) ? absMinK : null)}</td>
    <td class="num" title="Absolute highest score recorded by any athlete in any single performance this season">${fmt2(isFinite(absMaxK) ? absMaxK : null)}</td>
    <td class="num" title="Difference between the season's absolute highest and lowest scores">${absRangeK}</td>
    <td class="num" title="Weighted win rate across all athletes — always near 50% since every match has a winner and a loser">${fmtPct(wWRKar)}</td>
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
  const perfRows = perfs.map((p, i) => `
    <tr>
      <td class="num row-num">${i + 1}</td>
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
  const repertoireFlat = (r.Kata_Repertoire || []).map(k => {
    const kData = DATA.kata[gender]?.find(d => d.Kata === k.Kata);
    const winEntry = kataAvgMap[k.Kata];
    const avgScore = winEntry ? winEntry.sum / winEntry.n : null;
    const kWins = (r.Performances_Detail || []).filter(p => p.Kata === k.Kata && p.Won === true).length;
    const kPerfs = k.count;
    return {
      Kata:         k.Kata,
      Kata_Tier:    kData?.Kata_Tier || "",
      Performances: kPerfs,
      Avg_Score:    avgScore,
      Win_Rate:     kPerfs ? kWins / kPerfs : null,
      _tier:        kData ? tierBadge(kData.Kata_Tier) : "",
    };
  });
  const perfsFlat = perfs.map((p, i) => ({
    Tournament:  p.Tournament || "",
    Tourn_Order: TOURN_ORDER[p.Tournament] ?? 99,
    Round:       roundLabel[p.Round] || p.Round || "",
    Kata:        p.Kata || "",
    Avg_Score:   p.Avg_Score,
    Won_Sort:    p.Won === true ? "0_win" : p.Won === false ? "1_loss" : "2_none",
    Opponent:    p.Opponent || "",
    _won:        p.Won,
    _flag:       flagOf((TOURN_META[p.Tournament] || {}).country),
  }));

  /* medal count summary */
  const medalCounts = { 1: 0, 2: 0, 3: 0 };
  (r.Medals || []).forEach(m => medalCounts[m.Place] = (medalCounts[m.Place] || 0) + 1);
  const medalSummaryParts = [];
  if (medalCounts[1]) medalSummaryParts.push(`${medalCounts[1]}× Gold`);
  if (medalCounts[2]) medalSummaryParts.push(`${medalCounts[2]}× Silver`);
  if (medalCounts[3]) medalSummaryParts.push(`${medalCounts[3]}× Bronze`);

  /* rank among all karateka — competition-style (ties share same rank) */
  const karAll = DATA.karateka[gender] || [];
  const rkKFig = (field, asc, tab, figId) => {
    const vals  = karAll.filter(d => d[field] != null);
    const total = vals.length;
    const myVal = r[field];
    if (myVal == null || !total) return "";
    const better = vals.filter(d => asc ? d[field] < myVal : d[field] > myVal).length;
    const tied   = vals.filter(d => d[field] === myVal).length;
    const suffix = tied > 1 ? " (T)" : "";
    const v = `${better + 1}/${total}${suffix}`;
    return `<div class="stat-rank"><a href="#" onclick="switchToTab('${tab}');setTimeout(()=>document.getElementById('${figId}')?.scrollIntoView({behavior:'smooth',block:'start'}),80);return false;" style="color:var(--red);text-decoration:none;font-weight:700;font-size:13px" title="See Figure ${figId.replace('finding-','').toUpperCase()}">${v}</a></div>`;
  };
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
      <div class="stat-box"><div class="stat-label">Avg Score</div><div class="stat-value">${fmt2(r.Mean_Score)}</div>${rkKFig('Mean_Score', false, 'karateka-findings', 'finding-a1')}</div>
      <div class="stat-box"><div class="stat-label">Median</div><div class="stat-value">${fmt2(r.Median_Score)}</div>${rkK('Median_Score')}</div>
      <div class="stat-box"><div class="stat-label">Worst Score</div><div class="stat-value">${fmt2(r.Min_Score)}</div>${rkK('Min_Score', true)}${worstPerf ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Kata: <strong>${navLink("kata", worstPerf.Kata)}</strong></div>` : ""}</div>
      <div class="stat-box"><div class="stat-label">Best Score</div><div class="stat-value">${fmt2(r.Max_Score)}</div>${rkK('Max_Score')}${bestPerf ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Kata: <strong>${navLink("kata", bestPerf.Kata)}</strong></div>` : ""}</div>
      <div class="stat-box"><div class="stat-label">Win Rate</div><div class="stat-value">${fmtPct(r.Win_Rate)}</div>${rkKFig('Win_Rate', false, 'karateka-findings', 'finding-a2')}</div>
    </div>
    ${r.Medals && r.Medals.length ? `
    <div class="card-section-title">Medals</div>
    ${medalSummaryParts.length ? `<p style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px">${medalSummaryParts.join(" &nbsp;·&nbsp; ")}</p>` : ""}
    <div class="pill-list" style="margin-bottom:14px">
      ${r.Medals.map(m => `<span class="pill">${m.Place === 1 ? "🥇" : m.Place === 2 ? "🥈" : "🥉"} ${navLink("tournament", m.Tournament)}</span>`).join("")}
    </div>` : ""}
    ${r.Mean_Score != null ? `
    <div class="card-section-title">Score Distribution</div>
    <div style="height:140px;position:relative;margin-bottom:14px"><canvas id="chart-kar-histogram"></canvas></div>` : ""}
    ${repertoireFlat.length ? `
    <div class="card-section-title">Kata Repertoire</div>
    <div class="card-table-wrap" style="margin-bottom:14px">
      <table class="data-table" id="card-kar-repertoire">
        <thead><tr>
          <th class="num row-num">#</th>
          <th data-sort="Kata" data-label="Kata" style="cursor:pointer" onclick="sortCardTable('card-kar-repertoire','Kata')">Kata</th>
          <th data-sort="Performances" data-label="Performances" class="num" style="cursor:pointer" onclick="sortCardTable('card-kar-repertoire','Performances')">Performances ↓</th>
          <th data-sort="Avg_Score" data-label="Avg Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-kar-repertoire','Avg_Score')">Avg Score</th>
          <th data-sort="Win_Rate" data-label="Win Rate" class="num" style="cursor:pointer" onclick="sortCardTable('card-kar-repertoire','Win_Rate')">Win Rate</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>` : ""}
    ${perfsFlat.length ? `
    <div class="card-section-title">All Performances</div>
    <div class="card-table-wrap">
      <table class="data-table" id="card-kar-performances">
        <thead><tr>
          <th class="num row-num">#</th>
          <th data-sort="Tournament" data-label="Tournament" style="cursor:pointer" onclick="sortCardTable('card-kar-performances','Tournament')">Tournament</th>
          <th data-sort="Round" data-label="Round" style="cursor:pointer" onclick="sortCardTable('card-kar-performances','Round')">Round</th>
          <th data-sort="Kata" data-label="Kata" style="cursor:pointer" onclick="sortCardTable('card-kar-performances','Kata')">Kata</th>
          <th data-sort="Avg_Score" data-label="Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-kar-performances','Avg_Score')">Score</th>
          <th data-sort="Won_Sort" data-label="Result" class="num" style="cursor:pointer" onclick="sortCardTable('card-kar-performances','Won_Sort')">Result</th>
          <th data-sort="Opponent" data-label="Opponent" style="cursor:pointer" onclick="sortCardTable('card-kar-performances','Opponent')" title="Inferred 1v1 opponent based on score matching">Opponent</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>` : ""}`;
  if (repertoireFlat.length) initCardTable("card-kar-repertoire", repertoireFlat, "Performances", "desc",
    (k, i) => `<tr>
      <td class="num row-num">${i + 1}</td>
      <td>${k._tier} ${navLink("kata", k.Kata)}</td>
      <td class="num">${k.Performances}</td>
      <td class="num">${k.Avg_Score != null ? k.Avg_Score.toFixed(2) : "—"}</td>
      <td class="num">${k.Win_Rate != null ? fmtPct(k.Win_Rate) : "—"}</td>
    </tr>`);
  if (perfsFlat.length) initCardTable("card-kar-performances", perfsFlat, "Tourn_Order", "asc",
    (p, i) => `<tr>
      <td class="num row-num">${i + 1}</td>
      <td>${p._flag}${navLink("tournament", p.Tournament)}</td>
      <td>${esc(p.Round)}</td>
      <td class="name-cell">${navLink("kata", p.Kata)}</td>
      <td class="num">${p.Avg_Score != null ? p.Avg_Score.toFixed(2) : "—"}</td>
      <td class="num" style="color:${p._won ? "#3a6e3a" : p._won === false ? "var(--red)" : "inherit"};font-weight:600">${p._won == null ? "—" : p._won ? "Win" : "Loss"}</td>
      <td>${p.Opponent ? navLink("karateka", p.Opponent) : "—"}</td>
    </tr>`);
  document.getElementById("karateka-card").classList.remove("hidden");
  _currentCard = { type: "karateka", name: r.Karateka };
  window.location.hash = `karateka/${encodeURIComponent(r.Karateka)}`;
  scrollToCard("karateka-card");
  /* score histogram */
  const karScores = (r.Performances_Detail || []).map(p => p.Avg_Score).filter(s => s != null);
  renderScoreHistogram("chart-kar-histogram", karScores, "_karHistChart");

  /* common opponents — read directly from Opponent field in Performances_Detail */
  const opponents = {};
  for (const p of (r.Performances_Detail || [])) {
    if (!p.Opponent) continue;
    const oppName = p.Opponent;
    if (!opponents[oppName]) {
      const oppRow = (DATA.karateka[gender] || []).find(k => k.Karateka === oppName);
      opponents[oppName] = { Karateka: oppName, Country: oppRow?.Country || "", Meetings: 0, Wins: 0 };
    }
    opponents[oppName].Meetings++;
    if (p.Won === true) opponents[oppName].Wins++;
  }
  const oppFlat = Object.values(opponents)
    .filter(o => o.Meetings > 0)
    .map(o => ({ ...o, Win_Rate: o.Meetings > 0 ? o.Wins / o.Meetings : null }))
    .sort((a,b) => b.Meetings - a.Meetings)
  if (oppFlat.length) {
    const oppSection = document.createElement("div");
    oppSection.innerHTML = `
      <div class="card-section-title">All Opponents (${oppFlat.length})</div>
      <div class="card-table-wrap">
        <table class="data-table" id="card-kar-opponents">
          <thead><tr>
            <th class="num row-num" title="Rank by meetings">#</th>
            <th data-sort="Karateka" data-label="Opponent" style="cursor:pointer" onclick="sortCardTable('card-kar-opponents','Karateka')" title="Opponent's name and country">Opponent</th>
            <th data-sort="Meetings" data-label="Meetings" class="num" style="cursor:pointer" onclick="sortCardTable('card-kar-opponents','Meetings')" title="Number of rounds competed head-to-head in the same tournament round">Meetings ↓</th>
            <th data-sort="Wins" data-label="Wins" class="num" style="cursor:pointer" onclick="sortCardTable('card-kar-opponents','Wins')" title="Rounds won against this opponent">Wins vs.</th>
            <th data-sort="Win_Rate" data-label="Win Rate" class="num" style="cursor:pointer" onclick="sortCardTable('card-kar-opponents','Win_Rate')" title="Win rate against this opponent (Wins ÷ Meetings)">Win Rate</th>
          </tr></thead>
          <tbody></tbody>
        </table>
      </div>`;
    document.getElementById("karateka-card").appendChild(oppSection);
    initCardTable("card-kar-opponents", oppFlat, "Meetings", "desc",
      (o, i) => `<tr>
        <td class="num row-num">${i + 1}</td>
        <td class="name-cell">${flagOf(o.Country)} <a class="nav-link" data-nav-type="karateka" data-nav-name="${esc(o.Karateka)}">${esc(o.Karateka)}</a></td>
        <td class="num">${o.Meetings}</td>
        <td class="num">${o.Wins}</td>
        <td class="num">${o.Win_Rate != null ? fmtPct(o.Win_Rate) : "—"}</td>
      </tr>`);
  }
}

function showCountryCard(r, all) {
  const rkC = (field, asc = false) => {
    const vals  = all.filter(d => d[field] != null);
    const total = vals.length;
    const myVal = r[field];
    if (myVal == null || !total) return "";
    const better = vals.filter(d => asc ? d[field] < myVal : d[field] > myVal).length;
    const tied   = vals.filter(d => d[field] === myVal).length;
    const suffix = tied > 1 ? " (T)" : "";
    return `<div class="stat-rank">${better + 1}/${total}${suffix}</div>`;
  };

  const medals = r._medalsList || [];
  const sortedMedals = [...medals].sort((a, b) => (TOURN_ORDER[a.Tournament] ?? 99) - (TOURN_ORDER[b.Tournament] ?? 99) || a.Place - b.Place);
  const medalCounts = { 1: 0, 2: 0, 3: 0 };
  medals.forEach(m => medalCounts[m.Place] = (medalCounts[m.Place] || 0) + 1);
  const medalsByAthlete = {};
  sortedMedals.forEach(m => {
    if (!medalsByAthlete[m.Athlete]) medalsByAthlete[m.Athlete] = { Athlete: m.Athlete, Gold: 0, Silver: 0, Bronze: 0 };
    if (m.Place === 1) medalsByAthlete[m.Athlete].Gold++;
    else if (m.Place === 2) medalsByAthlete[m.Athlete].Silver++;
    else medalsByAthlete[m.Athlete].Bronze++;
  });
  const athleteMedalRows = Object.values(medalsByAthlete).sort((a, b) => b.Gold - a.Gold || b.Silver - a.Silver || b.Bronze - a.Bronze);
  const fmtMedalCell = a => [a.Gold ? `${a.Gold}x 🥇` : "", a.Silver ? `${a.Silver}x 🥈` : "", a.Bronze ? `${a.Bronze}x 🥉` : ""].filter(Boolean).join(", ");
  const medalSummaryParts = [];
  if (medalCounts[1]) medalSummaryParts.push(`${medalCounts[1]}× Gold`);
  if (medalCounts[2]) medalSummaryParts.push(`${medalCounts[2]}× Silver`);
  if (medalCounts[3]) medalSummaryParts.push(`${medalCounts[3]}× Bronze`);

  const athleteFlat2 = (r._athleteObjs || []).map(k => ({
    Karateka:     k.Karateka,
    Performances: k.Performances ?? 0,
    Avg_Score:    k.Mean_Score,
    Best_Score:   k.Max_Score,
    Win_Rate:     k.Win_Rate,
    Medals:       k.Medals?.length || 0,
    _medals:      k.Medals && k.Medals.length ? k.Medals.map(m => m.Place===1?"🥇":m.Place===2?"🥈":"🥉").join("") : "—",
  }));

  const kataFlat2 = Object.entries(r._kataMap || {}).map(([kata, count]) => {
    const kData = DATA.kata[gender]?.find(d => d.Kata === kata);
    const sc = r._kataScoreMap?.[kata];
    return { Kata: kata, Kata_Tier: kData?.Kata_Tier || "", Performances: count, Avg_Score: sc ? sc.sum / sc.n : null, _tier: kData ? tierBadge(kData.Kata_Tier) : "" };
  });

  document.getElementById("countries-card").innerHTML = `
    <button class="card-close-btn" onclick="document.getElementById('countries-card').classList.add('hidden')" title="Close">✕</button>
    <div class="card-header">
      <span class="card-title">${flagOf(r.Country)} ${esc(r.Country)}</span>
    </div>
    <div class="card-stats">
      <div class="stat-box"><div class="stat-label">Athletes</div><div class="stat-value">${r.Athletes}</div>${rkC('Athletes')}</div>
      <div class="stat-box"><div class="stat-label">Performances</div><div class="stat-value">${r.Performances}</div>${rkC('Performances')}</div>
      <div class="stat-box"><div class="stat-label">Tournaments</div><div class="stat-value">${r.Tournaments}</div>${rkC('Tournaments')}</div>
      <div class="stat-box"><div class="stat-label">Avg Score</div><div class="stat-value">${fmt2(r.Avg_Score)}</div>${rkC('Avg_Score')}</div>
      <div class="stat-box"><div class="stat-label">Best Score</div><div class="stat-value">${fmt2(r.Best_Score)}</div>${rkC('Best_Score')}</div>
      <div class="stat-box"><div class="stat-label">Win Rate</div><div class="stat-value">${fmtPct(r.Win_Rate)}</div>${rkC('Win_Rate')}</div>
      <div class="stat-box"><div class="stat-label">Medals</div><div class="stat-value">${r.Medals || 0}</div>${rkC('Medals')}</div>
    </div>
    ${medals.length ? `
    <div class="card-section-title">Medals</div>
    ${medalSummaryParts.length ? `<p style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px">${medalSummaryParts.join(" &nbsp;·&nbsp; ")}</p>` : ""}
    <div class="card-table-wrap" style="margin-bottom:14px">
      <div class="dt-scroll-body">
        <table class="data-table">
          <thead><tr>
            <th class="num row-num">#</th>
            <th>Athlete</th>
            <th>Medal(s)</th>
          </tr></thead>
          <tbody>
            ${athleteMedalRows.map((a, i) => `<tr>
              <td class="num row-num">${i + 1}</td>
              <td class="name-cell"><strong>${navLink("karateka", a.Athlete)}</strong></td>
              <td>${fmtMedalCell(a)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>` : ""}
    <div class="card-section-title">Athletes</div>
    <div class="card-table-wrap" style="margin-bottom:14px">
      <table class="data-table" id="card-country-athletes">
        <thead><tr>
          <th class="num row-num">#</th>
          <th data-sort="Karateka" data-label="Athlete" style="cursor:pointer" onclick="sortCardTable('card-country-athletes','Karateka')">Athlete</th>
          <th data-sort="Performances" data-label="Performances" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-athletes','Performances')">Performances</th>
          <th data-sort="Avg_Score" data-label="Avg Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-athletes','Avg_Score')">Avg Score ↓</th>
          <th data-sort="Best_Score" data-label="Best Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-athletes','Best_Score')">Best Score</th>
          <th data-sort="Win_Rate" data-label="Win Rate" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-athletes','Win_Rate')">Win Rate</th>
          <th data-sort="Medals" data-label="Medals" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-athletes','Medals')">Medals</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>
    ${kataFlat2.length ? `
    <div class="card-section-title">Kata Performed</div>
    <div class="card-table-wrap">
      <table class="data-table" id="card-country-kata">
        <thead><tr>
          <th class="num row-num">#</th>
          <th data-sort="Kata" data-label="Kata" style="cursor:pointer" onclick="sortCardTable('card-country-kata','Kata')">Kata</th>
          <th data-sort="Performances" data-label="Performances" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-kata','Performances')">Performances ↓</th>
          <th data-sort="Avg_Score" data-label="Avg Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-kata','Avg_Score')">Avg Score</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>` : ""}`;
  initCardTable("card-country-athletes", athleteFlat2, "Avg_Score", "desc",
    (k, i) => `<tr>
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${navLink("karateka", k.Karateka)}</td>
      <td class="num">${k.Performances}</td>
      <td class="num">${k.Avg_Score != null ? k.Avg_Score.toFixed(2) : "—"}</td>
      <td class="num">${k.Best_Score != null ? k.Best_Score.toFixed(2) : "—"}</td>
      <td class="num">${k.Win_Rate != null ? fmtPct(k.Win_Rate) : "—"}</td>
      <td class="num">${k._medals}</td>
    </tr>`);
  if (kataFlat2.length) initCardTable("card-country-kata", kataFlat2, "Performances", "desc",
    (k, i) => `<tr>
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${k._tier} ${navLink("kata", k.Kata)}</td>
      <td class="num">${k.Performances}</td>
      <td class="num">${k.Avg_Score != null ? k.Avg_Score.toFixed(3) : "—"}</td>
    </tr>`);

  /* tournaments attended */
  const tournSet = new Set();
  for (const k of (r._athleteObjs || [])) {
    for (const p of (k.Performances_Detail || [])) {
      if (p.Tournament) tournSet.add(p.Tournament);
    }
  }
  const tournFlat = [...tournSet].sort().map(t => {
    const meta = TOURN_META[t] || {};
    let scoreSum = 0, scoredN = 0, wins = 0, winN = 0;
    const athSent = new Set();
    for (const k of (r._athleteObjs || [])) {
      let appeared = false;
      for (const p of (k.Performances_Detail || [])) {
        if (p.Tournament === t) {
          appeared = true;
          if (p.Avg_Score != null) { scoreSum += p.Avg_Score; scoredN++; }
          if (p.Won != null) { wins += p.Won ? 1 : 0; winN++; }
        }
      }
      if (appeared) athSent.add(k.Karateka);
    }
    const medals = (r._medalsList || []).filter(m => m.Tournament === t);
    const gold   = medals.filter(m => m.Place === 1).length;
    const silver = medals.filter(m => m.Place === 2).length;
    const bronze = medals.filter(m => m.Place === 3).length;
    return {
      Tournament:    t,
      Athletes_Sent: athSent.size,
      Gold:   gold,
      Silver: silver,
      Bronze: bronze,
      _flag:     flagOf(meta.country),
      Avg_Score: scoredN ? scoreSum / scoredN : null,
      Win_Rate:  winN   ? wins / winN        : null,
    };
  });
  if (tournFlat.length) {
    const ts = document.createElement("div");
    ts.innerHTML = `
      <div class="card-section-title">Tournaments Attended (${tournFlat.length})</div>
      <div class="card-table-wrap">
        <table class="data-table" id="card-country-tournaments">
          <thead><tr>
            <th class="num row-num">#</th>
            <th data-sort="Tournament" data-label="Tournament" style="cursor:pointer" onclick="sortCardTable('card-country-tournaments','Tournament')">Tournament</th>
            <th data-sort="Athletes_Sent" data-label="Athletes Sent" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-tournaments','Athletes_Sent')">Athletes</th>
            <th data-sort="Gold" data-label="Gold" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-tournaments','Gold')">🥇</th>
            <th data-sort="Silver" data-label="Silver" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-tournaments','Silver')">🥈</th>
            <th data-sort="Bronze" data-label="Bronze" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-tournaments','Bronze')">🥉</th>
            <th data-sort="Avg_Score" data-label="Avg Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-tournaments','Avg_Score')">Avg Score</th>
            <th data-sort="Win_Rate" data-label="Win Rate" class="num" style="cursor:pointer" onclick="sortCardTable('card-country-tournaments','Win_Rate')">Win Rate</th>
          </tr></thead>
          <tbody></tbody>
        </table>
      </div>`;
    document.getElementById("countries-card").appendChild(ts);
    initCardTable("card-country-tournaments", tournFlat, "Tournament", "asc",
      (t, i) => `<tr>
        <td class="num row-num">${i + 1}</td>
        <td>${t._flag} ${navLink("tournament", t.Tournament)}</td>
        <td class="num">${t.Athletes_Sent || "—"}</td>
        <td class="num">${t.Gold   ? `${t.Gold}× 🥇`   : "—"}</td>
        <td class="num">${t.Silver ? `${t.Silver}× 🥈` : "—"}</td>
        <td class="num">${t.Bronze ? `${t.Bronze}× 🥉` : "—"}</td>
        <td class="num">${t.Avg_Score != null ? t.Avg_Score.toFixed(3) : "—"}</td>
        <td class="num">${t.Win_Rate != null ? fmtPct(t.Win_Rate) : "—"}</td>
      </tr>`);
  }
  _currentCard = { type: "country", name: r.Country };
  window.location.hash = `country/${encodeURIComponent(r.Country)}`;
  scrollToCard("countries-card");
  document.getElementById("countries-card").classList.remove("hidden");
}

/* ════════════════════════════════════════════════════════════════ TOURNAMENTS TAB */
function buildCountryStats() {
  const karAll = DATA.karateka[gender] || [];
  const map = {};
  for (const k of karAll) {
    const c = k.Country;
    if (!c) continue;
    if (!map[c]) map[c] = { Country: c, athleteObjs: [], performances: 0, tournaments: new Set(), scoreSum: 0, scoredPerfs: 0, wins: 0, winPerfs: 0, bestScore: -Infinity, golds: 0, silvers: 0, bronzes: 0, medalsList: [], kataMap: {}, kataScoreMap: {} };
    const m = map[c];
    m.athleteObjs.push(k);
    m.performances += k.Performances || 0;
    (k.Performances_Detail || []).forEach(p => { if (p.Tournament) m.tournaments.add(p.Tournament); });
    if (k.Mean_Score != null && k.Performances) { m.scoreSum += k.Mean_Score * k.Performances; m.scoredPerfs += k.Performances; }
    if (k.Win_Rate != null && k.Performances)   { m.wins += k.Win_Rate * k.Performances; m.winPerfs += k.Performances; }
    if (k.Max_Score != null && k.Max_Score > m.bestScore) m.bestScore = k.Max_Score;
    (k.Medals || []).forEach(med => {
      if (med.Place === 1) m.golds++;
      else if (med.Place === 2) m.silvers++;
      else m.bronzes++;
      m.medalsList.push({ ...med, Athlete: k.Karateka });
    });
    (k.Kata_Repertoire || []).forEach(kr => {
      m.kataMap[kr.Kata] = (m.kataMap[kr.Kata] || 0) + (kr.count || 0);
    });
    (k.Performances_Detail || []).forEach(p => {
      if (p.Kata && p.Avg_Score != null) {
        if (!m.kataScoreMap[p.Kata]) m.kataScoreMap[p.Kata] = { sum: 0, n: 0 };
        m.kataScoreMap[p.Kata].sum += p.Avg_Score;
        m.kataScoreMap[p.Kata].n++;
      }
    });
  }
  return Object.values(map).map(m => ({
    Country:      m.Country,
    Athletes:     m.athleteObjs.length,
    Performances: m.performances,
    Tournaments:  m.tournaments.size,
    Avg_Score:    m.scoredPerfs ? m.scoreSum / m.scoredPerfs : null,
    Best_Score:   isFinite(m.bestScore) ? m.bestScore : null,
    Win_Rate:     m.winPerfs ? m.wins / m.winPerfs : null,
    Medals:       m.golds + m.silvers + m.bronzes,
    _medals:      { gold: m.golds, silver: m.silvers, bronze: m.bronzes },
    _medalsList:  m.medalsList,
    _athleteObjs: m.athleteObjs,
    _kataMap:      m.kataMap,
    _kataScoreMap: m.kataScoreMap,
  }));
}

function renderCountriesTable() {
  const s = sortState.countries;
  const q = searchQuery.countries;
  const fullAll = buildCountryStats();
  const cMean = field => { const v = fullAll.map(r => r[field]).filter(x => x != null && isFinite(x)); return v.length ? v.reduce((s,x)=>s+x,0)/v.length : null; };
  const cWtAvg = (() => { const tp = fullAll.reduce((s,r)=>s+(r.Performances||0),0); const ts = fullAll.reduce((s,r)=>s+(r.Avg_Score!=null?r.Avg_Score*r.Performances:0),0); return tp ? ts/tp : null; })();
  const cWtWR  = (() => { const tp = fullAll.reduce((s,r)=>s+(r.Performances||0),0); const tw = fullAll.reduce((s,r)=>s+(r.Win_Rate!=null?r.Win_Rate*r.Performances:0),0); return tp ? tw/tp : null; })();
  const cBest  = fullAll.map(r => r.Best_Score).filter(x => x != null && isFinite(x)).reduce((m,v)=>Math.max(m,v), -Infinity);
  const cTotalMedals = fullAll.reduce((s,r) => s + (r.Medals || 0), 0);
  const cstb = document.getElementById("countries-summary-tbody"); if (cstb) cstb.innerHTML = `<tr>
    <td class="num row-num"></td>
    <td class="name-cell">Average Statistics Across All Countries</td>
    <td class="num" title="Mean number of athletes per country">${fmt2(cMean("Athletes"))}</td>
    <td class="num" title="Mean number of performances per country">${fmt2(cMean("Performances"))}</td>
    <td class="num" title="Mean number of tournaments attended per country">${fmt2(cMean("Tournaments"))}</td>
    <td class="num" title="Weighted average score across all countries and performances">${fmt2(cWtAvg)}</td>
    <td class="num" title="Single highest score recorded by any athlete from any country this season">${isFinite(cBest) ? fmt2(cBest) : "—"}</td>
    <td class="num" title="Weighted win rate across all countries — always near 50% since every match has a winner and a loser">${fmtPct(cWtWR)}</td>
    <td class="num" title="Total medals won across all countries this season">${cTotalMedals || "—"}</td>
  </tr>`;
  let all = fullAll;
  if (q) all = all.filter(r => r.Country.toLowerCase().includes(q));
  const rows = sortData(all, s.col, s.dir);
  if (!rows.length) {
    document.getElementById("countries-tbody").innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted)">No countries match "${esc(q)}"</td></tr>`;
    return;
  }
  document.getElementById("countries-tbody").innerHTML = rows.map((r, i) => `
    <tr data-country="${esc(r.Country)}" style="cursor:pointer">
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${flagOf(r.Country)} ${navLink("country", r.Country)}</td>
      <td class="num">${r.Athletes}</td>
      <td class="num">${r.Performances}</td>
      <td class="num">${r.Tournaments}</td>
      <td class="num">${fmt2(r.Avg_Score)}</td>
      <td class="num">${fmt2(r.Best_Score)}</td>
      <td class="num">${fmtPct(r.Win_Rate)}</td>
      <td class="num">${r._medals.gold ? "🥇".repeat(r._medals.gold) : ""}${r._medals.silver ? "🥈".repeat(r._medals.silver) : ""}${r._medals.bronze ? "🥉".repeat(r._medals.bronze) : ""}${!r.Medals ? "—" : ""}</td>
    </tr>`).join("");
  document.querySelectorAll("#countries-tbody tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const all = buildCountryStats();
      const row = all.find(r => r.Country === tr.dataset.country);
      if (row) { showCountryCard(row, all); highlightRow("countries-tbody", "data-country", row.Country); }
    });
  });
}

function renderTournamentsTable() {
  const s = sortState.tournaments;
  /* compute unique countries per tournament */
  const tournCountries = {};
  for (const k of (DATA.karateka[gender] || [])) {
    for (const p of (k.Performances_Detail || [])) {
      if (p.Tournament && k.Country) {
        if (!tournCountries[p.Tournament]) tournCountries[p.Tournament] = new Set();
        tournCountries[p.Tournament].add(k.Country);
      }
    }
  }
  const baseRows = DATA.tournaments.filter(r => r.Gender.toLowerCase() === gender).map(r => ({
    ...r,
    Unique_Countries: (tournCountries[r.Tournament]?.size ?? 0),
    Tourn_Order: TOURN_ORDER[r.Tournament] ?? 99,
  }));
  const tMean = field => { const v = baseRows.map(r => r[field]).filter(x => x != null); return v.length ? v.reduce((s,x)=>s+x,0)/v.length : null; };
  const tWtAvg = (() => { const tp = baseRows.reduce((s,r)=>s+(r.Total_Performances||0),0); const ts = baseRows.reduce((s,r)=>s+(r.Avg_Score!=null?r.Avg_Score*r.Total_Performances:0),0); return tp ? ts/tp : null; })();
  const tstb = document.getElementById("tourn-summary-tbody"); if (tstb) tstb.innerHTML = `<tr>
    <td class="num row-num"></td>
    <td class="name-cell">Average Statistics Across All Tournaments</td>
    <td class="num" title="Mean number of performances per tournament">${fmt2(tMean("Total_Performances"))}</td>
    <td class="num" title="Mean number of athletes per tournament">${fmt2(tMean("Unique_Karateka"))}</td>
    <td class="num" title="Mean number of unique kata performed per tournament">${fmt2(tMean("Unique_Kata"))}</td>
    <td class="num" title="Mean number of countries represented per tournament">${fmt2(tMean("Unique_Countries"))}</td>
    <td class="num" title="Weighted average score across all tournaments and performances">${tWtAvg != null ? tWtAvg.toFixed(3) : "—"}</td>
  </tr>`;
  const rows = sortData(baseRows, s.col, s.dir);
  const tmeta = t => TOURN_META[t] || {};
  document.getElementById("tournaments-tbody").innerHTML = rows.map((r, i) => `
    <tr data-tourn="${esc(r.Tournament)}" style="cursor:pointer">
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${flagOf(tmeta(r.Tournament).country)} ${navLink("tournament", r.Tournament)}</td>
      <td class="num">${r.Total_Performances}</td>
      <td class="num">${r.Unique_Karateka}</td>
      <td class="num">${r.Unique_Kata}</td>
      <td class="num">${r.Unique_Countries || "—"}</td>
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

  /* medalists */
  const medalists = [];
  for (const k of (DATA.karateka[gender] || [])) {
    for (const m of (k.Medals || [])) {
      if (m.Tournament === r.Tournament) medalists.push({ name: k.Karateka, country: k.Country, place: m.Place });
    }
  }
  medalists.sort((a, b) => a.place - b.place);
  const medalistHtml = medalists.length ? `
    <div class="card-section-title" style="margin-top:14px">Medalists</div>
    <div class="pill-list" style="margin-bottom:14px">${medalists.map(m => `<span class="pill">${m.place===1?"🥇":m.place===2?"🥈":"🥉"} ${flagOf(m.country)} <strong>${navLink("karateka", m.name)}</strong></span>`).join("")}</div>` : "";

  /* athletes — with tournament-specific stats */
  const athletes = (DATA.karateka[gender] || [])
    .filter(k => (k.Tournament_List || []).includes(r.Tournament))
    .sort((a, b) => a.Karateka.localeCompare(b.Karateka));

  /* collect per-athlete/kata/country stats for this tournament from Performances_Detail */
  const kataStats = {};   // kata → { count, scoreSum, scoredCount }
  const countryStats = {}; // country → { athletes: Set, scoreSum, scoredCount, wins, winCount }
  for (const k of athletes) {
    const tPerfs = (k.Performances_Detail || []).filter(p => p.Tournament === r.Tournament);
    k._tPerfs    = tPerfs.length;
    k._tScoreSum = 0; k._tScoredN = 0;
    for (const p of tPerfs) {
      if (p.Avg_Score != null) { k._tScoreSum += p.Avg_Score; k._tScoredN++; }
      if (p.Kata) {
        if (!kataStats[p.Kata]) kataStats[p.Kata] = { count: 0, scoreSum: 0, scoredCount: 0 };
        kataStats[p.Kata].count++;
        if (p.Avg_Score != null) { kataStats[p.Kata].scoreSum += p.Avg_Score; kataStats[p.Kata].scoredCount++; }
      }
      const c = k.Country;
      if (c) {
        if (!countryStats[c]) countryStats[c] = { athleteSet: new Set(), scoreSum: 0, scoredCount: 0, wins: 0, winCount: 0 };
        countryStats[c].athleteSet.add(k.Karateka);
        if (p.Avg_Score != null) { countryStats[c].scoreSum += p.Avg_Score; countryStats[c].scoredCount++; }
        if (p.Won != null) { countryStats[c].wins += p.Won ? 1 : 0; countryStats[c].winCount++; }
      }
    }
  }

  const kataLookup = Object.fromEntries((DATA.kata[gender] || []).map(d => [d.Kata, d]));

  const athleteFlat3 = athletes.map(k => ({
    Karateka:     k.Karateka,
    Country:      k.Country || "",
    Performances: k._tPerfs,
    Avg_Score:    k._tScoredN ? k._tScoreSum / k._tScoredN : null,
    _flag:        flagOf(k.Country),
  }));

  const kataArr = Object.entries(kataStats);
  const kataFlat3 = kataArr.map(([kata, ks]) => ({
    Kata:         kata,
    Kata_Tier:    kataLookup[kata]?.Kata_Tier || "",
    Performances: ks.count,
    Avg_Score:    ks.scoredCount ? ks.scoreSum / ks.scoredCount : null,
    _tier:        kataLookup[kata] ? tierBadge(kataLookup[kata].Kata_Tier) : "",
  }));

  const countryArr = Object.entries(countryStats);
  const countryFlat3 = countryArr.map(([country, cs]) => ({
    Country:   country,
    Athletes:  cs.athleteSet.size,
    Avg_Score: cs.scoredCount ? cs.scoreSum / cs.scoredCount : null,
    Win_Rate:  cs.winCount    ? cs.wins / cs.winCount        : null,
    _flag:     flagOf(country),
  }));

  /* missing data */
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
      <div class="stat-box"><div class="stat-label">Athletes</div><div class="stat-value">${athletes.length}</div></div>
      <div class="stat-box"><div class="stat-label">Unique Kata</div><div class="stat-value">${kataFlat3.length}</div></div>
      <div class="stat-box"><div class="stat-label">Countries</div><div class="stat-value">${countryFlat3.length}</div></div>
      <div class="stat-box"><div class="stat-label">Avg Score</div><div class="stat-value">${r.Avg_Score != null ? r.Avg_Score.toFixed(3) : "—"}</div></div>
    </div>
    ${medalistHtml}
    <div class="card-section-title">Athletes (${athletes.length})</div>
    <div class="card-table-wrap" style="margin-bottom:14px">
      <table class="data-table" id="card-tourn-athletes">
        <thead><tr>
          <th class="num row-num">#</th>
          <th data-sort="Karateka" data-label="Athlete" style="cursor:pointer" onclick="sortCardTable('card-tourn-athletes','Karateka')">Athlete</th>
          <th data-sort="Country" data-label="Country" style="cursor:pointer" onclick="sortCardTable('card-tourn-athletes','Country')">Country</th>
          <th data-sort="Performances" data-label="Performances" class="num" style="cursor:pointer" onclick="sortCardTable('card-tourn-athletes','Performances')">Performances</th>
          <th data-sort="Avg_Score" data-label="Avg Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-tourn-athletes','Avg_Score')">Avg Score</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>
    <div class="card-section-title">Kata Performed (${kataFlat3.length})</div>
    <div class="card-table-wrap" style="margin-bottom:14px">
      <table class="data-table" id="card-tourn-kata">
        <thead><tr>
          <th class="num row-num">#</th>
          <th data-sort="Kata" data-label="Kata" style="cursor:pointer" onclick="sortCardTable('card-tourn-kata','Kata')">Kata</th>
          <th data-sort="Performances" data-label="Performances" class="num" style="cursor:pointer" onclick="sortCardTable('card-tourn-kata','Performances')">Performances ↓</th>
          <th data-sort="Avg_Score" data-label="Avg Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-tourn-kata','Avg_Score')">Avg Score</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>
    <div class="card-section-title">Countries (${countryFlat3.length})</div>
    <div class="card-table-wrap" style="margin-bottom:14px">
      <table class="data-table" id="card-tourn-countries">
        <thead><tr>
          <th class="num row-num">#</th>
          <th data-sort="Country" data-label="Country" style="cursor:pointer" onclick="sortCardTable('card-tourn-countries','Country')">Country</th>
          <th data-sort="Athletes" data-label="Athletes" class="num" style="cursor:pointer" onclick="sortCardTable('card-tourn-countries','Athletes')">Athletes ↓</th>
          <th data-sort="Avg_Score" data-label="Avg Score" class="num" style="cursor:pointer" onclick="sortCardTable('card-tourn-countries','Avg_Score')">Avg Score</th>
          <th data-sort="Win_Rate" data-label="Win Rate" class="num" style="cursor:pointer" onclick="sortCardTable('card-tourn-countries','Win_Rate')">Win Rate</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    </div>
    ${missingHtml}`;
  initCardTable("card-tourn-athletes", athleteFlat3, "Karateka", "asc",
    (k, i) => `<tr>
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${k._flag} ${navLink("karateka", k.Karateka)}</td>
      <td>${navLink("country", k.Country)}</td>
      <td class="num">${k.Performances}</td>
      <td class="num">${k.Avg_Score != null ? k.Avg_Score.toFixed(3) : "—"}</td>
    </tr>`);
  initCardTable("card-tourn-kata", kataFlat3, "Performances", "desc",
    (k, i) => `<tr>
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${k._tier} ${navLink("kata", k.Kata)}</td>
      <td class="num">${k.Performances}</td>
      <td class="num">${k.Avg_Score != null ? k.Avg_Score.toFixed(3) : "—"}</td>
    </tr>`);
  initCardTable("card-tourn-countries", countryFlat3, "Athletes", "desc",
    (k, i) => `<tr>
      <td class="num row-num">${i + 1}</td>
      <td class="name-cell">${k._flag} ${navLink("country", k.Country)}</td>
      <td class="num">${k.Athletes}</td>
      <td class="num">${k.Avg_Score != null ? k.Avg_Score.toFixed(3) : "—"}</td>
      <td class="num">${k.Win_Rate != null ? fmtPct(k.Win_Rate) : "—"}</td>
    </tr>`);
  _currentCard = { type: "tournament", name: r.Tournament };
  window.location.hash = `tournament/${encodeURIComponent(r.Tournament)}`;
  scrollToCard("tournaments-card");
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

function makeCountryHBar(id, countries, athletes) {
  destroyChart(id);
  const ctx = document.getElementById(id); if (!ctx) return;
  const imgs = {};
  let pending = countries.length;
  countries.forEach(country => {
    const iso = ISO2[country]?.toLowerCase();
    if (!iso) { if (--pending <= 0 && charts[id]) charts[id].update(); return; }
    const img = new Image(20, 15);
    img.onload = () => { imgs[country] = img; if (--pending <= 0 && charts[id]) charts[id].update(); };
    img.onerror = () => { if (--pending <= 0 && charts[id]) charts[id].update(); };
    img.src = `https://flagcdn.com/20x15/${iso}.png`;
  });
  const flagPlugin = {
    id: "flagLabels",
    afterDraw(chart) {
      const yAxis = chart.scales.y;
      const c2d = chart.ctx;
      c2d.save();
      c2d.font = `11px ${CHART_FONT}`;
      c2d.textBaseline = "middle";
      c2d.fillStyle = "#1c1c18";
      countries.forEach((country, i) => {
        const y = yAxis.getPixelForTick(i);
        const img = imgs[country];
        const flagW = 20, flagH = 15, gap = 5;
        const rightEdge = yAxis.left - 8;
        const nameW = c2d.measureText(country).width;
        if (img && img.complete && img.naturalWidth > 0) {
          const startX = rightEdge - flagW - gap - nameW;
          c2d.drawImage(img, startX, y - flagH / 2, flagW, flagH);
          c2d.textAlign = "left";
          c2d.fillText(country, startX + flagW + gap, y);
        } else {
          c2d.textAlign = "right";
          c2d.fillText(country, rightEdge, y);
        }
      });
      c2d.restore();
    }
  };
  charts[id] = new Chart(ctx, {
    type: "bar",
    data: { labels: countries, datasets: [{ data: athletes, backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 3 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      layout: { padding: { left: 175 } },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c2 => ` ${c2.raw}` } } },
      scales: {
        x: { min: 0, grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 11 }, color: "#7a7060" }, title: { display: true, text: "Athletes", font: { family: CHART_FONT, size: 11 }, color: "#7a7060" } },
        y: { grid: { display: false }, ticks: { display: false } },
      },
    },
    plugins: [flagPlugin],
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
  const g = gender === "male" ? "male" : "female";
  const subEl = document.getElementById("kata-findings-subtitle");
  if (subEl) subEl.textContent = `Statistical breakdowns for all ${kata.length} kata performed by ${g} athletes across 9 tournaments in the 2024–25 WKF season.`;

  /* Findings section */
  const diffSorted  = [...kata].filter(r => r.Diff != null).sort((a,b) => a.Diff - b.Diff);
  const diffSortedD = [...diffSorted].slice().reverse();
  const wrSorted5   = [...kata].filter(r => r.Win_Rate != null && r.Performances >= 5).sort((a,b) => b.Win_Rate - a.Win_Rate);
  const lowestDiff  = diffSorted[0];
  const highestDiff = diffSortedD[0];
  const highestWR   = wrSorted5[0];
  const lowestWR    = wrSorted5[wrSorted5.length - 1];
  const scoredKata  = kata.filter(r => r.Mean_Score != null);
  const wtAvgAll    = (() => { const tw = scoredKata.reduce((s,r)=>s+r.Performances,0); return tw ? scoredKata.reduce((s,r)=>s+r.Mean_Score*r.Performances,0)/tw : null; })();
  const popSorted0  = [...kata].sort((a,b) => b.Performances - a.Performances);

  const kf = document.getElementById("kata-findings-text");
  if (kf) kf.innerHTML = `
    <div class="finding-block" style="margin-top:0">
      <h3 class="compare-head">Kata Findings</h3>
      <ul style="font-size:13px;color:var(--text-muted);line-height:2.2;padding-left:20px">
        <li>The overall performance-weighted average score for ${gender} kata this season was <strong style="color:var(--text)">${wtAvgAll != null ? wtAvgAll.toFixed(3) : "—"}</strong>.</li>
        <li>The most performed ${gender} kata was <strong style="color:var(--text)">${esc(popSorted0[0].Kata)}</strong> with <strong style="color:var(--text)">${popSorted0[0].Performances}</strong> performances. The second most performed was <strong style="color:var(--text)">${esc(popSorted0[1].Kata)}</strong> with <strong style="color:var(--text)">${popSorted0[1].Performances}</strong>. See <em>Figure K-1</em> for the full breakdown.</li>
        ${lowestDiff && highestDiff ? `<li>An interesting pattern emerges when comparing the <em>kata differential</em> (how much athletes score on a kata relative to their personal average) to win rate. <strong style="color:var(--text)">Shisochin</strong> had the lowest differential (<strong style="color:var(--text)">-0.225</strong>), meaning athletes performing it scored well below their personal average, so you would assume it has a low win rate. However, its win rate is the highest of any kata: <strong style="color:var(--text)">100.0%</strong>. Furthermore, you might assume that the kata with the highest differential, which is <strong style="color:var(--text)">Gankaku</strong> (<strong style="color:var(--text)">+0.084</strong>), would have a high win rate, yet its win rate was only <strong style="color:var(--text)">14.3%</strong>.</li>` : ""}
        ${lowestDiff && highestDiff ? `<li>This apparent contradiction reveals a key limitation of the data: the kata differential measures how an athlete scores on a kata <em>relative to their own average</em>, not relative to their opponent's score. ${esc(lowestDiff.Kata)}'s negative differential likely reflects that it is chosen predominantly by elite athletes whose personal averages are already very high — even scoring "below average" for them is competitive. ${esc(highestDiff.Kata)}'s high differential but low win rate suggests that the athletes who perform it score well in isolation, but face opponents who score even higher.</li>` : ""}
        ${gender === "male" ? `<li>Using the standard IQR method (scores below Q1 − 1.5×IQR or above Q3 + 1.5×IQR), male kata performance scores have <strong style="color:var(--text)">7</strong> low outliers: <strong style="color:var(--text)">6.98, 7.12, 7.16, 7.18, 7.20, 7.24, 7.24</strong> and <strong style="color:var(--text)">7</strong> high outliers: <strong style="color:var(--text)">9.02, 9.06, 9.10, 9.12, 9.14, 9.18, 9.28</strong>. Remarkably, all 7 of the high outliers were performed by Kakeru Nishiyama.</li>` : `<li>Using the standard IQR method (scores below Q1 − 1.5×IQR or above Q3 + 1.5×IQR), female kata scores have <strong style="color:var(--text)">4</strong> low outliers: <strong style="color:var(--text)">6.14, 6.20, 6.38, 6.98</strong> and <strong style="color:var(--text)">4</strong> high outliers: <strong style="color:var(--text)">8.88, 8.88, 8.96, 9.22</strong>.</li>`}
        <li>Win rate should be interpreted with caution: it reflects the outcomes of specific matchups and is influenced by opponent strength and bracket luck, not kata choice alone. See <em>Figure K-3</em> for win rates across all kata.</li>
        <li>Small sample sizes for rarely performed kata make their statistics unreliable. Kata with fewer than 5 performances may show extreme win rates or differentials simply due to limited data, and should not be over-interpreted.</li>
      </ul>
    </div>`;

  /* 1. Popularity */
  const popSorted = [...kata].sort((a, b) => b.Performances - a.Performances);
  const top1 = popSorted[0];
  const top5Perfs = popSorted.slice(0,10).reduce((s,r) => s + r.Performances, 0);
  const totalPerfsAll = DATA.meta[gender+"_performances"];
  document.getElementById("insight-popularity").textContent =
    `${top1.Kata} was the most performed ${gender === "male" ? "Male" : "Female"} kata with ${top1.Performances} performances across ${top1.Unique_Karateka} athletes. ` +
    `The top 5 kata accounted for ${top5Perfs} of ${totalPerfsAll}, or ${(top5Perfs/totalPerfsAll*100).toFixed(1)}% of, total performances.`;
  makeHBar("chart-popularity", popSorted.map(r => r.Kata), popSorted.map(r => r.Performances), "Performances", 0);

  /* 2. Avg Score */
  const scoreSorted = [...kata].filter(r => r.Mean_Score != null).sort((a, b) => b.Mean_Score - a.Mean_Score);
  const top1s = scoreSorted[0], bot1s = scoreSorted[scoreSorted.length - 1];
  const overallAvg = (() => { const sc = kata.filter(r => r.Mean_Score != null); const tw = sc.reduce((s,r)=>s+r.Performances,0); return tw ? sc.reduce((s,r)=>s+r.Mean_Score*r.Performances,0)/tw : null; })();
  document.getElementById("insight-avgscore").textContent =
    `${top1s.Kata} had the highest average score (${top1s.Mean_Score.toFixed(3)}); ` +
    `${bot1s.Kata} had the lowest (${bot1s.Mean_Score.toFixed(3)}). ` +
    `The overall ${gender} average across all performances was ${overallAvg != null ? overallAvg.toFixed(3) : "—"}.`;
  makeHBar("chart-avgscore", scoreSorted.map(r => r.Kata), scoreSorted.map(r => r.Mean_Score), "Average Score", 7.0, scoreSorted.map(r => r.Performances));

  /* 3. Win Rate */
  const winSorted = [...kata].filter(r => r.Win_Rate != null && r.Performances >= 5).sort((a, b) => b.Win_Rate - a.Win_Rate);
  document.getElementById("insight-winrate").textContent =
    `Win rates are heavily influenced by opponent strength and bracket luck — not kata choice alone. All kata with at least 5 performances are shown.`;
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
        borderWidth: 1.5, pointRadius: 4, pointHoverRadius: 6,
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
  const g = gender === "male" ? "Male" : "Female";
  const other = gender === "male" ? "Female" : "Male";
  document.getElementById("insight-performed").innerHTML =
    `Lists which Advanced and Intermediate kata were and were not performed during ${g} kata competition in the 2024–25 season. ` +
    `To compare which kata were performed by ${g} versus ${other} athletes, see <a href="#" onclick="switchToTab('compare');setTimeout(()=>{const el=document.getElementById('fig-g2');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},150);return false;" style="color:var(--red)">Figure G-2</a> in the Male vs. Female tab.`;
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
      borderWidth: 1.5, pointRadius: 4, pointHoverRadius: 6,
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
  const g = gender === "male" ? "male" : "female";
  const subElA = document.getElementById("athlete-findings-subtitle");
  if (subElA) subElA.textContent = `Rankings and country breakdowns for all ${kdata.length} ${g} athletes who competed across 9 tournaments in the 2024–25 WKF season.`;

  /* Findings section */
  const byScore5  = [...kdata].filter(k => k.Mean_Score != null && k.Performances >= 5).sort((a,b) => b.Mean_Score - a.Mean_Score);
  const byPerfs   = [...kdata].sort((a,b) => b.Performances - a.Performances);
  const byWR5     = [...kdata].filter(k => k.Win_Rate != null && k.Performances >= 5).sort((a,b) => b.Win_Rate - a.Win_Rate);
  const byCountry = [...countries].sort((a,b) => b.Athletes - a.Athletes);
  const top1k     = byScore5[0], top2k = byScore5[1];
  const topC      = byCountry[0], secC = byCountry[1];
  const af = document.getElementById("athlete-findings-text");
  if (af) af.innerHTML = `
    <div class="finding-block" style="margin-top:0">
      <h3 class="compare-head">Athlete Findings</h3>
      <ul style="font-size:13px;color:var(--text-muted);line-height:2.2;padding-left:20px">
        ${gender === "male" ? `
        <li>Male kata competition this season was largely dominated by <strong style="color:var(--text)">Kakeru Nishiyama</strong> (Japan), who led all male athletes with an average score of <strong style="color:var(--text)">${top1k ? top1k.Mean_Score.toFixed(3) : "—"}</strong> across <strong style="color:var(--text)">${top1k ? top1k.Performances : "—"}</strong> performances and a win rate of <strong style="color:var(--text)">${byWR5[0] && byWR5[0].Karateka === "Kakeru Nishiyama" ? (byWR5[0].Win_Rate*100).toFixed(1)+"%" : "—"}</strong>. No other male athlete came close in consistency; the second-highest averaging athlete (minimum 5 performances) was <strong style="color:var(--text)">${top2k ? esc(top2k.Karateka) : "—"}</strong> (${top2k ? esc(top2k.Country) : "—"}) at <strong style="color:var(--text)">${top2k ? top2k.Mean_Score.toFixed(3) : "—"}</strong>, a gap of <strong style="color:var(--text)">${top1k && top2k ? (top1k.Mean_Score - top2k.Mean_Score).toFixed(3) : "—"}</strong>. See <em>Figure A-1</em>.</li>
        <li>Japan dominated male kata representation with <strong style="color:var(--text)">${topC ? topC.Athletes : "—"}</strong> athletes, nearly double the next-largest contingent. Italy sent <strong style="color:var(--text)">${byCountry[1] ? byCountry[1].Athletes : "—"}</strong> athletes and Turkey sent <strong style="color:var(--text)">${byCountry[2] ? byCountry[2].Athletes : "—"}</strong>. See <em>Figure A-3</em> for the full country breakdown.</li>
        <li>The most active male athlete by total performances was <strong style="color:var(--text)">${byPerfs[0] ? esc(byPerfs[0].Karateka) : "—"}</strong> (${byPerfs[0] ? esc(byPerfs[0].Country) : "—"}) with <strong style="color:var(--text)">${byPerfs[0] ? byPerfs[0].Performances : "—"}</strong> performances, followed by <strong style="color:var(--text)">${byPerfs[1] ? esc(byPerfs[1].Karateka) : "—"}</strong> (${byPerfs[1] ? esc(byPerfs[1].Country) : "—"}) with <strong style="color:var(--text)">${byPerfs[1] ? byPerfs[1].Performances : "—"}</strong>.</li>
        ` : `
        <li>Female kata at the top level was defined by a close rivalry between two athletes: <strong style="color:var(--text)">Maho Ono</strong> (Japan) and <strong style="color:var(--text)">Grace Lau</strong> (Hong Kong). Ono led in average score (<strong style="color:var(--text)">${byScore5.find(k=>k.Karateka==="Maho Ono")?.Mean_Score.toFixed(3) ?? "—"}</strong> across <strong style="color:var(--text)">${byScore5.find(k=>k.Karateka==="Maho Ono")?.Performances ?? "—"}</strong> performances) while Lau led in win rate (<strong style="color:var(--text)">${byWR5.find(k=>k.Karateka==="Grace Lau") ? (byWR5.find(k=>k.Karateka==="Grace Lau").Win_Rate*100).toFixed(1)+"%" : "—"}</strong> across <strong style="color:var(--text)">${byScore5.find(k=>k.Karateka==="Grace Lau")?.Performances ?? "—"}</strong> performances). The gap in average score between them was <strong style="color:var(--text)">${byScore5.find(k=>k.Karateka==="Maho Ono") && byScore5.find(k=>k.Karateka==="Grace Lau") ? Math.abs(byScore5.find(k=>k.Karateka==="Maho Ono").Mean_Score - byScore5.find(k=>k.Karateka==="Grace Lau").Mean_Score).toFixed(3) : "—"}</strong>, an exceptionally tight margin at the highest level of competition. See <em>Figure A-1</em>.</li>
        <li>Japan dominated female kata representation with <strong style="color:var(--text)">${topC ? topC.Athletes : "—"}</strong> athletes. Egypt sent <strong style="color:var(--text)">${byCountry[1] ? byCountry[1].Athletes : "—"}</strong> and Italy sent <strong style="color:var(--text)">${byCountry[2] ? byCountry[2].Athletes : "—"}</strong>. See <em>Figure A-3</em>.</li>
        <li>The most active female athlete by total performances was <strong style="color:var(--text)">${byPerfs[0] ? esc(byPerfs[0].Karateka) : "—"}</strong> (${byPerfs[0] ? esc(byPerfs[0].Country) : "—"}) with <strong style="color:var(--text)">${byPerfs[0] ? byPerfs[0].Performances : "—"}</strong> performances, followed by <strong style="color:var(--text)">${byPerfs[1] ? esc(byPerfs[1].Karateka) : "—"}</strong> (${byPerfs[1] ? esc(byPerfs[1].Country) : "—"}) with <strong style="color:var(--text)">${byPerfs[1] ? byPerfs[1].Performances : "—"}</strong>.</li>
        `}
        <li>Win rate reflects match outcomes against specific opponents and is shaped by bracket draw, not kata choice or athlete skill alone. See <em>Figure A-2</em>.</li>
      </ul>
    </div>`;

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
    `Win rates reflect match outcomes against specific opponents and are shaped by bracket draw and athlete skill — not kata choice alone. Athletes with at least 5 performances are shown.`;
  makeWinRateHBar("chart-k-winrate", kWinSorted.map(r => r.Karateka), kWinSorted.map(r => +(r.Win_Rate*100).toFixed(1)));

  /* 9. Countries */
  const topCountries = countries.filter(r => r.Athletes >= 2).slice(0, 15);
  const multiCountries = countries.filter(r => r.Athletes >= 2);
  document.getElementById("insight-country").textContent =
    topCountries[0]
      ? `${countries.length} countries sent ${gender} kata athletes this season; ${multiCountries.length} sent 2 or more. ${topCountries[0].Country} sent the most with ${topCountries[0].Athletes} competitors.`
      : "";
  makeCountryHBar("chart-country", topCountries.map(r => r.Country), topCountries.map(r => r.Athletes));
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

/* ══════════════════════════════════════════════════════ BACK BUTTON */
function setupBackButton() {
  const btn = document.getElementById("nav-back-btn");
  if (!btn) return;
  btn.style.display = "none";
  btn.addEventListener("click", _navBack);
}

/* ══════════════════════════════════════════════════════ DEEP LINK */
function parseDeepLink() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;
  const parts = hash.split("/");
  if (parts[0] === "tab" && parts[1]) {
    switchToTab(parts[1]);
    return;
  }
  const type = parts[0];
  const name = parts.slice(1).map(decodeURIComponent).join("/");
  if (!name) return;
  const typeToTab = { kata: "kata", karateka: "karateka", tournament: "tournaments", country: "countries" };
  const tab = typeToTab[type];
  if (!tab) return;
  switchToTab(tab);
  setTimeout(() => {
    if (type === "kata") {
      const row = DATA.kata[gender].find(r => r.Kata === name);
      if (row) { showKataCard(row); highlightRow("kata-tbody", "data-kata", name); }
    } else if (type === "karateka") {
      const row = DATA.karateka[gender].find(r => r.Karateka === name);
      if (row) { showKaratekaCard(row); highlightRow("karateka-tbody", "data-karateka", name); }
    } else if (type === "tournament") {
      const row = (DATA.tournaments || []).find(r => r.Tournament === name);
      if (row) showTournamentCard(row);
    } else if (type === "country") {
      const all = buildCountryStats();
      const row = all.find(r => r.Country === name);
      if (row) { showCountryCard(row, all); highlightRow("countries-tbody", "data-country", name); }
    }
  }, 100);
}

/* ══════════════════════════════════════════════════════ GLOBAL SEARCH */
function setupGlobalSearch() {
  const input = document.getElementById("global-search");
  const dropdown = document.getElementById("global-search-dropdown");
  if (!input || !dropdown) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q || q.length < 2) { dropdown.style.display = "none"; return; }
    const results = [];

    /* kata */
    (DATA.kata[gender] || []).filter(r => r.Kata.toLowerCase().includes(q)).slice(0, 5)
      .forEach(r => results.push({ type: "kata", name: r.Kata, sub: `${r.Kata_Tier || ""} · ${r.Performances} performances` }));

    /* karateka */
    (DATA.karateka[gender] || []).filter(r => r.Karateka.toLowerCase().includes(q)).slice(0, 5)
      .forEach(r => results.push({ type: "karateka", name: r.Karateka, sub: `${r.Country} · ${r.Performances} performances` }));

    /* countries */
    buildCountryStats().filter(r => r.Country.toLowerCase().includes(q)).slice(0, 3)
      .forEach(r => results.push({ type: "country", name: r.Country, sub: `${r.Athletes} athletes` }));

    /* tournaments */
    (DATA.tournaments || []).filter(r => r.Tournament.toLowerCase().includes(q) && r.Gender.toLowerCase() === gender).slice(0, 3)
      .forEach(r => results.push({ type: "tournament", name: r.Tournament, sub: `${r.Total_Performances} performances` }));

    if (!results.length) {
      dropdown.innerHTML = `<div class="gsd-empty">No results for "${esc(q)}"</div>`;
      dropdown.style.display = "block";
      return;
    }

    const groupLabels = { kata: "Kata", karateka: "Athletes", country: "Countries", tournament: "Tournaments" };
    const grouped = {};
    results.forEach(r => { if (!grouped[r.type]) grouped[r.type] = []; grouped[r.type].push(r); });
    let html = "";
    for (const [type, items] of Object.entries(grouped)) {
      html += `<div class="gsd-group-label">${groupLabels[type]}</div>`;
      items.forEach(item => {
        html += `<div class="gsd-item" data-type="${esc(item.type)}" data-name="${esc(item.name)}">
          <span class="gsd-name">${esc(item.name)}</span>
          <span class="gsd-sub">${esc(item.sub)}</span>
        </div>`;
      });
    }
    dropdown.innerHTML = html;
    dropdown.style.display = "block";
  });

  dropdown.addEventListener("click", e => {
    const item = e.target.closest(".gsd-item");
    if (!item) return;
    input.value = "";
    dropdown.style.display = "none";
    confirmNav(item.dataset.type, item.dataset.name);
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".global-search-wrap")) dropdown.style.display = "none";
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Escape") { dropdown.style.display = "none"; input.blur(); }
  });
}

/* ══════════════════════════════════════════════════════ SCORE HISTOGRAM */
function renderScoreHistogram(canvasId, scores, chartKey) {
  if (_kataHistChart && chartKey === "_kataHistChart") { _kataHistChart.destroy(); _kataHistChart = null; }
  if (_karHistChart  && chartKey === "_karHistChart")  { _karHistChart.destroy();  _karHistChart  = null; }
  const ctx = document.getElementById(canvasId); if (!ctx || !scores.length) return;
  /* build bins of width 0.1 from floor to ceil of data */
  const BIN_W = 0.1;
  const minV = Math.floor(scores.reduce((m,v)=>Math.min(m,v), Infinity) / BIN_W) * BIN_W;
  const maxV = Math.ceil( scores.reduce((m,v)=>Math.max(m,v), -Infinity) / BIN_W) * BIN_W;
  const bins = [];
  for (let b = minV; b < maxV + BIN_W/2; b = +(b + BIN_W).toFixed(2)) {
    const lo = b, hi = +(b + BIN_W).toFixed(2);
    bins.push({ lo, hi, count: scores.filter(s => s >= lo && s < hi).length });
  }
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: bins.map(b => b.lo.toFixed(1)),
      datasets: [{ data: bins.map(b => b.count), backgroundColor: RED, borderColor: RED_BORDER, borderWidth: 1, borderRadius: 2 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { title: i => `${bins[i[0].dataIndex].lo.toFixed(2)} – ${bins[i[0].dataIndex].hi.toFixed(2)}`, label: c => ` ${c.raw} performance${c.raw !== 1 ? "s" : ""}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: CHART_FONT, size: 10 }, color: "#7a7060" }, title: { display: true, text: "Score", font: { family: CHART_FONT, size: 10 }, color: "#7a7060" } },
        y: { grid: { color: GRID }, ticks: { font: { family: CHART_FONT, size: 10 }, color: "#7a7060", stepSize: 1 } },
      },
    },
  });
  if (chartKey === "_kataHistChart") _kataHistChart = chart;
  else _karHistChart = chart;
}

/* ══════════════════════════════════════════════════════ MEDALS TAB */
function _buildMedalRows(g) {
  const medalMap = {};
  for (const k of (DATA.karateka[g] || [])) {
    const c = k.Country;
    if (!c) continue;
    if (!medalMap[c]) medalMap[c] = { Country: c, Gold: 0, Silver: 0, Bronze: 0 };
    for (const m of (k.Medals || [])) {
      if (m.Place === 1) medalMap[c].Gold++;
      else if (m.Place === 2) medalMap[c].Silver++;
      else medalMap[c].Bronze++;
    }
  }
  return Object.values(medalMap)
    .filter(r => r.Gold + r.Silver + r.Bronze > 0)
    .map(r => ({ ...r, Total: r.Gold + r.Silver + r.Bronze }))
    .sort((a,b) => b.Gold - a.Gold || b.Silver - a.Silver || b.Bronze - a.Bronze || a.Country.localeCompare(b.Country));
}

let _medalSort = { male: { col: "Gold", dir: "desc" }, female: { col: "Gold", dir: "desc" } };

function sortMedalTable(g, col) {
  const s = _medalSort[g];
  if (s.col === col) s.dir = s.dir === "desc" ? "asc" : "desc";
  else { s.col = col; s.dir = "desc"; }
  _renderMedalBody(g);
}

function _renderMedalBody(g) {
  const s = _medalSort[g];
  let rows = _buildMedalRows(g);
  rows = rows.sort((a, b) => {
    const av = a[s.col], bv = b[s.col];
    if (typeof av === "string") return s.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return s.dir === "asc" ? av - bv : bv - av;
  }).map((r, i) => ({ ...r, _rank: i + 1 }));
  const tbody = document.getElementById(`medals-tbody-${g}`);
  if (!tbody) return;
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td class="num row-num">${r._rank}</td>
      <td>${flagOf(r.Country)} ${navLink("country", r.Country)}</td>
      <td class="num" style="font-weight:${r.Gold ? 700 : 400}">${r.Gold || "—"}</td>
      <td class="num" style="font-weight:${r.Silver ? 700 : 400}">${r.Silver || "—"}</td>
      <td class="num" style="font-weight:${r.Bronze ? 700 : 400}">${r.Bronze || "—"}</td>
      <td class="num" style="font-weight:700">${r.Gold + r.Silver + r.Bronze}</td>
    </tr>`).join("");
}

function _medalTableHTML(g, label) {
  return `
    <div>
      <h3 class="compare-head" style="margin-bottom:10px">${label}</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr>
            <th class="num row-num" style="cursor:pointer" onclick="sortMedalTable('${g}','_rank')">#</th>
            <th style="cursor:pointer;min-width:140px" onclick="sortMedalTable('${g}','Country')">Country</th>
            <th class="num" style="cursor:pointer" onclick="sortMedalTable('${g}','Gold')">🥇</th>
            <th class="num" style="cursor:pointer" onclick="sortMedalTable('${g}','Silver')">🥈</th>
            <th class="num" style="cursor:pointer" onclick="sortMedalTable('${g}','Bronze')">🥉</th>
            <th class="num" style="cursor:pointer" onclick="sortMedalTable('${g}','Total')">Total</th>
          </tr></thead>
          <tbody id="medals-tbody-${g}"></tbody>
        </table>
      </div>
    </div>`;
}

function renderMedalsTab() {
  const el = document.getElementById("medals-content");
  if (!el || el.dataset.built) return;
  el.dataset.built = "1";
  el.innerHTML = `<div class="medals-two-col">${_medalTableHTML("male","Male Kata Medals by Country")}${_medalTableHTML("female","Female Kata Medals by Country")}</div>`;
  _renderMedalBody("male");
  _renderMedalBody("female");
}

/* ══════════════════════════════════════════════════════ TOURNAMENT TIMELINE */
/* Shared timeline rendering core. tournNames = array of unique tournament name strings.
   onChipClick(tournName) is called when a chip is clicked. */
function _buildTimelineHTML(tournNames) {
  const MON = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
  const monthIdx = name => {
    const d = (TOURN_META[name] || {}).date || "";
    const m = d.match(/([A-Z][a-z]{2}).*?(\d{4})/);
    if (!m) return null;
    return (parseInt(m[2]) - 2024) * 12 + (MON[m[1]] ?? 0);
  };

  const FIRST = 0, LAST = 22;
  const pct = idx => ((idx - FIRST) / (LAST - FIRST) * 100).toFixed(2);

  const positioned = tournNames
    .map(name => ({ name, idx: monthIdx(name) }))
    .filter(x => x.idx !== null)
    .sort((a, b) => a.idx - b.idx);

  const PROX = 2, NUM_ROWS = 3;
  const rowLast = new Array(NUM_ROWS).fill(-Infinity);
  const rows = positioned.map(({ idx }) => {
    let assigned = -1;
    for (let r = 0; r < NUM_ROWS; r++) {
      if (idx - rowLast[r] > PROX) { assigned = r; break; }
    }
    if (assigned === -1) assigned = rowLast.indexOf(Math.min(...rowLast));
    rowLast[assigned] = idx;
    return assigned;
  });

  const ticks = [];
  for (let i = FIRST; i <= LAST; i += 3) {
    const yr = 2024 + Math.floor(i / 12);
    const mon = i % 12;
    ticks.push({ i, label: mon === 0 ? `${Object.keys(MON)[mon]} ${yr}` : Object.keys(MON)[mon] });
  }
  if (!ticks.find(t => t.i === LAST)) {
    const yr = 2024 + Math.floor(LAST / 12);
    ticks.push({ i: LAST, label: `${Object.keys(MON)[LAST % 12]} ${yr}` });
  }

  const AXIS = 140, H = 210, CHIP_H = 32;
  const rowOffsets = [44, 82, 120];

  let html = `<div class="tl-real" style="height:${H}px;position:relative;width:88%;margin:0 auto">`;
  html += `<div style="position:absolute;left:0;right:0;top:${AXIS}px;height:3px;background:#b0a090"></div>`;
  ticks.forEach(({ i, label }) => {
    const p = pct(i);
    html += `<div style="position:absolute;left:${p}%;top:${AXIS - 5}px;width:1px;height:12px;background:#b0a090;transform:translateX(-50%)"></div>`;
    html += `<div style="position:absolute;left:${p}%;top:${AXIS + 14}px;font-size:12px;color:var(--text-muted);transform:translateX(-50%);white-space:nowrap">${label}</div>`;
  });
  positioned.forEach(({ name, idx }, i) => {
    const meta = TOURN_META[name] || {};
    const p = pct(idx);
    const chipTop = AXIS - rowOffsets[rows[i]];
    const connTop = chipTop + CHIP_H;
    const connH   = AXIS - connTop;
    html += `<button class="tl-chip-real" data-tourn="${esc(name)}" style="position:absolute;left:${p}%;top:${chipTop}px;transform:translateX(-50%)">${flagOf(meta.country)} ${esc(name)}</button>`;
    if (connH > 0) html += `<div style="position:absolute;left:${p}%;top:${connTop}px;width:1px;height:${connH}px;background:#b0a090;transform:translateX(-50%)"></div>`;
  });
  html += `</div>`;
  return html;
}

function renderTournamentTimeline() {
  const wrap = document.getElementById("tourn-timeline-wrap");
  if (!wrap) return;
  const key = gender;
  if (_timelineRendered === key && wrap.children.length) return;
  _timelineRendered = key;

  const names = DATA.tournaments
    .filter(r => r.Gender.toLowerCase() === gender)
    .map(r => r.Tournament);
  wrap.innerHTML = _buildTimelineHTML(names);

  wrap.querySelectorAll(".tl-chip-real").forEach(btn => {
    btn.addEventListener("click", () => {
      const row = DATA.tournaments.find(r => r.Tournament === btn.dataset.tourn && r.Gender.toLowerCase() === gender);
      if (row) showTournamentCard(row);
    });
  });
}

function initHowToCards() {
  document.querySelectorAll(".how-to-card").forEach(card => {
    const body = card.querySelector(".how-to-body");
    if (!body) return;
    const title = body.querySelector("strong");
    if (!title) return;

    /* wrap title + toggle in a header row */
    const header = document.createElement("div");
    header.className = "how-to-header";
    const toggle = document.createElement("span");
    toggle.className = "how-to-toggle";
    toggle.textContent = "+";
    title.parentNode.insertBefore(header, title);
    header.appendChild(title);
    header.appendChild(toggle);

    /* collect siblings after header, separating q from detail paragraphs */
    const siblings = [];
    while (header.nextSibling) siblings.push(header.nextSibling);

    const detail = document.createElement("div");
    detail.className = "how-to-detail";
    let qEl = null;
    siblings.forEach(el => {
      if (el.classList && el.classList.contains("how-to-q")) {
        qEl = el;
      } else {
        detail.appendChild(el);
      }
    });

    /* question stays visible outside detail; content paragraphs are hidden */
    body.appendChild(detail);
    if (qEl) body.appendChild(qEl);

    /* toggle on card click */
    card.addEventListener("click", () => {
      card.classList.toggle("open");
    });
  });
}

function renderWelcomeTimeline() {
  const wrap = document.getElementById("welcome-timeline-wrap");
  if (!wrap || wrap.children.length) return;

  /* Deduplicate: same 9 tournaments appear for both genders */
  const seen = new Set();
  const names = DATA.tournaments.map(r => r.Tournament).filter(n => seen.has(n) ? false : (seen.add(n), true));
  wrap.innerHTML = _buildTimelineHTML(names);

  wrap.querySelectorAll(".tl-chip-real").forEach(btn => {
    btn.addEventListener("click", () => {
      const tourn = btn.dataset.tourn;
      switchToTab("tournaments");
      setTimeout(() => {
        const row = DATA.tournaments.find(r => r.Tournament === tourn && r.Gender.toLowerCase() === gender);
        if (row) { showTournamentCard(row); highlightRow("tourn-table", row.Tournament, "Tournament"); }
      }, 80);
    });
  });
}

/* ══════════════════════════════════════════════════════ WORLD MAP */
function renderWorldMap() {
  const wrap = document.getElementById("world-map-wrap");
  if (!wrap) return;
  const key = gender;
  if (_mapRendered === key && wrap.querySelector("svg")) return;
  _mapRendered = key;

  /* athlete counts per country */
  const countryStats = buildCountryStats();
  const athleteMap = {};
  countryStats.forEach(r => { athleteMap[r.Country] = r.Athletes; });
  const maxAthletes = Math.max(...Object.values(athleteMap), 1);

  /* name mapping from topojson country names → our DATA.countries names */
  const NAME_MAP = {
    "United States of America": "USA",
    "United Kingdom": "England",
    "Republic of Korea": "South Korea",
    "Iran (Islamic Republic of)": "Iran",
    "Taiwan": "Taiwan",
    "Hong Kong S.A.R.": "Hong Kong",
    "United Arab Emirates": "UAE",
    "Czech Republic": "Czech Republic",
    "Slovakia": "Slovakia",
    "Montenegro": "Montenegro",
  };
  const resolve = name => NAME_MAP[name] || name;

  wrap.innerHTML = `<h3 class="compare-head" style="margin-bottom:8px">Athletes per Country — ${gender === "male" ? "Male" : "Female"}</h3><div id="world-map-svg-wrap" style="width:80%;margin:0 auto;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);overflow:hidden"></div>`;
  const svgWrap = document.getElementById("world-map-svg-wrap");
  const tooltip = document.getElementById("map-tooltip");

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(r => r.json())
    .then(world => {
      const countries = topojson.feature(world, world.objects.countries);
      const w = svgWrap.getBoundingClientRect().width || 700;
      const h = Math.round(w * 0.5);
      const proj = d3.geoNaturalEarth1().scale(w / 6.28).translate([w / 2, h / 2]);
      const path = d3.geoPath(proj);

      /* log scale: 1 athlete → light pink, max athletes → very dark red.
         Log compresses the low end less than sqrt, making 5–10 athletes
         visually much darker than 1–3. */
      const logScale = d3.scaleLog()
        .domain([1, Math.max(maxAthletes, 2)])
        .range([0.08, 1])
        .clamp(true);
      const color = n => n ? d3.interpolateRgb("#f5c0c0", "#700f0f")(logScale(n)) : "#e8dcc8";

      const svg = d3.create("svg").attr("viewBox", `0 0 ${w} ${h}`).style("width","100%").style("height","auto");

      svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => color(athleteMap[resolve(d.properties.name)] || 0))
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.3)
        .style("cursor", d => {
          const name = resolve(d.properties.name);
          return athleteMap[name] ? "pointer" : "default";
        })
        .on("mousemove", (event, d) => {
          const name = resolve(d.properties.name);
          const n = athleteMap[name];
          if (!tooltip) return;
          tooltip.style.display = "block";
          tooltip.style.left = (event.clientX + 12) + "px";
          tooltip.style.top  = (event.clientY - 28) + "px";
          tooltip.innerHTML = n
            ? `<strong>${esc(name)}</strong> · ${n} athlete${n !== 1 ? "s" : ""}`
            : `<span style="color:var(--text-muted)">${esc(name)}</span>`;
        })
        .on("mouseleave", () => { if (tooltip) tooltip.style.display = "none"; })
        .on("click", (event, d) => {
          const name = resolve(d.properties.name);
          if (athleteMap[name]) confirmNav("country", name);
        });

      svgWrap.appendChild(svg.node());
    })
    .catch(() => {
      svgWrap.innerHTML = `<p style="padding:24px;color:var(--text-muted);font-size:13px">Could not load world map.</p>`;
    });
}
