(function () {
  var root = document.documentElement;
  var theme = 'light';
  try { var saved = localStorage.getItem('university-vr.theme'); if (saved === 'dark' || saved === 'light') theme = saved; } catch (_) {}
  function apply(value) {
    theme = value === 'dark' ? 'dark' : 'light'; root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      var uz = root.lang === 'uz';
      button.setAttribute('aria-label', theme === 'dark' ? (uz ? 'Yorug‘ mavzuni yoqish' : 'Включить светлую тему') : (uz ? 'Qorong‘i mavzuni yoqish' : 'Включить темную тему')); button.setAttribute('aria-pressed', String(theme === 'dark'));
      var use = button.querySelector('use'); if (use) use.setAttribute('href', './assets/ui-icons/sprite.svg#i-' + (theme === 'dark' ? 'sun' : 'moon'));
    });
    document.querySelectorAll('iframe').forEach(function (frame) { frame.contentWindow?.postMessage({ type: 'university-panorama:theme', theme: theme }, location.origin); });
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = theme === 'dark' ? '#17211f' : '#f5f4ed';
  }
  apply(theme); document.addEventListener('DOMContentLoaded', function () { apply(theme); });
  window.addEventListener('university-ui-ready', function () { apply(theme); });
  document.addEventListener('click', function (event) { if (!event.target.closest('[data-theme-toggle]')) return; apply(theme === 'dark' ? 'light' : 'dark'); try { localStorage.setItem('university-vr.theme', theme); } catch (_) {} });
})();
