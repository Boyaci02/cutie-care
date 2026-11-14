// Påminnelse om friskvårdsbidraget (Denisa 14/11 2026: "From now to until end of December
// and it should lead to buy friskvård"). Litet kort nere i hörnet, inte helskärm.
// Visas till och med 31/12 2026 Stockholmstid, sedan aldrig mer. "Senare" eller Escape
// vilar den i 7 dagar, klick på "Köp friskvård" stänger den för gott. Samma fil ligger i
// cutiecare (hemsidan) och cutie-booking (appen); utseendet styrs av data-variant.
(function () {
  'use strict';
  // 1 januari 2027 00:00 Stockholm = 31 december 2026 23:00 UTC.
  var SLUT = Date.UTC(2026, 11, 31, 23, 0, 0);
  if (Date.now() >= SLUT) return;
  if (window.CC_KIOSK_TOKEN || /^\/(?:fran-salongen|self-check-in|staff-arrivals)/.test(location.pathname)) return; // salongsskärmen

  var script = document.currentScript;
  var ds = (script && script.dataset) || {};
  var VARIANT = ds.variant === 'app' ? 'app' : 'site';
  var HREF = ds.href || 'https://app.cutiecare.se/friskvard.html#friskvardskort';
  var NY_FLIK = ds.newTab === '1';
  window.ccFriskvardPaminnelseAktiv = true; // hemsidans gamla friskvårdsruta står över

  var KEY = 'cc_fv_paminnelse_2026';
  var VILA_MS = 7 * 24 * 60 * 60 * 1000;
  var minne = {
    get: function () { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } },
    set: function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  };
  var sparat = minne.get();
  if (sparat === 'kopt') return;
  if (sparat && Number(sparat) > Date.now()) return;

  // Appen: bara på startsidan och bokningens första steg, aldrig i friskvårdsflödet.
  function tillaten() {
    if (Date.now() >= SLUT) return false;
    if (VARIANT !== 'app') return true;
    if (/(?:^|[?&])wellness=/.test(location.search)) return false;
    var aktiv = document.querySelector('.step.active');
    if (aktiv && Number(aktiv.getAttribute('data-step')) > 1) return false;
    var oppen = document.querySelector('[role="dialog"][aria-modal="true"]:not([hidden])');
    if (oppen && oppen.offsetParent !== null) return false;
    return true;
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css =
    '.cc-fvp{--fvp-red:#C41E3A;--fvp-red-dark:#A31730;--fvp-ink:#292628;--fvp-muted:#5F5458;--fvp-line:#ECE5E3;' +
    'position:fixed;right:24px;bottom:24px;z-index:' + (VARIANT === 'app' ? 50 : 950) + ';width:min(344px,calc(100vw - 48px));' +
    'background:#fff;border:1px solid var(--fvp-line);border-radius:18px;box-shadow:0 18px 48px rgba(41,38,40,.18),0 2px 8px rgba(41,38,40,.06);' +
    'padding:20px 20px 16px;color:var(--fvp-ink);text-align:left;box-sizing:border-box;' +
    'opacity:0;transform:translateY(16px) scale(.98);transform-origin:bottom right;pointer-events:none;visibility:hidden;' +
    'transition:opacity .28s cubic-bezier(.25,1,.5,1),transform .42s cubic-bezier(.25,1,.5,1),visibility 0s linear .42s}' +
    '.cc-fvp *{box-sizing:border-box}' +
    '.cc-fvp.is-open{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .28s cubic-bezier(.25,1,.5,1),transform .42s cubic-bezier(.25,1,.5,1),visibility 0s}' +
    '.cc-fvp:focus{outline:none}.cc-fvp:focus-visible{outline:3px solid var(--fvp-red);outline-offset:3px}' +
    '.cc-fvp__eyebrow{margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--fvp-red)}' +
    '.cc-fvp__title{margin:0 0 8px;font-size:19px;line-height:1.25;font-weight:600;letter-spacing:-.01em;color:var(--fvp-ink)}' +
    '.cc-fvp__body{margin:0 0 16px;font-size:14px;line-height:1.5;color:var(--fvp-muted)}' +
    '.cc-fvp__actions{display:grid;grid-template-columns:1fr 1.35fr;gap:8px}' +
    '.cc-fvp__btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 14px;border-radius:12px;' +
    'font:inherit;font-size:14.5px;font-weight:600;line-height:1.1;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;' +
    'transition:background-color .18s ease,border-color .18s ease,transform .16s cubic-bezier(.25,1,.5,1)}' +
    '.cc-fvp__btn:active{transform:scale(.97)}' +
    '.cc-fvp__btn:focus-visible{outline:3px solid var(--fvp-red);outline-offset:2px}' +
    '.cc-fvp__btn--later{background:#fff;color:var(--fvp-ink);border:1px solid var(--fvp-line)}' +
    '.cc-fvp__btn--later:hover{border-color:#cfc3c0;background:#FCFAF9}' +
    '.cc-fvp__btn--buy{background:var(--fvp-red);color:#fff;border:1px solid var(--fvp-red)}' +
    '.cc-fvp__btn--buy:hover{background:var(--fvp-red-dark);border-color:var(--fvp-red-dark);color:#fff}' +
    '.cc-fvp--site{font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--fvp-ink:#3D2B1F;--fvp-muted:#5E5049;--fvp-line:#E8DED6}' +
    '.cc-fvp--site .cc-fvp__title{font-family:"Cormorant Garamond",Georgia,serif;font-size:25px;font-weight:600;line-height:1.12;letter-spacing:-.005em}' +
    '.cc-fvp--site .cc-fvp__btn{border-radius:999px}' +
    '.cc-fvp--app{font-family:"DM Sans",sans-serif}' +
    '.cc-fvp--app .cc-fvp__title{font-weight:500;letter-spacing:-.4px}' +
    '@media (max-width:600px){.cc-fvp{left:12px;right:12px;width:auto;bottom:12px;padding:18px 16px 14px;transform-origin:bottom center}' +
    '.cc-fvp__title{font-size:18px}.cc-fvp--site .cc-fvp__title{font-size:23px}}' +
    '@media (prefers-reduced-motion:reduce){.cc-fvp,.cc-fvp.is-open{transform:none;transition:opacity .01s linear,visibility 0s}.cc-fvp__btn{transition:none}.cc-fvp__btn:active{transform:none}}';

  var el, prevFocus = null, vakt = null, open = false;

  function bygg() {
    var style = document.createElement('style');
    style.id = 'cc-fvp-style';
    style.textContent = css;
    document.head.appendChild(style);

    el = document.createElement('div');
    el.className = 'cc-fvp cc-fvp--' + VARIANT;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-labelledby', 'cc-fvp-title');
    el.setAttribute('aria-describedby', 'cc-fvp-body');
    el.setAttribute('aria-hidden', 'true');
    el.tabIndex = -1;
    el.innerHTML =
      '<p class="cc-fvp__eyebrow">Påminnelse</p>' +
      '<h2 class="cc-fvp__title" id="cc-fvp-title">Ditt friskvårdsbidrag för 2026 går ut vid årsskiftet</h2>' +
      '<p class="cc-fvp__body" id="cc-fvp-body">Köp friskvård nu och boka massage eller fotvård när du vill.</p>' +
      '<div class="cc-fvp__actions">' +
      '<button type="button" class="cc-fvp__btn cc-fvp__btn--later" data-fvp-later>Senare</button>' +
      '<a class="cc-fvp__btn cc-fvp__btn--buy" data-fvp-buy href="' + HREF + '"' +
      (NY_FLIK ? ' target="_blank" rel="noopener"' : '') + '>Köp friskvård</a>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('[data-fvp-later]').addEventListener('click', function () { stang(true); });
    el.querySelector('[data-fvp-buy]').addEventListener('click', function () {
      minne.set('kopt');
      stang(false, true);
    });
  }

  // Lägg kortet ovanför fasta bottenelement (bokningsknapp, mobilmeny, sticky CTA).
  function placera() {
    if (!el) return;
    var mobil = window.innerWidth <= 600;
    var bas = mobil ? 12 : 24;
    var lagst = window.innerHeight;
    var sel = VARIANT === 'app' ? '.cc-tabs, #ctaBar, .cta-bar' : '.sticky-cta';
    var noder = document.querySelectorAll(sel);
    for (var i = 0; i < noder.length; i++) {
      var n = noder[i];
      var cs = getComputedStyle(n);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
      var r = n.getBoundingClientRect();
      if (r.height === 0 || r.top >= window.innerHeight) continue;
      // Bara element som ligger under kortets horisontella yta räknas.
      var kort = el.getBoundingClientRect();
      if (!mobil && (r.right < kort.left || r.left > kort.right)) continue;
      if (r.top < lagst) lagst = r.top;
    }
    var bottom = Math.max(bas, Math.round(window.innerHeight - lagst + (lagst < window.innerHeight ? 12 : 0)));
    el.style.bottom = bottom + 'px';
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') { stang(true); }
  }

  function visa() {
    if (open || !tillaten()) return;
    if (!el) bygg();
    open = true;
    placera();
    el.setAttribute('aria-hidden', 'false');
    // Två bildrutor så övergången faktiskt spelas.
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('is-open'); }); });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', placera);
    vakt = setInterval(function () {
      if (!tillaten()) { stang(false); return; }
      placera();
    }, 400);
    // Fokus flyttas bara om besökaren inte redan står i ett fält eller en knapp.
    var a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement) {
      prevFocus = a;
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    }
  }

  function stang(vila, behallFokus) {
    if (!open) return;
    open = false;
    if (vila) minne.set(String(Date.now() + VILA_MS));
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', placera);
    clearInterval(vakt);
    if (!behallFokus && el.contains(document.activeElement)) {
      if (prevFocus && prevFocus !== document.body && prevFocus.focus) prevFocus.focus();
      else document.activeElement.blur();
    }
    prevFocus = null;
  }

  // Start: efter 5 s, eller vid första scrollen efter 1,5 s. Väntar ut cookierutan.
  var start = Date.now();
  var forsok = function () {
    var cookie = document.getElementById('cookie-banner');
    if (cookie && cookie.classList.contains('visible')) { setTimeout(forsok, 1000); return; }
    visa();
  };
  var timer = setTimeout(forsok, 5000);
  function onScroll() {
    if (Date.now() - start < 1500 || window.scrollY < 200) return;
    window.removeEventListener('scroll', onScroll);
    clearTimeout(timer);
    forsok();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
