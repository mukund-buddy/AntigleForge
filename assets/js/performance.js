/* ========================================
   AntigleForge - Performance Mode System
   Only accessible via ./mode URL
   ======================================== */

const PerformanceMode = (() => {
  const CONFIG = {
    FPS_THRESHOLD: 30,
    CHECK_INTERVAL: 2000,
    SAMPLE_SIZE: 60,
    STORAGE_KEY: 'antigleforge_perf_mode'
  };

  let isPerformanceMode = false;
  let fpsHistory = [];
  let lastTime = performance.now();
  let frameCount = 0;
  let checkInterval = null;
  let indicator = null;

  function init() {
    // Only activate if URL ends with /mode or contains ?mode
    const url = window.location.href;
    const isModePage = url.endsWith('/mode') || 
                       url.endsWith('/mode.html') || 
                       url.includes('?mode') || 
                       url.includes('&mode');
    
    if (!isModePage) {
      // Check saved preference for non-mode pages
      const savedMode = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (savedMode === 'true') {
        enablePerformanceMode(false);
      }
      return;
    }

    // Mode page - show indicator and start monitoring
    createIndicator();
    startMonitoring();
  }

  function createIndicator() {
    indicator = document.getElementById('perfIndicator');
    if (indicator) {
      indicator.classList.add('active');
    }
  }

  function startMonitoring() {
    function measureFrame() {
      frameCount++;
      const now = performance.now();
      const delta = now - lastTime;

      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        fpsHistory.push(fps);

        if (fpsHistory.length > CONFIG.SAMPLE_SIZE) {
          fpsHistory.shift();
        }

        frameCount = 0;
        lastTime = now;

        if (fpsHistory.length >= 5) {
          checkFPS();
        }
      }

      requestAnimationFrame(measureFrame);
    }

    requestAnimationFrame(measureFrame);
    checkInterval = setInterval(checkFPS, CONFIG.CHECK_INTERVAL);
  }

  function checkFPS() {
    if (fpsHistory.length < 5) return;

    const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;

    if (avgFPS < CONFIG.FPS_THRESHOLD && !isPerformanceMode) {
      enablePerformanceMode(true);
    } else if (avgFPS >= CONFIG.FPS_THRESHOLD + 10 && isPerformanceMode) {
      disablePerformanceMode(true);
    }
  }

  function enablePerformanceMode(save = true) {
    if (isPerformanceMode) return;

    isPerformanceMode = true;
    document.body.classList.add('performance-mode');

    if (indicator) {
      indicator.classList.add('active');
    }

    if (save) {
      localStorage.setItem(CONFIG.STORAGE_KEY, 'true');
    }

    window.dispatchEvent(new CustomEvent('performanceModeChange', {
      detail: { enabled: true }
    }));

  }

  function disablePerformanceMode(save = true) {
    if (!isPerformanceMode) return;

    isPerformanceMode = false;
    document.body.classList.remove('performance-mode');

    if (indicator) {
      indicator.classList.remove('active');
    }

    if (save) {
      localStorage.setItem(CONFIG.STORAGE_KEY, 'false');
    }

    window.dispatchEvent(new CustomEvent('performanceModeChange', {
      detail: { enabled: false }
    }));

  }

  function isPerformance() {
    return isPerformanceMode;
  }

  function getCurrentFPS() {
    if (fpsHistory.length === 0) return 0;
    return fpsHistory[fpsHistory.length - 1];
  }

  function getAverageFPS() {
    if (fpsHistory.length === 0) return 0;
    return Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);
  }

  function destroy() {
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  }

  return {
    init,
    enable: enablePerformanceMode,
    disable: disablePerformanceMode,
    isPerformance,
    getCurrentFPS,
    getAverageFPS,
    destroy,
    CONFIG
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PerformanceMode.init());
} else {
  PerformanceMode.init();
}