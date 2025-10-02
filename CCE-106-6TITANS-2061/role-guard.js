// Role-Based Access Control Guard
// Prevents users from accessing pages meant for different account types

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { auth, db, rtdb } from "./firebase-init.js";

// Define page access rules
const PAGE_RULES = {
  // Admin-only pages
  admin: ['admin.html', 'admin-users.html', 'admin-coaches.html', 'admin-bookings.html', 'admin-classes.html', 'admin-memberships.html'],
  
  // Coach-only pages
  coach: ['coach-dashboard.html', 'coach-schedule.html', 'coach-clients.html'],
  
  // Member-only pages
  member: ['user-dashboard.html', 'my-bookings.html', 'my-profile.html'],
  
  // Public pages (accessible to all logged-in users)
  public: ['index.html', 'membership.html', 'classes.html', 'workouts.html', 'coaching.html', 'online-gym.html', 'articles.html'],
  
  // Guest pages (no auth required)
  guest: ['login.html', 'register.html', 'coach-login.html', 'coach-register.html']
};

// Get current page filename
function getCurrentPage() {
  const path = window.location.pathname;
  return path.split('/').pop() || 'index.html';
}

// Get user's account type from Firestore or RTDB
async function getUserAccountType(uid) {
  try {
    // Try Firestore first
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.accountType || 'member';
    }
    
    // Fallback to RTDB
    const snap = await get(child(ref(rtdb), 'users/' + uid));
    if (snap.exists()) {
      const userData = snap.val();
      return userData.accountType || 'member';
    }
    
    return 'member'; // Default to member
  } catch (error) {
    console.error('Error fetching user account type:', error);
    return 'member';
  }
}

// Check if user has access to current page
function hasAccess(accountType, currentPage) {
  // Guest pages are always accessible
  if (PAGE_RULES.guest.includes(currentPage)) {
    return true;
  }
  
  // Public pages accessible to all logged-in users
  if (PAGE_RULES.public.includes(currentPage)) {
    return true;
  }
  
  // Admin pages only for admins
  if (PAGE_RULES.admin.includes(currentPage)) {
    return accountType === 'admin';
  }
  
  // Coach pages only for coaches
  if (PAGE_RULES.coach.includes(currentPage)) {
    return accountType === 'coach';
  }
  
  // Member pages only for members
  if (PAGE_RULES.member.includes(currentPage)) {
    return accountType === 'member';
  }
  
  // Unknown page, allow by default
  return true;
}

// Get redirect page based on account type
function getRedirectPage(accountType) {
  switch (accountType) {
    case 'admin':
      return 'admin.html';
    case 'coach':
      return 'coach-dashboard.html';
    case 'member':
      return 'user-dashboard.html';
    default:
      return 'index.html';
  }
}

// Initialize role guard
export function initRoleGuard(options = {}) {
  const {
    requireAuth = true,
    allowedRoles = null,
    redirectOnFail = true
  } = options;
  
  const currentPage = getCurrentPage();
  
  // If this is a guest page, no need to check auth
  if (PAGE_RULES.guest.includes(currentPage) && !requireAuth) {
    return;
  }
  
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Not logged in
      if (requireAuth && !PAGE_RULES.guest.includes(currentPage)) {
        console.warn('Access denied: Authentication required');
        if (redirectOnFail) {
          window.location.href = 'login.html';
        }
      }
      return;
    }
    
    // Get user's account type
    const accountType = await getUserAccountType(user.uid);
    
    // Check if specific roles are required
    if (allowedRoles) {
      if (!allowedRoles.includes(accountType)) {
        console.warn(`Access denied: Required role ${allowedRoles.join(' or ')}, but user is ${accountType}`);
        if (redirectOnFail) {
          const redirectPage = getRedirectPage(accountType);
          window.location.href = redirectPage;
        }
        return;
      }
    }
    
    // Check general access rules
    if (!hasAccess(accountType, currentPage)) {
      console.warn(`Access denied: ${accountType} cannot access ${currentPage}`);
      if (redirectOnFail) {
        const redirectPage = getRedirectPage(accountType);
        window.location.href = redirectPage;
      }
    }
  });
}

// Quick guard functions for specific roles
export function requireAdmin() {
  initRoleGuard({ allowedRoles: ['admin'] });
}

export function requireCoach() {
  initRoleGuard({ allowedRoles: ['coach'] });
}

export function requireMember() {
  initRoleGuard({ allowedRoles: ['member'] });
}

export function requireMemberOrCoach() {
  initRoleGuard({ allowedRoles: ['member', 'coach'] });
}

// Check if user has specific role (for conditional UI)
export async function hasRole(role) {
  const user = auth.currentUser;
  if (!user) return false;
  
  const accountType = await getUserAccountType(user.uid);
  return accountType === role;
}

// Export for debugging
export { getCurrentPage, getUserAccountType, hasAccess, getRedirectPage };

