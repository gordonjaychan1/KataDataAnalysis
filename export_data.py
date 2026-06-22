"""
Run this script from the same folder as Male2425Season.csv and Female2425Season.csv.
It generates data.json used by the website.

Usage:
    python export_data.py
"""

import pandas as pd
import numpy as np
import json
import os

# ── Load ──────────────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))

def find_csv(name):
    candidates = [
        os.path.join(script_dir, name),
        os.path.join(os.path.expanduser("~"), "Downloads", name),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"Cannot find {name}. Place it next to this script or in ~/Downloads.")

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

    # top karateka (by performances) per kata
    top_k = (
        df_all.dropna(subset=["Kata"])
        .groupby(["Kata", "Karateka"])
        .size()
        .reset_index(name="n")
        .sort_values("n", ascending=False)
        .groupby("Kata")
        .apply(lambda g: g.head(5)[["Karateka", "n"]].rename(columns={"n": "performances"}).to_dict("records"))
        .reset_index(name="Top_Karateka")
    )

    km = base.merge(scores, on="Kata", how="left").merge(unique_k, on="Kata", how="left").merge(top_k, on="Kata", how="left")
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
def build_karateka_master(df_all, df_scores):
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
    # kata repertoire: list of {kata, count}
    repertoire = (
        df_all.dropna(subset=["Kata"])
        .groupby(["Karateka", "Kata"])
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .groupby("Karateka")
        .apply(lambda g: g[["Kata", "count"]].to_dict("records"))
        .reset_index(name="Kata_Repertoire")
    )
    # tournament history: list of tournament names
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
    for col in ["Win_Rate"]:
        km[col] = km[col].round(4)
    for col in ["Mean_Score", "Median_Score", "Min_Score", "Max_Score"]:
        km[col] = km[col].round(2)
    return km.sort_values("Performances", ascending=False).reset_index(drop=True)

karateka_m = build_karateka_master(df[df["Gender"] == "Male"], df_clean[df_clean["Gender"] == "Male"])
karateka_f = build_karateka_master(df[df["Gender"] == "Female"], df_clean[df_clean["Gender"] == "Female"])

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
    })
tourn_summary.sort(key=lambda x: (x["Tournament"], x["Gender"]))

# ── Meta ──────────────────────────────────────────────────────────────────────
meta = {
    "total_performances": int(df_total.shape[0]),
    "num_tournaments": int(df_total["Tournament"].nunique()),
    "male_karateka": int(df[df["Gender"] == "Male"]["Karateka"].nunique()),
    "female_karateka": int(df[df["Gender"] == "Female"]["Karateka"].nunique()),
    "male_kata": int(df[df["Gender"] == "Male"]["Kata"].nunique()),
    "female_kata": int(df[df["Gender"] == "Female"]["Kata"].nunique()),
}

# ── Serialize (NaN → None) ────────────────────────────────────────────────────
def clean(obj):
    if isinstance(obj, float) and np.isnan(obj): return None
    if isinstance(obj, dict):  return {k: clean(v) for k, v in obj.items()}
    if isinstance(obj, list):  return [clean(i) for i in obj]
    return obj

output = {
    "meta": meta,
    "kata":      {"male": clean(kata_m.to_dict("records")),      "female": clean(kata_f.to_dict("records"))},
    "karateka":  {"male": clean(karateka_m.to_dict("records")),  "female": clean(karateka_f.to_dict("records"))},
    "tournaments": clean(tourn_summary),
}

out_path = os.path.join(script_dir, "data.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Done. Wrote {out_path}")
