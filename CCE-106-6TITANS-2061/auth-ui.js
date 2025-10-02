// Shared Authentication UI Components
// Handles user profile dropdown, modals, and auth state display

import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { ref, get, set, child, onValue, update } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { auth, rtdb } from "./firebase-init.js";

// Show logged-in user UI with profile dropdown
export function showUserUI(userData) {
  const authButtons = document.getElementById("authButtons");
  if (!authButtons) return;

  // Determine dashboard link based on account type
  const accountType = userData?.accountType || 'member';
  let dashboardLink = 'user-dashboard.html';
  let dashboardIcon = 'fa-tachometer-alt';
  let dashboardLabel = 'Dashboard';
  
  if (accountType === 'admin') {
    dashboardLink = 'admin.html';
    dashboardIcon = 'fa-crown';
    dashboardLabel = 'Admin Panel';
  } else if (accountType === 'coach') {
    dashboardLink = 'coach-dashboard.html';
    dashboardIcon = 'fa-chalkboard-teacher';
    dashboardLabel = 'Coach Dashboard';
  }
  
  // Show account type badge
  const roleBadge = accountType === 'admin' 
    ? '<span style="background:#ffd700;color:#000;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-left:6px;">ADMIN</span>'
    : accountType === 'coach'
    ? '<span style="background:#4CAF50;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-left:6px;">COACH</span>'
    : '';

  authButtons.style.visibility = "visible";
  authButtons.innerHTML = `
    <div class="profile-dropdown" id="profileDropdown">
      <button class="profile-btn" id="profileBtn">
        <span class="profile-avatar">${accountType === 'admin' ? '👑' : accountType === 'coach' ? '🎯' : '👤'}</span>
        <span id="navUserName">${userData?.firstName || "User"}${roleBadge}</span>
        <i class="fa fa-caret-down"></i>
      </button>
      <div class="profile-menu" id="profileMenu">
        <div class="profile-menu-header">
          <span id="profileMenuName">${userData?.firstName || "User"} ${userData?.lastName || ""}</span><br>
          <small id="profileMenuEmail">${userData?.email || userData?.uid || ""}</small>
        </div>
        <ul class="profile-menu-list">
          ${accountType !== 'admin' ? `<li>
            <a href="#" id="openNotif">
              <i class="fas fa-bell"></i> Notifications
              <span class="notif-badge" id="notifBadgeDd" style="display:none;background:#ff6b6b;color:#fff;border-radius:999px;padding:2px 8px;font-size:10px;margin-left:8px;">0</span>
            </a>
          </li>` : ''}
          <li><a href="${dashboardLink}"><i class="fas ${dashboardIcon}"></i> ${dashboardLabel}</a></li>
          <li><a href="#" id="profileViewBtn"><i class="fas fa-user"></i> View Profile</a></li>
          <li><button id="logoutBtnNav"><i class="fas fa-sign-out-alt"></i> Logout</button></li>
        </ul>
      </div>
    </div>
  `;

  setupDropdown();
  
  // Only setup notifications for non-admin users
  if (accountType !== 'admin') {
    setupNotifications(userData);
  }
  
  setupLogout();
  setupProfileModal(userData);
}

// Show guest UI (Login/Sign Up buttons)
export function showGuestUI() {
  const authButtons = document.getElementById("authButtons");
  if (!authButtons) return;

  authButtons.style.visibility = "visible";
  authButtons.innerHTML = `
    <a href="login.html" id="loginBtnNav">Login</a>
    <a href="register.html" id="signupBtnNav">Sign Up</a>
  `;
}

// Setup dropdown toggle functionality
function setupDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  const btn = document.getElementById("profileBtn");
  
  if (btn && dropdown) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });
    
    // Use a flag to prevent immediate closure
    let justOpenedNotifPanel = false;
    
    document.addEventListener("click", (e) => {
      // Don't close dropdown if clicking notification panel or notification link
      if (!dropdown.contains(e.target) && 
          !e.target.closest('#dropdownNotifPanel') && 
          !e.target.closest('#openNotif')) {
        dropdown.classList.remove("open");
        // Also close notification panel when dropdown closes
        if (!justOpenedNotifPanel) {
          const notifPanel = document.getElementById('dropdownNotifPanel');
          if (notifPanel) {
            notifPanel.style.display = 'none';
          }
        }
      }
      // Reset flag after a short delay
      setTimeout(() => { justOpenedNotifPanel = false; }, 300);
    });
    
    // Set flag when notification link is clicked
    const openNotif = document.getElementById('openNotif');
    if (openNotif) {
      openNotif.addEventListener('click', () => {
        justOpenedNotifPanel = true;
      }, true);
    }
  }
}

