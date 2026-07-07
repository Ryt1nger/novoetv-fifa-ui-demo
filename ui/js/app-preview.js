(function (global) {
  'use strict';

  var AUDIT_PRESETS = [
  { id: 'tab-schedule-focused', label: 'Tab: расписание', state: { activeTab: 'schedule', railFocus: null, tabFocus: 'schedule' } },
  { id: 'rail-schedule-focused', label: 'Rail: расписание', state: { activeTab: 'schedule', railFocus: 'schedule', tabFocus: null } },
  { id: 'tab-bracket-focused', label: 'Tab: сетка', state: { activeTab: 'bracket', railFocus: null, tabFocus: 'bracket' } },
  { id: 'rail-bracket-focused', label: 'Rail: сетка', state: { activeTab: 'bracket', railFocus: 'bracket', tabFocus: null } },
  { id: 'tab-my-team-focused', label: 'Tab: моя команда', state: { activeTab: 'my_team', railFocus: null, tabFocus: 'my_team' } },
  { id: 'rail-my-team-focused', label: 'Rail: моя команда', state: { activeTab: 'my_team', railFocus: 'my_team', tabFocus: null } }
  ];

  function byId(id) { return document.getElementById(id); }

  function setStatus(text) {
    var el = byId('dev-status');
    if (el) el.textContent = text;
  }

  function applyShellState(partial) {
    if (!global.SportUI) return;
    var next = Object.assign({}, SportUI.getState(), partial);
    SportUI.applyState(next);
    syncDevPanel(next);
  }

  function syncDevPanel(state) {
    document.querySelectorAll('[data-screen-tab]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-screen-tab') === state.activeTab);
    });
  }

  function syncBroadcastButton() {
    var btn = byId('btn-broadcast-back');
    if (!btn) return;
    var visible = global.BroadcastUI && BroadcastUI.getState().visible;
    btn.classList.toggle('preview-hidden', !visible);
  }

  function updateDevPanelHeight() {
    var panel = byId('dev-panel');
    if (!panel || document.documentElement.classList.contains('audit-mode')) {
      document.documentElement.style.setProperty('--dev-panel-height', '0px');
      return;
    }
    var h = panel.classList.contains('collapsed') ? 18 : panel.offsetHeight;
    document.documentElement.style.setProperty('--dev-panel-height', h + 'px');
  }

  function initDevPanelChrome() {
    var panel = byId('dev-panel');
    var collapse = byId('dev-collapse');
    var moreToggle = byId('dev-more-toggle');
    var more = byId('dev-more');

    if (collapse && panel) {
      collapse.addEventListener('click', function () {
        panel.classList.add('collapsed');
        updateDevPanelHeight();
      });
    }
    if (panel) {
      panel.addEventListener('click', function (e) {
        if (!panel.classList.contains('collapsed')) return;
        if (e.target.closest('button, select')) return;
        panel.classList.remove('collapsed');
        updateDevPanelHeight();
      });
    }
    if (moreToggle && more) {
      moreToggle.addEventListener('click', function () {
        more.classList.toggle('preview-hidden');
        updateDevPanelHeight();
      });
    }
    if (panel && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateDevPanelHeight).observe(panel);
    }
  }

  function loadMocks() {
    return FifaData.loadAll().then(function () {
      var shell = FifaData.getShell();
      var fifa = FifaData.getFifa2026();
      SportUI.init(shell);
      if (global.ScheduleUI) ScheduleUI.render(fifa);
      if (global.BracketUI) BracketUI.render(fifa);
      if (global.MyTeamUI) MyTeamUI.render(FifaData.getFifa2026ForMyTeam());
      applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: 'schedule' });
      var sched = ScheduleUI ? ScheduleUI.getState() : {};
      var myTeam = MyTeamUI ? MyTeamUI.getState() : {};
      setStatus((sched.matchCount || 0) + ' матч., ' + (myTeam.countryCount || 0) + ' стр.');
      return { shell: shell, fifa: fifa };
    }).catch(function (err) {
      setStatus('Ошибка загрузки моков: ' + err.message);
    });
  }

  function initDevPanel() {
    initDevPanelChrome();

    document.querySelectorAll('[data-screen-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyShellState({ activeTab: btn.getAttribute('data-screen-tab') });
      });
    });

    var presets = byId('dev-audit-presets');
    if (presets) {
      AUDIT_PRESETS.forEach(function (preset) {
        var opt = document.createElement('option');
        opt.value = preset.id;
        opt.textContent = preset.label;
        presets.appendChild(opt);
      });
      presets.addEventListener('change', function () {
        if (!presets.value) return;
        applyAuditPreset(presets.value);
      });
    }

    var reload = byId('btn-reload-mocks');
    if (reload) reload.addEventListener('click', loadMocks);

    var toggleErr = byId('btn-schedule-toggle-error');
    if (toggleErr) {
      toggleErr.addEventListener('click', function () {
        if (!global.ScheduleUI) return;
        var next = !ScheduleUI.getState().showError;
        ScheduleUI.showError(next);
        toggleErr.classList.toggle('active', next);
      });
    }
    var toggleScroll = byId('btn-schedule-toggle-scroll-top');
    if (toggleScroll) {
      toggleScroll.addEventListener('click', function () {
        if (!global.ScheduleUI) return;
        var next = !ScheduleUI.getState().showScrollTop;
        ScheduleUI.showScrollTop(next);
        toggleScroll.classList.toggle('active', next);
      });
    }

    var bracketPlayable = byId('btn-bracket-focus-playable');
    if (bracketPlayable) {
      bracketPlayable.addEventListener('click', function () {
        if (!global.BracketUI) return;
        applyShellState({ activeTab: 'bracket', railFocus: null, tabFocus: null });
        BracketUI.setFocusedCell(BracketUI.getPlayableCellId());
      });
    }

    var broadcastShow = byId('btn-broadcast-show');
    if (broadcastShow) {
      broadcastShow.addEventListener('click', function () {
        if (global.BroadcastUI) BroadcastUI.showFromMock();
      });
    }
    var broadcastBack = byId('btn-broadcast-back');
    if (broadcastBack) {
      broadcastBack.addEventListener('click', function () {
        if (global.BroadcastUI) BroadcastUI.hide();
      });
    }
    var broadcastHide = byId('btn-broadcast-hide');
    if (broadcastHide) {
      broadcastHide.addEventListener('click', function () {
        if (global.BroadcastUI) BroadcastUI.hide();
      });
    }

    var myteamBelgium = byId('btn-myteam-select-belgium');
    if (myteamBelgium) {
      myteamBelgium.addEventListener('click', function () {
        if (!global.MyTeamUI) return;
        applyShellState({ activeTab: 'my_team', railFocus: null, tabFocus: null });
        MyTeamUI.setSelectedTeams(['Бельгия']);
        MyTeamUI.setFocusedCountry('Бельгия');
      });
    }
  }

  function fitPreview() {
    var stage = byId('tv-stage');
    if (!stage) return;
    updateDevPanelHeight();
    var devH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dev-panel-height')) || 32;
    var scale = Math.min(
      (window.innerWidth - 16) / 1920,
      (window.innerHeight - devH) / 1080
    );
    document.documentElement.style.setProperty('--preview-scale', String(scale));
  }

  function init() {
    document.documentElement.classList.add('browser-preview');
    if (new URLSearchParams(location.search).has('audit')) {
      document.documentElement.classList.add('audit-mode');
    }
    initDevPanel();
    if (global.SportPointer) SportPointer.init();
    fitPreview();
    window.addEventListener('resize', fitPreview);
    return loadMocks().then(function () {
      updateDevPanelHeight();
      fitPreview();
    });
  }

  function applyScheduleAudit(id) {
    if (!global.ScheduleUI || !global.SportUI) return;
    if (global.BroadcastUI) BroadcastUI.hide();
    var scanTop = ScheduleUI.findFirstMatchOnDate('26.06') || ScheduleUI.getFirstMatchId();
    var first = scanTop;
    var playoff = ScheduleUI.findMatchId('PLAYOFF');
    SportUI.applyState({ activeTab: 'schedule', railFocus: null, tabFocus: null });

    var states = {
      'schedule-from-top': function () {
        ScheduleUI.applyAuditState({ matchId: scanTop, scrollToMatchId: scanTop });
      },
      'schedule-match-focus': function () {
        ScheduleUI.applyAuditState({ matchId: scanTop, scrollToMatchId: scanTop });
      },
      'schedule-scrolled-mid': function () {
        ScheduleUI.applyAuditState({ matchId: playoff || first, scrollToMatchId: playoff || first });
      },
      'schedule-scroll-top': function () {
        ScheduleUI.applyAuditState({
          matchId: playoff || first,
          scrollToMatchId: playoff || first,
          showScrollTop: true,
          showBroadcastDialog: true
        });
        if (global.BroadcastUI) BroadcastUI.applyAuditState({ showBroadcastDialog: true });
      },
      'schedule-error': function () {
        ScheduleUI.applyAuditState({
          showError: true,
          errorMessage: 'Не удалось загрузить расписание'
        });
      },
      'schedule-live-card': function () {
        ScheduleUI.applyAuditState({
          matchId: first,
          scrollTop: 0,
          demoAvailability: 'live'
        });
      }
    };
    if (states[id]) states[id]();
  }

  function applyAuditPreset(id) {
    if (id && id.indexOf('schedule-') === 0) {
      applyScheduleAudit(id);
      return;
    }
    if (id && id.indexOf('my-team-') === 0) {
      applyMyTeamAudit(id);
      return;
    }
    if (id && id.indexOf('bracket-') === 0) {
      applyBracketAudit(id);
      return;
    }
    if (id === 'broadcast-dialog') {
      applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: null });
      if (global.BroadcastUI) BroadcastUI.applyAuditState({ showBroadcastDialog: true });
      return;
    }
    var preset = AUDIT_PRESETS.find(function (p) { return p.id === id; });
    if (preset) applyShellState(preset.state);
  }

  function applyBracketAudit(id) {
    if (!global.BracketUI || !global.SportUI) return;
    if (global.BroadcastUI) BroadcastUI.hide();
    SportUI.applyState({ activeTab: 'bracket', railFocus: null, tabFocus: null });
    if (id === 'bracket-default') {
      BracketUI.applyAuditState({ focusedCellId: 'left_r0_0' });
    } else if (id === 'bracket-playable-focused') {
      applyShellState({ activeTab: 'schedule', railFocus: null, tabFocus: 'schedule' });
      var pid = ScheduleUI.findMatchId('PLAYOFF_18') || ScheduleUI.findMatchId('PLAYOFF');
      ScheduleUI.applyAuditState({ matchId: pid, scrollToMatchId: pid });
      if (global.BroadcastUI) BroadcastUI.applyAuditState({ showBroadcastDialog: true, focusedIndex: 1 });
    }
  }

  function applyMyTeamAudit(id) {
    if (!global.MyTeamUI || !global.SportUI) return;
    if (global.BroadcastUI) BroadcastUI.hide();

    if (id === 'rail-myteam-focused') {
      SportUI.applyState({ activeTab: 'my_team', railFocus: 'my_team', tabFocus: null });
      MyTeamUI.applyAuditState({
        selectedTeams: [],
        clearCountryFocus: true,
        clearMatchFocus: true,
        scrollScheduleTop: true
      });
      return;
    }
    if (id === 'tab-myteam-focused') {
      SportUI.applyState({ activeTab: 'my_team', railFocus: null, tabFocus: 'my_team' });
      MyTeamUI.applyAuditState({
        selectedTeams: [],
        clearCountryFocus: true,
        clearMatchFocus: true,
        scrollScheduleTop: true
      });
      return;
    }
    if (id === 'my-team-countries') {
      SportUI.applyState({ activeTab: 'my_team', railFocus: null, tabFocus: null });
      MyTeamUI.applyAuditState({
        selectedTeams: [],
        focusedCountry: 'Czechia',
        clearMatchFocus: true,
        scrollScheduleTop: true
      });
      return;
    }
    if (id === 'my-team-schedule-filtered') {
      SportUI.applyState({ activeTab: 'my_team', railFocus: null, tabFocus: null });
      MyTeamUI.applyAuditState({
        selectedTeams: ['Бельгия'],
        focusedCountry: 'Австралия',
        focusSchedule: true,
        scrollScheduleTop: true
      });
      return;
    }
    if (id === 'my-team-country-selected') {
      SportUI.applyState({ activeTab: 'my_team', railFocus: null, tabFocus: null });
      MyTeamUI.applyAuditState({
        selectedTeams: ['Бельгия'],
        focusedCountry: 'Бельгия',
        clearMatchFocus: true,
        scrollScheduleTop: true
      });
    }
  }

  global.AppPreview = {
    init: init,
    loadMocks: loadMocks,
    applyShellState: applyShellState,
    syncBroadcastButton: syncBroadcastButton,
    applyScheduleAudit: applyScheduleAudit,
    applyBracketAudit: applyBracketAudit,
    applyMyTeamAudit: applyMyTeamAudit,
    applyAuditPreset: applyAuditPreset,
    AUDIT_PRESETS: AUDIT_PRESETS
  };
})(typeof window !== 'undefined' ? window : global);
