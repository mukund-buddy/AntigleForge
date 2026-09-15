/* ========================================
   AntigleForge - Shared Components
   Footer + FAQ (edit here for all pages)
   ======================================== */

const AntigleComponents = (() => {

  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/tools/')) return '../';
    return './';
  }

  const FOOTER_HTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="__BASE__assets/images/logo.png" alt="AntigleForge" class="brand-logo brand-logo-sm">
          <span class="brand-text brand-text-sm">Antigle<span class="brand-accent">Forge</span></span>
        </div>
        <nav class="footer-nav">
          <a href="__BASE__index.html" class="footer-link">Home</a>
          <a href="__BASE__tools.html" class="footer-link">Tools</a>
        </nav>
        <div class="footer-social">
          <a href="https://youtube.com/@notgamingplayz" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="YouTube">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.122-2.136c.502-1.884.502-5.814.502-5.814s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://instagram.com/antigle_official" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.8C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://github.com/mukund-buddy" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>Created by Mukund | &copy; 2026 AntigleForge. All rights reserved.</p>
      </div>
    </div>
  </footer>`;

  function getFAQ(items) {
    const base = getBasePath();
    const arrow = `<svg class="faq-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
    let html = `
    <section class="section">
      <div class="container">
        <div class="faq-section">
          <h2 class="faq-title">Frequently Asked Questions</h2>`;
    items.forEach(faq => {
      html += `
          <div class="faq-item">
            <div class="faq-question">${faq.q}${arrow}</div>
            <div class="faq-answer">${faq.a}</div>
          </div>`;
    });
    html += `
        </div>
      </div>
    </section>`;
    return html;
  }

  function injectFooter() {
    const existing = document.querySelector('.footer');
    if (existing) return;
    const base = getBasePath();
    const html = FOOTER_HTML.replace(/__BASE__/g, base);
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function injectFAQ(items) {
    const existing = document.querySelector('.faq-section');
    if (existing) return;
    const main = document.querySelector('main');
    if (!main) return;
    main.insertAdjacentHTML('beforeend', getFAQ(items));
  }

  function setupFAQ() {
    document.addEventListener('click', function(e) {
      const question = e.target.closest('.faq-question');
      if (!question) return;
      const item = question.parentElement;
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  }

  function init(faqs) {
    injectFooter();
    if (faqs && faqs.length) injectFAQ(faqs);
    setupFAQ();
  }

  return { init, getFAQ, getBasePath };
})();
