/* ════════════════════════════════════════════════════════════════════════════
   Internationalization (i18n) — English (default) / Japanese
   Loaded before app.js, so I18N / applyI18n / t share global scope with app.js.

   - Static markup: add data-i18n / data-i18n-title / data-i18n-ph to elements.
     English is captured from the original DOM; Japanese comes from I18N[key].jp.
   - JS-generated strings: call t(key) — entries carry both en and jp.
   ════════════════════════════════════════════════════════════════════════════ */

const I18N = {
  /* ── Tabs / nav ── */
  "tab.welcome":  { en: "Home", jp: "ホーム" },
  "tab.kata":     { en: "Kata", jp: "型" },
  "tab.athletes": { en: "Athletes", jp: "選手" },
  "tab.tournaments": { en: "Tournaments", jp: "大会" },
  "tab.countries": { en: "Countries", jp: "国" },
  "tab.medals":   { en: "Medals", jp: "メダル" },
  "tab.kataFindings": { en: "Kata Analysis", jp: "型の分析" },
  "tab.athleteFindings": { en: "Athlete Analysis", jp: "選手の分析" },
  "tab.compare":  { en: "Male vs. Female", jp: "男子 vs 女子" },
  "tab.notes":    { en: "Notes", jp: "注記" },
  "tab.about":    { en: "About", jp: "概要" },
  "tab.references": { en: "References", jp: "参考資料" },
  "btn.back":     { en: "← Back", jp: "← 戻る" },
  "toggle.male":  { en: "Male", jp: "男子" },
  "toggle.female": { en: "Female", jp: "女子" },

  /* ── Navigation confirmation modal ── */
  "nav.cancel":   { en: "Cancel", jp: "キャンセル" },
  "nav.go":       { en: "Go", jp: "移動" },

  /* ── Search placeholders ── */
  "ph.globalSearch": { en: "Search Kata, Athletes, Tournaments, Countries, etc.", jp: "型・選手・大会・国などを検索…" },
  "ph.searchKata":   { en: "Search kata…", jp: "型を検索…" },
  "ph.searchAthletes": { en: "Search athletes…", jp: "選手を検索…" },
  "ph.searchCountries": { en: "Search countries…", jp: "国を検索…" },

  /* ── Header ── */
  "site.title": { en: "2024–25 WKF Season — Kata Analysis", jp: "2024–25 WKFシーズン — 型分析" },

  /* ── Welcome ── */
  "welcome.heading": { en: "Welcome!", jp: "ようこそ！" },
  "welcome.intro": {
    en: "This site presents a statistical analysis of all kata performances recorded during the <strong>nine Tier 1 tournaments in the 2024–25 WKF season</strong>, covering both the <strong>Male and Female Kata</strong> categories.",
    jp: "本サイトは、<strong>2024–25 WKFシーズンの9つのTier 1大会</strong>で記録された全ての型演武に関する統計分析を、<strong>男子型・女子型</strong>の両カテゴリーにわたって紹介します。"
  },
  "welcome.introBasics": {
    en: "If you are unfamiliar with kata competition, see \"Kata Competition Basics\" below for a brief breakdown.",
    jp: "型競技になじみのない方は、下の「型競技の基礎」で簡単な説明をご覧ください。"
  },
  "welcome.timelineTitle": { en: "2024–25 Season Timeline", jp: "2024–25 シーズンの日程" },
  "welcome.timelineSub": { en: "Click any tournament to explore its results.", jp: "大会をクリックすると結果を見られます。" },
  "welcome.basicsTitle": { en: "Kata Competition Basics", jp: "型競技の基礎" },
  "welcome.basicsHint": { en: "Click to open.", jp: "クリックして開く" },
  "welcome.basicsP1": {
    en: "Two athletes compete in a <strong>head-to-head match</strong>. One performs their kata first, then the next athlete performs. Each judge on a <strong>panel of seven</strong> assigns a score from 0–10. The <strong>highest and lowest scores are discarded</strong>; the <strong>remaining five are averaged</strong> to produce the final score. Refer to the linked YouTube video at the bottom of the Home page for an example.",
    jp: "2人の選手が<strong>直接対戦</strong>します。まず一方が型を演武し、続いてもう一方が演武します。<strong>7人の審判</strong>が0〜10点で採点し、<strong>最高点と最低点を除いた</strong><strong>残り5点の平均</strong>が最終スコアとなります。演武の例については、ホームページ下部にリンクされたYouTube動画をご覧ください。"
  },
  "welcome.basicsP2": {
    en: "At Tier 1 tournaments, athletes are split into <strong>eight groups of four competitors each</strong> (if there are fewer than 32 total competitors, certain groups will have only three athletes). Each group runs a <strong>round robin</strong> between all competitors, and the athlete with the <strong>most wins advances to the bracket stage</strong>. In the bracket stage, the eight group winners are placed into an <strong>8-person single-elimination bracket</strong> and compete in three rounds until the bracket concludes. After the bracket concludes, two <strong>repechage</strong> (“second-chance”) matches are held: athletes who were eliminated earlier by the two finalists get another chance and compete for the <strong>two bronze medals</strong> (4 athletes total).",
    jp: "Tier 1大会では、選手は<strong>4名ずつ8つの組</strong>に分けられます（出場者が32名未満の場合、一部の組は3名になります）。各組で<strong>総当たり戦</strong>を行い、<strong>最も勝ち数の多い選手が決勝トーナメントに進みます</strong>。決勝トーナメントでは、各組の勝者8名が<strong>8人制のシングルエリミネーション方式のトーナメント</strong>に入り、3回戦を戦って優勝が決まります。トーナメント終了後には<strong>敗者復活戦（レペチャージ）</strong>が2試合行われます。これは「敗者復活」の一戦で、決勝に進んだ2名の選手に途中で敗れた選手たちが、もう一度チャンスを得て<strong>2つの銅メダル</strong>をかけて争います（計4名）。"
  },
  "welcome.basicsP3": {
    en: "At the World Championships, the <strong>top two athletes from each group</strong> progressed to the bracket stage, resulting in a <strong>16-person single-elimination bracket</strong>.",
    jp: "世界選手権では、<strong>各組の上位2名</strong>が決勝トーナメントに進み、<strong>16人制のシングルエリミネーション方式のトーナメント</strong>となりました。"
  },
  "welcome.howToTitle": { en: "How to Use This Site", jp: "本サイトの使い方" },

  /* ── How-to group labels ── */
  "howto.group.func": { en: "Functionalities", jp: "機能" },
  "howto.group.data": { en: "Data Tabs", jp: "データタブ" },
  "howto.group.findings": { en: "Findings Tabs", jp: "分析タブ" },
  "howto.group.reference": { en: "Reference", jp: "参考" },

  /* ── Section titles ── */
  "title.compare": { en: "Male vs. Female Kata: Season Comparison", jp: "男子 vs 女子の型：シーズン比較" },
  "compare.sub": {
    en: "This tab compares both genders simultaneously and is not affected by the Male / Female toggle.",
    jp: "このタブは男女を同時に比較するもので、男子／女子の切り替えの影響を受けません。"
  },
  "title.references": { en: "References", jp: "参考資料" },

  /* ── Findings figure titles ── */
  "fig.kataPopularity": { en: "Kata Popularity", jp: "型の人気" },
  "fig.kataAvgScore": { en: "Kata Average Score", jp: "型の平均スコア" },
  "fig.kataWinRate": { en: "Kata Win Rate", jp: "型の勝率" },
  "fig.perfVsScore": { en: "Performances vs. Average Score", jp: "演武数 vs 平均スコア" },
  "fig.kataVsAthleteAvg": { en: "Kata Score vs. Athlete's Average", jp: "型のスコア vs 選手の平均" },
  "fig.stddev": { en: "Standard Deviation of Kata Scores vs. Number of Performers", jp: "型スコアの標準偏差 vs 演武者数" },
  "fig.avgByTournament": { en: "Average Score by Tournament", jp: "大会別の平均スコア" },
  "fig.tierBreakdown": { en: "Kata Tier Breakdown", jp: "型の階級別内訳" },
  "fig.tierCounts": { en: "Kata Tier Counts", jp: "型の階級別カウント" },
  "fig.performedByTier": { en: "Performed & Unperformed Kata by Tier", jp: "階級別の演武済み・未演武の型" },
  "fig.top20Avg": { en: "Top 20 Athletes by Average Score", jp: "平均スコア上位20選手" },
  "fig.top20WinRate": { en: "Top 20 Athletes by Win Rate", jp: "勝率上位20選手" },
  "fig.athletesByCountry": { en: "Athletes by Country", jp: "国別の選手数" },

  /* ── Table column headers (shared) ── */
  "col.kata": { en: "Kata", jp: "型" },
  "col.tier": { en: "Tier", jp: "階級" },
  "col.performances": { en: "Performances", jp: "演武数" },
  "col.athletes": { en: "Athletes", jp: "選手数" },
  "col.avgScore": { en: "Avg Score", jp: "平均スコア" },
  "col.median": { en: "Median", jp: "中央値" },
  "col.min": { en: "Min", jp: "最小" },
  "col.max": { en: "Max", jp: "最大" },
  "col.range": { en: "Range", jp: "レンジ" },
  "col.stdDev": { en: "Std Dev", jp: "標準偏差" },
  "col.winRate": { en: "Win Rate", jp: "勝率" },
  "col.scoreDifferential": { en: "Score Differential", jp: "スコア差" },
  "col.athlete": { en: "Athlete", jp: "選手" },
  "col.country": { en: "Country", jp: "国" },
  "col.medals": { en: "Medals", jp: "メダル" },
  "col.tournaments": { en: "Tournaments", jp: "大会数" },
  "col.differential": { en: "Differential", jp: "差（差分）" },
  "col.tournament": { en: "Tournament", jp: "大会" },
  "col.uniqueKata": { en: "Unique Kata", jp: "型数" },
  "col.countries": { en: "Countries", jp: "国数" },
  "col.bestScore": { en: "Best Score", jp: "最高スコア" },
  "col.metric": { en: "Metric", jp: "項目" },
  "col.count": { en: "Count", jp: "件数" },
  "col.percent": { en: "Percent", jp: "割合" },
  "col.diffVsAthleteAvg": { en: "Diff vs Athlete Avg", jp: "選手平均との差" },
  "col.uniquePerformers": { en: "Unique Performers", jp: "演武者数" },
  "col.scoreStdDev": { en: "Score Std Dev", jp: "スコア標準偏差" },
  "col.kataInTier": { en: "Kata in Tier", jp: "階級内の型数" },
  "col.kataPerformed": { en: "Kata Performed", jp: "演武された型" },
  "col.kataUnperformed": { en: "Kata Unperformed", jp: "未演武の型" },
  "lbl.male": { en: "Male", jp: "男子" },
  "lbl.female": { en: "Female", jp: "女子" },

  /* ── Table header tooltips ── */
  "tip.kataName": { jp: "型の名称" },
  "tip.tier": { jp: "技術的難易度による分類：上級または中級" },
  "tip.kataPerf": { jp: "今シーズンこの型が演武された総回数" },
  "tip.kataAthletes": { jp: "この型を演武した選手の人数" },
  "tip.kataAvg": { jp: "この型の全演武の平均スコア" },
  "tip.kataMedian": { jp: "全演武をスコア順に並べたときの中央のスコア" },
  "tip.kataMin": { jp: "この型で記録された最低スコア" },
  "tip.kataMax": { jp: "この型で記録された最高スコア" },
  "tip.kataRange": { jp: "最高スコア − 最低スコア。この型のスコアの幅" },
  "tip.kataStd": { jp: "スコアの安定性。低いほど演武間でスコアが揃っています" },
  "tip.winRatePerf": { jp: "試合に勝った演武の割合" },
  "tip.kataScoreDiff": { jp: "型のスコアが演武者個人の平均からどれだけ離れているかの平均（型の平均スコア − 選手の平均スコア）" },
  "tip.athleteName": { jp: "選手の名前" },
  "tip.athleteCountry": { jp: "選手の国" },
  "tip.medalsWon": { jp: "今シーズン獲得したメダル" },
  "tip.athletePerf": { jp: "今シーズンの個別の型演武の総数" },
  "tip.athleteTourns": { jp: "選手が出場した大会数" },
  "tip.athleteAvg": { jp: "選手の全演武の平均スコア" },
  "tip.athleteMedian": { jp: "選手の全スコアを並べたときの中央のスコア" },
  "tip.athleteMin": { jp: "選手が単一の演武で得た最低スコア" },
  "tip.athleteMax": { jp: "選手が単一の演武で得た最高スコア" },
  "tip.athleteRange": { jp: "最高スコア − 最低スコア。選手のスコアの幅" },
  "tip.athleteDiff": { jp: "全試合における、選手のスコアから相手のスコアを引いた値の平均" },
  "tip.tournName": { jp: "大会名" },
  "tip.tournPerf": { jp: "この大会で記録された総型演武数" },
  "tip.uniqueAthletes": { jp: "出場した選手の人数" },
  "tip.tournUniqueKata": { jp: "この大会で演武された異なる型の数" },
  "tip.tournCountries": { jp: "この大会に参加した国の数" },
  "tip.tournAvg": { jp: "この大会の全演武の平均スコア" },
  "tip.countryName": { jp: "国名" },
  "tip.countryPerf": { jp: "この国の選手による総型演武数" },
  "tip.countryTourns": { jp: "この国の選手が参加した異なる大会数" },
  "tip.weightedAvg": { jp: "全演武の加重平均スコア" },
  "tip.countryBest": { jp: "この国の選手による単一演武の最高スコア" },
  "tip.weightedWinRate": { jp: "全演武の加重勝率" },
  "tip.totalMedals": { jp: "今シーズン獲得した総メダル数" },

  /* ── Detail-card section titles ── */
  "sec.scoreDistribution": { en: "Score Distribution", jp: "スコア分布" },
  "sec.allAthletes": { en: "All Athletes", jp: "全選手" },
  "sec.medals": { en: "Medals", jp: "メダル" },
  "sec.kataRepertoire": { en: "Kata Repertoire", jp: "型のレパートリー" },
  "sec.allPerformances": { en: "All Performances", jp: "全演武" },
  "sec.allOpponents": { en: "All Opponents", jp: "全対戦相手" },
  "sec.athletes": { en: "Athletes", jp: "選手" },
  "sec.kataPerformed": { en: "Kata Performed", jp: "演武された型" },
  "sec.tournamentsAttended": { en: "Tournaments Attended", jp: "出場した大会" },
  "sec.athletesAtTournament": { en: "Athletes at this Tournament", jp: "この大会の選手" },
  "sec.kataAtTournament": { en: "Kata Performed at this Tournament", jp: "この大会で演武された型" },
  "sec.countries": { en: "Countries", jp: "国" },

  /* ── Detail-card stat labels & small labels ── */
  "stat.worstScore": { en: "Worst Score", jp: "最低スコア" },
  "lbl.athleteColon": { en: "Athlete", jp: "選手" },
  "lbl.kataColon": { en: "Kata", jp: "型" },
  "res.win": { en: "Win", jp: "勝ち" },
  "res.loss": { en: "Loss", jp: "負け" },
  "medal.gold": { en: "Gold", jp: "金" },
  "medal.silver": { en: "Silver", jp: "銀" },
  "medal.bronze": { en: "Bronze", jp: "銅" },

  /* ── In-card table column headers (extras beyond col.*) ── */
  "col.result": { en: "Result", jp: "結果" },
  "col.opponent": { en: "Opponent", jp: "対戦相手" },
  "col.round": { en: "Round", jp: "ラウンド" },
  "col.score": { en: "Score", jp: "スコア" },
  "col.scoreDiff": { en: "Score Diff", jp: "スコア差" },
  "col.meetings": { en: "Meetings", jp: "対戦数" },
  "col.wins": { en: "Wins", jp: "勝利数" },
  "col.athletesSent": { en: "Athletes Sent", jp: "派遣選手数" },
  "col.total": { en: "Total", jp: "合計" },
  "tier.Advanced": { en: "Advanced", jp: "上級" },
  "tier.Intermediate": { en: "Intermediate", jp: "中級" },
  "tier.Beginner": { en: "Beginner", jp: "初級" },
  "chart.score": { en: "Score", jp: "スコア" },
  "chart.performances": { en: "performances", jp: "演武" },

  /* ── Chart axis titles & doughnut titles (Kata Analysis figures) ── */
  "axis.performances": { en: "Performances", jp: "演武数" },
  "axis.avgScore": { en: "Average Score", jp: "平均スコア" },
  "axis.winRatePct": { en: "Win Rate (%)", jp: "勝率（%）" },
  "axis.scoreDiffVsAthAvg": { en: "Score Diff vs Athlete Avg", jp: "選手平均とのスコア差" },
  "axis.uniquePerformers": { en: "Unique Performers", jp: "演武者数" },
  "axis.scoreStdDev": { en: "Score Std Dev (σ)", jp: "スコア標準偏差 (σ)" },
  "axis.athletes": { en: "Athletes", jp: "選手数" },
  "chartTitle.pctPerfByTier": { en: "% of Performances by Tier", jp: "階級別の演武割合" },
  "chartTitle.distinctKataByTier": { en: "Distinct Kata Count by Tier", jp: "階級別の型数" },
  "note.countriesMin2": { en: "This figure only shows countries that sent 2 or more athletes.", jp: "この図は2名以上の選手を派遣した国のみを表示しています。" },

  /* ── Kata tier system (Welcome) overlap explanation & curve graph ── */
  "welcome.tier.overlap": {
    en: "<strong>Tiers are broad bands, not a strict ranking.</strong> Difficulty varies widely within each tier, and the bands overlap: <strong>the most demanding Intermediate kata are harder than the least demanding Advanced kata.</strong> The majority of Advanced kata were performed, while only a small minority of Intermediate kata were performed, indicating that, when choosing Intermediate kata, elite athletes only chose the best of them. See <a href=\"#\" onclick=\"switchToTab('kata-findings');setTimeout(()=>{const el=document.getElementById('performed-kata-grid');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},150);return false;\" style=\"color:var(--red)\">Figure K-10</a> to see which Advanced and Intermediate kata were and were not performed.",
    jp: "<strong>階級は厳密な順位ではなく、大まかな区分です。</strong>各階級の中でも難易度は大きく異なり、区分は重なり合います。<strong>最も難しい中級型は、最も易しい上級型よりも難度が高いのです。</strong>上級型の大半が演武された一方で、中級型はごく一部しか演武されませんでした。これは、エリート選手が中級型を選ぶ際には、その中でも最良のものだけを選んでいることを示しています。どの上級型・中級型が演武され、どれが演武されなかったかは<a href=\"#\" onclick=\"switchToTab('kata-findings');setTimeout(()=>{const el=document.getElementById('performed-kata-grid');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},150);return false;\" style=\"color:var(--red)\">図 K-10</a>をご覧ください。"
  },
  "tier.curveCaption": {
    en: "Each curve shows how the kata in one tier spread across difficulty. Where the curves overlap, some Intermediate kata are more advanced than some Advanced kata.",
    jp: "各曲線は、その階級の型が難易度の上でどう分布しているかを示します。曲線が重なる部分では、一部の中級型が一部の上級型よりも難度が高くなっています。"
  },
  "tier.axisDifficulty": { en: "Difficulty →", jp: "難易度 →" },
  "tier.overlapLabel": { en: "Overlap", jp: "重なり" },
  "fig.figure": { en: "Figure", jp: "図" },
  "map.athletes": { en: "athletes", jp: "選手" },
  "tourn.noMissing": { en: "No missing data for this tournament.", jp: "この大会に欠損データはありません。" },
  "perf.performed": { en: "Performed", jp: "演武あり" },
  "perf.notPerformed": { en: "Not Performed", jp: "演武なし" },
  "lbl.none": { en: "None", jp: "なし" },
  "miss.total": { en: "Total Performances", jp: "総演武数" },
  "miss.complete": { en: "Complete (Kata + Score present)", jp: "完全（型名＋スコアあり）" },
  "miss.kataOnly": { en: "Missing Kata Name (score present)", jp: "型名が欠損（スコアあり）" },
  "miss.scoreOnly": { en: "Missing Score (kata name present)", jp: "スコアが欠損（型名あり）" },
  "miss.both": { en: "Missing Both", jp: "型名・スコアともに欠損" },

  /* ── Round names (performance log) ── */
  "round.rr": { en: "Round Robin", jp: "予選リーグ" },
  "round.r1": { en: "Round 1", jp: "1回戦" },
  "round.r2": { en: "Round 2", jp: "2回戦" },
  "round.r3": { en: "Round 3", jp: "3回戦" },
  "round.r4": { en: "Round 4", jp: "4回戦" },
  "round.rpc": { en: "Repechage", jp: "敗者復活" },
  "sec.medalists": { en: "Medalists", jp: "メダリスト" },
  "sec.missingData": { en: "Missing Data", jp: "欠損データ" },

  /* ── Medals tab table titles ── */
  "medals.maleTitle": { en: "Male Kata Medals by Country", jp: "国別 男子型メダル" },
  "medals.femaleTitle": { en: "Female Kata Medals by Country", jp: "国別 女子型メダル" },

  /* ── Main-table "averages" summary rows ── */
  "summary.avgAllKata": { en: "Average Statistics Across All Kata", jp: "全型の平均統計" },
  "summary.avgAllAthletes": { en: "Average Statistics Across All Athletes", jp: "全選手の平均統計" },
  "summary.avgAllCountries": { en: "Average Statistics Across All Countries", jp: "全国の平均統計" },
  "summary.avgAllTournaments": { en: "Average Statistics Across All Tournaments", jp: "全大会の平均統計" },

  /* ── Notes tab ── */
  "notes.aboutData.h": { jp: "データについて" },
  "notes.aboutData.p1": { jp: `演武データは、WKFが採点シートと大会結果に使用する公式オンラインプラットフォームであるsportdata.orgから、手作業で収集・整理しました。` },
  "notes.aboutData.p2": { jp: `データセットは<strong>9大会</strong>を対象とします：2024年のKarate1プレミアリーグ4大会（パリ、アンタルヤ、カイロ、カサブランカ）、2025年のK1 4大会（カイロ、杭州、パリ、ラバト）、そして2025年カイロ世界空手選手権。` },
  "notes.aboutData.datasets": { jp: `<strong>3つのデータセット：</strong>男子型、女子型、メダル。` },
  "notes.aboutData.kataH": { jp: "男子型・女子型データセット" },
  "notes.aboutData.kata1": { jp: `<strong>1,970行</strong>（男子1,006行、女子964行）— 1行につき型の演武1回。` },
  "notes.aboutData.kata2": { jp: `<strong>8列：</strong> <code>Kata</code>、<code>Score</code>、<code>Avg Score</code>、<code>Won?</code>、<code>Karateka</code>、<code>Round #</code>、<code>Tournament</code>、<code>Opponent</code>。` },
  "notes.aboutData.kata3": { jp: `<code>Avg Score</code>は<code>Score</code>を5で割った値です。スコアに関わる全ての分析は平均スコアのみを使用します。` },
  "notes.aboutData.kata4": { jp: `<code>Won?</code>は、この演武が対戦相手の演武に勝ったかどうかを示すTrue/Falseの項目です。` },
  "notes.aboutData.kata5": { jp: `<code>Round #</code>は<code>rr</code>（総当たり戦＝プール（予選）ステージ）、または<code>r1</code>・<code>r2</code>・<code>r3</code>・<code>r4</code>（ブラケット（決勝トーナメント）ステージの第1〜4回戦）のいずれかです。` },
  "notes.aboutData.medalsH": { jp: "メダルデータセット" },
  "notes.aboutData.medals1": { jp: `<strong>9行</strong> — 1行につき1大会。` },
  "notes.aboutData.medals2": { jp: `<strong>8列：</strong>1位、2位、そして2つの3位（各大会で銅メダルは2つ授与されるため）を、男子・女子それぞれについて記録。` },
  "notes.aboutData.download": { jp: `<em>データセットは<a href="#" onclick="switchToTab('references');return false;" style="color:var(--red)">参考資料</a>タブからダウンロードできます。</em>` },
  "notes.missing.h": { jp: "欠損データ" },
  "notes.missing.p1": { jp: "下の表は性別ごとの欠損データをまとめたものです。型名やスコアに関わる分析は、そのデータが存在する行のみを使用します。" },
  "notes.tier.h": { jp: "型の階級システム" },
  "notes.tier.p1": { jp: `型は、USA Karate公式型リストに基づき<strong>上級</strong>・<strong>中級</strong>・<strong>初級</strong>の3階級に分類されます（詳しくは<a href="#" onclick="switchToTab('references');return false;" style="color:var(--red)">参考資料の図 App-2</a>をご覧ください）。` },
  "notes.tier.p2": { jp: "競技では、選手は自分の階級以下の型のみ演武できます。例えば中級型部門の選手は上級型を演武できず、中級または初級の型を演武しなければなりません。" },
  "notes.tier.p3": { jp: "Tier 1のWKF大会では全部門が上級であり、どの型でも（上級・中級・初級）演武できます。" },
  "notes.tier.li1": { jp: "<strong>上級</strong>：複雑な技、珍しい立ち方、まれな伝統形を含む高難度の型。ほぼ国際エリートレベルでのみ演武されます。例：スーパーリンペイ、雲手、オーハン、パープーレン、五十四歩小。" },
  "notes.tier.li2": { jp: "<strong>中級</strong>：国内・大陸レベルで一般的な中級の型。WKF大会でも時折見られます。例：シソーチン、セイエンチン、観空大。" },
  "notes.tier.li3": { jp: "<strong>初級</strong>：このレベルの競技ではめったに見られない低難度の型。" },
  "notes.interp.h": { jp: "解釈に関する注意" },
  "notes.interp.li1": { jp: "演武回数が非常に少ない型（約10回未満）は、標本数が小さいため統計が偏ることがあります。" },
  "notes.interp.li2": { jp: "1〜2大会のみ出場した選手は、標本数が小さいため統計が代表的でない場合があります。" },
  "notes.interp.li3": { jp: "平均スコアや中央値スコアなどが高い型は、単に少数のエリート専門家によって演武されているだけかもしれず、必ずしも他の型より「優れている」わけではありません。" },
  "notes.interp.li4": { jp: "男子と女子の種目は完全に別です。" },
  "notes.interp.li5": { jp: "2人の選手の演武回数が非常に近い場合（例：Maho Onoは52回、Grace Lauは48回）、それは両者の競技シーズンを比較する上でほとんど参考になりません。演武回数の大きな差は、一方の選手がしばしばブラケット（決勝トーナメント）ステージに進み、大会でより上位まで勝ち進んでいることを示しますが、小さな差は多くの場合、一方の選手が4人ではなく3人だけのプールに偶然振り分けられ、演武が1回少なくなった結果にすぎません。" },

  /* ── About tab ── */
  "about.dedication": { jp: "この作品を、空手と努力による自己研鑽への生涯の情熱を私に与えてくださった Shihan Carl Hultin に捧げます。" },
  "about.me.h": { jp: "私について" },
  "about.me.p1": { jp: `私の名前はGordon Jay Chanで、6歳で空手を始めました。<strong>林派糸東流</strong>を修練していますが、大学に入学してからはキャンパスの松濤館空手部に入り、糸東流と並行して松濤館も稽古しました。現在はその同じ部のコーチを務めています。` },
  "about.me.p2": { jp: "10歳の頃から競技を続けています。型は常に、私が最も惹かれる空手の側面でした。技の奥深さ、プレッシャー下での精度の要求、そして終わりなき洗練の追求です。" },
  "about.why.h": { jp: "なぜ作ったのか" },
  "about.why.p1": { jp: "私は以前から型競技に興味がありました。なぜ人々は特定の型を選ぶのか？その選手にとって最高の型はどれか？型の選択や演武に傾向はあるのか？また、各型の中央値スコアや最高スコアといった具体的な数字も気になっていました。そうすれば、次に誰かが「実はオハンダイの方がウンスーより人気だったと思う」と言ったとき、当て推量ではなく実データで答えられます。大学では経営情報システムを学び、Pythonによるデータサイエンスの授業を受けたので、その分析スキルをエリート国際型競技に応用しました。" },
  "about.why.p2": { jp: "このプロジェクトは、私（そして願わくば多くの好奇心ある人々）が、こうした疑問にできるだけ多く答えるためのリソースです。最高レベルでどの型が選ばれているのか、選手間や大会間でスコアがどう比較されるのか、そしてその間のすべてを、より明確に把握したいのです。皆さんが自分の抱く傾向や疑問を探求する助けになれば幸いです！" },
  "about.download.h": { jp: "データのダウンロード" },
  "about.download.p": { jp: `生のデータセットは<a href="#" onclick="switchToTab('references');return false;" style="color:var(--red)">参考資料</a>タブで入手できます。` },

  /* ── References tab ── */
  "ref.downloadHead": { jp: "データのダウンロード" },
  "ref.rawDataset": { jp: "生データセット" },
  "ref.maleTitle": { jp: "男子型：2024–25シーズン" },
  "ref.maleMeta": { jp: "今シーズン記録された全ての男子型演武" },
  "ref.femaleTitle": { jp: "女子型：2024–25シーズン" },
  "ref.femaleMeta": { jp: "今シーズン記録された全ての女子型演武" },
  "ref.placementsTitle": { jp: "大会順位" },
  "ref.placementsMeta": { jp: "各大会の金・銀・銅メダリスト" },
  "ref.downloadCsv": { jp: "⬇ CSVをダウンロード" },
  "ref.rulesHead": { jp: "競技規則" },
  "ref.rulesDoc": { jp: "競技規則文書" },
  "ref.appendixHead": { jp: "付録" },
  "ref.officialList": { jp: "公式型リスト" },
  "ref.fromWkf": { jp: "出典：WKF型競技規則 2026" },
  "ref.officialListLabel": { jp: "公式リスト" },
  "ref.usaListTitle": { jp: "USA Karate：公式型リスト" },
  "ref.fromUsa": { jp: "出典：USA Karate競技規則、2026年1月1日" },
  "ref.usaRulesTitle": { jp: "USA Karate：競技規則（2026年1月1日）↗" },
  "ref.wkfRulesTitle": { jp: "WKF：型競技規則 2026 ↗" },
  "ref.usaRulesMeta": { jp: "USA Karate · 2026" },
  "ref.wkfRulesMeta": { jp: "世界空手連盟（WKF） · 2026" },
  "ref.figApp1": { jp: "図 App-1" },
  "ref.figApp2": { jp: "図 App-2" },

  /* ── How-to cards (body-level: English captured from DOM, Japanese below) ── */
  "howto.tables": { jp: `<strong>表の見方</strong>
                <ul>
                  <li>列見出しをクリックすると並べ替え、もう一度で逆順になります。</li>
                  <li>見出しにカーソルを合わせると説明が表示されます。</li>
                  <li>詳細カードでは、統計値の下の小さな数字（例：<em>3/42</em>）が全体での順位を表し、<em>(T)</em> は同順位を示します。</li>
                  <li>主要な表の上部には各列の平均を示す<strong>平均</strong>行が固定されています。</li>
                </ul>
                <p class="how-to-q"><em>並べ替え・順位の読み方・型の階級を知りたいときは？</em></p>` },
  "howto.links": { jp: `<strong>赤いリンクとナビゲーション</strong>
                <ul>
                  <li><span style="color:var(--red);font-weight:600">赤色</span>で表示される型・選手・大会・国の名前はリンクです。</li>
                  <li>クリックするとその項目の詳細カードへ移動します（確認プロンプトが表示されます）。</li>
                  <li>詳細カード内・分析タブの表・検索結果など、どこでも機能します。</li>
                </ul>
                <p class="how-to-q"><em>選手のプロフィールから演武した型へ、または型からその型で最高得点を出した選手へ、どう移動する？</em></p>` },
  "howto.genderToggle": { jp: `<strong>男子／女子の切り替え</strong>
                <ul>
                  <li>右上の<strong>男子</strong>／<strong>女子</strong>ボタンで、すべての表・グラフ・統計が即座に切り替わります。</li>
                  <li>ボタンにカーソルを合わせると、その性別のシーズン概要が表示されます。</li>
                  <li>図は性別ごとに番号付けされ、正確に引用できます（男子 <em>K-1, A-1, …</em>、女子 <em>FK-1, FA-1, …</em>）。</li>
                </ul>
                <p class="how-to-q"><em>男子の型の結果を見たい？それとも女子の型の結果を見たい？</em></p>` },
  "howto.search": { jp: `<strong>全体検索バー</strong>
                <ul>
                  <li>右上の検索バーは、型・選手・大会・国を一度に横断検索します。</li>
                  <li>入力すると結果が表示され、クリックするとその詳細カードへ移動します。</li>
                </ul>
                <p class="how-to-q"><em>探している型や選手の名前は分かっている。どうすれば素早くたどり着ける？</em></p>` },
  "howto.back": { jp: `<strong>戻るボタンとナビゲーション履歴</strong>
                <ul>
                  <li>赤いリンクをたどると、左下に<strong>← 戻る</strong>ボタンが表示され、前のカードやタブに戻れます。</li>
                  <li>起点まで戻ったとき、またはタブを手動でクリックすると消えます。</li>
                </ul>
                <p class="how-to-q"><em>いくつものリンクされたカードをたどって、戻りたい。戻るボタンはどこ？</em></p>` },
  "howto.dataKata": { jp: `<strong>型</strong>
                <ul>
                  <li>型ごとの統計：演武数、演武した選手数（実数）、平均、勝率など。</li>
                  <li>行をクリックすると、各統計におけるその型の順位、スコア分布のヒストグラム、演武した全選手を示す<strong>詳細カード</strong>が開きます。</li>
                </ul>
                <p class="how-to-q"><em>特定の型の統計は？誰が最も上手く演武している？</em></p>` },
  "howto.dataAthletes": { jp: `<strong>選手</strong>
                <ul>
                  <li>選手ごとの統計：国・勝率・総合的な<strong>差（差分）</strong>（自分のスコアから相手のスコアを引き全試合で平均）など。</li>
                  <li>行をクリックすると、順位付きのシーズン統計、スコアのヒストグラム、型のレパートリー、全試合の時系列ログ、対戦成績、メダルを含む<strong>詳細カード</strong>が開きます。</li>
                </ul>
                <p class="how-to-q"><em>特定の選手はシーズンを通じてどう戦った？最も多く対戦したのは誰？</em></p>` },
  "howto.dataTournaments": { jp: `<strong>大会</strong>
                <ul>
                  <li>大会ごとに1行（開催順）：演武数・選手数・型数・参加国数・平均スコア。</li>
                  <li>上部の日程表から9大会のいずれへも移動できます。</li>
                  <li>行をクリックすると、メダリストとその大会の全選手・型・国を含む<strong>詳細カード</strong>が開きます。</li>
                </ul>
                <p class="how-to-q"><em>特定の大会には誰が出場し、誰がメダルを獲得した？</em></p>` },
  "howto.dataCountries": { jp: `<strong>国</strong>
                <ul>
                  <li>国ごとの統計：選手数・演武数・大会数・平均／最高スコア・勝率・メダル数。</li>
                  <li><strong>世界地図</strong>は選手数で各国を色分けし（赤が濃いほど選手が多い）、クリックで開けます。</li>
                  <li>行をクリックすると、所属選手・演武された型・出場大会（派遣選手数とメダル付き）・メダル集計を含む<strong>詳細カード</strong>が開きます。</li>
                </ul>
                <p class="how-to-q"><em>最も多く出場した国は？特定の国はシーズンを通じてどう戦った？</em></p>` },
  "howto.findKata": { jp: `<strong>型の分析</strong>
                <ul>
                  <li>型の傾向のグラフ：人気・平均スコア・勝率・階級別内訳、そして各型が選手個人の基準と比べてどう得点するか（選手の通常より「難しい」か「易しい」かの目安）。</li>
                  <li>グラフ上部の文章がシーズンの注目すべき型の話題をまとめています。</li>
                </ul>
                <p class="how-to-q"><em>選手が好成績を収めている型は？トップ選手が最も選ぶ型は？</em></p>` },
  "howto.findAthlete": { jp: `<strong>選手の分析</strong>
                <ul>
                  <li>平均スコアと勝率による選手ランキング、スコアと勝率の散布図、国別の内訳。</li>
                  <li>各バーはクリックで詳細カードへ移動します。</li>
                  <li>グラフ上部の<strong>アスリート・スポットライト</strong>が際立った選手を紹介します。</li>
                </ul>
                <p class="how-to-q"><em>最高得点の選手は誰？どの国が圧倒した？</em></p>` },
  "howto.compare": { jp: `<strong>男子 vs 女子</strong>
                <ul>
                  <li>各性別だけが演武した型（表）。</li>
                  <li>重なりを示すベン図と、性別ごとの人気上位5型。</li>
                  <li>男女共通型の「男子 − 女子」平均スコア差を示す棒グラフと並べ替え可能な表。</li>
                </ul>
                <p class="how-to-q"><em>片方の性別だけが演武する型はある？男女で最も得点が異なる型は？</em></p>` },
  "howto.medals": { jp: `<strong>メダル</strong>
                <ul>
                  <li>男子型と女子型のメダル表を並べて表示（既定は金メダル順）。</li>
                  <li>全9大会を通じた各国の金・銀・銅・合計を示します。</li>
                  <li>見出しをクリックで並べ替え。</li>
                </ul>
                <p class="how-to-q"><em>今シーズン最も多くメダルを獲得した国は？</em></p>` },
  "howto.notesCard": { jp: `<strong>注記</strong>
                <ul>
                  <li>データの収集方法、欠損データとその理由、型の階級の定義、WKFの採点規則、勝率の読み方。</li>
                  <li>不明な点や予想外の点があれば、まずここをお読みください。</li>
                </ul>
                <p class="how-to-q"><em>このデータはどう収集された？統計は実際に何を意味する？</em></p>` },
  "howto.aboutCard": { jp: `<strong>概要</strong>
                <ul>
                  <li>制作者の背景とプロジェクトの動機。</li>
                  <li>手法に関する注記、そしてサイト構築に使用した生CSVデータのダウンロードリンク。</li>
                </ul>
                <p class="how-to-q"><em>このサイトは誰が何のために作った？生データはどこで入手できる？</em></p>` },
};

