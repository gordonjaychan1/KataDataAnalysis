/* ════════════════════════════════════════════════════════════════════════════
   Internationalization (i18n) — English (default) / Japanese
   Loaded before app.js, so I18N / applyI18n / t share global scope with app.js.

   - Static markup: add data-i18n / data-i18n-title / data-i18n-ph to elements.
     English is captured from the original DOM; Japanese comes from I18N[key].jp.
   - JS-generated strings: call t(key) — entries carry both en and jp.
   ════════════════════════════════════════════════════════════════════════════ */

const I18N = {
  /* ── Tabs / nav ── */
  "tab.welcome":  { en: "Welcome", jp: "ようこそ" },
  "tab.kata":     { en: "Kata", jp: "型" },
  "tab.athletes": { en: "Athletes", jp: "選手" },
  "tab.tournaments": { en: "Tournaments", jp: "大会" },
  "tab.countries": { en: "Countries", jp: "国" },
  "tab.medals":   { en: "Medals", jp: "メダル" },
  "tab.kataFindings": { en: "Kata Findings", jp: "型の分析" },
  "tab.athleteFindings": { en: "Athlete Findings", jp: "選手の分析" },
  "tab.compare":  { en: "Male vs. Female", jp: "男子 vs 女子" },
  "tab.notes":    { en: "Important Notes", jp: "重要な注記" },
  "tab.about":    { en: "About", jp: "概要" },
  "tab.references": { en: "References", jp: "参考資料" },
  "btn.back":     { en: "← Back", jp: "← 戻る" },
  "toggle.male":  { en: "Male", jp: "男子" },
  "toggle.female": { en: "Female", jp: "女子" },

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
    en: "This site presents a statistical analysis of all kata performances recorded during the nine Tier 1 tournaments in the 2024–25 WKF season — covering both the Male and Female Kata categories.",
    jp: "本サイトは、2024–25 WKFシーズンの9つのTier 1大会で記録された全ての型演武に関する統計分析を、男子型・女子型の両カテゴリーにわたって紹介します。"
  },
  "welcome.timelineTitle": { en: "2024–25 Season Timeline", jp: "2024–25 シーズンの日程" },
  "welcome.timelineSub": { en: "Click any tournament to explore its results.", jp: "大会をクリックすると結果を見られます。" },
  "welcome.howToTitle": { en: "How to Use This Site", jp: "本サイトの使い方" },

  /* ── How-to group labels ── */
  "howto.group.func": { en: "Functionalities", jp: "機能" },
  "howto.group.data": { en: "Data Tabs", jp: "データタブ" },
  "howto.group.findings": { en: "Findings Tabs", jp: "分析タブ" },
  "howto.group.reference": { en: "Reference", jp: "参考" },

  /* ── Section titles ── */
  "title.compare": { en: "Male vs. Female Kata — Season Comparison", jp: "男子 vs 女子の型 — シーズン比較" },
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
  "notes.aboutData.p1": { jp: `データはWKF公式のライブ採点シートと一般公開された大会結果から手作業で収集しました。データセットは<strong>9大会</strong>を対象とします：2024年のKarate1プレミアリーグ4大会（パリ、アンタルヤ、カイロ、カサブランカ）、2025年のK1 4大会（カイロ、杭州、パリ、ラバト）、そして2025年カイロ世界空手選手権。` },
  "notes.aboutData.p2": { jp: `保持しているのは<strong>平均スコア</strong>（Avg Score）のみで、生の合計スコアは除外しています。スコアに関わる全ての分析は平均スコアのみを使用します。` },
  "notes.missing.h": { jp: "欠損データ" },
  "notes.missing.p1": { jp: "下の表は性別ごとの欠損データをまとめたものです。型名やスコアに関わる分析は、そのデータが存在する行のみを使用します。" },
  "notes.tier.h": { jp: "型の階級システム" },
  "notes.tier.p1": { jp: `型は、USA Karate公式型リストに基づき<strong>上級</strong>・<strong>中級</strong>・<strong>初級</strong>の3階級に分類されます（詳しくは<a href="#" onclick="switchToTab('references');return false;" style="color:var(--red)">参考資料の図 App-2</a>をご覧ください）。` },
  "notes.tier.p2": { jp: "競技では、選手は自分の階級以下の型のみ演武できます。例えば中級型部門の選手は上級型を演武できず、中級または初級の型を演武しなければなりません。" },
  "notes.tier.p3": { jp: "Tier 1のWKF大会では全部門が上級であり、どの型でも（上級・中級・初級）演武できます。" },
  "notes.tier.li1": { jp: "<strong>上級</strong> — 複雑な技、珍しい立ち方、まれな伝統形を含む高難度の型。ほぼ国際エリートレベルでのみ演武されます。例：スーパーリンペイ、雲手、オーハン、パープーレン、五十四歩小。" },
  "notes.tier.li2": { jp: "<strong>中級</strong> — 国内・大陸レベルで一般的な中級の型。WKF大会でも時折見られます。例：シソーチン、セイエンチン、観空大。" },
  "notes.tier.li3": { jp: "<strong>初級</strong> — このレベルの競技ではめったに見られない低難度の型。" },
  "notes.scoring.h": { jp: "WKFの採点システム" },
  "notes.scoring.p1": { jp: `7人の審判がそれぞれ0〜10点を付けます。最高点と最低点を除外し、残りの5点を平均して最終スコアを算出します。このデータセットはこの<strong>平均スコア</strong>のみを記録します。<strong>8.0</strong>を超えるスコアはK1プレミアリーグレベルで一般に競争力があるとされ、決勝のトップ演武はしばしば8.5〜9.0に達します。` },
  "notes.won.h": { jp: "「勝利？（Won?）」項目について" },
  "notes.won.p1": { jp: `2人の選手が同時に直接対戦します。両者が型を演武し、審判が旗を上げて勝者を決めます。<strong>Won?</strong>はその選手が試合に勝ったかどうかを記録します。複数演武にわたる勝率は、ある型の選択（または選手）がどれだけ勝利につながるかを示しますが、型自体以外の多くの要因にも左右されます。` },
  "notes.interp.h": { jp: "解釈に関する注意" },
  "notes.interp.li1": { jp: "演武回数が約10回未満の型は、標本数が小さいため統計が偏ることがあります。" },
  "notes.interp.li2": { jp: "平均スコアの高い型は、単に少数のエリート専門家によって演武されているだけかもしれず、必ずしも他の型より「優れている」わけではありません。" },
  "notes.interp.li3": { jp: "男子と女子の種目は完全に別です。性別をまたいでスコアを比較しないでください。" },
  "notes.interp.li4": { jp: "1〜2大会のみ出場した選手は、統計が代表的でない場合があります。" },

  /* ── About tab ── */
  "about.dedication": { jp: "この作品を、空手と努力による自己研鑽への生涯の情熱を私に与えてくださった Shihan Carl Hultin に捧げます。" },
  "about.me.h": { jp: "私について" },
  "about.me.p1": { jp: `私はカリフォルニアで育ち、6歳で空手を始めました。<strong>林派糸東流</strong>を修練していますが、大学に入学してからはキャンパスの松濤館空手部に入り、糸東流と並行して松濤館も稽古しました。現在はその同じ部のコーチを務めています。` },
  "about.me.p2": { jp: "10歳の頃から競技を続けています。型は常に、私が最も惹かれる空手の側面でした。技の奥深さ、プレッシャー下での精度の要求、そして終わりなき洗練の追求です。" },
  "about.why.h": { jp: "なぜ作ったのか" },
  "about.why.p1": { jp: "私は以前から型競技に興味があり、なぜ人々が特定の型を選ぶのか、型の選択と演武に有用な傾向があるのかに関心がありました。また、各型の中央値スコアや最高スコアなどが単純に気になっていました。大学では経営情報システムを学び、Pythonによるデータサイエンスの授業を受けました。これらの疑問に答えるため、その授業で得た分析スキルをエリート国際型競技に応用しました。" },
  "about.why.p2": { jp: "このプロジェクトは、私（そして願わくば多くの好奇心ある人々）ができるだけ多くの疑問に答えるためのリソースです。最高レベルでどの型が選ばれているのか、選手間でスコアがどう比較されるのか、WKFのシーズン全体でどんなパターンが現れるのかを、より明確に把握したいのです。有用なリソースとなり、皆さんに楽しく役立つものになれば幸いです。" },
  "about.method.h": { jp: "手法" },
  "about.method.p1": { jp: "演武データは、2024–25シーズンの全9大会にわたり、WKF公式採点シートと大会結果から手作業で収集しました。データ処理と分析の主要言語としてPythonを使用し、以下のライブラリを用いました：" },
  "about.method.li1": { jp: "<strong>Pandas</strong> — データセットの構造化・クリーニング・操作に" },
  "about.method.li2": { jp: "<strong>NumPy</strong> — 数値計算と記述統計に" },
  "about.method.li3": { jp: "<strong>Chart.js</strong> — 本サイトの全インタラクティブグラフに" },
  "about.download.h": { jp: "データのダウンロード" },
  "about.download.p": { jp: `生のデータセットは<a href="#" onclick="switchToTab('references');return false;" style="color:var(--red)">参考資料</a>タブで入手できます。` },

  /* ── References tab ── */
  "ref.downloadHead": { jp: "データのダウンロード" },
  "ref.rawDataset": { jp: "生データセット" },
  "ref.maleTitle": { jp: "男子型 — 2024–25シーズン" },
  "ref.maleMeta": { jp: "今シーズン記録された全ての男子型演武" },
  "ref.femaleTitle": { jp: "女子型 — 2024–25シーズン" },
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
  "ref.usaListTitle": { jp: "USA Karate — 公式型リスト" },
  "ref.fromUsa": { jp: "出典：USA Karate競技規則、2026年1月1日" },
  "ref.usaRulesTitle": { jp: "USA Karate — 競技規則（2026年1月1日）↗" },
  "ref.wkfRulesTitle": { jp: "WKF — 型競技規則 2026 ↗" },
  "ref.usaRulesMeta": { jp: "USA Karate · 2026" },
  "ref.wkfRulesMeta": { jp: "世界空手連盟（WKF） · 2026" },
  "ref.figApp1": { jp: "図 App-1" },
  "ref.figApp2": { jp: "図 App-2" },

  /* ── How-to cards (body-level: English captured from DOM, Japanese below) ── */
  "howto.tables": { jp: `<strong>表の見方</strong>
                <p>すべての表は並べ替え可能です。列見出しをクリックすると昇順／降順に並び替わり、もう一度クリックすると逆順になります。列見出しにカーソルを合わせると、その列が何を表すかの説明が表示されます。</p>
                <p>詳細カードでは、統計値の下に表示される小さな数字（例：<em>3/42</em>）は順位を表し、その統計においてその項目が全体の中で何位かを示します。<em>(T)</em> は他の項目と同順位であることを意味します。</p>
                <p>主要な表（型・選手・大会・国）には、各列の平均を示す<strong>平均</strong>行が下部に固定されています。その行の各セルにカーソルを合わせると、平均が何を計算しているかの説明が表示されます。</p>
                <p>型は、USA Karate型リストに基づき上級・中級・初級のいずれかに分類されます。各型名の横に色分けされたバッジが表示されます。完全な階級一覧は参考資料タブの図 App-2 をご覧ください。</p>
                <p class="how-to-q"><em>並べ替え・順位の読み方・型の階級を知りたいときは？</em></p>` },
  "howto.links": { jp: `<strong>赤いリンクとナビゲーション</strong>
                <p><span style="color:var(--red);font-weight:600">赤色</span>で表示される型名・選手名・大会名・国名はクリック可能なリンクです。カーソルを合わせると下線が表示され、クリックするとその項目の詳細カードへ移動するか確認するプロンプトが開きます。</p>
                <p>これは詳細カード内、分析タブの表の中、検索結果など、あらゆる場所で機能します。関連する項目の間を自由に行き来でき、いつでも左下の<strong>← 戻る</strong>ボタンで元の場所に戻れます。</p>
                <p class="how-to-q"><em>選手のプロフィールから演武した型へ、または型からその型で最高得点を出した選手へ、どう移動する？</em></p>` },
  "howto.genderToggle": { jp: `<strong>男子／女子の切り替え</strong>
                <p>右上の<strong>男子</strong>／<strong>女子</strong>ボタンで、すべてのページを男子型と女子型のデータセット間で切り替えます。表・グラフ・統計はすべて即座に更新され、再読み込みは不要です。</p>
                <p>どちらかのボタンにカーソルを合わせると、その性別のシーズン全体の概要（総演武数・型数・選手数・大会数・国数）がツールチップで表示されます。</p>
                <p>図は性別ごとに番号付けされており、正確に引用できます。男子の図は <em>K-1, A-1, …</em>、対応する女子の図は <em>FK-1, FA-1, …</em> と番号付けされます。</p>
                <p class="how-to-q"><em>男子の型の結果を見たい？それとも女子の型の結果を見たい？</em></p>` },
  "howto.langToggle": { jp: `<strong>言語（EN / JP）</strong>
                <p>右上の<strong>EN</strong>／<strong>JP</strong>ボタンで、サイトを英語と日本語の間で切り替えます。ナビゲーション・表の見出し・ツールチップ・分析の文章・参考資料ページ・これらのヘルプカードはすべて翻訳されます。選手名・型名・国名・大会名などのデータ値は元の表記のまま保持されます。</p>
                <p>選択した言語は次回訪問時にも記憶されます。</p>
                <p class="how-to-q"><em>このサイトを日本語で読めますか？ Can I read this site in Japanese?</em></p>` },
  "howto.search": { jp: `<strong>全体検索バー</strong>
                <p>右上（性別切り替えの隣）の検索バーは、型・選手・大会・国の4種類のデータを一度に横断検索します。入力すると結果がドロップダウンに表示され、いずれかをクリックするとその項目の詳細カードへ直接移動します。</p>
                <p>検索バーはどのタブからでも利用できるため、目的のタブに手動で切り替えなくても任意の項目へ移動できます。</p>
                <p class="how-to-q"><em>探している型や選手の名前は分かっている。どうすれば素早くたどり着ける？</em></p>` },
  "howto.back": { jp: `<strong>戻るボタンとナビゲーション履歴</strong>
                <p>赤いリンクをたどって新しい詳細カードを開くたびに、画面左下に<strong>← 戻る</strong>ボタンが表示されます。クリックすると前のカードやタブに戻れるので、迷わずに自由に探索できます。</p>
                <p>戻るボタンは、ナビゲーションの起点まで戻ったとき、またはナビバーのタブを手動でクリックしたときに消えます。</p>
                <p class="how-to-q"><em>いくつものリンクされたカードをたどって、戻りたい。戻るボタンはどこ？</em></p>` },
  "howto.dataKata": { jp: `<strong>型（Kata）</strong>
                <p>今シーズン演武された全ての型の詳細な統計：総演武数・演武した選手数・平均スコア・中央値・最小／最大・標準偏差・勝率、そしてその型が選手個人の平均得点とどう比較されるか。名前で検索し、任意の列で並べ替えできます。</p>
                <p>行をクリックすると<strong>型の詳細カード</strong>が開き、スコア分布のヒストグラム、その型を演武した全選手の順位表（個別統計付き）、男女共通の型のスコア比較表が表示されます。</p>
                <p class="how-to-q"><em>特定の型の統計は？誰が最も上手く演武している？</em></p>` },
  "howto.dataAthletes": { jp: `<strong>選手（Athletes）</strong>
                <p>今シーズン出場した全選手を、国・演武数・出場大会数・平均スコア・中央値・最小／最大・勝率、そして総合的な<strong>差（差分）</strong>（自分のスコアから相手のスコアを引いた値を全試合で平均したもの）の各列とともに表示します。名前で検索し、任意の列で並べ替えできます。</p>
                <p>行をクリックすると<strong>選手の詳細カード</strong>が開き、順位付きのシーズン統計、スコアのヒストグラム、型ごとの平均・勝率を含むレパートリー、全演武の時系列ログ（各試合の大会・ラウンド・型・スコア・勝敗・相手、そして相手とのスコア差）、対戦した全相手との直接対戦成績の表が表示されます。メダルは大会が開催された順に並びます。</p>
                <p class="how-to-q"><em>特定の選手はシーズンを通じてどう戦った？最も多く対戦したのは誰？</em></p>` },
  "howto.dataTournaments": { jp: `<strong>大会（Tournaments）</strong>
                <p>大会ごとに1行（開催順）で、総演武数・選手数・型数・参加国数・平均スコアの各列を表示します。ページ上部のインタラクティブな日程表にはシーズンの9大会すべてが並び、チップをクリックするとその大会の詳細カードへ直接移動できます。</p>
                <p>行をクリックすると<strong>大会の詳細カード</strong>が開き、メダリスト（金・銀・銅）に加え、その大会に出場した全選手・型・国の表が表示されます。</p>
                <p class="how-to-q"><em>特定の大会には誰が出場し、誰がメダルを獲得した？</em></p>` },
  "howto.dataCountries": { jp: `<strong>国（Countries）</strong>
                <p>今シーズン選手を派遣した全ての国を、選手数・総演武数・出場大会数・平均スコア・最高スコア・勝率・総メダル数の各列とともに表示します。任意の列で並べ替えるか、名前で検索できます。</p>
                <p>タブ上部の<strong>世界地図</strong>は各国を選手数で色分けします（赤が濃いほど選手が多い）。ハイライトされた国をクリックして確認すると、その国の詳細カードへ直接移動します。</p>
                <p>行をクリックすると<strong>国の詳細カード</strong>が開き、所属選手・演武された型・出場大会（各大会の派遣選手数と獲得メダル付き）・メダル集計の詳しい内訳が表示されます。</p>
                <p class="how-to-q"><em>最も多く出場した国は？特定の国はシーズンを通じてどう戦った？</em></p>` },
  "howto.findKata": { jp: `<strong>型の分析（Kata Findings）</strong>
                <p>型の傾向を可視化します：人気ランキング、平均スコアのランキング、勝率グラフ（今シーズン演武された全ての型を対象）、階級別の内訳（上級と中級の型がどれだけ選ばれ、どう得点するか）、そして各型が選手個人の得点基準とどう比較されるか（その型が選手の通常より「難しい」か「易しい」かの目安）を示すグラフ。</p>
                <p>グラフの上にある文章による分析は、シーズンで最も注目すべき型の話題をまとめています。</p>
                <p class="how-to-q"><em>選手が好成績を収めている型は？トップ選手が最も選ぶ型は？</em></p>` },
  "howto.findAthlete": { jp: `<strong>選手の分析（Athlete Findings）</strong>
                <p>平均スコアと勝率で選手を順位付けするグラフ、スコアと勝率の散布図、最も多くの選手を派遣した国の内訳。各バーはクリック可能で、その選手や国の詳細カードへ移動します。</p>
                <p>グラフの上にある<strong>アスリート・スポットライト</strong>の記事が、シーズンで際立った選手を紹介します。</p>
                <p class="how-to-q"><em>最高得点の選手は誰？どの国が圧倒した？</em></p>` },
  "howto.compare": { jp: `<strong>男子 vs 女子</strong>
                <p>男女を並べて比較します：男子のみが演武した型、女子のみが演武した型（表で表示）、両者の重なりを示すベン図、性別ごとの人気上位5型。棒グラフと並べ替え可能な表が、男女両方が演武した各型の「男子 − 女子」平均スコア差を示します。</p>
                <p class="how-to-q"><em>片方の性別だけが演武する型はある？男女で最も得点が異なる型は？</em></p>` },
  "howto.medals": { jp: `<strong>メダル（Medals）</strong>
                <p>男子型と女子型のメダル表を並べて表示し、既定では金メダル数で並べ替えます。全9大会を通じた各国の金・銀・銅・合計メダル数を示します。列見出しをクリックすると並べ替えられます。</p>
                <p class="how-to-q"><em>今シーズン最も多くメダルを獲得した国は？</em></p>` },
  "howto.notesCard": { jp: `<strong>重要な注記（Important Notes）</strong>
                <p>データの収集方法、欠損しているデータとその理由、型の階級の定義、WKFの採点規則、勝率の解釈に関する指針。サイト上で不明な点や予想外の点があれば、こちらをお読みください。</p>
                <p class="how-to-q"><em>このデータはどう収集された？統計は実際に何を意味する？</em></p>` },
  "howto.aboutCard": { jp: `<strong>概要（About）</strong>
                <p>制作者の背景とこのプロジェクトの動機、手法に関する注記、そしてサイト構築に使用した生のCSVデータをダウンロードするリンク。</p>
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
  "Anan": "アーナン", "Anan Dai": "アーナンダイ", "Chatanyara Kusanku": "北谷屋良クーサンクー",
  "Chibana No Kushanku": "知花のクーサンクー", "Enpi": "燕飛", "Gankaku": "岩鶴",
  "Gojushiho": "五十四歩", "Gojushiho Dai": "五十四歩大", "Gojushiho Sho": "五十四歩小",
  "Jitte": "十手", "Kanku Sho": "観空小", "Kishimoto No Kushanku": "岸本のクーサンクー",
  "Kousoukun Dai": "公相君大", "Kousoukun Sho": "公相君小", "Kururunfa": "クルルンファ",
  "Kusanku": "クーサンクー", "Kyan No Chinto": "喜屋武のチントー", "Matsumura Bassai": "松村バッサイ",
  "Nijushiho": "二十四歩", "Nipaipo": "ニーパイポ", "Ohan": "オーハン", "Ohan Dai": "オーハンダイ",
  "Oyadomari No Passai": "親泊のパッサイ", "Pachu": "パーチュー", "Paiku": "パイクー",
  "Papuren": "パープーレン", "Sansai": "サンサイ", "Sanseiru": "サンセイルー", "Seipai": "セーパイ",
  "Seisan": "セーサン", "Shisochin": "シソーチン", "Sochin": "ソーチン", "Suparinpei": "スーパーリンペイ",
  "Tomari Bassai": "泊バッサイ", "Unsu": "雲手",
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
