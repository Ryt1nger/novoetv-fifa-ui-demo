(function (global) {
  'use strict';

  function displayNameRu(team) {
    if (!team) return null;
    if (team.name_ru) return team.name_ru;
    if (team.nameRu) return team.nameRu;
    if (team.name) return team.name;
    return null;
  }

  function matchTeamNames(match) {
    var out = [];
    if (match.team1_name_ru) out.push(match.team1_name_ru);
    if (match.team2_name_ru) out.push(match.team2_name_ru);
    if (match.team1_name) out.push(match.team1_name);
    if (match.team2_name) out.push(match.team2_name);
    return out;
  }

  function toCountryNames(response) {
    return toCountryList(response).map(function (c) { return c.label; });
  }

  function toCountryList(response) {
    var teams = (response && response.teams) || {};
    var keys = Object.keys(teams);
    if (keys.length) {
      if (response && response.demo) {
        return keys
          .sort(function (a, b) {
            var na = parseInt(a, 10);
            var nb = parseInt(b, 10);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.localeCompare(b);
          })
          .map(function (k) { return teamEntry(teams[k], k); })
          .filter(function (c) { return c && c.label; });
      }
      var list = keys.map(function (k) { return teamEntry(teams[k], k); }).filter(function (c) { return c && c.label; });
      list.sort(function (a, b) { return a.label.localeCompare(b.label, 'ru'); });
      var seen = {};
      return list.filter(function (c) {
        if (seen[c.label]) return false;
        seen[c.label] = true;
        return true;
      });
    }
    var fromMatches = [];
    if (global.FifaScheduleMapper) {
      FifaScheduleMapper.sortedMatches(response).forEach(function (m) {
        matchTeamNames(m).forEach(function (n) {
          if (fromMatches.indexOf(n) < 0) fromMatches.push(n);
        });
      });
    }
    fromMatches.sort(function (a, b) { return a.localeCompare(b, 'ru'); });
    return fromMatches.map(function (name) {
      return { slot: null, label: name, id: null, name: name, name_ru: name, tla: null, crest: null };
    });
  }

  function teamEntry(team, slotKey) {
    if (!team) return null;
    var label = displayNameRu(team);
    if (!label) return null;
    return {
      slot: team.slot != null ? team.slot : (slotKey != null ? parseInt(slotKey, 10) : null),
      label: label,
      id: team.id != null ? team.id : null,
      name: team.name || null,
      name_ru: team.name_ru || team.nameRu || null,
      tla: team.tla || null,
      crest: team.crest || null
    };
  }

  global.FifaTeamsMapper = { toCountryNames: toCountryNames, toCountryList: toCountryList };
})(typeof window !== 'undefined' ? window : global);
