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

  function toAbsolute(path) {
    if (!path) return path;
    if (/^https?:\/\//i.test(path)) return path;
    if (path.charAt(0) === '/') return location.origin + path;
    return new URL(path, location.href).href;
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

  function init() {
    var base = repoBase();
    document.documentElement.style.setProperty('--fifa-repo-base', base || '');
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  global.FifaAssets = {
    repoBase: repoBase,
    asset: asset,
    mock: mock,
    flag: flag,
    icon: icon,
    absolute: toAbsolute,
    init: init
  };
})(typeof window !== 'undefined' ? window : global);