/* Apply translations to all tagged static elements. EN is captured once from
   the original DOM so toggling back to English is lossless. */
function applyI18n() {
  const jp = (typeof lang !== "undefined") && lang === "jp";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    if (el.dataset.i18nEn == null) el.dataset.i18nEn = el.innerHTML;
    const e = I18N[el.dataset.i18n];
    el.innerHTML = (jp && e && e.jp != null) ? e.jp : el.dataset.i18nEn;
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    if (el.dataset.i18nTitleEn == null) el.dataset.i18nTitleEn = el.getAttribute("title") || "";
    const e = I18N[el.dataset.i18nTitle];
    el.setAttribute("title", (jp && e && e.jp != null) ? e.jp : el.dataset.i18nTitleEn);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    if (el.dataset.i18nPhEn == null) el.dataset.i18nPhEn = el.getAttribute("placeholder") || "";
    const e = I18N[el.dataset.i18nPh];
    el.setAttribute("placeholder", (jp && e && e.jp != null) ? e.jp : el.dataset.i18nPhEn);
  });
  document.documentElement.lang = jp ? "ja" : "en";
}

/* For JS-generated strings: returns the entry in the active language. */
function t(key) {
  const e = I18N[key];
  if (!e) return key;
  const v = (typeof lang !== "undefined" && lang === "jp") ? e.jp : e.en;
  return v != null ? v : (e.en != null ? e.en : key);
}

