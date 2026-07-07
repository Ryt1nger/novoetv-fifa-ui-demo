(function (global) {
  'use strict';

  var state = {
    visible: false,
    focusedIndex: 0,
    sources: [],
    selectionSource: null
  };

  function byId(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderList() {
    var list = byId('sport_sources_list');
    if (!list) return;
    list.innerHTML = state.sources.map(function (src, i) {
      var cls = ['sport_source_item'];
      if (i === state.focusedIndex) cls.push('focused');
      return (
        '<div class="' + cls.join(' ') + '" data-source-index="' + i + '">' +
          '<span class="sport_source_title">' + escapeHtml(src.title) + '</span>' +
          '<span class="sport_source_chevron" aria-hidden="true"></span>' +
        '</div>'
      );
    }).join('');
  }

  function show(sources, focusedIndex) {
    state.sources = sources || [];
    state.focusedIndex = focusedIndex != null ? focusedIndex : 0;
    state.visible = true;
    var root = byId('sport_sources_dialog_root');
    if (root) {
      root.classList.remove('preview-hidden');
      root.setAttribute('aria-hidden', 'false');
    }
    renderList();
    syncDevChrome();
  }

  function setFocusedIndex(index) {
    if (!state.sources.length) return;
    state.focusedIndex = Math.max(0, Math.min(index, state.sources.length - 1));
    renderList();
  }

  function syncDevChrome() {
    if (global.AppPreview && AppPreview.syncBroadcastButton) {
      AppPreview.syncBroadcastButton();
    }
  }

  function clearActiveSelection() {
    if (state.selectionSource === 'schedule' && global.ScheduleUI && ScheduleUI.setSelectedMatch) {
      ScheduleUI.setSelectedMatch(null);
    } else if (state.selectionSource === 'my_team' && global.MyTeamUI && MyTeamUI.setSelectedMatch) {
      MyTeamUI.setSelectedMatch(null);
    } else if (state.selectionSource === 'bracket' && global.BracketUI && BracketUI.setSelectedCell) {
      BracketUI.setSelectedCell(null);
    }
    state.selectionSource = null;
  }

  function hide() {
    state.visible = false;
    var root = byId('sport_sources_dialog_root');
    if (root) {
      root.classList.add('preview-hidden');
      root.setAttribute('aria-hidden', 'true');
    }
    clearActiveSelection();
    syncDevChrome();
  }

  function isPlayable(match) {
    if (!match || !match.channelIds || !match.channelIds.length) return false;
    return match.isLive || !!match.score;
  }

  function resolveSources(channelIds) {
    var tvChannels = global.FifaData && FifaData.getTvChannels ? FifaData.getTvChannels() : {};
    return (channelIds || []).map(function (channelId) {
      var id = String(channelId);
      var ch = tvChannels[id];
      return {
        id: id,
        channelId: id,
        title: (ch && ch.title) ? ch.title : id
      };
    });
  }

  function showForMatch(match, selectionSource) {
    if (!isPlayable(match)) return;
    var sources = resolveSources(match.channelIds);
    if (!sources.length) return;
    state.selectionSource = selectionSource || null;
    show(sources, 0);
  }

  function showFromMock() {
    var data = global.FifaData && FifaData.getBroadcastSources();
    if (data && data.sources) show(data.sources, 0);
  }

  function applyAuditState(cfg) {
    if (cfg.showBroadcastDialog) {
      var data = global.FifaData && FifaData.getBroadcastSources();
      var sources = data && data.sources ? data.sources : [];
      show(sources, cfg.focusedIndex != null ? cfg.focusedIndex : 0);
    } else {
      hide();
    }
  }

  global.BroadcastUI = {
    show: show,
    hide: hide,
    showForMatch: showForMatch,
    showFromMock: showFromMock,
    setFocusedIndex: setFocusedIndex,
    applyAuditState: applyAuditState,
    getState: function () { return { visible: state.visible, count: state.sources.length }; }
  };
})(typeof window !== 'undefined' ? window : global);
