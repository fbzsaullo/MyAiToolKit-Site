(function () {
  var root = document.documentElement;
  var store = null;
  try { store = window.localStorage; } catch (e) {}
  var get = function (key) { try { return store && store.getItem(key); } catch (e) { return null; } };

  var theme = get('matk-theme');
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);

  var current = root.lang === 'en' ? 'en' : 'pt-BR';
  var saved = get('matk-lang');
  var target = null;
  if (saved === 'en' || saved === 'pt-BR') {
    target = saved;
  } else if (current === 'pt-BR') {
    var first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    target = /^pt(-|$)/i.test(first) ? 'pt-BR' : 'en';
  }
  if (target && target !== current) {
    var path = location.pathname;
    var next = target === 'en'
      ? '/en' + (path === '/' ? '/' : path)
      : path.replace(/^\/en(\/|$)/, '/');
    location.replace(next + location.search + location.hash);
  }
})();
