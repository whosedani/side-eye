// ============================
// SEYE — Side Eye Face
// ============================

(function () {
  'use strict';

  // ── Config loader ──
  let config = {
    ca: '',
    twitter: '#',
    community: '#'
  };

  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        config.ca = data.ca || '';
        config.twitter = data.twitter || '#';
        config.community = data.community || '#';
      }
    } catch (_) {}
    applyConfig();
  }

  function applyConfig() {
    var caText = config.ca || 'TBA';

    // Nav
    document.getElementById('caAddress').textContent = caText;
    document.getElementById('twitterLink').href = config.twitter;
    document.getElementById('communityLink').href = config.community;

    // Hero
    document.getElementById('heroCaAddress').textContent = caText;
    document.getElementById('heroTwitterLink').href = config.twitter;
    document.getElementById('heroCommunityLink').href = config.community;
  }

  // ── Copy CA (both buttons) ──
  ['caAddress', 'heroCaAddress'].forEach(function (id) {
    document.getElementById(id).addEventListener('click', function () {
      if (!config.ca) return;
      navigator.clipboard.writeText(config.ca).then(function () {
        showToast();
      });
    });
  });

  function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 1800);
  }

  // ── Cursor avoidance (Hero face) ──
  const hero = document.getElementById('hero');
  const faceWrap = document.getElementById('faceWrap');
  let isHeroHovered = false;
  let resetTimeout;

  hero.addEventListener('mousemove', function (e) {
    isHeroHovered = true;
    clearTimeout(resetTimeout);

    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized offset from center (-1 to 1)
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    // Rotate OPPOSITE to cursor (side eye avoidance)
    const rotateY = -dx * 18;
    const rotateX = dy * 10;

    // Parallax translate away from cursor
    const translateX = -dx * 12;
    const translateY = -dy * 6;

    faceWrap.style.transform =
      'rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg) translateX(' + translateX + 'px) translateY(' + translateY + 'px)';
  });

  hero.addEventListener('mouseleave', function () {
    isHeroHovered = false;
    // Slow return to center
    faceWrap.style.transition = 'transform 2s ease';
    faceWrap.style.transform = 'rotateY(0deg) rotateX(0deg) translateX(0px) translateY(0px)';

    resetTimeout = setTimeout(function () {
      faceWrap.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';
    }, 2100);
  });

  hero.addEventListener('mouseenter', function () {
    clearTimeout(resetTimeout);
    faceWrap.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';
  });

  // ── Cursor glow ──
  const glow = document.getElementById('cursorGlow');

  document.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  // ── Gallery: hide broken images ──
  document.querySelectorAll('.gallery-item img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.parentElement.style.display = 'none';
    });
  });

  // ── Init ──
  loadConfig();
})();
