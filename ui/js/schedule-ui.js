(function (global) {
  'use strict';

  var state = {
    sections: [],
    focusedMatchId: null,
    selectedMatchId: null,
    showError: false,
    showScrollTop: false,
    forceShowScrollTop: false,
    demoAvailability: {}
  };

  var boundList = false;
  var boundScrollTop = false;

  function byId(id) { return document.getElementById(id); }

  function updateScrollTopVisibility() {
    var list = byId('rv_sport_schedule');
    var scrollBtn = byId('btn_schedule_scroll_top');
    var visible = !state.showError && (
      state.forceShowScrollTop || (list && list.scrollTop > 0)
    );
    if (scrollBtn) scrollBtn.classList.toggle('preview-hidden', !visible);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function effectiveAvailability(match) {
    return state.demoAvailability[match.matchId] || match.availability;
  }

  function isPlayable(match) {
    if (!match) return false;
    return !!(match.channelIds && match.channelIds.length && (match.isLive || match.score));
  }

  function syncPlayOverlay(cardEl, match, focused) {
    var play = cardEl.querySelector('.iv_match_play');
    if (play) play.classList.toggle('visible', !!focused && isPlayable(match));
  }

  function flagImg(url, cls) {
    if (url) {
      return '<img class="' + cls + '" src="' + escapeHtml(url) + '" alt="" loading="lazy" />';
    }
    return '<span class="flag_placeholder ' + cls + '" aria-hidden="true"></span>';
  }

  function buildMatchCard(match) {
    var score = match.score;
    var scoreHtml = '';
    if (score) {
      scoreHtml =
        '<div class="score_container visible">' +
          '<span class="tv_score_home">' + escapeHtml(score.home) + '</span>' +
          '<span class="tv_score_colon">:</span>' +
          '<span class="tv_score_away">' + escapeHtml(score.away) + '</span>' +
        '</div>';
    }

    var classes = ['match_card_root', effectiveAvailability(match)];
    if (isPlayable(match)) classes.push('playable');
    if (match.matchId === state.selectedMatchId) classes.push('selected');
    if (match.matchId === state.focusedMatchId) classes.push('focused');
    var showPlay = match.matchId === state.focusedMatchId && isPlayable(match);

    return (
      '<div class="' + classes.join(' ') + '" data-match-id="' + escapeHtml(match.matchId) + '" tabindex="0">' +
        '<div class="meta_play_slot">' +
          '<div class="meta_text_col">' +
            '<span class="tv_group">' + escapeHtml(match.groupLabel) + '</span>' +
            '<span class="tv_time">' + escapeHtml(match.time) + '</span>' +
          '</div>' +
          '<span class="iv_match_play' + (showPlay ? ' visible' : '') + '" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="match_main_content">' +
          '<span class="tv_team_home">' + escapeHtml(match.teamHome) + '</span>' +
          '<div class="flag_slot">' + flagImg(match.flagHomeUrl, 'iv_flag_home') + '</div>' +
          scoreHtml +
          '<div class="flag_slot">' + flagImg(match.flagAwayUrl, 'iv_flag_away') + '</div>' +
          '<span class="tv_team_away">' + escapeHtml(match.teamAway) + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function buildSection(section) {
    var cards = section.matches.map(buildMatchCard).join('');
    return (
      '<div class="schedule-section" data-section>' +
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
    BroadcastUI.showForMatch(match, 'schedule');
  }

  function bindListEvents() {
    var list = byId('rv_sport_schedule');
    if (!list) return;
    if (!boundList) {
      boundList = true;
      list.addEventListener('dblclick', function (e) {
        var card = e.target.closest('.match_card_root');
        if (!card) return;
        e.preventDefault();
        openBroadcastForMatch(card.getAttribute('data-match-id'));
      });
      list.addEventListener('scroll', updateScrollTopVisibility);
    }
    if (!boundScrollTop) {
      var scrollBtn = byId('btn_schedule_scroll_top');
      if (scrollBtn) {
        boundScrollTop = true;
        scrollBtn.addEventListener('click', function () {
          scrollListTop();
        });
      }
    }
  }

  function renderList() {
    var list = byId('rv_sport_schedule');
    if (!list) return;
    list.innerHTML = state.sections.map(buildSection).join('');
    bindListEvents();
  }

  function render(fifaResponse) {
    state.sections = FifaScheduleMapper.toScheduleSections(fifaResponse);
    if (!state.focusedMatchId && state.sections[0] && state.sections[0].matches[0]) {
      state.focusedMatchId = state.sections[0].matches[0].matchId;
    }
    renderList();
    applyChrome();
  }

  function applyChrome() {
    var err = byId('sport_schedule_error_container');
    var list = byId('rv_sport_schedule');
    if (err) err.classList.toggle('preview-hidden', !state.showError);
    if (list) list.classList.toggle('preview-hidden', state.showError);
    updateScrollTopVisibility();
  }

  function setFocusedMatch(matchId) {
    state.focusedMatchId = matchId || null;
    document.querySelectorAll('#rv_sport_schedule .match_card_root').forEach(function (el) {
      var id = el.getAttribute('data-match-id');
      var on = state.focusedMatchId !== null && id === state.focusedMatchId;
      el.classList.toggle('focused', on);
      syncPlayOverlay(el, findMatch(id), on);
    });
  }

  function setSelectedMatch(matchId) {
    state.selectedMatchId = matchId || null;
    document.querySelectorAll('#rv_sport_schedule .match_card_root').forEach(function (el) {
      var on = state.selectedMatchId !== null &&
        el.getAttribute('data-match-id') === state.selectedMatchId;
      el.classList.toggle('selected', on);
    });
  }

  function showError(show, message) {
    state.showError = !!show;
    var tv = byId('tv_schedule_error');
    if (tv && message) tv.textContent = message;
    applyChrome();
  }

  function showScrollTop(show) {
    state.forceShowScrollTop = !!show;
    state.showScrollTop = state.forceShowScrollTop;
    updateScrollTopVisibility();
  }

  function scrollListTop() {
    var list = byId('rv_sport_schedule');
    if (list) list.scrollTop = 0;
    state.forceShowScrollTop = false;
    state.showScrollTop = false;
    updateScrollTopVisibility();
  }

  function scrollToDate(dateLabel) {
    var list = byId('rv_sport_schedule');
    if (!list || !dateLabel) return;
    var sections = list.querySelectorAll('.schedule-section');
    for (var i = 0; i < sections.length; i++) {
      var dateEl = sections[i].querySelector('.tv_date');
      if (dateEl && dateEl.textContent === dateLabel) {
        list.scrollTop = Math.max(0, sections[i].offsetTop - list.offsetTop);
        updateScrollTopVisibility();
        return;
      }
    }
  }

  function scrollToMatch(matchId) {
    var list = byId('rv_sport_schedule');
    if (!list || !matchId) return;
    var card = list.querySelector('[data-match-id="' + matchId + '"]');
    if (!card) return;
    var top = card.offsetTop - list.offsetTop - 40;
    list.scrollTop = Math.max(0, top);
    updateScrollTopVisibility();
  }

  function findMatchId(prefix) {
    for (var i = 0; i < state.sections.length; i++) {
      for (var j = 0; j < state.sections[i].matches.length; j++) {
        var id = state.sections[i].matches[j].matchId;
        if (String(id).indexOf(prefix) === 0) return id;
      }
    }
    return null;
  }

  function findFirstMatchOnDate(dateLabel) {
    for (var i = 0; i < state.sections.length; i++) {
      if (state.sections[i].date === dateLabel && state.sections[i].matches[0]) {
        return state.sections[i].matches[0].matchId;
      }
    }
    return null;
  }

  function getFirstMatchId() {
    if (state.sections[0] && state.sections[0].matches[0]) {
      return state.sections[0].matches[0].matchId;
    }
    return null;
  }

  function setDemoAvailability(matchId, availability) {
    if (!matchId) return;
    if (availability) state.demoAvailability[matchId] = availability;
    else delete state.demoAvailability[matchId];
    renderList();
    setFocusedMatch(state.focusedMatchId);
    setSelectedMatch(state.selectedMatchId);
  }

  function resetDemo() {
    state.demoAvailability = {};
    state.showError = false;
    state.showScrollTop = false;
    state.forceShowScrollTop = false;
    applyChrome();
    renderList();
  }

  function applyAuditState(cfg) {
    resetDemo();
    if (cfg.clearFocus) {
      setFocusedMatch(null);
      setSelectedMatch(null);
    } else {
      if (cfg.matchId) setFocusedMatch(cfg.matchId);
      if (cfg.selectedMatchId) setSelectedMatch(cfg.selectedMatchId);
    }
    if (cfg.demoAvailability) setDemoAvailability(cfg.matchId, cfg.demoAvailability);
    if (cfg.scrollTop != null) {
      var list = byId('rv_sport_schedule');
      if (list) list.scrollTop = cfg.scrollTop;
      updateScrollTopVisibility();
    }
    if (cfg.scrollToDate) scrollToDate(cfg.scrollToDate);
    if (cfg.scrollToMatchId) scrollToMatch(cfg.scrollToMatchId);
    if (cfg.showError) showError(true, cfg.errorMessage);
    if (cfg.showScrollTop) showScrollTop(true);
    else updateScrollTopVisibility();
  }

  function getState() {
    return {
      sectionCount: state.sections.length,
      matchCount: state.sections.reduce(function (n, s) { return n + s.matches.length; }, 0),
      focusedMatchId: state.focusedMatchId,
      selectedMatchId: state.selectedMatchId,
      showError: state.showError,
      showScrollTop: state.showScrollTop
    };
  }

  global.ScheduleUI = {
    render: render,
    setFocusedMatch: setFocusedMatch,
    setSelectedMatch: setSelectedMatch,
    showError: showError,
    showScrollTop: showScrollTop,
    scrollListTop: scrollListTop,
    scrollToMatch: scrollToMatch,
    scrollToDate: scrollToDate,
    findMatch: findMatch,
    findMatchId: findMatchId,
    openBroadcastForMatch: openBroadcastForMatch,
    findFirstMatchOnDate: findFirstMatchOnDate,
    getFirstMatchId: getFirstMatchId,
    setDemoAvailability: setDemoAvailability,
    applyAuditState: applyAuditState,
    getState: getState
  };
})(typeof window !== 'undefined' ? window : global);
