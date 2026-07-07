(function (global) {
  'use strict';

  var state = {
    layout: null,
    cellMatches: {},
    focusedCellId: null,
    selectedCellId: null
  };

  var boundCells = false;

  function byId(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ensureMount() {
    var root = byId('bracket_content_container');
    if (!root) return null;
    if (!byId('bracket_connectors')) {
      root.innerHTML =
        '<div id="bracket_connectors"></div>' +
        '<div id="bracket_cells_container"></div>' +
        '<div id="bracket_labels_container"></div>';
    }
    return root;
  }

  function availability(match) {
    if (match.isLive) return 'live';
    if (match.score || match.isPlayable) return 'available';
    if (match.teamTop === 'Н/Д' && match.teamBottom === 'Н/Д') return 'future';
    if (match.score == null && !match.isLive) return 'future';
    return 'available';
  }

  function buildCell(placement, match) {
    var avail = availability(match);
    var classes = ['bracket_cell', avail];
    if (placement.id === state.selectedCellId) classes.push('selected');
    if (placement.id === state.focusedCellId) classes.push('focused');
    if (match.isPlayable) classes.push('playable');

    var showPlay = placement.id === state.focusedCellId && match.isPlayable;

    return (
      '<div class="' + classes.join(' ') + '" id="bracket_cell_' + escapeHtml(placement.id) + '"' +
        ' data-cell-id="' + escapeHtml(placement.id) + '"' +
        ' style="left:' + placement.left + 'px;top:' + placement.top + 'px"' +
        ' tabindex="0">' +
        '<div class="meta_play_slot">' +
          '<div class="meta_text_col">' +
            '<span class="tv_date">' + escapeHtml(match.date) + '</span>' +
            '<span class="tv_time">' + escapeHtml(match.time) + '</span>' +
          '</div>' +
          '<span class="iv_match_play' + (showPlay ? ' visible' : '') + '" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="bracket_teams">' +
          '<span class="tv_team_top">' + escapeHtml(match.teamTop) + '</span>' +
          '<span class="tv_team_bottom">' + escapeHtml(match.teamBottom) + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function renderConnectors(pairBars) {
    var el = byId('bracket_connectors');
    if (!el) return;
    el.innerHTML = pairBars.map(function (bar) {
      return '<div class="bracket_pair_bar" style="left:' + bar.left + 'px;top:' + bar.top +
        'px;height:' + bar.height + 'px"></div>';
    }).join('');
  }

  function renderLabels(labels, cellWidth) {
    var el = byId('bracket_labels_container');
    if (!el) return;
    el.innerHTML = labels.map(function (label) {
      return (
        '<div class="bracket_round_label" style="left:' + label.left + 'px;top:' + label.top +
          'px;width:' + cellWidth + 'px">' + escapeHtml(label.text) + '</div>'
      );
    }).join('');
  }

  function openBroadcastForCell(cellId) {
    var match = state.cellMatches[cellId];
    if (!match || !global.BroadcastUI) return;
    setFocusedCell(cellId);
    BroadcastUI.showForMatch(match, 'bracket');
  }

  function bindCellEvents() {
    var container = byId('bracket_cells_container');
    if (!container || boundCells) return;
    boundCells = true;
    container.addEventListener('dblclick', function (e) {
      var cell = e.target.closest('.bracket_cell');
      if (!cell) return;
      e.preventDefault();
      openBroadcastForCell(cell.getAttribute('data-cell-id'));
    });
  }

  function renderCells(cells) {
    var el = byId('bracket_cells_container');
    if (!el) return;
    el.innerHTML = cells.map(function (placement) {
      var match = state.cellMatches[placement.id] || placement.match;
      return buildCell(placement, match);
    }).join('');
    bindCellEvents();
  }

  function render(fifaResponse) {
    ensureMount();
    state.layout = FifaBracketLayout.buildLayout();
    state.cellMatches = FifaBracketMapper.toCellMatches(fifaResponse);
    if (!state.focusedCellId) state.focusedCellId = 'left_r0_0';

    renderConnectors(state.layout.pairBars);
    renderLabels(state.layout.labels, state.layout.metrics.cellWidth);
    renderCells(state.layout.cells);
  }

  function setFocusedCell(cellId) {
    state.focusedCellId = cellId || null;
    document.querySelectorAll('#bracket_cells_container .bracket_cell').forEach(function (el) {
      var id = el.getAttribute('data-cell-id');
      var isFocus = id === state.focusedCellId;
      el.classList.toggle('focused', isFocus);
      var play = el.querySelector('.iv_match_play');
      var match = state.cellMatches[id];
      if (play) play.classList.toggle('visible', isFocus && !!(match && match.isPlayable));
    });
  }

  function setSelectedCell(cellId) {
    state.selectedCellId = cellId || null;
    document.querySelectorAll('#bracket_cells_container .bracket_cell').forEach(function (el) {
      var on = state.selectedCellId !== null &&
        el.getAttribute('data-cell-id') === state.selectedCellId;
      el.classList.toggle('selected', on);
    });
  }

  function applyAuditState(cfg) {
    if (cfg.focusedCellId) setFocusedCell(cfg.focusedCellId);
    if (cfg.selectedCellId) setSelectedCell(cfg.selectedCellId);
  }

  function getPlayableCellId() {
    var ids = Object.keys(state.cellMatches);
    for (var i = 0; i < ids.length; i++) {
      if (state.cellMatches[ids[i]].isPlayable) return ids[i];
    }
    return 'left_r0_0';
  }

  function getState() {
    return {
      focusedCellId: state.focusedCellId,
      cellCount: state.layout ? state.layout.cells.length : 0
    };
  }

  global.BracketUI = {
    render: render,
    setFocusedCell: setFocusedCell,
    setSelectedCell: setSelectedCell,
    openBroadcastForCell: openBroadcastForCell,
    applyAuditState: applyAuditState,
    getPlayableCellId: getPlayableCellId,
    getState: getState
  };
})(typeof window !== 'undefined' ? window : global);
