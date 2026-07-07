(function (global) {
  'use strict';

  var TAB_ORDER = ['schedule', 'bracket', 'my_team'];

  var TAB_IDS = {
    schedule: 'tab_schedule',
    bracket: 'tab_bracket',
    my_team: 'tab_my_team'
  };

  var RAIL_IDS = {
    schedule: 'btn_sport_rail_schedule',
    bracket: 'btn_sport_rail_bracket',
    my_team: 'btn_sport_rail_my_team'
  };

  var PAGE_IDS = {
    schedule: 'sport_schedule_root',
    bracket: 'bracket_content_container',
    my_team: 'sport_my_team_root'
  };

  function iconPath(file) {
    var path = global.FifaAssets ? FifaAssets.icon(file) : '../../assets/img/icons/' + file;
    return global.FifaAssets && FifaAssets.absolute ? FifaAssets.absolute(path) : path;
  }

  var ICONS = {
    football: iconPath('football.svg'),
    tournir_grid: iconPath('tournir_grid.svg'),
    your_team_icon: iconPath('your_team_icon.svg'),
    rail_back: iconPath('ic_sport_rail_back.svg')
  };

  var state = {
    activeTab: 'schedule',
    railFocus: null,
    tabFocus: null
  };

  function byId(id) { return document.getElementById(id); }

  function clearFocusClass(selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.remove('focused');
    });
  }

  function iconSpan(className, iconPath) {
    return (
      '<span class="' + className + '" style="--icon-url:url(\'' + iconPath + '\')"></span>'
    );
  }

  function buildTab(tabKey, label, iconName) {
    return (
      '<div id="' + TAB_IDS[tabKey] + '" class="sport-tab" data-tab="' + tabKey + '" tabindex="0">' +
        '<div id="tab_content_row" class="tab_content_row">' +
          '<div class="tab-icon-wrap">' +
            iconSpan('iv_tab_icon', ICONS[iconName]) +
          '</div>' +
          '<span class="tv_tab_label">' + label + '</span>' +
        '</div>' +
        '<div class="tab_indicator"></div>' +
      '</div>'
    );
  }

  function init(shellMock) {
    var shell = shellMock && shellMock.sportShell;
    var title = byId('tv_sport_title');
    if (title && shell) title.textContent = shell.title;

    var back = byId('btn_sport_back');
    if (back && !back.querySelector('.rail-icon')) {
      back.innerHTML = iconSpan('rail-icon rail-back-icon', ICONS.rail_back);
    }

    TAB_ORDER.forEach(function (key) {
      var btn = byId(RAIL_IDS[key]);
      if (!btn || btn.querySelector('.rail-icon')) return;
      var icon = shell && shell.tabs.find(function (t) {
        return t.id === TAB_IDS[key];
      });
      var iconName = icon ? icon.icon : key;
      btn.innerHTML = iconSpan('rail-icon', ICONS[iconName]);
    });

    var tabsEl = byId('sport_tabs');
    if (tabsEl && shell && shell.tabs.length) {
      tabsEl.innerHTML = shell.tabs.map(function (tab) {
        var key = tab.id.replace('tab_', '');
        if (key === 'my_team') key = 'my_team';
        return buildTab(
          tab.id === 'tab_my_team' ? 'my_team' : tab.id.replace('tab_', ''),
          tab.label,
          tab.icon
        );
      }).join('');
    }

    applyState(state);
  }

  function setActiveTab(tabKey) {
    if (TAB_ORDER.indexOf(tabKey) < 0) return;
    state.activeTab = tabKey;

    TAB_ORDER.forEach(function (key) {
      var tab = byId(TAB_IDS[key]);
      var rail = byId(RAIL_IDS[key]);
      var page = byId(PAGE_IDS[key]);
      var on = key === tabKey;
      if (tab) tab.classList.toggle('selected', on);
      if (rail) rail.classList.toggle('selected', on);
      if (page) page.classList.toggle('preview-hidden', !on);
    });

    var pager = byId('sport_pager');
    if (pager) pager.classList.toggle('bracket-active', tabKey === 'bracket');
  }

  function setRailFocus(tabKey) {
    clearFocusClass('.sport-rail-btn');
    state.railFocus = tabKey || null;
    if (tabKey && byId(RAIL_IDS[tabKey])) {
      byId(RAIL_IDS[tabKey]).classList.add('focused');
    }
  }

  function setTabFocus(tabKey) {
    clearFocusClass('.sport-tab');
    state.tabFocus = tabKey || null;
    if (tabKey && byId(TAB_IDS[tabKey])) {
      byId(TAB_IDS[tabKey]).classList.add('focused');
    }
  }

  function applyState(next) {
    if (next.activeTab !== undefined) setActiveTab(next.activeTab);
    if (next.railFocus !== undefined) setRailFocus(next.railFocus);
    if (next.tabFocus !== undefined) setTabFocus(next.tabFocus);
  }

  function getState() {
    return {
      activeTab: state.activeTab,
      railFocus: state.railFocus,
      tabFocus: state.tabFocus
    };
  }

  global.SportUI = {
    TAB_ORDER: TAB_ORDER,
    init: init,
    setActiveTab: setActiveTab,
    setRailFocus: setRailFocus,
    setTabFocus: setTabFocus,
    applyState: applyState,
    getState: getState
  };
})(typeof window !== 'undefined' ? window : global);
