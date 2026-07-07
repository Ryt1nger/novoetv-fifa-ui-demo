(function (global) {
  'use strict';

  var cache = {
    fifa2026: null,
    shell: null,
    broadcast: null,
    tvChannels: null
  };

  function fetchJson(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.json();
    });
  }

  function mergeScanMatches(base, overlay) {
    if (!base || !overlay || !overlay.matches) return base;
    base.matches = base.matches || {};
    Object.keys(overlay.matches).forEach(function (k) {
      if (base.matches[k]) {
        Object.assign(base.matches[k], overlay.matches[k]);
      } else {
        base.matches[k] = overlay.matches[k];
      }
    });
    return base;
  }

  function isAuditMode() {
    return typeof location !== 'undefined' && new URLSearchParams(location.search).has('audit');
  }

  function filterMyTeamMatches(data) {
    if (!data || !data.matches) return data;
    var keep = {};
    Object.keys(data.matches).forEach(function (k) {
      if (k.indexOf('MT') === 0) keep[k] = data.matches[k];
    });
    return Object.assign({}, data, { matches: keep });
  }

  function filterMatchesForAudit(data, ids) {
    if (!data || !data.matches || !ids || !ids.length) return;
    var keep = {};
    ids.forEach(function (id) {
      if (data.matches[id]) keep[id] = data.matches[id];
    });
    data.matches = keep;
  }

  function loadAll() {
    return fetchJson('../../mocks/fifa2026.json').then(function (data) {
      cache.fifa2026 = data;
      return fetchJson('../../mocks/fifa2026-scan-matches.json').then(function (overlay) {
        mergeScanMatches(cache.fifa2026, overlay);
      }).catch(function () { /* optional */ });
    }).then(function () {
      return fetchJson('../../mocks/fifa2026-bracket-overlay.json').then(function (overlay) {
        mergeScanMatches(cache.fifa2026, overlay);
      }).catch(function () { /* optional */ });
    }).then(function () {
      return fetchJson('../../mocks/fifa2026-myteam-scan.json').then(function (overlay) {
        mergeScanMatches(cache.fifa2026, overlay);
      }).catch(function () { /* optional */ });
    }).then(function () {
      return fetchJson('../../mocks/fifa2026-teams.json').then(function (teamsData) {
        if (teamsData && teamsData.teams) {
          cache.fifa2026.teams = cache.fifa2026.teams || {};
          Object.assign(cache.fifa2026.teams, teamsData.teams);
        }
      }).catch(function () { /* optional */ });
    }).then(function () {
      if (!isAuditMode()) return;
      return fetchJson('../../mocks/fifa2026-audit-whitelist.json').then(function (wl) {
        filterMatchesForAudit(cache.fifa2026, wl.matchIds || []);
      }).catch(function () { /* optional */ });
    }).then(function () {
      return Promise.all([
        fetchJson('../../mocks/fifa-shell.json').then(function (data) { cache.shell = data; }),
        fetchJson('../../mocks/fifa-broadcast-sources.json').then(function (data) { cache.broadcast = data; }),
        fetchJson('../../mocks/fifa-tv-channels.json').then(function (data) { cache.tvChannels = data; }).catch(function () { /* optional */ })
      ]);
    });
  }

  function getFifa2026() { return cache.fifa2026; }
  function getFifa2026ForMyTeam() {
    if (!isAuditMode() || !cache.fifa2026) return cache.fifa2026;
    return filterMyTeamMatches(cache.fifa2026);
  }
  function getShell() { return cache.shell; }
  function getBroadcastSources() { return cache.broadcast; }
  function getTvChannels() { return cache.tvChannels || {}; }

  function countMatches(data) {
    return data && data.matches ? Object.keys(data.matches).length : 0;
  }

  global.FifaData = {
    loadAll: loadAll,
    getFifa2026: getFifa2026,
    getFifa2026ForMyTeam: getFifa2026ForMyTeam,
    getShell: getShell,
    getBroadcastSources: getBroadcastSources,
    getTvChannels: getTvChannels,
    countMatches: countMatches
  };
})(typeof window !== 'undefined' ? window : global);
