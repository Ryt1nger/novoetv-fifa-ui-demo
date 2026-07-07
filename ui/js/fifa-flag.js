(function (global) {
  'use strict';

  var REMOTE_URL = 'https://media.api-sports.io/football/teams/%d.png';
  var useLocal = true;

  function localFlagUrl(teamId) {
    if (!teamId || teamId <= 0) return null;
    var path;
    if (global.FifaAssets && FifaAssets.flag) path = FifaAssets.flag(teamId);
    else path = '../../assets/img/flags/' + teamId + '.png';
    return global.FifaAssets && FifaAssets.absolute ? FifaAssets.absolute(path) : path;
  }

  function teamIdFromUrl(url) {
    var m = String(url || '').match(/(?:teams\/|flags\/)(\d+)\.png/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function normalizeCrestUrl(url) {
    var trimmed = String(url || '').trim();
    if (!trimmed) return null;
    if (useLocal) {
      var id = teamIdFromUrl(trimmed);
      if (id) return localFlagUrl(id);
    }
    if (/\.svg$/i.test(trimmed)) {
      var svgId = trimmed.split('/').pop().split('.')[0];
      if (/^\d+$/.test(svgId)) return flagUrl(parseInt(svgId, 10));
    }
    if (trimmed.indexOf('http://') === 0) return 'https://' + trimmed.slice(7);
    if (trimmed.indexOf('https://') === 0) return trimmed;
    return trimmed;
  }

  function flagUrl(teamId) {
    if (!teamId || teamId <= 0) return null;
    if (useLocal) return localFlagUrl(teamId);
    return REMOTE_URL.replace('%d', String(teamId));
  }

  function resolveUrl(primaryUrl, teamId) {
    var normalized = normalizeCrestUrl(primaryUrl);
    if (normalized) return normalized;
    return flagUrl(teamId);
  }

  function findTeamInMap(teams, teamId, teamCode) {
    if (!teams) return null;
    if (teamId != null && teams[String(teamId)]) return teams[String(teamId)];
    var list = Object.keys(teams).map(function (k) { return teams[k]; });
    if (teamId != null) {
      var byId = list.find(function (t) { return t.id === teamId; });
      if (byId) return byId;
    }
    if (teamCode) {
      var code = String(teamCode).toUpperCase();
      return list.find(function (t) {
        return (t.tla && t.tla.toUpperCase() === code) ||
          (t.name && t.name.toUpperCase() === code);
      }) || null;
    }
    return null;
  }

  function resolveTeamCrest(match, side, teams) {
    var embedded = side === 1 ? match.homeTeam : match.awayTeam;
    var teamId = side === 1
      ? (match.team1_id != null ? match.team1_id : match.homeTeamId)
      : (match.team2_id != null ? match.team2_id : match.awayTeamId);
    var teamCode = side === 1 ? match.team1_code : match.team2_code;

    if (embedded && embedded.crest) {
      var fromEmbedded = resolveUrl(embedded.crest, embedded.id || teamId);
      if (fromEmbedded) return fromEmbedded;
    }
    var fromMap = findTeamInMap(teams, teamId, teamCode);
    if (fromMap && fromMap.crest) {
      var fromCrest = resolveUrl(fromMap.crest, fromMap.id || teamId);
      if (fromCrest) return fromCrest;
    }
    return resolveUrl(null, teamId);
  }

  global.FifaFlag = {
    resolveUrl: resolveUrl,
    normalizeCrestUrl: normalizeCrestUrl,
    resolveTeamCrest: resolveTeamCrest,
    flagUrl: flagUrl,
    setUseLocal: function (on) { useLocal = on !== false; }
  };
})(typeof window !== 'undefined' ? window : global);
