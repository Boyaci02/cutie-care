/* ============================================================
   CUTIE CARE — JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. STICKY NAV ──────────────────────────────────────── */
  const nav = document.getElementById('main-nav');

  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 2. HAMBURGER MENY ──────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Stäng vid klick på länk
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Stäng vid klick utanför
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 3. SCROLL-ANIMATIONER (fade-in) ────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback för äldre webbläsare
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ── 4. PRISFLIKAR ──────────────────────────────────────── */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const pricingTables = document.querySelectorAll('.pricing__table');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Uppdatera knappar
        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Uppdatera tabeller
        pricingTables.forEach(table => {
          table.classList.remove('active');
        });
        const target = document.getElementById('tab-' + targetTab);
        if (target) target.classList.add('active');
      });
    });
  }

  /* ── 5. FAQ ACCORDION ───────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    if (!question) return;

    const toggle = () => {
      const isOpen = item.classList.contains('open');

      // Stäng alla andra
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const q = other.querySelector('.faq__question');
          if (q) q.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggla aktuell
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', !isOpen);
    };

    question.addEventListener('click', toggle);

    // Tangentbordsnavigation
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
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── 8. LIGHTBOX FÖR GALLERI (salongsidor) ─────────────── */
  const galleryItems = document.querySelectorAll('.salon-gallery__item[data-src]');

  if (galleryItems.length > 0) {
    // Skapa lightbox-element
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
      display:none;position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,0.9);align-items:center;justify-content:center;
      cursor:pointer;
    `;
    const lbImg = document.createElement('img');
    lbImg.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;';
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

    lightbox.addEventListener('click', () => {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  /* ── 9. AKTIV NAV-LÄNK ──────────────────────────────────── */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href.replace('./', ''))) {
      link.style.color = 'var(--red)';
    }
  });

});
