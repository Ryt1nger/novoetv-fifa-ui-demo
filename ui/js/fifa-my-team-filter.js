(function (global) {
  'use strict';

  function filter(items, selectedTeams) {
    if (!selectedTeams || !selectedTeams.length) return items;

    var selected = {};
    selectedTeams.forEach(function (n) { selected[n] = true; });

    var result = [];
    var pendingHeader = null;

    items.forEach(function (item) {
      if (item.type === 'date') {
        pendingHeader = item;
      } else if (item.type === 'match') {
        var m = item.data;
        if (selected[m.teamHome] || selected[m.teamAway]) {
          if (pendingHeader) {
            var last = result[result.length - 1];
            if (!last || last.type !== 'date' || last.date !== pendingHeader.date) {
              result.push(pendingHeader);
            }
            pendingHeader = null;
          }
          result.push(item);
        }
      }
    });
    return result;
  }

  function toSections(items) {
    var sections = [];
    var current = null;
    items.forEach(function (item) {
      if (item.type === 'date') {
        if (current) sections.push(current);
        current = { date: item.date, dayOfWeek: item.dayOfWeek, matches: [] };
      } else if (item.type === 'match' && current) {
        current.matches.push(item.data);
      }
    });
    if (current) sections.push(current);
    return sections;
  }

  global.FifaMyTeamFilter = {
    filter: filter,
    toSections: toSections
  };
})(typeof window !== 'undefined' ? window : global);
