/* ============================================
   Saturn's Meat — JavaScript
   Subtle starfield, shooting star orbit,
   scroll reveals, nav behavior
   ============================================ */

(function () {
  'use strict';

  // ────────────────────────────────────────────
  // SUBTLE STARFIELD (very faint, background)
  // ────────────────────────────────────────────
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 100; // fewer than before — subtle

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const isGold = Math.random() > 0.75;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random() * 0.5 + 0.1,
        dAlpha: (Math.random() - 0.5) * 0.004,
        hue: isGold ? 40 : 0,
        sat: isGold ? '60%' : '0%',
        lit: isGold ? '70%' : '85%'
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.alpha += s.dAlpha;
      if (s.alpha <= 0.05 || s.alpha >= 0.55) s.dAlpha *= -1;
      s.alpha = Math.max(0.05, Math.min(0.55, s.alpha));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, ${s.sat}, ${s.lit}, ${s.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  createStars();
  drawStars();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      createStars();
    }, 300);
  });

  // ────────────────────────────────────────────
  // SHOOTING STAR ORBIT AROUND TITLE
  // Uses requestAnimationFrame for full browser support
  // ────────────────────────────────────────────
  function setupShootingStar() {
    const title = document.getElementById('heroTitle');
    const star = document.getElementById('shootingStar');
    const orbit = document.getElementById('starOrbit');
    if (!title || !star || !orbit) return;

    const SPEED = 0.0007;        // radians per ms (~9s full loop)
    let angle = 0;
    let lastTime = performance.now();
    let rx, ry, cx, cy;

    function measure() {
      const rect = title.getBoundingClientRect();
      const padX = 45;
      const padY = 30;
      const w = rect.width + padX * 2;
      const h = rect.height + padY * 2;
      rx = w / 2;
      ry = h / 2;
      cx = w / 2;
      cy = h / 2;

      orbit.style.width = w + 'px';
      orbit.style.height = h + 'px';
      orbit.style.left = -padX + 'px';
      orbit.style.top = -padY + 'px';
    }

    function tick(now) {
      const dt = now - lastTime;
      lastTime = now;
      angle += SPEED * dt;
      if (angle > Math.PI * 2) angle -= Math.PI * 2;

      // Position on the ellipse
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);

      // Direction of travel (tangent) — used to rotate the trail
      const dx = -rx * Math.sin(angle);
      const dy =  ry * Math.cos(angle);
      const rot = Math.atan2(dy, dx) * (180 / Math.PI);

      star.style.left = x + 'px';
      star.style.top  = y + 'px';
      star.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;

      requestAnimationFrame(tick);
    }

    measure();
    requestAnimationFrame(tick);
    window.addEventListener('resize', measure);
  }

  // Run after fonts load so title dimensions are stable
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setupShootingStar);
  } else {
    window.addEventListener('load', setupShootingStar);
  }

  // ────────────────────────────────────────────
  // NAVBAR SCROLL
  // ────────────────────────────────────────────
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ────────────────────────────────────────────
  // MOBILE NAV TOGGLE
  // ────────────────────────────────────────────
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ────────────────────────────────────────────
  // SCROLL REVEAL (general .reveal elements)
  // ────────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ────────────────────────────────────────────
  // CREW MEMBER REVEAL (reuse same pattern)
  // ────────────────────────────────────────────
  const crewObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        crewObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.crew-member').forEach(el => crewObserver.observe(el));

  // ────────────────────────────────────────────
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ────────────────────────────────────────────
  // STAGGERED REVEAL FOR REVIEW CARDS
  // ────────────────────────────────────────────
  const reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });

  // ────────────────────────────────────────────
  // STAGGERED REVEAL FOR MENU COURSE ITEMS
  // ────────────────────────────────────────────
  const courseItems = document.querySelectorAll('.course-item');
  const courseObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger each item inside the courses container
        const items = entry.target.querySelectorAll('.course-item');
        items.forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(15px)';
          item.style.transition = `opacity .5s ease ${i * 0.07}s, transform .5s ease ${i * 0.07}s`;
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          });
        });
        courseObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const coursesContainer = document.querySelector('.menu__courses');
  if (coursesContainer) courseObserver.observe(coursesContainer);

})();
