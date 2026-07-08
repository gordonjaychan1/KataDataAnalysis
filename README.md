# 2024–25 WKF Season — Kata Analysis

A website that compiles and analyzes men's and women's **kata** competition data
from the 2024–25 World Karate Federation (WKF) season.

🔗 **Live site:** https://gordonjaychan1.github.io/KataDataAnalysis/

Every ranked performance from the season's major tournaments is recorded and
turned into browsable tables, per-athlete and per-kata breakdowns, and a set of
charts exploring which kata win, who performs them best, and how the men's and
women's fields compare.

## Features

- **Data tables** — Kata, Athletes, Tournaments, Countries, and Medals, all
  sortable and searchable.
- **Analysis** — Kata analysis, athlete analysis, and a Male vs. Female
  comparison, with charts for popularity, average score, win rate, score
  spread, tier breakdowns, and a world map of athletes by country.
- **Bilingual** — full English and Japanese (日本語) translations.
- **Light / dark theme** — remembered across visits.
- **Downloadable data** — the raw season CSVs are available from the site.

## Data

All data lives in [`data/`](data/):

| File | Contents |
| --- | --- |
| `Male2425Season.csv` | Every men's ranked performance (~1,000 rows) |
| `Female2425Season.csv` | Every women's ranked performance (~960 rows) |
| `Medals.csv` | Podium (1st–3rd) for each tournament |
| `data.json` | Generated aggregate consumed by the site (see below) |

Each performance row has the columns:

```
Kata, Score, Avg Score, Won?, Karateka, Round #, Tournament, Opponent
```

## How it works

This is a **static site** — plain HTML, CSS, and vanilla JavaScript, hosted on
GitHub Pages. There is no build step to view it; the browser loads
`index.html`, which fetches the pre-computed `data/data.json` and renders
everything client-side.

`data.json` is generated from the CSVs by a Python script:

```bash
cd scripts
python export_data.py   # reads ../data/*.csv, writes ../data/data.json
```

Requires Python 3 with `pandas` and `numpy`. Re-run it whenever the CSVs change,
then commit the updated `data.json`.

## Project structure

```
index.html            Single-page app (markup + inline layout)
favicon.svg
assets/
  css/style.css       All styling
  js/app.js           App logic, tables, charts, rendering
  js/i18n.js          English / Japanese translation strings
  vendor/             Third-party libraries (Chart.js)
data/                 Source CSVs + generated data.json
images/
  athletes/           Athlete headshots, one <slug>.jpg per athlete
  reference/          Reference and illustrative images
scripts/
  export_data.py      Builds data.json from the CSVs
```

### Athlete photos

Headshots are matched to athletes by a filename slug: the name is lowercased,
accents are stripped, and every run of non-alphanumeric characters becomes a
single hyphen — e.g. `Terryana D'Onofrio` → `terryana-d-onofrio.jpg`. Drop a
matching `.jpg` into `images/athletes/` and the athlete's card picks it up
automatically. The slug logic lives in `photoSlug()` in `assets/js/app.js`.

## Charts & libraries

- **Chart.js** — bar/scatter charts (vendored in `assets/vendor/`).
- **D3** + **topojson-client** — the world map of athletes by country (loaded
  from a CDN).

## Development

Because everything is static, the simplest way to run it locally is any static
file server from the repo root:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` will not work, since the app
`fetch()`es `data/data.json` and needs an HTTP origin.
