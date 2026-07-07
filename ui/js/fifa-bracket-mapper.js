(function (global) {
  'use strict';

  var LIVE = { LIVE: 1, IN_PLAY: 1, IN_PLAY_NOW: 1, PAUSED: 1 };
  var FINISHED = { FINISHED: 1, AWARDED: 1 };
  var UNPLAYED = { TIMED: 1, SCHEDULED: 1, NOT_STARTED: 1 };

  function resolveTableOrder(match) {
    if (match.table_order >= 1 && match.table_order <= 32) return match.table_order;
    var id = String(match.id || '');
    if (id.indexOf('PLAYOFF_') === 0) {
      var n = parseInt(id.replace('PLAYOFF_', ''), 10);
      if (n >= 1 && n <= 32) return n;
    }
    return null;
  }

  function playoffMap(response) {
    var out = {};
    var matches = (response && response.matches) || {};
    Object.keys(matches).forEach(function (k) {
      var m = matches[k];
      var id = m.id != null ? String(m.id) : '';
      if (id.indexOf('PLAYOFF_') === 0 || m.table_order != null) out[id] = m;
    });
    return out;
  }

  function teamName(match, side) {
    var ru = side === 1 ? match.team1_name_ru : match.team2_name_ru;
    var en = side === 1 ? match.team1_name : match.team2_name;
    if (ru) return ru;
    if (en) return en;
    return null;
  }

  function isFinished(match) {
    var st = String(match.status || '').toUpperCase();
    if (FINISHED[st]) return true;
    var s = match.score || {};
    var h = s.team1 != null ? s.team1 : s.home;
    var a = s.team2 != null ? s.team2 : s.away;
    return h != null && a != null && !UNPLAYED[st];
  }

  function winnerSide(match) {
    var s = match.score || {};
    var h = s.team1 != null ? s.team1 : s.home;
    var a = s.team2 != null ? s.team2 : s.away;
    if (h == null || a == null) return null;
    if (h > a) return 1;
    if (a > h) return 2;
    return null;
  }

  function resolveTeamLabel(match, side, playoffById, teams, tbd) {
    var direct = teamName(match, side);
    if (direct) return direct;
    var src = side === 1 ? match.team1_source : match.team2_source;
    if (!src) return tbd;
    if (src.match_id) {
      var feeder = playoffById[src.match_id];
      if (feeder && isFinished(feeder)) {
        var w = winnerSide(feeder);
        if (!w) return tbd;
        var loser = w === 1 ? 2 : 1;
        var role = String(src.role || 'winner').toLowerCase();
        var pick = role === 'loser' ? loser : w;
        return resolveTeamLabel(feeder, pick, playoffById, teams, tbd);
      }
    }
    return tbd;
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
    if (match.timestamp > 0) return new Date(match.timestamp * 1000);
    return null;
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function formatTeamLine(name, goals) {
    if (goals == null) return name;
    return name + ' ' + goals;
  }

  function mapMatch(cellId, match, playoffById, teams, tbd) {
    var kickoff = parseKickoff(match);
    var s = match.score || {};
    var home = s.team1 != null ? s.team1 : s.home;
    var away = s.team2 != null ? s.team2 : s.away;
    var score = home != null && away != null ? home + ' : ' + away : null;
    var isLive = !!(match.status && LIVE[String(match.status).toUpperCase()]);
    var channels = match.channels || [];
    var topName = resolveTeamLabel(match, 1, playoffById, teams, tbd);
    var botName = resolveTeamLabel(match, 2, playoffById, teams, tbd);
    return {
      id: cellId,
      playoffMatchId: String(match.id),
      date: kickoff ? pad2(kickoff.getDate()) + '.' + pad2(kickoff.getMonth() + 1) : tbd,
      time: kickoff ? pad2(kickoff.getHours()) + ':' + pad2(kickoff.getMinutes()) : tbd,
      teamTop: formatTeamLine(topName, home),
      teamBottom: formatTeamLine(botName, away),
      isLive: isLive,
      score: score,
      channelIds: channels,
      isPlayable: channels.length > 0 && (isLive || score != null),
      availability: isLive ? 'live' : (score ? 'available' : 'future')
    };
  }

  function toCellMatches(response, tbd) {
    tbd = tbd || 'Н/Д';
    var playoffById = playoffMap(response);
    var teams = (response && response.teams) || {};
    if (!Object.keys(playoffById).length) return {};

    var cellToMatch = {};
    Object.keys(playoffById).forEach(function (id) {
      var m = playoffById[id];
      var order = resolveTableOrder(m);
      if (!order) return;
      var cellId = FifaBracketLayout.TABLE_ORDER_TO_CELL[order];
      if (cellId) cellToMatch[cellId] = m;
    });

    var out = {};
    Object.keys(FifaBracketLayout.TABLE_ORDER_TO_CELL).forEach(function (orderKey) {
      var cellId = FifaBracketLayout.TABLE_ORDER_TO_CELL[orderKey];
      var m = cellToMatch[cellId];
      out[cellId] = m
        ? mapMatch(cellId, m, playoffById, teams, tbd)
        : { id: cellId, date: tbd, time: tbd, teamTop: tbd, teamBottom: tbd, availability: 'future' };
    });
    return out;
  }

  global.FifaBracketMapper = { toCellMatches: toCellMatches };
})(typeof window !== 'undefined' ? window : global);
