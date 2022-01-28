#gets the number of days at each location give range
def placeCounts(range_start, col, t_log):
    from datetime import datetime, timedelta
    dates = list(t_log['date'])
    range_end = max(t_log['date'])
    idx_range_start = dates.index(range_start)
    idx_range_end = dates.index(range_end)

    range_start = datetime.fromisoformat(range_start)
    range_end = datetime.fromisoformat(range_end)
    range_delta = (range_end - range_start).days

    #filter to date range and get count of requested value
    t_log = t_log[:][idx_range_start:idx_range_end]
    place_names = list(t_log[col].value_counts().index)
    place_counts = list(t_log[col].value_counts())

    result = {}
    for x in zip(place_names, place_counts):
        result[x[0]] = (x[1], round(x[1]/range_delta, 5))
    result['n/a'] = (range_delta-sum(place_counts), round((len(t_log)-sum(place_counts))/range_delta, 5))
    
    return result

def rangeSummary(t_log, col, range_start):
    from datetime import datetime, timedelta
    range_start = datetime.fromisoformat(range_start)
    range_end = max(t_log['date'])
    summary = {}
    recent_place = 'init'
    recent_place_start = 'init'

    for idx,row in t_log[['date',col]].iterrows():
        if row['date'] >= range_start and row['date'] <= range_end:
            #remove NaT issue
            if type(row[col]) != type(str()) and type(row[col]) != type(tuple()): 
                    cur_place = 'n/a'
            if type(row[col]) == type(tuple()): 
                    cur_place = row[col][1] + ', ' + row[col][0]
            else:
                cur_place = row[col]
            if recent_place != cur_place:
                if recent_place != 'init':
                    summary[recent_place] = summary.setdefault(recent_place, []) + [(str(recent_place_start)[:10], str(row['date'] - timedelta(days=1))[:10])]

                recent_place = cur_place
                recent_place_start = row['date']
    summary[recent_place] = summary.setdefault(recent_place, []) + [(str(recent_place_start)[:10], str(row['date'])[:10])]
    
    return summary