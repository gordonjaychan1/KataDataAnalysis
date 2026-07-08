"""
Reads the season CSVs from ../data/ and writes ../data/data.json, which the
website loads at runtime. Run it from this scripts/ folder.

Usage:
    py export_data.py
"""

import pandas as pd
import numpy as np
import json
import os

# ── Load ──────────────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))

def find_csv(name):
    candidates = [
        os.path.join(script_dir, "..", "data", name),  # ../data/ (preferred)
        os.path.join(script_dir, name),
        os.path.join(os.path.expanduser("~"), "Downloads", name),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"Cannot find {name}. Place it in the data/ folder next to this script.")

df_m = pd.read_csv(find_csv("Male2425Season.csv"))
df_f = pd.read_csv(find_csv("Female2425Season.csv"))
df_m["Gender"] = "Male"
df_f["Gender"] = "Female"
df = pd.concat([df_m, df_f], ignore_index=True)

# ── Clean ─────────────────────────────────────────────────────────────────────
for col in ["Kata", "Karateka", "Tournament"]:
    df[col] = df[col].str.strip().str.title()

df["Score"]     = pd.to_numeric(df["Score"],     errors="coerce")
df["Avg Score"] = pd.to_numeric(df["Avg Score"], errors="coerce")
df_with_round = df.copy()
for col in ["Kata", "Karateka", "Tournament", "Opponent"]:
    if col in df_with_round.columns:
        df_with_round[col] = df_with_round[col].str.strip().str.title()          # keep Round # for performance history
df = df.drop(columns=["Score", "Round #"])

replacements = {
    "Chatanyara":  "Chatanyara Kusanku",
    "Chibana":     "Chibana No Kushanku",
    "Unu":         "Unsu",
    "Shishochin":  "Shisochin",
    "Kishimoto":   "Kishimoto No Kushanku",
    "Sanseru":     "Sanseiru",
}
df["Kata"] = df["Kata"].replace(replacements)
df["Kata"] = df["Kata"].replace(["", " ", "nan"], np.nan)
df_with_round["Kata"] = df_with_round["Kata"].replace(replacements)
df_with_round["Kata"] = df_with_round["Kata"].replace(["", " ", "nan"], np.nan)

# ── Missing data summary ──────────────────────────────────────────────────────
total_rows      = len(df)
complete_rows   = int((df["Kata"].notna() & df["Avg Score"].notna()).sum())
missing_kata_only  = int((df["Kata"].isna()  & df["Avg Score"].notna()).sum())
missing_score_only = int((df["Kata"].notna() & df["Avg Score"].isna()).sum())
missing_both       = int((df["Kata"].isna()  & df["Avg Score"].isna()).sum())

def gender_missing(g):
    dg = df[df["Gender"] == g]
    return {
        "total":              int(dg.shape[0]),
        "complete":           int((dg["Kata"].notna() & dg["Avg Score"].notna()).sum()),
        "missing_kata_only":  int((dg["Kata"].isna()  & dg["Avg Score"].notna()).sum()),
        "missing_score_only": int((dg["Kata"].notna() & dg["Avg Score"].isna()).sum()),
        "missing_both":       int((dg["Kata"].isna()  & dg["Avg Score"].isna()).sum()),
    }

missing_data = {
    "total":              total_rows,
    "complete":           complete_rows,
    "missing_kata_only":  missing_kata_only,
    "missing_score_only": missing_score_only,
    "missing_both":       missing_both,
    "male":   gender_missing("Male"),
    "female": gender_missing("Female"),
}

