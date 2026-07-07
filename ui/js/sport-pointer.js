(function (global) {
  'use strict';

  var RAIL_TAB = {
    btn_sport_rail_schedule: 'schedule',
    btn_sport_rail_bracket: 'bracket',
    btn_sport_rail_my_team: 'my_team'
  };

  function byId(id) { return document.getElementById(id); }

  function applyShell(partial) {
    if (global.AppPreview && AppPreview.applyShellState) {
      AppPreview.applyShellState(partial);
    } else if (global.SportUI) {
      SportUI.applyState(partial);
    }
  }

  function onStageClick(e) {
    if (e.target.closest('#dev-panel')) return;

    var broadcastDialog = byId('sport_sources_dialog_root');
    if (broadcastDialog && !broadcastDialog.classList.contains('preview-hidden')) {
      if (!e.target.closest('#sport_sources_panel')) {
        if (global.BroadcastUI) BroadcastUI.hide();
        return;
      }
    }

    var railBtn = e.target.closest('.sport-rail-btn');
    if (railBtn && RAIL_TAB[railBtn.id]) {
      var railTab = RAIL_TAB[railBtn.id];
      applyShell({ activeTab: railTab, railFocus: railTab, tabFocus: null });
      return;
    }

    var tabEl = e.target.closest('.sport-tab');
    if (tabEl) {
      var tabKey = tabEl.getAttribute('data-tab');
      if (tabKey) applyShell({ activeTab: tabKey, tabFocus: tabKey, railFocus: null });
      return;
    }

    var schedCard = e.target.closest('#rv_sport_schedule .match_card_root');
    if (schedCard && global.ScheduleUI) {
      applyShell({ activeTab: 'schedule', railFocus: null, tabFocus: null });
      ScheduleUI.setFocusedMatch(schedCard.getAttribute('data-match-id'));
      return;
    }

    var bracketCell = e.target.closest('#bracket_cells_container .bracket_cell');
    if (bracketCell && global.BracketUI) {
      applyShell({ activeTab: 'bracket', railFocus: null, tabFocus: null });
      BracketUI.setFocusedCell(bracketCell.getAttribute('data-cell-id'));
      return;
    }

    var myMatch = e.target.closest('#rv_my_team_schedule .match_card_root');
    if (myMatch && global.MyTeamUI) {
      applyShell({ activeTab: 'my_team', railFocus: null, tabFocus: null });
      MyTeamUI.setFocusedMatch(myMatch.getAttribute('data-match-id'));
      return;
    }

    var source = e.target.closest('#sport_sources_list .sport_source_item');
    if (source && global.BroadcastUI) {
      var idx = parseInt(source.getAttribute('data-source-index'), 10);
      if (!isNaN(idx)) BroadcastUI.setFocusedIndex(idx);
    }
  }

  function init() {
    var stage = byId('tv-stage');
    if (!stage) return;
    stage.addEventListener('click', onStageClick);
  }

  global.SportPointer = { init: init };
})(typeof window !== 'undefined' ? window : global);
