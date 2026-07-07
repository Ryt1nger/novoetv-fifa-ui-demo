(function (global) {
  'use strict';

  var GRID_SPAN = 3;
  var EMPTY_TEXT = 'Нет матчей для выбранных команд';

  var state = {
    countries: [],
    selectedTeams: [],
    focusedCountry: null,
    focusedMatchId: null,
    selectedMatchId: null,
    allItems: [],
    sections: []
  };

  var boundCountries = false;
  var boundSchedule = false;

  function byId(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function countryLabel(c) {
    return typeof c === 'string' ? c : c.label;
  }

  function ensureMount() {
    var root = byId('sport_my_team_root');
    if (!root) return null;
    if (!byId('my_team_countries_panel')) {
      root.innerHTML =
        '<div id="my_team_countries_panel">' +
          '<div id="rv_my_team_countries"></div>' +
        '</div>' +
        '<div id="rv_my_team_schedule"></div>' +
        '<div id="tv_my_team_schedule_empty" class="preview-hidden">' + EMPTY_TEXT + '</div>';
    }
    return root;
  }

  function flagImg(url) {
    if (url) {
      return '<img class="iv_flag" src="' + escapeHtml(url) + '" alt="" loading="lazy" />';
    }
    return '<span class="flag_placeholder iv_flag" aria-hidden="true"></span>';
  }

  function buildCountryChip(country) {
    var name = countryLabel(country);
    var selected = state.selectedTeams.indexOf(name) >= 0;
    var focused = state.focusedCountry === name;
    var classes = ['country_chip_root'];
    if (selected) classes.push('selected');
    if (focused) classes.push('focused');
    var showBullet = focused;
    var title = country.tla ? country.tla : '';
    if (country.id) title = (title ? title + ' · ' : '') + 'id ' + country.id;
    return (
      '<div class="' + classes.join(' ') + '"' +
        ' data-country="' + escapeHtml(name) + '"' +
        (country.id != null ? ' data-team-id="' + country.id + '"' : '') +
        (country.tla ? ' data-tla="' + escapeHtml(country.tla) + '"' : '') +
        (title ? ' title="' + escapeHtml(title) + '"' : '') +
        ' role="button" tabindex="0">' +
        '<span class="my_team_bullet iv_country_bullet' + (showBullet ? ' visible' : '') + '"></span>' +
        '<span class="tv_country_name">' + escapeHtml(name) + '</span>' +
      '</div>'
    );
  }

  function syncCountryChip(el) {
    if (!el) return;
    var name = el.getAttribute('data-country');
    var selected = state.selectedTeams.indexOf(name) >= 0;
    var focused = state.focusedCountry === name;
    el.classList.toggle('selected', selected);
    el.classList.toggle('focused', focused);
    var bullet = el.querySelector('.iv_country_bullet');
    if (bullet) {
      bullet.classList.toggle('visible', focused);
    }
  }

  function syncAllCountryChips() {
    document.querySelectorAll('#rv_my_team_countries .country_chip_root').forEach(syncCountryChip);
  }

  function bindCountryEvents() {
    if (boundCountries) return;
    var grid = byId('rv_my_team_countries');
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      var chip = e.target.closest('.country_chip_root');
      if (!chip) return;
      e.preventDefault();
      if (global.AppPreview) {
        AppPreview.applyShellState({ activeTab: 'my_team', railFocus: null, tabFocus: null });
      } else if (global.SportUI) {
        SportUI.applyState({ activeTab: 'my_team', railFocus: null, tabFocus: null });
      }
      toggleCountrySelection(chip.getAttribute('data-country'));
    });
    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var chip = e.target.closest('.country_chip_root');
      if (!chip) return;
      e.preventDefault();
      if (global.AppPreview) {
        AppPreview.applyShellState({ activeTab: 'my_team', railFocus: null, tabFocus: null });
      } else if (global.SportUI) {
        SportUI.applyState({ activeTab: 'my_team', railFocus: null, tabFocus: null });
      }
      toggleCountrySelection(chip.getAttribute('data-country'));
    });
    boundCountries = true;
  }

  function buildMyTeamMatchCard(match) {
    var score = match.score;
    var homeScore = score ? String(score.home) : '';
    var awayScore = score ? String(score.away) : '';
    var classes = ['match_card_root', 'my_team_match', match.availability || 'available'];
    var playable = !!(match.channelIds && match.channelIds.length && (match.isLive || score));
    if (playable) classes.push('playable');
    if (match.matchId === state.selectedMatchId) classes.push('selected');
    if (match.matchId === state.focusedMatchId) classes.push('focused');
    var showPlay = match.matchId === state.focusedMatchId &&
      match.channelIds && match.channelIds.length && (match.isLive || score);

    return (
      '<div class="' + classes.join(' ') + '" data-match-id="' + escapeHtml(match.matchId) + '" tabindex="0">' +
        '<div class="meta_play_slot">' +
          '<span class="tv_time' + (showPlay ? ' hidden-for-play' : '') + '">' + escapeHtml(match.time) + '</span>' +
          '<span class="iv_match_play' + (showPlay ? ' visible' : '') + '" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="my_team_match_teams">' +
          '<div class="my_team_team_row">' +
            '<span class="tv_team_home">' + escapeHtml(match.teamHome) + '</span>' +
            '<span class="flag_slot">' + flagImg(match.flagHomeUrl) + '</span>' +
          '</div>' +
          '<div class="my_team_team_row">' +
            '<span class="tv_team_away">' + escapeHtml(match.teamAway) + '</span>' +
            '<span class="flag_slot">' + flagImg(match.flagAwayUrl) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="score_container vertical always">' +
          '<span class="tv_score_home">' + escapeHtml(homeScore) + '</span>' +
          '<span class="tv_score_away">' + escapeHtml(awayScore) + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function buildSection(section) {
    var cards = section.matches.map(buildMyTeamMatchCard).join('');
    return (
      '<div class="my_team_section" data-section>' +
        '<div class="date_block">' +
          '<div class="tv_date">' + escapeHtml(section.date) + '</div>' +
          '<div class="tv_day_of_week">' + escapeHtml(section.dayOfWeek) + '</div>' +
        '</div>' +
        '<div class="rv_section_matches">' + cards + '</div>' +
      '</div>'
    );
  }

  function findMatch(matchId) {
    if (!matchId) return null;
    for (var i = 0; i < state.sections.length; i++) {
      for (var j = 0; j < state.sections[i].matches.length; j++) {
        var match = state.sections[i].matches[j];
        if (match.matchId === matchId) return match;
      }
    }
    return null;
  }

  function openBroadcastForMatch(matchId) {
    var match = findMatch(matchId);
    if (!match || !global.BroadcastUI) return;
    setFocusedMatch(matchId);
    setSelectedMatch(matchId);
    BroadcastUI.showForMatch(match, 'my_team');
  }

  function setSelectedMatch(matchId) {
    state.selectedMatchId = matchId || null;
    document.querySelectorAll('#rv_my_team_schedule .my_team_match').forEach(function (el) {
      var on = state.selectedMatchId !== null &&
        el.getAttribute('data-match-id') === state.selectedMatchId;
      el.classList.toggle('selected', on);
    });
  }

  function bindScheduleEvents() {
    if (boundSchedule) return;
    var list = byId('rv_my_team_schedule');
    if (!list) return;
    boundSchedule = true;
    list.addEventListener('dblclick', function (e) {
      var card = e.target.closest('.match_card_root');
      if (!card) return;
      e.preventDefault();
      openBroadcastForMatch(card.getAttribute('data-match-id'));
    });
  }

  function renderScheduleList() {
    var list = byId('rv_my_team_schedule');
    if (!list) return;
    list.innerHTML = state.sections.map(buildSection).join('');
    bindScheduleEvents();
  }

  function refreshSchedule() {
    var filtered = FifaMyTeamFilter.filter(state.allItems, state.selectedTeams);
    state.sections = FifaMyTeamFilter.toSections(filtered);
    var list = byId('rv_my_team_schedule');
    var empty = byId('tv_my_team_schedule_empty');
    var hasContent = state.sections.some(function (s) { return s.matches.length > 0; });
    renderScheduleList();
    if (list) list.classList.toggle('preview-hidden', !hasContent);
    if (empty) {
      empty.classList.toggle('preview-hidden', hasContent || !state.selectedTeams.length);
    }
  }

  function renderCountries() {
    var grid = byId('rv_my_team_countries');
    if (!grid) return;
    grid.innerHTML = state.countries.map(buildCountryChip).join('');
    bindCountryEvents();
  }

  function render(fifaResponse) {
    ensureMount();
    state.countries = FifaTeamsMapper.toCountryList(fifaResponse);
    state.allItems = FifaScheduleMapper.toScheduleItems(fifaResponse);
    if (!state.focusedCountry && state.countries[0]) {
      state.focusedCountry = countryLabel(state.countries[0]);
    }
    renderCountries();
    refreshSchedule();
  }

  function setSelectedTeams(names) {
    state.selectedTeams = names ? names.slice() : [];
    syncAllCountryChips();
    refreshSchedule();
  }

  function setFocusedCountry(name) {
    state.focusedCountry = name || null;
    syncAllCountryChips();
  }

  function toggleCountrySelection(name) {
    if (!name) return;
    var idx = state.selectedTeams.indexOf(name);
    if (idx >= 0) state.selectedTeams.splice(idx, 1);
    else state.selectedTeams.push(name);
    state.focusedCountry = name;
    syncAllCountryChips();
    refreshSchedule();
    document.querySelectorAll('#rv_my_team_countries .country_chip_root').forEach(function (el) {
      if (el.getAttribute('data-country') === name) el.focus({ preventScroll: true });
    });
  }

  function setFocusedMatch(matchId) {
    state.focusedMatchId = matchId || null;
    document.querySelectorAll('#rv_my_team_schedule .my_team_match').forEach(function (el) {
      var on = state.focusedMatchId !== null &&
        el.getAttribute('data-match-id') === state.focusedMatchId;
      el.classList.toggle('focused', on);
      var play = el.querySelector('.iv_match_play');
      var match = findMatch(el.getAttribute('data-match-id'));
      var showPlay = on && match && match.channelIds && match.channelIds.length &&
        (match.isLive || match.score);
      if (play) play.classList.toggle('visible', !!showPlay);
      var time = el.querySelector('.tv_time');
      if (time) time.classList.toggle('hidden-for-play', !!showPlay);
    });
  }

  function getFirstMatchId() {
    for (var i = 0; i < state.sections.length; i++) {
      if (state.sections[i].matches[0]) return state.sections[i].matches[0].matchId;
    }
    return null;
  }

  function applyAuditState(cfg) {
    if (cfg.selectedTeams) setSelectedTeams(cfg.selectedTeams);
    if (cfg.clearCountryFocus) {
      setFocusedCountry(null);
    } else if (cfg.focusedCountry !== undefined) {
      setFocusedCountry(cfg.focusedCountry);
    }
    if (cfg.scrollScheduleTop) {
      var list = byId('rv_my_team_schedule');
      if (list) list.scrollTop = 0;
    }
    if (cfg.focusSchedule) {
      setFocusedMatch(getFirstMatchId());
    } else if (cfg.clearMatchFocus) {
      setFocusedMatch(null);
    } else if (cfg.focusedMatchId !== undefined) {
      setFocusedMatch(cfg.focusedMatchId);
    }
  }

  function getState() {
    return {
      countryCount: state.countries.length,
      selectedCount: state.selectedTeams.length,
      sectionCount: state.sections.length,
      focusedCountry: state.focusedCountry
    };
  }

  global.MyTeamUI = {
    render: render,
    setSelectedTeams: setSelectedTeams,
    setFocusedCountry: setFocusedCountry,
    toggleCountrySelection: toggleCountrySelection,
    setFocusedMatch: setFocusedMatch,
    setSelectedMatch: setSelectedMatch,
    openBroadcastForMatch: openBroadcastForMatch,
    applyAuditState: applyAuditState,
    getFirstMatchId: getFirstMatchId,
    getState: getState
  };
})(typeof window !== 'undefined' ? window : global);