// Setup notification panel with Firebase RTDB integration
function setupNotifications(userData) {
  console.log('setupNotifications called with userData:', userData);
  console.log('rtdb available:', !!rtdb);
  
  if (!userData || !userData.uid) {
    console.error('Cannot setup notifications: missing userData or UID', userData);
    return;
  }
  
  // Create notification panel
  let notifPanel = document.getElementById('dropdownNotifPanel');
  if (!notifPanel) {
    notifPanel = document.createElement('div');
    notifPanel.id = 'dropdownNotifPanel';
    notifPanel.style.cssText = `
      position: fixed;
      right: 20px;
      top: 80px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 10px;
      min-width: 320px;
      max-width: 400px;
      max-height: 60vh;
      overflow: auto;
      display: none;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;
    notifPanel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:4px 0;">
        <strong style="color:#ffd700;font-size:14px;">Notifications</strong>
        <button id="markAllRead" style="background:#2a2a2a;border:1px solid #333;color:#fff;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;">Mark all read</button>
      </div>
      <div id="notifList" style="display:flex;flex-direction:column;gap:6px;min-height:100px;"></div>
    `;
    document.body.appendChild(notifPanel);
  }

  const openNotif = document.getElementById('openNotif');
  const badgeDd = document.getElementById('notifBadgeDd');
  
  console.log('Notification elements check:', {
    openNotif: !!openNotif,
    badgeDd: !!badgeDd,
    rtdb: !!rtdb,
    uid: userData.uid
  });
  
  if (openNotif && rtdb && userData.uid) {
    let notifCache = {};
    
    console.log('Setting up onValue listener for:', 'notifications/' + userData.uid);
    
    // Listen for real-time notification updates
    try {
      onValue(ref(rtdb, 'notifications/' + userData.uid), (snap) => {
        console.log('Notification snapshot received:', snap.val());
        notifCache = snap.val() || {};
        const unread = Object.values(notifCache).filter(n => n && n.read === false).length;
        
        // Update badge
        if (badgeDd) {
          badgeDd.style.display = unread > 0 ? 'inline-block' : 'none';
          badgeDd.textContent = String(unread);
        }
        
        // Update notification list
        const list = document.getElementById('notifList');
        if (list) {
          const entries = Object.entries(notifCache).slice(-10).reverse();
          list.innerHTML = entries.map(([id, n]) => `
            <div style="padding:8px;border:1px solid #333;border-radius:6px;color:#ddd;background:${n.read ? '#161616' : '#202020'};">
              <div style="color:#ffd700;font-weight:600;">${n.type || 'notice'}</div>
              <div>${n.message || ''}</div>
              <small style="color:#888;">${new Date(n.createdAt || Date.now()).toLocaleString()}</small>
            </div>
          `).join('') || '<div style="color:#888;padding:8px;text-align:center;">No notifications</div>';
        }
      }, (error) => {
        console.error('Error setting up notification listener:', error);
      });
    } catch (err) {
      console.error('Error in onValue setup:', err);
    }
    
    // Toggle notification panel
    let clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isHidden = notifPanel.style.display === 'none' || notifPanel.style.display === '';
      
      if (isHidden) {
        notifPanel.style.display = 'block';
        // Force reflow to ensure display is applied
        notifPanel.offsetHeight;
      } else {
        notifPanel.style.display = 'none';
      }
    };
    
    openNotif.removeEventListener('click', clickHandler);
    openNotif.addEventListener('click', clickHandler, true);
    
    // Close panel when clicking outside (but not the dropdown or the notification link)
    const outsideClickHandler = (e) => {
      // Small delay to ensure the open click has completed
      setTimeout(() => {
        if (notifPanel.style.display === 'block' && 
            !e.target.closest('#openNotif') && 
            !e.target.closest('#dropdownNotifPanel') &&
            !e.target.closest('.profile-menu-list')) {
          notifPanel.style.display = 'none';
        }
      }, 50);
    };
    
    // Delay adding the handler to prevent immediate closure
    setTimeout(() => {
      document.addEventListener('click', outsideClickHandler);
    }, 500);
    
    // Mark all as read
    const markAll = document.getElementById('markAllRead');
    if (markAll) {
      markAll.addEventListener('click', async () => {
        try {
          const updates = {};
          Object.entries(notifCache).forEach(([id, n]) => {
            if (n && n.read === false) {
              updates['notifications/' + userData.uid + '/' + id + '/read'] = true;
            }
          });
          if (Object.keys(updates).length > 0) {
            await update(ref(rtdb), updates);
          }
        } catch (err) {
          console.error('Error marking notifications as read:', err);
        }
      });
    }
  }
}