# ── Country map ───────────────────────────────────────────────────────────────
athlete_country = {
    "Ortiz Aquino Jefferson": "Venezuela", "Enes Ozdemir": "Turkey", "Sakichi Abe": "Japan",
    "Dyun Kimura": "Brazil", "Ariel Torres": "USA", "Alessandro Iodice": "Italy",
    "Mohammad Hussain": "Kuwait", "James Harrison": "England", "Ryonosuke Kikuchi": "Japan",
    "Howard Hung Ho Wai": "Hong Kong", "Almosawi Sayed Mohammed": "Kuwait",
    "Zaresta Yuda Ahmad Zigi": "Indonesia", "Ryuji Moto": "Japan", "Damian Quintero": "Spain",
    "Yuki Ujihara": "Switzerland", "Saber Benmekhlouf": "Algeria", "Kazumasa Moto": "Japan",
    "Martin Romero Raul": "Spain", "Alessio Ghinami": "Italy", "Roman Hrcka": "Slovakia",
    "Ali Sofuoglu": "Turkey", "Franck Ngoan": "France", "Taishi Tozaki": "USA",
    "Abu Wahib Jonas": "Germany", "Mattia Busato": "Italy", "Botond Nagy": "Hungary",
    "Almosawi Sayed Salman": "Kuwait", "Petru Comanescu": "Romania",
    "Kakeru Nishiyama": "Japan", "Gakuji Tozaki": "USA", "Kutluhan Duran": "Turkey",
    "Casanova Guerrero Cleiver": "Venezuela", "Dilara Bozan": "Turkey",
    "Lanyfer Minano": "Switzerland", "Putri Aprilia Krisda": "Indonesia",
    "Armada Ruiz Andrea": "Venezuela", "Mirisa Ohuchi": "Japan",
    "Veronika Miskova": "Czech Republic", "Athina Tsiakmaki": "Greece",
    "Danni Williams": "England", "Terryana D'Onofrio": "Italy", "Morales Ozuna Gema": "Spain",
    "Alexandra Feracci": "France", "Shirley Jay": "Germany", "Saeko Azuma": "Japan",
    "Lo Sum Man": "Hong Kong", "Semblano Mariana": "Portugal", "Mahsa Afsaneh": "Iran",
    "Chiara Manca": "Belgium", "Jasmin Juettner": "Germany", "Jana Vanusanikova": "Slovakia",
    "Maho Ono": "Japan", "Carola Casale": "Italy", "Aya En-Nesyry": "Morocco",
    "Nicole Turner": "England", "Natsuki Shimizu": "Japan", "Helvetia Taily": "France",
    "Garcia Lozano Paola": "Spain", "Ana Cruz": "Portugal", "Grace Lau": "Hong Kong",
    "Sakura Kokumai": "USA", "Xenou Georgia Archontia": "Greece", "Roberta Dominici": "Italy",
    "Tung Yee Yin": "Hong Kong", "Wong Sze Man": "Hong Kong", "Carolina Amato": "Italy",
    "Turemen Damla Su": "Turkey", "Colak Keyda Nur": "Turkey", "Sakura Alforte": "Philippines",
    "Sadeghi Dastak Fatemeh": "Iran", "Kiri Mishima": "Japan", "Adam Bardos": "Hungary",
    "Ryusei Ikeda": "Japan", "Furkan Kaynar": "Turkey", "Matthew Gruitia": "Canada",
    "Omar Diop": "Senegal", "Gianluca Gallo": "Italy", "Roman Heydarov": "Azerbaijan",
    "Aya Hesham": "Egypt", "Nodoka Yamada": "Japan", "Jana Khamis": "Egypt",
    "Mariam Elezaby": "Egypt", "Nakaji Hisami": "Japan", "Asmaa Allam": "Egypt",
    "Rey Chinen": "USA", "Yaroslav Fedorov": "Ukraine", "Yuki Sato": "Japan",
    "Manuel Grazia": "Italy", "Abu Alhaija Kareem": "Jordan", "Yasuhiro Machida": "Japan",
    "Giuseppe Panagia": "Italy", "Aoi Funada": "Japan", "Guido Polsinelli": "Italy",
    "Tijani Lamoum": "Morocco", "Anthony Vu": "Sweden", "Eiji Otsuki": "Japan",
    "Karim Ghaly": "Egypt", "El Mansoury Salah Eddine": "Morocco", "Kao Kitaguchi": "Japan",
    "Zapata Machado Valentina": "Colombia", "Natacha Fernandes": "Portugal",
    "Narimene Dahleb": "Algeria", "Chien Hui Hsuan": "Taiwan", "Rita Marques": "Portugal",
    "Tarik Koc": "Turkey", "Thomas Klemz": "France", "Perez De Abreu Ricardo": "Venezuela",
    "Rick Sonnema": "Netherlands", "Chen Chao Ching": "Taiwan", "Adam Ellithy": "Egypt",
    "Rimas Assi": "Egypt", "Rita Siebert": "Germany", "Habiba Mousa": "Egypt",
    "Mai-Linh Bui": "France", "Lila Ritz": "Switzerland", "Tamara Lehner": "Austria",
    "Yuto Watanabe": "Japan", "Kotaro Ohata": "Japan", "Gianluca Greco": "Venezuela",
    "Bu Khawwah Yaqoub": "Saudi Arabia", "Vladimir Mijac": "Montenegro",
    "Ninon Vaucelle-Spelle": "France", "Miriam Ederar": "Italy", "Yiwei Tao": "China",
    "Diana Oligino": "Venezuela", "Anicha Romba": "Burkina Faso",
    "Leong Wai Yee Shannon": "Singapore", "Quiroz Castillo Yaneth": "Mexico",
    "Holly Wigg": "New Zealand", "Mia Karlsson": "Sweden", "Sofia Fialkova": "Slovakia",
    "Stephanie Dimovska": "Australia", "Gabrielle Henrique": "Brazil",
    "Jasmin Bleul": "Germany", "Claudia Laos-Loo": "Canada", "Thing Sanu Maya": "Nepal",
    "Lovelly Anne Robberth": "Malaysia", "De Castro Heriberto": "Dominican Republic",
    "Dylan Fisher": "Australia", "Mostafa Elghobashy": "Egypt",
    "Nicholas Rowsby": "New Zealand", "Kangwei Yang": "China",
    "Oluwaseun Olorunmbe": "Nigeria", "Artur Neto": "Portugal",
    "Impagnatiello Luca Mateo": "Argentina", "Brillant Mukeshimana": "Burundi",
    "Taeyeon Hwang": "South Korea", "Youcef Ziad": "Algeria", "Morris Tellocke": "Germany",
    "Alejandro Ramirez": "Colombia", "Jure Sluga": "Slovenia",
}
df["Country"] = df["Karateka"].map(athlete_country)

