(function () {
  function formatDate(str) {
    var parts = str.split('-');
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0));
  }

  function updateRunningTime() {
    var el = document.getElementById('system-running-time');
    if (!el) return;
    var birthDay = formatDate('2021-06-11');
    var seconds = Math.floor((new Date() - birthDay) / 1000);
    var days = Math.floor(seconds / 86400);
    var hours = Math.floor((seconds % 86400) / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    el.innerHTML = '博客在各种环境已运行：' + days + '天' + hours + '小时' + minutes + '分' + (seconds % 60) + '秒';
  }

  function initRightMenu() {
    if (typeof jQuery === 'undefined') return;
    var isPC = true;
    if (typeof MobileDetect !== 'undefined') {
      var detector = new MobileDetect(window.navigator.userAgent);
      isPC = !detector.phone() && !detector.tablet();
    }
    if (!isPC) return;

    var $menu = jQuery('.usercm');
    if (!$menu.length) return;
    var menuX = 0;
    var menuY = 0;
    jQuery(window).on('mousemove.hilangMenu', function (event) {
      var winWidth = jQuery(window).width();
      var winHeight = jQuery(window).height();
      menuX = event.pageX;
      menuY = event.pageY;
      if (event.clientX + $menu.outerWidth() >= winWidth) menuX -= $menu.outerWidth() + 5;
      if (event.clientY + $menu.outerHeight() >= winHeight) menuY -= $menu.outerHeight() + 5;
    });

    jQuery('html')
      .off('contextmenu.hilangMenu')
      .on('contextmenu.hilangMenu', function (event) {
        event.preventDefault();
        $menu.css({ left: menuX, top: menuY }).show();
      })
      .off('click.hilangMenu')
      .on('click.hilangMenu', function () {
        $menu.hide();
      });
  }

  function selectedText() {
    return window.getSelection ? window.getSelection().toString() : '';
  }

  window.getSelect = function () {
    var text = selectedText();
    if (!text) {
      if (typeof layer !== 'undefined') layer.msg('请选择需要复制的内容！');
      else alert('请选择需要复制的内容！');
      return;
    }
    try {
      document.execCommand('copy');
      if (typeof layer !== 'undefined') layer.msg('复制成功！');
    } catch (err) {
      alert('复制失败，请手动复制');
    }
  };

  window.bingSearch = function () {
    var text = selectedText();
    if (!text) {
      if (typeof layer !== 'undefined') layer.msg('请选择需要搜索的内容！');
      else alert('请选择需要搜索的内容！');
      return;
    }
    window.open('https://cn.bing.com/search?q=' + encodeURIComponent(text));
  };

  function fixHeadingAnchors() {
    var map = new Map();
    document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').forEach(function (header) {
      map.set(header.textContent.trim(), header.id);
    });
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var target = decodeURIComponent(link.getAttribute('href').slice(1));
      if (map.has(target)) link.setAttribute('href', '#' + map.get(target));
    });
    if (window.location.hash) {
      var hashText = decodeURIComponent(window.location.hash.slice(1));
      var targetEl = document.getElementById(hashText) || document.getElementById(map.get(hashText));
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function initSecurityPrompt() {
    setTimeout(function () {
      if (localStorage.getItem('popupShown')) return;
      var popup = document.createElement('div');
      popup.className = 'welcome-overlay';
      popup.innerHTML = '<div class="welcome-card">'
        + '<div class="welcome-header">'
        + '<h3 class="welcome-title">渐怀的博客</h3>'
        + '<p class="welcome-subtitle">专注网络安全技术分享</p>'
        + '</div>'
        + '<div class="welcome-body">'
        + '<div class="welcome-notice">'
        + '<div class="welcome-notice-bar">本站资源仅限合法授权学习，严禁非法使用</div>'
        + '<a class="welcome-notice-link" href="/agreement/">查看用户协议 &rarr;</a>'
        + '</div>'
        + '<div class="welcome-recommend">'
        + '<div class="recommend-label">\u{1F525} 推荐阅读</div>'
        + '<a class="recommend-item" href="/archives/">'
        + '<span class="recommend-icon-wrap" style="background:rgba(239,68,68,.1)">&#x1F4D6;</span>'
        + '<div class="recommend-info"><span class="recommend-text">全部文章</span><span class="recommend-desc">漏洞分析 / 工具资源 / 代码审计</span></div>'
        + '<span class="recommend-arrow">&rarr;</span></a>'
        + '</div>'
        + '<button id="agreeBtn" class="welcome-enter-btn">\u{1F680} 开始探索</button>'
        + '<p class="welcome-hint">点击即视为同意《用户协议》</p>'
        + '</div></div>';
      document.body.appendChild(popup);
      requestAnimationFrame(function () { popup.classList.add('visible'); });
      function closePopup() {
        popup.classList.remove('visible');
        popup.classList.add('hiding');
        setTimeout(function () { popup.remove(); }, 400);
        localStorage.setItem('popupShown', 'true');
      }
      document.getElementById('agreeBtn').addEventListener('click', closePopup);
      popup.querySelectorAll('.recommend-item').forEach(function (item) {
        item.addEventListener('click', closePopup);
      });
      var noticeLink = popup.querySelector('.welcome-notice-link');
      if (noticeLink) noticeLink.addEventListener('click', closePopup);
    }, 1000);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function codeTextFromBlock(block) {
    var lines = block.querySelectorAll('td.code .line');
    if (lines.length) {
      return Array.prototype.map.call(lines, function (line) {
        return line.innerText || line.textContent || '';
      }).join('\n').replace(/\n$/, '');
    }
    var code = block.querySelector('td.code pre') || block.querySelector('pre');
    return code ? (code.innerText || code.textContent || '').trimEnd() : (block.innerText || block.textContent || '').trimEnd();
  }

  function initCodeCopyButtons() {
    var container = document.getElementById('post_content') || document.querySelector('.post-content');
    if (!container) return;
    container.querySelectorAll('figure.highlight').forEach(function (block) {
      if (block.querySelector('.code-copy-button')) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy-button';
      button.textContent = '复制';
      button.setAttribute('aria-label', '复制代码');
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var text = codeTextFromBlock(block);
        copyText(text).then(function () {
          button.textContent = '已复制';
          button.classList.add('copied');
          setTimeout(function () {
            button.textContent = '复制';
            button.classList.remove('copied');
          }, 1400);
        }).catch(function () {
          button.textContent = '失败';
          setTimeout(function () { button.textContent = '复制'; }, 1400);
        });
      });
      block.appendChild(button);
    });
  }

  function isPC() {
    if (typeof MobileDetect !== 'undefined') {
      var d = new MobileDetect(window.navigator.userAgent);
      return !d.phone() && !d.tablet();
    }
    return true;
  }

  function initClickTextEffect() {
    if (!isPC()) return;
    var texts = [
      '❤我不去想是否能够成功❤',
      '❤既然选择了远方❤',
      '❤便只顾风雨兼程❤',
      '❤我不去想身后会不会袭来寒风冷雨❤',
      '❤既然目标是地平线❤',
      '❤留给世界的只能是背影❤',
      '❤我不去想未来是平坦还是泥泞❤',
      '❤只要热爱生命❤',
      '❤一切，都在意料之中❤'
    ];
    var idx = 0;
    document.body.addEventListener('click', function (e) {
      var span = document.createElement('span');
      span.textContent = texts[idx];
      idx = (idx + 1) % texts.length;
      var r = ~~(255 * Math.random());
      var g = ~~(255 * Math.random());
      var b = ~~(255 * Math.random());
      span.style.cssText =
        'z-index:999999;position:absolute;' +
        'top:' + (e.pageY - 20) + 'px;left:' + e.pageX + 'px;' +
        'font-weight:bold;pointer-events:none;user-select:none;' +
        'color:rgb(' + r + ',' + g + ',' + b + ');' +
        'transition:top 1.5s ease,opacity 1.5s ease;opacity:1;';
      document.body.appendChild(span);
      requestAnimationFrame(function () {
        span.style.top = (e.pageY - 180) + 'px';
        span.style.opacity = '0';
      });
      setTimeout(function () { span.remove(); }, 1600);
    });
  }

  function loadScript(src, attrs, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    if (cb) s.onload = cb;
    document.body.appendChild(s);
  }

  function initLive2D() {
    if (!isPC()) return;
    window.addEventListener('error', function (e) {
      if (e.message && e.message.indexOf('hitTest') !== -1) {
        e.preventDefault();
        return true;
      }
    }, true);
    var s = document.createElement('script');
    s.src = 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0-rc.5/dist/autoload.js';
    s.async = true;
    document.body.appendChild(s);
  }

  function initCanvasNest() {
    if (!isPC()) return;
    var count = 120, dist = 12000, mouseDist = 20000;
    var color = '94,114,228';
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.45;';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W, H, points = [], mouse = { x: null, y: null };
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', function () { mouse.x = null; mouse.y = null; });
    for (var i = 0; i < count; i++) {
      points.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .6, vy: (Math.random() - .6) * .6,
        r: 1.2 + Math.random() * .8
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < count; i++) {
        var p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + color + ',.6)';
        ctx.fill();
        for (var j = i + 1; j < count; j++) {
          var q = points[j];
          var dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < dist) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(' + color + ',' + (.3 * (1 - d / dist)) + ')';
            ctx.lineWidth = .6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        if (mouse.x !== null) {
          var mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = mdx * mdx + mdy * mdy;
          if (md < mouseDist) {
            var f = (mouseDist - md) / mouseDist;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(' + color + ',' + (f * .5) + ')';
            ctx.lineWidth = f * 1.2;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            p.x -= mdx * .02;
            p.y -= mdy * .02;
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function initScrollBlur() {
    var timer;
    window.addEventListener('scroll', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var el = document.getElementById('content');
        if (!el) return;
        if (document.body.classList.contains('noscroll')) return;
        if (window.scrollY > window.innerHeight * 0.3) {
          el.classList.add('scroll-blur');
        } else {
          el.classList.remove('scroll-blur');
        }
      }, 60);
    });
  }

  function fixModalAriaHidden() {
    document.querySelectorAll('.modal').forEach(function (modal) {
      modal.addEventListener('hidden.bs.modal', function () {
        if (document.activeElement && modal.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      });
    });
  }

  function initScrollReveal() {
    if (document.getElementById('post_content')) return;
    var items = document.querySelectorAll('.post.card, .widget.card, .shuoshuo-container');
    if (!items.length || !window.IntersectionObserver) return;
    items.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1)';
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  function initSmoothBackTop() {
    var btn = document.getElementById('fabtn_back_to_top') || document.querySelector('.fabtn-back-to-top');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initReadingProgressBar() {
    var post = document.getElementById('post_content');
    if (!post) return;
    var bar = document.createElement('div');
    bar.id = 'reading-progress-bar';
    document.body.appendChild(bar);
    window.addEventListener('scroll', function () {
      var rect = post.getBoundingClientRect();
      var total = post.scrollHeight;
      var visible = window.innerHeight;
      var scrolled = -rect.top;
      var progress = Math.min(Math.max(scrolled / (total - visible), 0), 1);
      bar.style.width = (progress * 100) + '%';
    });
  }

  function initHilangEnhancements() {
    updateRunningTime();
    setInterval(updateRunningTime, 1000);
    initRightMenu();
    initCodeCopyButtons();
    fixHeadingAnchors();
    fixModalAriaHidden();
    initSecurityPrompt();
    initClickTextEffect();
    initScrollReveal();
    initScrollBlur();
    initSmoothBackTop();
    initReadingProgressBar();
    setTimeout(initCodeCopyButtons, 300);
    setTimeout(initCodeCopyButtons, 1500);
    window.addEventListener('load', function () { setTimeout(initCodeCopyButtons, 200); });
    setTimeout(initLive2D, 600);
    setTimeout(initCanvasNest, 600);

    var post = document.getElementById('post_content') || document.querySelector('.post-content');
    if (post && window.MutationObserver) {
      new MutationObserver(function () {
        initCodeCopyButtons();
      }).observe(post, { childList: true, subtree: true });
    }
  }

  function onPjaxLoad() {
    initCodeCopyButtons();
    fixHeadingAnchors();
    initReadingProgressBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHilangEnhancements);
  } else {
    initHilangEnhancements();
  }

  window.pjaxLoaded = onPjaxLoad;

  if (typeof jQuery !== 'undefined') {
    jQuery(document).on('pjax:complete', function () {
      setTimeout(onPjaxLoad, 100);
    });
  }
})();
