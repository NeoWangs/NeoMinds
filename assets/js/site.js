(function () {
  var root = document.documentElement;

  function isDark() {
    return root.getAttribute('data-theme') === 'dark';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var dark = !isDark();
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
        try { localStorage.setItem('oj-theme', dark ? 'dark' : 'light'); } catch (e) {}
      });
    }

    window.ojCardLayout();
    setTimeout(window.ojCardLayout, 100);
  });

  window.addEventListener('load', window.ojCardLayout);
  window.addEventListener('resize', function () {
    window.clearTimeout(window.__ojCardResizeTimer);
    window.__ojCardResizeTimer = window.setTimeout(window.ojCardLayout, 120);
  });
})();

window.ojCardLayout = function () {
  var wraps = document.getElementsByClassName('oj-card-wrap');

  function getArrayKey(items, value) {
    for (var key in items) {
      if (items[key] === value) return key;
    }
    return 0;
  }

  function layout(el) {
    var heights = [];
    var boxes = el.children;
    if (!boxes[0]) return;

    var boxWidth = boxes[0].offsetWidth;
    if (!boxWidth) return;

    var columns = Math.max(1, el.offsetWidth / boxWidth | 0);
    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    for (var i = 0; i < boxes.length; i++) {
      boxes[i].style.position = '';
      boxes[i].style.top = '';
      boxes[i].style.left = '';
    }

    for (var j = 0; j < boxes.length; j++) {
      var boxHeight = boxes[j].offsetHeight;
      if (j < columns) {
        heights[j] = boxHeight;
        continue;
      }

      var minHeight = Math.min.apply({}, heights);
      var minKey = getArrayKey(heights, minHeight);
      heights[minKey] += boxHeight;
      boxes[j].style.position = 'absolute';
      boxes[j].style.top = minHeight + 'px';
      boxes[j].style.left = (minKey * boxWidth) + 'px';
    }

    el.style.height = (heights.length ? Math.max.apply({}, heights) : 0) + 'px';
  }

  for (var i = 0; i < wraps.length; i++) {
    layout(wraps[i]);
  }
};

window.runcode = window.runcode || {};
window.runcode.open = function (element) {
  var target = document.getElementById(element);
  if (!target) return;
  var win = window.open('', '', '');
  if (!win) return;
  win.opener = null;
  win.document.write(target.value);
  win.document.close();
};
window.runcode.copy = function (element) {
  var codeobj = document.getElementById(element);
  if (!codeobj) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(codeobj.value);
  } else {
    codeobj.select();
    codeobj.setSelectionRange(0, codeobj.value.length);
    document.execCommand('copy');
    setTimeout(function () {
      codeobj.blur();
    }, 300);
  }
};