# ── Kata tiers ────────────────────────────────────────────────────────────────
adv_kata = [
    "Anan", "Anan Dai", "Chatanyara Kusanku", "Chibana No Kushanku", "Chinto",
    "Gankaku", "Gojushiho", "Gojushiho Dai", "Gojushiho Sho", "Hakucho", "Heiku",
    "Kanchin", "Kanku Sho", "Kishimoto No Kushanku", "Kousoukun Dai", "Kururunfa",
    "Kyan No Chinto", "Kyan No Wanshu", "Matsumura Bassai", "Nipaipo", "Ohan",
    "Ohan Dai", "Oyadomari No Passai", "Paiku", "Papuren", "Sansai", "Seishan",
    "Suparinpei", "Tomari Bassai", "Unsu", "Useishi",
]
interm_kata = [
    "Ananko", "Aoyagi", "Bassai", "Bassai Dai", "Bassai Sho", "Chinte", "Enpi",
    "Garyu", "Hangetsu", "Haufa", "Ishimine Bassai", "Itosu Rohai Shodan",
    "Itosu Rohai Nidan", "Itosu Rohai Sandan", "Jiin", "Jion", "Jitte", "Juroku",
    "Kanku Dai", "Kanshu", "Kousoukun", "Kousoukun Sho", "Kusanku", "Matsukaze",
    "Matsumura Rohai", "Meikyo", "Myojo", "Naifanchin Shodan", "Naifanchin Nidan",
    "Naifanchin Sandan", "Naihanchi", "Nijushiho", "Niseishi", "Pachu", "Passai",
    "Rohai", "Saifa", "Sanchin", "Sanseiru", "Sanseru", "Seichin", "Seienchin",
    "Seipai", "Seiryu", "Seisan", "Shiho Kousoukun", "Shinpa", "Shinsei", "Shisochin",
    "Sochin", "Tekki Shodan", "Tekki Nidan", "Tekki Sandan", "Tensho", "Wankan", "Wanshu",
]

def assign_tier(kata):
    if pd.isna(kata):       return "Missing"
    if kata in adv_kata:    return "Advanced"
    if kata in interm_kata: return "Intermediate"
    return "Beginner"

