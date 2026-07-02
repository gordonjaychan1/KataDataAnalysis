import json

with open('other/data.json') as f:
    data = json.load(f)

for g in ['male','female']:
    kata = data['kata'][g]
    kar = data['karateka'][g]

    scored = [r for r in kata if r.get('Mean_Score') is not None]
    tw = sum(r['Performances'] for r in scored)
    kata_wt = sum(r['Mean_Score']*r['Performances'] for r in scored)/tw if tw else None

    tp = sum(k.get('Performances',0) for k in kar)
    ts = sum(k['Mean_Score']*k['Performances'] for k in kar if k.get('Mean_Score') is not None)
    ath_wt = ts/tp if tp else None

    simple = sum(r['Mean_Score'] for r in scored)/len(scored)

    print(g, 'kata-wt:', round(kata_wt,4), 'ath-wt:', round(ath_wt,4), 'simple:', round(simple,4))

    byDiff = sorted([r for r in kata if r.get('Diff') is not None], key=lambda r: r['Diff'])
    byDiffD = sorted(byDiff, key=lambda r: -r['Diff'])
    byWR5 = sorted([r for r in kata if r.get('Win_Rate') is not None and r['Performances']>=5], key=lambda r: -r['Win_Rate'])
    byScore = sorted(scored, key=lambda r: -r['Mean_Score'])
    byPerfs = sorted(kata, key=lambda r: -r['Performances'])
    byAthletes = sorted(kata, key=lambda r: -r.get('Unique_Karateka',0))

    for r in byDiff[:3]:
        print('  low diff:', r['Kata'], 'diff='+str(round(r['Diff'],3)), 'WR='+str(round(r.get('Win_Rate',0)*100,1))+'%', 'score='+str(round(r['Mean_Score'],3) if r.get('Mean_Score') else '?'), 'perfs='+str(r['Performances']))
    for r in byDiffD[:3]:
        print('  high diff:', r['Kata'], 'diff='+str(round(r['Diff'],3)), 'WR='+str(round(r.get('Win_Rate',0)*100,1))+'%', 'perfs='+str(r['Performances']))
    print('  highest WR(>=5):', byWR5[0]['Kata'], str(round(byWR5[0]['Win_Rate']*100,1))+'%', 'diff='+str(round(byWR5[0].get('Diff',0),3) if byWR5[0].get('Diff') is not None else '?'))
    print('  lowest WR(>=5):', byWR5[-1]['Kata'], str(round(byWR5[-1]['Win_Rate']*100,1))+'%')
    print('  top score:', byScore[0]['Kata'], round(byScore[0]['Mean_Score'],3), 'perfs='+str(byScore[0]['Performances']))
    print('  bot score:', byScore[-1]['Kata'], round(byScore[-1]['Mean_Score'],3), 'perfs='+str(byScore[-1]['Performances']))
    print('  most performed:', byPerfs[0]['Kata'], byPerfs[0]['Performances'])

    # Countries
    countries = data['countries'][g]
    byAthletes2 = sorted(countries, key=lambda r: -r.get('Athletes',0))
    byWRc = sorted([r for r in countries if r.get('Win_Rate') is not None and r.get('Athletes',0)>=3], key=lambda r: -r['Win_Rate'])
    byScoreC = sorted([r for r in countries if r.get('Avg_Score') is not None and r.get('Athletes',0)>=3], key=lambda r: -r['Avg_Score'])
    print('  top 5 countries by athletes:', [(r['Country'], r['Athletes']) for r in byAthletes2[:5]])
    print('  top countries by WR (>=3 athletes):', [(r['Country'], round(r['Win_Rate']*100,1)) for r in byWRc[:3]])
    print('  top countries by score (>=3 athletes):', [(r['Country'], round(r['Avg_Score'],3)) for r in byScoreC[:3]])

    # Athletes
    karAll = kar
    byScore_a = sorted([k for k in karAll if k.get('Mean_Score') is not None and k.get('Performances',0)>=5], key=lambda k: -k['Mean_Score'])
    byPerfs_a = sorted(karAll, key=lambda k: -k.get('Performances',0))
    byWR_a = sorted([k for k in karAll if k.get('Win_Rate') is not None and k.get('Performances',0)>=5], key=lambda k: -k['Win_Rate'])
    print('  top 5 athletes by score (>=5 perfs):', [(k['Karateka'], k['Country'], round(k['Mean_Score'],3), k['Performances']) for k in byScore_a[:5]])
    print('  top 3 athletes by perfs:', [(k['Karateka'], k['Country'], k['Performances']) for k in byPerfs_a[:3]])
    print('  top 3 athletes by WR (>=5 perfs):', [(k['Karateka'], k['Country'], round(k['Win_Rate']*100,1)) for k in byWR_a[:3]])
    print('---')
