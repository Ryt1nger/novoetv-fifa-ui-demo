(function (global) {
  'use strict';

  function repoBase() {
    var path = location.pathname || '';
    var ui = path.indexOf('/ui/');
    if (ui >= 0) return path.slice(0, ui);
    return path.replace(/\/[^/]*$/, '') || '';
  }

  function join(base, rel) {
    var clean = rel.replace(/^\//, '');
    if (!base) return '/' + clean;
    return base + '/' + clean;
  }

  function asset(relPath) {
    return join(repoBase(), 'assets/' + relPath.replace(/^\//, ''));
  }

  function mock(relPath) {
    return join(repoBase(), 'mocks/' + relPath.replace(/^\//, ''));
  }

  function flag(teamId) {
    return asset('img/flags/' + teamId + '.png');
  }

  function icon(name) {
    return asset('img/icons/' + name);
  }

  global.FifaAssets = {
    repoBase: repoBase,
    asset: asset,
    mock: mock,
    flag: flag,
    icon: icon
  };
})(typeof window !== 'undefined' ? window : global);