df["Kata Tier"] = df["Kata"].apply(assign_tier)
df_clean = df.dropna(subset=["Kata", "Avg Score"]).copy()
df_total = df.copy()

# ── Kata master ───────────────────────────────────────────────────────────────
def build_kata_master(df_all, df_scores):
    base = (
        df_all.groupby("Kata")
        .agg(Performances=("Kata", "size"), Win_Rate=("Won?", "mean"), Kata_Tier=("Kata Tier", "first"))
        .reset_index()
    )
    scores = (
        df_scores.groupby("Kata")["Avg Score"]
        .agg(Mean_Score="mean", Median_Score="median", Min_Score="min", Max_Score="max", Std_Dev="std")
        .reset_index()
    )
    unique_k = df_all.groupby("Kata")["Karateka"].nunique().reset_index(name="Unique_Karateka")
    athlete_counts = (
        df_all.dropna(subset=["Kata", "Karateka"])
        .groupby(["Kata", "Karateka"]).size().reset_index(name="Performances")
    )
    athlete_scores = (
        df_scores.dropna(subset=["Kata", "Karateka"])
        .groupby(["Kata", "Karateka"])["Avg Score"].mean().reset_index(name="Avg_Score")
    )
    athlete_scores["Avg_Score"] = athlete_scores["Avg_Score"].round(3)
    all_k = (
        athlete_counts.merge(athlete_scores, on=["Kata", "Karateka"], how="left")
        .sort_values("Performances", ascending=False)
        .groupby("Kata")
        .apply(lambda g: g[["Karateka", "Performances", "Avg_Score"]].to_dict("records"), include_groups=False)
        .reset_index(name="All_Karateka")
    )
    km = base.merge(scores, on="Kata", how="left").merge(unique_k, on="Kata", how="left").merge(all_k, on="Kata", how="left")
    km["Range"] = (km["Max_Score"] - km["Min_Score"]).round(2)
    for col in ["Mean_Score", "Std_Dev", "Win_Rate"]:
        km[col] = km[col].round(4)
    for col in ["Median_Score", "Min_Score", "Max_Score"]:
        km[col] = km[col].round(2)
    km["Unique_Karateka"] = km["Unique_Karateka"].astype(int)
    return km.sort_values("Performances", ascending=False).reset_index(drop=True)

kata_m = build_kata_master(df[df["Gender"] == "Male"], df_clean[df_clean["Gender"] == "Male"])
kata_f = build_kata_master(df[df["Gender"] == "Female"], df_clean[df_clean["Gender"] == "Female"])

# ── Karateka master ───────────────────────────────────────────────────────────
def build_karateka_master(df_all, df_scores, df_rounds_g=None):
    base = (
        df_all.groupby("Karateka")
        .agg(
            Performances=("Karateka", "size"),
            Win_Rate=("Won?", "mean"),
            Tournaments_Attended=("Tournament", "nunique"),
            Country=("Country", "first"),
        )
        .reset_index()
    )
    scores = (
        df_scores.groupby("Karateka")["Avg Score"]
        .agg(Mean_Score="mean", Median_Score="median", Min_Score="min", Max_Score="max")
        .reset_index()
    )
    repertoire = (
        df_all.dropna(subset=["Kata"])
        .groupby(["Karateka", "Kata"]).size().reset_index(name="count")
        .sort_values("count", ascending=False)
        .groupby("Karateka")
        .apply(lambda g: g[["Kata", "count"]].to_dict("records"), include_groups=False)
        .reset_index(name="Kata_Repertoire")
    )
    tourn_hist = (
        df_all.groupby("Karateka")["Tournament"]
        .apply(lambda x: sorted(x.unique().tolist()))
        .reset_index(name="Tournament_List")
    )
    km = (
        base
        .merge(scores, on="Karateka", how="left")
        .merge(repertoire, on="Karateka", how="left")
        .merge(tourn_hist, on="Karateka", how="left")
    )
    km["Win_Rate"]     = km["Win_Rate"].round(4)
    km["Mean_Score"]   = km["Mean_Score"].round(2)
    km["Median_Score"] = km["Median_Score"].round(2)
    km["Min_Score"]    = km["Min_Score"].round(2)
    km["Max_Score"]    = km["Max_Score"].round(2)
    if df_rounds_g is not None:
        rnd = df_rounds_g.rename(columns={"Round #": "Round", "Won?": "Won", "Avg Score": "Avg_Score"})
        rnd["Avg_Score"] = rnd["Avg_Score"].round(3)
        cols = ["Tournament", "Round", "Kata", "Avg_Score", "Won"]
        if "Opponent" in rnd.columns:
            cols.append("Opponent")
        perf_detail = (
            rnd.groupby("Karateka")
            .apply(lambda g: g[cols].to_dict("records"), include_groups=False)
            .reset_index(name="Performances_Detail")
        )
        km = km.merge(perf_detail, on="Karateka", how="left")
    return km.sort_values("Performances", ascending=False).reset_index(drop=True)

