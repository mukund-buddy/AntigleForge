/* ========================================
   AntigleForge - Main JavaScript
   Core Functionality + Animations
   ======================================== */

const AntigleForge = (() => {
  // State
  let isInitialized = false;

  function init() {
    if (isInitialized) return;
    isInitialized = true;

    /* Navigation (hamburger, language switcher) lives in components.js now.
       Binding it here as well toggled the menu twice, so it never opened. */
    setupFAQs();
    setupLazyLoading();
    setupScrollReveal();
    setupCardEffects();
  }

  /* Navigation is owned by components.js (header is injected there).
     Do not bind hamburger handlers here or clicks fire twice. */

  /* FAQ accordion handling lives entirely in components.js (delegated
     document-level listener). Binding here too broke the accordion:
     direct handler added .open, then the delegated handler saw it open
     and removed it again, so FAQs never expanded. */
  function setupFAQs() {}

  function setupLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tool = entry.target;
          const toolName = tool.dataset.tool;
          tool.classList.add('loaded');
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });

    document.querySelectorAll('[data-tool]').forEach(tool => {
      observer.observe(tool);
    });
  }

  /**
   * Setup scroll reveal animations
   */
  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  /**
   * Setup card mouse tracking effects
   */
  function setupCardEffects() {
    const cards = document.querySelectorAll('.tool-card, .feature-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
      return true;
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('Copied to clipboard!');
        return true;
      } catch (err) {
        showToast('Failed to copy', true);
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  function showToast(message, isError = false) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: ${isError ? '#ef4444' : '#22c55e'};
      color: white;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      z-index: 1000;
      animation: toastIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function generateUUID() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    if (window.crypto && crypto.getRandomValues) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  return {
    init,
    copyToClipboard,
    showToast,
    generateUUID,
    debounce,
    throttle
  };
})();

// Add CSS for toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  @keyframes toastOut {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
  }
`;
document.head.appendChild(toastStyles);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AntigleForge.init());
} else {
  AntigleForge.init();
}