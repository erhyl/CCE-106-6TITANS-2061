// Utils: modal focus trap and toast notifications

(function() {
  function trapFocus(modal) {
    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    modal.addEventListener('keydown', handleTab);
    first.focus();
  }

  function showToast(message, type) {
    const containerId = 'toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.right = '16px';
      container.style.bottom = '16px';
      container.style.zIndex = '2000';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#0a0a0a';
    toast.style.backgroundColor = type === 'error' ? '#ff6b6b' : type === 'success' ? '#4CAF50' : '#ffd700';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 300ms ease';
      setTimeout(() => toast.remove(), 350);
    }, 2500);
  }

  async function logEvent(action, details, page) {
    try {
      if (!window.firebaseAuth || !window.firebaseRtdb || !window.firebaseRT) return;
      const user = window.firebaseAuth.currentUser;
      if (!user) return;
      const { ref, set, push } = window.firebaseRT;
      const rtdb = window.firebaseRtdb;
      const key = push(ref(rtdb, 'events/' + user.uid)).key;
      await set(ref(rtdb, `events/${user.uid}/${key}`), {
        action,
        details,
        page,
        createdAt: Date.now()
      });
    } catch (e) {
      // swallow errors
    }
  }

  // Loading overlay utilities
  function showLoading() {
    const existing = document.getElementById("loadingOverlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    overlay.id = "loadingOverlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    document.body.appendChild(overlay);
  }

  function hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.remove();
  }

  window.Utils = { trapFocus, showToast, logEvent, showLoading, hideLoading };
  window.showLoading = showLoading;
  window.hideLoading = hideLoading;
})();

// Add loading spinner styles
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
  .loading-spinner {
    border: 6px solid #f3f3f3;
    border-top: 6px solid #ffd700;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(loadingStyles);
