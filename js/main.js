/* ============================================================
   CUTIE CARE — JavaScript
   Sticky nav, hamburger, reveal/fade-in, tabs, FAQ, partner-acc,
   smooth scroll, lightbox, sticky-CTA, hero parallax-tilt.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. STICKY NAV ──────────────────────────────────────── */
  const nav = document.getElementById('main-nav');

  if (nav) {
    let lastY = window.scrollY;
    let ticking = false;
    const SCROLL_DELTA = 6;     // ignore tiny jitter
    const HIDE_AFTER = 140;     // only hide once we've scrolled past this
    const SHOW_NEAR_TOP = 60;   // always show at top
    const mobileMenu = document.getElementById('mobile-menu');

    const apply = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      // Background style (existing behavior)
      if (y > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');

      // Hide on scroll down, show on scroll up
      const menuOpen = mobileMenu && mobileMenu.classList.contains('open');
      if (y <= SHOW_NEAR_TOP || menuOpen) {
        nav.classList.remove('nav--hidden');
      } else if (Math.abs(delta) > SCROLL_DELTA) {
        if (delta > 0 && y > HIDE_AFTER) {
          nav.classList.add('nav--hidden');
        } else if (delta < 0) {
          nav.classList.remove('nav--hidden');
        }
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
  }

  /* ── 2. HAMBURGER MENY ──────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    const openMenu = () => {
      mobileMenu.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    hamburger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });
  }

  /* ── 3. REVEAL + FADE-IN (IntersectionObserver) ─────────── */
  const animatedEls = document.querySelectorAll('.reveal, .fade-in');

  if (animatedEls.length > 0 && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in', 'visible');

          // Stagger på children — sätt --i automatiskt om reveal--stagger
          if (entry.target.classList.contains('reveal--stagger')) {
            Array.from(entry.target.children).forEach((child, idx) => {
              if (!child.style.getPropertyValue('--i')) {
                child.style.setProperty('--i', idx);
              }
              child.classList.add('is-in', 'visible');
            });
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px',
    });

    animatedEls.forEach(el => observer.observe(el));
  } else {
    // Fallback / reduced-motion: visa direkt
    animatedEls.forEach(el => el.classList.add('is-in', 'visible'));
  }

  /* ── 4. PRISFLIKAR ──────────────────────────────────────── */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const pricingTables = document.querySelectorAll('.pricing__table');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        pricingTables.forEach(table => {
          table.classList.remove('active');
          table.setAttribute('hidden', '');
        });
        const target = document.getElementById('tab-' + targetTab);
        if (target) {
          target.classList.add('active');
          target.removeAttribute('hidden');
        }
      });
    });

    // Keyboard arrow navigation
    const tabsContainer = document.querySelector('.tabs');
    if (tabsContainer) {
      tabsContainer.addEventListener('keydown', (e) => {
        const buttons = Array.from(tabsContainer.querySelectorAll('.tab-btn'));
        const currentIdx = buttons.findIndex(b => b === document.activeElement);
        if (currentIdx === -1) return;

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          buttons[(currentIdx + 1) % buttons.length].focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          buttons[(currentIdx - 1 + buttons.length) % buttons.length].focus();
        }
      });
    }
  }

  /* ── 5. FAQ ACCORDION ───────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    if (!question) return;

    const toggle = () => {
      const isOpen = item.classList.contains('open');

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const q = other.querySelector('.faq__question');
          if (q) q.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    };

    question.addEventListener('click', toggle);

    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ── 6. PARTNER ACCORDION (friskvård-sida) ──────────────── */
  const partnerItems = document.querySelectorAll('.partner-acc__item');

  partnerItems.forEach(item => {
    const header = item.querySelector('.partner-acc__header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      partnerItems.forEach(other => other.classList.remove('open'));
      item.classList.toggle('open', !isOpen);
    });
  });

  /* ── 7. SMOOTH SCROLL FÖR ANKARLÄNKAR ──────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#main') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ── 8. LIGHTBOX FÖR GALLERI (salongsidor) ─────────────── */
  const galleryItems = document.querySelectorAll('.salon-gallery__item[data-src]');

  if (galleryItems.length > 0) {
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
      display:none;position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,0.92);align-items:center;justify-content:center;
      cursor:pointer;backdrop-filter:blur(8px);
    `;
    const lbImg = document.createElement('img');
    lbImg.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,0.5);';
    lightbox.appendChild(lbImg);
    document.body.appendChild(lightbox);

    galleryItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        lbImg.src = item.dataset.src;
        lbImg.alt = item.dataset.alt || '';
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLb = () => {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    };

    lightbox.addEventListener('click', closeLb);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLb();
    });
  }

  /* ── 9. AKTIV NAV-LÄNK ──────────────────────────────────── */
  const currentPath = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;
    const linkPath = href.replace('./', '').replace(/\/$/, '');
    if (currentPath.endsWith(linkPath) && linkPath !== '') {
      link.classList.add('is-active');
    }
  });

  /* ── 10. STICKY MOBILE CTA ───────────────────────────────── */
  const stickyCTA = document.getElementById('sticky-cta');

  if (stickyCTA) {
    let lastShown = false;
    const onScrollSticky = () => {
      const shouldShow = window.scrollY > 600 && window.innerWidth < 768;
      if (shouldShow !== lastShown) {
        stickyCTA.classList.toggle('visible', shouldShow);
        stickyCTA.setAttribute('aria-hidden', String(!shouldShow));
        lastShown = shouldShow;
      }
    };
    window.addEventListener('scroll', onScrollSticky, { passive: true });
    window.addEventListener('resize', onScrollSticky, { passive: true });
    onScrollSticky();
  }

  /* ── 11. COOKIE BANNER ───────────────────────────────────── */
  const cookieBanner = document.getElementById('cookie-banner');

  if (cookieBanner && !localStorage.getItem('cc_cookies')) {
    setTimeout(() => cookieBanner.classList.add('visible'), 1200);

    cookieBanner.querySelector('[data-cookie-accept]')?.addEventListener('click', () => {
      localStorage.setItem('cc_cookies', 'accepted');
      cookieBanner.classList.remove('visible');
      setTimeout(() => cookieBanner.remove(), 400);
    });

    cookieBanner.querySelector('[data-cookie-decline]')?.addEventListener('click', () => {
      localStorage.setItem('cc_cookies', 'declined');
      cookieBanner.classList.remove('visible');
      setTimeout(() => cookieBanner.remove(), 400);
    });
  } else if (cookieBanner) {
    cookieBanner.remove();
  }

  /* ── 12. HERO PARALLAX-TILT (mouse-move) ────────────────── */
  const heroMedia = document.querySelector('.hero__media');

  if (heroMedia && !prefersReducedMotion && window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) {
    const imgWrap = heroMedia.querySelector('.hero__media__img-wrap');
    if (imgWrap) {
      let rafId = null;
      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

      const onMove = (e) => {
        const rect = heroMedia.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        targetX = dx * 4;  // max 4deg
        targetY = -dy * 4;
        if (!rafId) rafId = requestAnimationFrame(animate);
      };

      const animate = () => {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        imgWrap.style.transform = `perspective(1200px) rotateY(${currentX}deg) rotateX(${currentY}deg)`;
        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
          rafId = requestAnimationFrame(animate);
        } else {
          rafId = null;
        }
      };

      const onLeave = () => {
        targetX = 0; targetY = 0;
        if (!rafId) rafId = requestAnimationFrame(animate);
      };

      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseleave', onLeave);
    }
  }

});