dm_round = df_with_round[df_with_round["Gender"] == "Male"]
df_round = df_with_round[df_with_round["Gender"] == "Female"]
karateka_m = build_karateka_master(df[df["Gender"] == "Male"], df_clean[df_clean["Gender"] == "Male"], dm_round)
karateka_f = build_karateka_master(df[df["Gender"] == "Female"], df_clean[df_clean["Gender"] == "Female"], df_round)

# ── Placements / medals ───────────────────────────────────────────────────────
try:
    pldf = pd.read_csv(find_csv("Placements.csv"))
    medals = {"male": {}, "female": {}}
    for _, row in pldf.iterrows():
        tourn = str(row.iloc[0]).strip().title()
        combos = [
            ("male",   row.iloc[1], 1), ("male",   row.iloc[2], 2),
            ("male",   row.iloc[3], 3), ("male",   row.iloc[4], 3),
            ("female", row.iloc[5], 1), ("female", row.iloc[6], 2),
            ("female", row.iloc[7], 3), ("female", row.iloc[8], 3),
        ]
        for g, name, place in combos:
            if pd.isna(name) or str(name).strip() == "":
                continue
            name = str(name).strip()
            medals[g].setdefault(name, []).append({"Tournament": tourn, "Place": place})
    for km_df, g_key in [(karateka_m, "male"), (karateka_f, "female")]:
        km_df["Medals"] = km_df["Karateka"].map(lambda k: medals[g_key].get(k, []))
    print("Placements loaded.")
except FileNotFoundError:
    print("Placements CSV not found — medals skipped.")

# ── Tournament summary ────────────────────────────────────────────────────────
tourn_summary = []
for (tourn, gender), grp in df_total.groupby(["Tournament", "Gender"]):
    clean_grp = df_clean[(df_clean["Tournament"] == tourn) & (df_clean["Gender"] == gender)]
    tourn_summary.append({
        "Tournament": tourn,
        "Gender": gender,
        "Total_Performances": int(grp.shape[0]),
        "Unique_Kata": int(clean_grp["Kata"].nunique()),
        "Unique_Karateka": int(grp["Karateka"].nunique()),
        "Avg_Score": round(float(clean_grp["Avg Score"].mean()), 3) if len(clean_grp) else None,
        "Missing_Kata":  int((grp["Kata"].isna()  & grp["Avg Score"].notna()).sum()),
        "Missing_Score": int((grp["Kata"].notna() & grp["Avg Score"].isna()).sum()),
        "Missing_Both":  int((grp["Kata"].isna()  & grp["Avg Score"].isna()).sum()),
    })
tourn_summary.sort(key=lambda x: (x["Tournament"], x["Gender"]))

# ── Tier summary ─────────────────────────────────────────────────────────────
def build_tier_summary(df_g):
    performed_adv   = sorted(df_g[df_g["Kata Tier"] == "Advanced"]["Kata"].dropna().unique().tolist())
    performed_interm = sorted(df_g[df_g["Kata Tier"] == "Intermediate"]["Kata"].dropna().unique().tolist())
    unperformed_adv   = sorted([k for k in adv_kata   if k not in performed_adv])
    unperformed_interm = sorted([k for k in interm_kata if k not in performed_interm])
    return {
        "adv_kata_count":    len(adv_kata),
        "adv_performances":  int((df_g["Kata Tier"] == "Advanced").sum()),
        "adv_performed":     performed_adv,
        "adv_unperformed":   unperformed_adv,
        "interm_kata_count":   len(interm_kata),
        "interm_performances": int((df_g["Kata Tier"] == "Intermediate").sum()),
        "interm_performed":    performed_interm,
        "interm_unperformed":  unperformed_interm,
    }

