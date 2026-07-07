(function (global) {
  'use strict';

  var LIVE_STATUSES = { LIVE: 1, IN_PLAY: 1, IN_PLAY_NOW: 1, PAUSED: 1 };
  var DAY_ABBR = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function abbreviateDay(dayOfWeek) {
    var n = String(dayOfWeek || '').trim().toLowerCase();
    if (n.indexOf('понедельник') === 0 || n === 'пн') return 'пн';
    if (n.indexOf('вторник') === 0 || n === 'вт') return 'вт';
    if (n.indexOf('среда') === 0 || n === 'ср') return 'ср';
    if (n.indexOf('четверг') === 0 || n === 'чт') return 'чт';
    if (n.indexOf('пятница') === 0 || n === 'пт') return 'пт';
    if (n.indexOf('суббота') === 0 || n === 'сб') return 'сб';
    if (n.indexOf('воскресенье') === 0 || n === 'вс') return 'вс';
    return n;
  }

  function sortedMatches(response) {
    var matches = response && response.matches ? response.matches : {};
    return Object.keys(matches).map(function (k) { return matches[k]; }).sort(function (a, b) {
      var da = (a.date || '') + (a.time || '');
      var db = (b.date || '') + (b.time || '');
      if (da !== db) return da < db ? -1 : 1;
      return String(a.id).localeCompare(String(b.id));
    });
  }

  function matchId(match) {
    if (match.id == null) return '';
    return String(match.id);
  }

  function parseKickoff(match) {
    var date = match.date;
    var time = (match.time || '').trim();
    if (date && time) {
      var hp = time.split(':');
      var y = parseInt(date.slice(0, 4), 10);
      var mo = parseInt(date.slice(5, 7), 10) - 1;
      var day = parseInt(date.slice(8, 10), 10);
      var h = parseInt(hp[0], 10) || 0;
      var min = parseInt(hp[1], 10) || 0;
      var d = new Date(y, mo, day, h, min, 0, 0);
      if (!isNaN(d.getTime())) return d;
    }
    if (date) {
      var y0 = parseInt(date.slice(0, 4), 10);
      var mo0 = parseInt(date.slice(5, 7), 10) - 1;
      var day0 = parseInt(date.slice(8, 10), 10);
      var d0 = new Date(y0, mo0, day0, 0, 0, 0, 0);
      if (!isNaN(d0.getTime())) return d0;
    }
    if (match.timestamp > 0) return new Date(match.timestamp * 1000);
    return null;
  }

  function formatDisplayDate(d) {
    return pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1);
  }

  function formatDisplayTime(d) {
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function resolveGroupLabel(match) {
    if (match.group_ru) {
      var part = match.group_ru.split(' ').pop();
      if (part) return part;
    }
    if (match.group) {
      return match.group.replace(/^GROUP_/, '');
    }
    return match.stage_ru || match.stage || '';
  }

  function resolveTeamName(match, side) {
    var ru = side === 1 ? match.team1_name_ru : match.team2_name_ru;
    var en = side === 1 ? match.team1_name : match.team2_name;
    var code = side === 1 ? match.team1_code : match.team2_code;
    if (ru) return ru;
    if (en) return en;
    if (code) return code;
    return 'Н/Д';
  }

  function resolveScore(match) {
    var s = match.score || {};
    var home = s.team1 != null ? s.team1 : s.home;
    var away = s.team2 != null ? s.team2 : s.away;
    if (home != null && away != null) return { home: home, away: away, text: home + ' : ' + away };
    return null;
  }

  function isLiveStatus(status) {
    return !!(status && LIVE_STATUSES[String(status).trim().toUpperCase()]);
  }

  function resolveAvailability(match, kickoff, score) {
    if (isLiveStatus(match.status)) return 'live';
    if (score) return 'available';
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!kickoff) return 'available';
    var kickDate = new Date(kickoff);
    kickDate.setHours(0, 0, 0, 0);
    if (kickDate > today) return 'future';
    return 'available';
  }

  function formatGroupLabel(match) {
    var stage = match.stage_ru || match.stage || '';
    if (/финал/i.test(stage) || /1\/\d+/.test(stage)) return stage.replace(/\s*\.\.\.$/, '');
    var g = resolveGroupLabel(match);
    if (match.group || match.group_ru) return 'Группа ' + g;
    return g;
  }

  function mapMatch(match, kickoff, teams) {
    var score = resolveScore(match);
    var kickDate = kickoff ? new Date(kickoff) : null;
    if (kickDate) kickDate.setHours(0, 0, 0, 0);
    return {
      matchId: matchId(match),
      group: resolveGroupLabel(match),
      groupLabel: formatGroupLabel(match),
      time: kickoff ? formatDisplayTime(kickoff) : (match.time || ''),
      teamHome: resolveTeamName(match, 1),
      teamAway: resolveTeamName(match, 2),
      score: score,
      isLive: isLiveStatus(match.status),
      channelIds: match.channels || [],
      kickoffDate: kickDate,
      flagHomeUrl: global.FifaFlag
        ? FifaFlag.resolveTeamCrest(match, 1, teams)
        : null,
      flagAwayUrl: global.FifaFlag
        ? FifaFlag.resolveTeamCrest(match, 2, teams)
        : null,
      availability: resolveAvailability(match, kickoff, score)
    };
  }

  function toScheduleItems(response) {
    var teams = (response && response.teams) || {};
    var items = [];
    var currentDateKey = null;
    sortedMatches(response).forEach(function (match) {
      var kickoff = parseKickoff(match);
      if (!kickoff) return;
      var dateKey = kickoff.toISOString().slice(0, 10);
      if (dateKey !== currentDateKey) {
        currentDateKey = dateKey;
        items.push({
          type: 'date',
          date: formatDisplayDate(kickoff),
          dayOfWeek: DAY_ABBR[kickoff.getDay()]
        });
      }
      items.push({ type: 'match', data: mapMatch(match, kickoff, teams) });
    });
    return items;
  }

  function toScheduleSections(response) {
    var sections = [];
    var current = null;
    toScheduleItems(response).forEach(function (item) {
      if (item.type === 'date') {
        if (current) sections.push(current);
        current = { date: item.date, dayOfWeek: item.dayOfWeek, matches: [] };
      } else if (item.type === 'match' && current) {
        current.matches.push(item.data);
      }
    });
    if (current) sections.push(current);
    return sections;
  }

  global.FifaScheduleMapper = {
    toScheduleItems: toScheduleItems,
    toScheduleSections: toScheduleSections,
    sortedMatches: sortedMatches
  };
})(typeof window !== 'undefined' ? window : global);