// Setup logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtnNav");
  
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = "index.html";
      } catch (error) {
        alert("Logout failed: " + error.message);
      }
    });
  }
}

// Setup profile modal
function setupProfileModal(userData) {
  const profileViewBtn = document.getElementById("profileViewBtn");
  
  if (profileViewBtn) {
    profileViewBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showProfileModal(userData);
    });
  }
}

// Show profile modal
function showProfileModal(userData) {
  // Remove existing modal if present
  const oldModal = document.getElementById("profileModal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "profileModal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
  `;

  modal.innerHTML = `
    <div style="background:#181818;padding:2.5rem 2rem 2rem 2rem;border-radius:18px;min-width:320px;max-width:95vw;box-shadow:0 8px 32px #0008;position:relative;">
      <button id="closeProfileModal" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;color:#ffd700;cursor:pointer;">&times;</button>
      <div style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1.5rem;">
        <span style="font-size:2.5rem;">👤</span>
        <div>
          <div style="font-size:1.3rem;font-weight:700;color:#ffd700;">${userData?.firstName || ""} ${userData?.lastName || ""}</div>
          <div style="font-size:1rem;color:#fff;">${userData?.email || ""}</div>
        </div>
      </div>
      <div style="margin-bottom:1.2rem;">
        <strong>Account Type:</strong> <span style="color:#ffd700;">${userData?.accountType || "Member"}</span>
      </div>
      <div style="margin-bottom:1.2rem;">
        <strong>UID:</strong> <span style="color:#fff;">${userData?.uid || ""}</span>
      </div>
      <div style="margin-bottom:1.2rem;">
        <strong>Joined:</strong> <span style="color:#fff;">${
          userData?.createdAt
            ? new Date(userData.createdAt.seconds * 1000 || userData.createdAt).toLocaleDateString()
            : "N/A"
        }</span>
      </div>
      <button style="margin-top:1.5rem;padding:0.7rem 1.5rem;background:#ffd700;color:#111;font-weight:700;border:none;border-radius:8px;cursor:pointer;">Edit Profile (Coming Soon)</button>
    </div>
  `;

  document.body.appendChild(modal);
  
  document.getElementById("closeProfileModal").onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

// Initialize auth state and sync with RTDB
export async function initAuthState(onUserCallback = null) {
  const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js");
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Fetch user data from RTDB
        const snap = await get(child(ref(rtdb), "users/" + user.uid));
        let userData = snap.exists() ? snap.val() : null;

        // Create minimal user data if missing
        if (!userData) {
          const minimal = {
            uid: user.uid,
            email: user.email || "",
            firstName: user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "User",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          };
          await set(ref(rtdb, "users/" + user.uid), minimal);
          userData = minimal;
        }

        // Merge auth data with RTDB data
        const merged = {
          ...userData,
          uid: user.uid,
          email: userData.email || user.email || "",
          firstName: userData.firstName || user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "User",
          lastName: userData.lastName || user.displayName?.split(" ").slice(1).join(" ") || "",
        };

        // Update RTDB if fields were missing
        if (!userData.email || !userData.firstName || (!userData.lastName && merged.lastName)) {
          try {
            await set(ref(rtdb, "users/" + user.uid), {
              ...userData,
              email: merged.email,
              firstName: merged.firstName,
              lastName: merged.lastName,
              uid: user.uid,
            });
          } catch {}
        }

        showUserUI(merged);
        
        // Call custom callback if provided
        if (onUserCallback) {
          onUserCallback(merged, user);
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
        showUserUI({ firstName: "User", email: user.email || "" });
      }
    } else {
      showGuestUI();
    }
  });
}