/* ── Proper-noun display maps ──────────────────────────────────────────────────
   These translate the *displayed* text only. Data keys, sorting, navigation and
   deep links continue to use the original English names. */
const KATA_JP = {
  "Anan": "アーナン", "Anan Dai": "アーナンダイ", "Ananko": "アーナンコー", "Aoyagi": "青柳",
  "Bassai": "バッサイ", "Bassai Dai": "バッサイ大", "Bassai Sho": "バッサイ小",
  "Chatanyara Kusanku": "北谷屋良クーサンクー", "Chibana No Kushanku": "知花のクーサンクー",
  "Chinte": "珍手", "Chinto": "チントー", "Enpi": "燕飛", "Gankaku": "岩鶴", "Garyu": "臥龍",
  "Gojushiho": "五十四歩", "Gojushiho Dai": "五十四歩大", "Gojushiho Sho": "五十四歩小",
  "Hakucho": "白鳥", "Hangetsu": "半月", "Haufa": "ハウファ", "Heiku": "ヘイクー",
  "Ishimine Bassai": "石嶺バッサイ", "Itosu Rohai Nidan": "糸洲ローハイ二段",
  "Itosu Rohai Sandan": "糸洲ローハイ三段", "Itosu Rohai Shodan": "糸洲ローハイ初段",
  "Jiin": "慈陰", "Jion": "慈恩", "Jitte": "十手", "Juroku": "十六", "Kanchin": "カンチン",
  "Kanku Dai": "観空大", "Kanku Sho": "観空小", "Kanshu": "カンシュウ",
  "Kishimoto No Kushanku": "岸本のクーサンクー", "Kousoukun": "公相君",
  "Kousoukun Dai": "公相君大", "Kousoukun Sho": "公相君小", "Kururunfa": "クルルンファ",
  "Kusanku": "クーサンクー", "Kyan No Chinto": "喜屋武のチントー", "Kyan No Wanshu": "喜屋武のワンシュウ",
  "Matsukaze": "松風", "Matsumura Bassai": "松村バッサイ", "Matsumura Rohai": "松村ローハイ",
  "Meikyo": "明鏡", "Myojo": "明星", "Naifanchin Nidan": "ナイファンチン二段",
  "Naifanchin Sandan": "ナイファンチン三段", "Naifanchin Shodan": "ナイファンチン初段",
  "Naihanchi": "ナイハンチ", "Nijushiho": "二十四歩", "Nipaipo": "ニーパイポ", "Niseishi": "ニーセーシ",
  "Ohan": "オーハン", "Ohan Dai": "オーハンダイ", "Oyadomari No Passai": "親泊のパッサイ",
  "Pachu": "パーチュー", "Paiku": "パイクー", "Papuren": "パープーレン", "Passai": "パッサイ",
  "Rohai": "ローハイ", "Saifa": "サイファ", "Sanchin": "三戦", "Sansai": "サンサイ",
  "Sanseiru": "サンセイルー", "Sanseru": "サンセール", "Seichin": "セイチン", "Seienchin": "セイエンチン",
  "Seipai": "セーパイ", "Seiryu": "セイリュウ", "Seisan": "セーサン", "Seishan": "セイシャン",
  "Shiho Kousoukun": "四方公相君", "Shinpa": "シンパ", "Shinsei": "シンセイ", "Shisochin": "シソーチン",
  "Sochin": "ソーチン", "Suparinpei": "スーパーリンペイ", "Tekki Nidan": "鉄騎二段",
  "Tekki Sandan": "鉄騎三段", "Tekki Shodan": "鉄騎初段", "Tensho": "転掌",
  "Tomari Bassai": "泊バッサイ", "Unsu": "雲手", "Useishi": "ウーセーシー", "Wankan": "王冠",
  "Wanshu": "ワンシュウ",
};
const TOURN_JP = {
  "2024 Paris": "2024 パリ", "2024 Antalya": "2024 アンタルヤ", "2024 Cairo": "2024 カイロ",
  "2024 Casablanca": "2024 カサブランカ", "2025 Paris": "2025 パリ", "2025 Hangzhou": "2025 杭州",
  "2025 Cairo": "2025 カイロ", "2025 Rabat": "2025 ラバト", "2025 Worlds": "2025 世界選手権",
};
const COUNTRY_JP = {
  "Algeria": "アルジェリア", "Argentina": "アルゼンチン", "Australia": "オーストラリア", "Austria": "オーストリア",
  "Azerbaijan": "アゼルバイジャン", "Belgium": "ベルギー", "Brazil": "ブラジル", "Burkina Faso": "ブルキナファソ",
  "Burundi": "ブルンジ", "Canada": "カナダ", "China": "中国", "Colombia": "コロンビア", "Czech Republic": "チェコ",
  "Dominican Republic": "ドミニカ共和国", "Egypt": "エジプト", "England": "イングランド", "France": "フランス",
  "Germany": "ドイツ", "Greece": "ギリシャ", "Hong Kong": "香港", "Hungary": "ハンガリー", "Indonesia": "インドネシア",
  "Iran": "イラン", "Italy": "イタリア", "Japan": "日本", "Jordan": "ヨルダン", "Kuwait": "クウェート",
  "Malaysia": "マレーシア", "Mexico": "メキシコ", "Montenegro": "モンテネグロ", "Morocco": "モロッコ",
  "Nepal": "ネパール", "Netherlands": "オランダ", "New Zealand": "ニュージーランド", "Nigeria": "ナイジェリア",
  "Philippines": "フィリピン", "Portugal": "ポルトガル", "Romania": "ルーマニア", "Saudi Arabia": "サウジアラビア",
  "Senegal": "セネガル", "Singapore": "シンガポール", "Slovakia": "スロバキア", "Slovenia": "スロベニア",
  "South Korea": "韓国", "Spain": "スペイン", "Sweden": "スウェーデン", "Switzerland": "スイス",
  "Taiwan": "台湾", "Turkey": "トルコ", "USA": "アメリカ", "Ukraine": "ウクライナ", "Venezuela": "ベネズエラ",
};

/* Returns the localized display name for a proper noun, or the original if no map. */
function displayName(type, name) {
  if (typeof lang === "undefined" || lang !== "jp" || name == null) return name;
  const map = type === "kata" ? KATA_JP : type === "tournament" ? TOURN_JP : type === "country" ? COUNTRY_JP : null;
  return (map && map[name] != null) ? map[name] : name;
}
function roundName(code) {
  const e = I18N["round." + code];
  if (!e) return code;
  return (typeof lang !== "undefined" && lang === "jp") ? e.jp : e.en;
}
