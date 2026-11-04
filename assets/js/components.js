/* ============================================================
   AntigleForge - Shared Components (Single Source of Truth)
   Header + Footer + FAQ (injected across all pages from here)

   Header, footer aur FAQ sirf isi file me edit karo.
   Har page (index.html sahit) yahin se inject karta hai.

   Depends on: nothing. Safe to load on every page.
   ============================================================ */

const AntigleComponents = (() => {
  let headerReady = false;
  let footerReady = false;
  let headerBound = false;
  let storedFaqs = null;

  /* ----------------------------------------------------------
     Paths / page detection
     ---------------------------------------------------------- */

  function getBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/tools/')) return '../';
    return './';
  }

  function getPage() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const file = path.split('/').pop() || 'index.html';

    if (file === 'tools.html' || file === 'tools') return 'tools';
    if (path.includes('/tools/')) return 'tool-detail';
    if (file === 'mode.html' || file === 'mode') return 'mode';
    if (file.indexOf('about') === 0) return 'about';
    if (file.indexOf('privacy') === 0) return 'privacy';
    if (file.indexOf('terms') === 0) return 'terms';
    return 'home';
  }

  function navActive(page, target) {
    if (target === 'tools' && (page === 'tools' || page === 'tool-detail')) return ' active';
    return page === target ? ' active' : '';
  }

  /* ----------------------------------------------------------
     Icons (inline so there is no extra request)
     ---------------------------------------------------------- */

  const ICONS = {
    youtube:
      '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.4-4.8z"/>' +
      '<path fill="#0d0807" d="M10 15.2V8.8L15.5 12 10 15.2z"/>' +
      '</svg>',
    instagram:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>' +
      '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>' +
      '<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>' +
      '</svg>',
    github:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
      '<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>' +
      '</svg>',
    arrow:
      '<svg class="faq-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">' +
      '<polyline points="6 9 12 15 18 9"/></svg>'
  };

  /* ----------------------------------------------------------
     Header
     ---------------------------------------------------------- */

  function getHeader() {
    const page = getPage();
    const base = getBasePath();

    return `
  <header class="site-header">
    <nav class="navbar" aria-label="Main navigation">
      <div class="navbar-container">
        <a href="${base}index.html" class="navbar-brand" aria-label="AntigleForge home">
          <img src="${base}assets/images/logo-mark.svg" alt="" class="brand-logo" width="36" height="36" decoding="async">
          <span class="brand-text">Antigle<span class="brand-accent">Forge</span></span>
        </a>

        <ul class="navbar-nav" id="navbar-nav">
          <li><a href="${base}index.html" class="nav-link${navActive(page, 'home')}">Home</a></li>
          <li><a href="${base}tools.html" class="nav-link${navActive(page, 'tools')}">Tools</a></li>
        </ul>

        <div class="navbar-actions">
          <a href="https://youtube.com/@notgamingplayz" target="_blank" rel="noopener noreferrer"
             class="btn-social" aria-label="Visit Not Gaming Playz on YouTube" title="Visit Not Gaming Playz on YouTube">
            ${ICONS.youtube}
          </a>

          <button type="button" class="hamburger" id="hamburger" aria-label="Toggle navigation menu"
                  aria-expanded="false" aria-controls="navbar-nav">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>
      </div>
    </nav>
  </header>`;
  }

  /* ----------------------------------------------------------
     Footer (includes mode.html + @antigle_official Instagram)
     ---------------------------------------------------------- */

  const FOOTER_HTML = `
  <footer class="footer site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col footer-col-brand">
          <a href="__BASE__index.html" class="footer-brand" aria-label="AntigleForge home">
            <img src="__BASE__assets/images/logo-mark.svg" alt="" class="brand-logo brand-logo-sm" width="32" height="32" decoding="async">
            <span class="brand-text brand-text-sm">Antigle<span class="brand-accent">Forge</span></span>
          </a>
          <p class="footer-desc">Free, private Minecraft tools. Everything runs in your browser — no uploads, no accounts, no tracking.</p>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">Explore</h3>
          <ul class="footer-list">
            <li><a href="__BASE__index.html" class="footer-link">Home</a></li>
            <li><a href="__BASE__tools.html" class="footer-link">All Tools</a></li>
            <li><a href="__BASE__mode.html" class="footer-link">Choose Mode</a></li>
            <li><a href="__BASE__about.html" class="footer-link">About</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">Legal</h3>
          <ul class="footer-list">
            <li><a href="__BASE__privacy.html" class="footer-link">Privacy Policy</a></li>
            <li><a href="__BASE__terms.html" class="footer-link">Terms of Use</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h3 class="footer-heading">Connect</h3>
          <ul class="footer-list footer-list-social">
            <li>
              <a href="https://youtube.com/@notgamingplayz" target="_blank" rel="noopener noreferrer"
                 class="footer-social-link" aria-label="Visit Not Gaming Playz on YouTube" title="YouTube channel">
                ${ICONS.youtube}<span>YouTube</span>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/antigle_official/" target="_blank" rel="noopener noreferrer"
                 class="footer-social-link" aria-label="Visit antigle_official on Instagram" title="Instagram @antigle_official">
                ${ICONS.instagram}<span>Instagram</span>
              </a>
            </li>
            <li>
              <a href="https://github.com/mukund-buddy" target="_blank" rel="noopener noreferrer"
                 class="footer-social-link" aria-label="Visit Mukund on GitHub" title="GitHub profile">
                ${ICONS.github}<span>GitHub</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>
          <span>&copy; <span id="footerYear">2026</span> AntigleForge</span>
          <span class="footer-dot" aria-hidden="true">·</span>
          <span>All rights reserved.</span>
          <span class="footer-dot" aria-hidden="true">·</span>
          <span>Created by Mukund</span>
        </p>
      </div>
    </div>
  </footer>`;

  /* ----------------------------------------------------------
     FAQ (accessible, deterministic accordion)
     ---------------------------------------------------------- */

  function renderAnswer(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;(\/?)(strong|b|em|i|code|br)&gt;/g, '<$1$2>');
  }

  function toggleFAQItem(button) {
    const item = button.closest('.faq-item');
    if (!item) return;

    const isOpen = item.classList.contains('open');
    const parent = item.parentElement;

    if (parent) {
      parent.querySelectorAll('.faq-item').forEach((other) => {
        other.classList.remove('open');
        const btn = other.querySelector('.faq-question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    } else {
      item.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }
  }

  function bindFAQButtons(root) {
    const scope = root || document;
    scope.querySelectorAll('.faq-question').forEach((button) => {
      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFAQItem(button);
      };
    });
  }

  function injectFAQ(items) {
    if (items && items.length) {
      storedFaqs = items;
    }
    const faqsToRender = items && items.length ? items : storedFaqs;
    if (!faqsToRender || !faqsToRender.length) {
      bindFAQButtons(document);
      return;
    }

    const main = document.querySelector('main');
    if (!main) return;

    // Remove any pre-existing FAQ block so components.js always owns a clean instance
    const existingBlock = document.querySelector('.faq-block') || document.querySelector('.faq-section');
    if (existingBlock) {
      const parentSec = existingBlock.closest('section.faq-block') || existingBlock;
      parentSec.remove();
    }

    const isHome = getPage() === 'home';

    const section = document.createElement('section');
    section.className = 'section faq-block';
    section.id = 'faq';

    const container = document.createElement('div');
    container.className = 'container';

    const faqSection = document.createElement('div');
    faqSection.className = 'faq-section';

    const heading = document.createElement('h2');
    heading.className = 'faq-title';
    heading.textContent = 'Frequently Asked Questions';

    const sub = document.createElement('p');
    sub.className = 'faq-subtitle';
    sub.textContent = isHome
      ? 'Quick answers about AntigleForge. Every tool runs locally in your browser.'
      : 'Quick answers about this tool. Everything runs locally in your browser.';

    faqSection.appendChild(heading);
    faqSection.appendChild(sub);

    faqsToRender.forEach((faq, i) => {
      const item = document.createElement('div');
      item.className = 'faq-item';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'faq-question';
      button.id = 'faq-q-' + (i + 1);
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'faq-a-' + (i + 1));

      const label = document.createElement('span');
      label.className = 'faq-question-text';
      label.textContent = faq.q;
      button.appendChild(label);
      button.insertAdjacentHTML('beforeend', ICONS.arrow);

      const answer = document.createElement('div');
      answer.className = 'faq-answer';
      answer.id = 'faq-a-' + (i + 1);
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', button.id);

      const para = document.createElement('p');
      para.innerHTML = renderAnswer(faq.a);
      answer.appendChild(para);

      item.appendChild(button);
      item.appendChild(answer);
      faqSection.appendChild(item);
    });

    container.appendChild(faqSection);
    section.appendChild(container);
    main.appendChild(section);

    bindFAQButtons(faqSection);
  }

  /* ----------------------------------------------------------
     Wiring
     ---------------------------------------------------------- */

  function injectHeader() {
    if (headerReady || !document.body) return;
    headerReady = true;

    const existingHeader = document.querySelector('header.site-header');
    if (existingHeader) existingHeader.remove();
    const existingNav = document.querySelector('nav.navbar');
    if (existingNav) existingNav.remove();

    document.body.insertAdjacentHTML('afterbegin', getHeader());
  }

  function injectFooter() {
    if (footerReady || !document.body) return;
    footerReady = true;

    const existing = document.querySelector('footer.footer');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', FOOTER_HTML.replace(/__BASE__/g, getBasePath()));

    const year = document.getElementById('footerYear');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function closeMenu(hamburger, nav) {
    if (!hamburger || !nav) return;
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function setupHeader() {
    if (headerBound) return;
    headerBound = true;

    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('navbar-nav');

    if (hamburger && nav) {
      hamburger.addEventListener('click', () => {
        const open = !nav.classList.contains('active');
        nav.classList.toggle('active', open);
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      nav.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => closeMenu(hamburger, nav));
      });
    }

    document.addEventListener('click', (e) => {
      if (hamburger && nav && !hamburger.contains(e.target) && !nav.contains(e.target)) {
        closeMenu(hamburger, nav);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu(hamburger, nav);
      }
    });

    const navbar = document.querySelector('nav.navbar');
    if (navbar) {
      const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  function setupFAQ() {
    bindFAQButtons(document);
  }

  function init(faqs) {
    if (getPage() === 'mode') return;
    injectHeader();
    injectFooter();
    setupHeader();
    injectFAQ(faqs);
    setupFAQ();
  }

  function boot() {
    if (getPage() === 'mode') return;
    injectHeader();
    injectFooter();
    setupHeader();
    setupFAQ();
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }

  return { init, getFAQ: injectFAQ, getBasePath };
})();