# ── Kata score vs karateka average ────────────────────────────────────────────
def build_kata_vs_karateka_avg(df_clean_g):
    karateka_avg = df_clean_g.groupby("Karateka")["Avg Score"].mean()
    tmp = df_clean_g.copy()
    tmp["Karateka_Avg"] = tmp["Karateka"].map(karateka_avg)
    tmp["Diff"] = tmp["Avg Score"] - tmp["Karateka_Avg"]
    result = (
        tmp.groupby("Kata")
        .agg(Diff=("Diff", "mean"), Performances=("Diff", "count"))
        .reset_index()
    )
    result["Diff"] = result["Diff"].round(3)
    return result.sort_values("Diff", ascending=False).to_dict("records")

# ── Kata std dev vs unique performers ─────────────────────────────────────────
def build_kata_std_dev_table(df_clean_g):
    std_dev  = df_clean_g.groupby("Kata")["Avg Score"].std().reset_index(name="Std_Dev")
    unique_k = df_clean_g.groupby("Kata")["Karateka"].nunique().reset_index(name="Unique_Karateka")
    result = std_dev.merge(unique_k, on="Kata")
    result["Std_Dev"] = result["Std_Dev"].round(3)
    return result.sort_values("Unique_Karateka", ascending=False).to_dict("records")

# ── Country summary (per gender) ──────────────────────────────────────────────
def country_summary(df_g):
    counts = df_g.groupby("Country")["Karateka"].nunique().reset_index(name="Athletes")
    return counts.sort_values("Athletes", ascending=False).to_dict("records")

country_m = country_summary(df[df["Gender"] == "Male"])
country_f = country_summary(df[df["Gender"] == "Female"])

# ── Meta ──────────────────────────────────────────────────────────────────────
meta = {
    "total_performances":  int(df_total.shape[0]),
    "num_tournaments":     int(df_total["Tournament"].nunique()),
    "male_karateka":       int(df[df["Gender"] == "Male"]["Karateka"].nunique()),
    "female_karateka":     int(df[df["Gender"] == "Female"]["Karateka"].nunique()),
    "male_kata":           int(df[df["Gender"] == "Male"]["Kata"].nunique()),
    "female_kata":         int(df[df["Gender"] == "Female"]["Kata"].nunique()),
    "male_performances":   int(df[df["Gender"] == "Male"].shape[0]),
    "female_performances": int(df[df["Gender"] == "Female"].shape[0]),
}

# ── Serialize ─────────────────────────────────────────────────────────────────
def clean(obj):
    if isinstance(obj, float) and np.isnan(obj): return None
    if isinstance(obj, dict):  return {k: clean(v) for k, v in obj.items()}
    if isinstance(obj, list):  return [clean(i) for i in obj]
    return obj

dm = df_clean[df_clean["Gender"] == "Male"]
df_ = df_clean[df_clean["Gender"] == "Female"]

output = {
    "meta":         meta,
    "missing_data": missing_data,
    "kata":         {"male": clean(kata_m.to_dict("records")),      "female": clean(kata_f.to_dict("records"))},
    "karateka":     {"male": clean(karateka_m.to_dict("records")),  "female": clean(karateka_f.to_dict("records"))},
    "tournaments":  clean(tourn_summary),
    "countries":    {"male": clean(country_m), "female": clean(country_f)},
    "tier_summary": {
        "male":   build_tier_summary(df[df["Gender"] == "Male"]),
        "female": build_tier_summary(df[df["Gender"] == "Female"]),
    },
    "kata_vs_karateka_avg": {
        "male":   clean(build_kata_vs_karateka_avg(dm)),
        "female": clean(build_kata_vs_karateka_avg(df_)),
    },
    "kata_std_dev": {
        "male":   clean(build_kata_std_dev_table(dm)),
        "female": clean(build_kata_std_dev_table(df_)),
    },
}

out_path = os.path.join(script_dir, "..", "data", "data.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Done. Wrote {out_path}")
