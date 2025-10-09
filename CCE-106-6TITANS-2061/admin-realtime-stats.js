// Real-time Admin Statistics Module
// Fetches actual data from Firebase and calculates metrics

import { 
  ref, 
  onValue, 
  get, 
  child, 
  set, 
  update 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Pricing configuration
const MEMBERSHIP_PRICES = {
  basic: 29,
  premium: 59,
  elite: 99,
  student: 19,
  family: 149,
  corporate: 199 // Average for corporate
};

class RealtimeAdminStats {
  constructor(auth, rtdb, db) {
    this.auth = auth;
    this.rtdb = rtdb;
    this.db = db;
    this.listeners = [];
    this.currentStats = {
      totalUsers: 0,
      activeCoaches: 0,
      monthlyRevenue: 0,
      activeSessions: 0
    };
    this.previousStats = {
      totalUsers: 0,
      activeCoaches: 0,
      monthlyRevenue: 0,
      activeSessions: 0
    };
  }

  // Initialize all real-time listeners
  async initialize() {
    console.log('📊 Initializing real-time admin statistics...');
    
    // Load historical data first
    await this.loadHistoricalStats();
    
    // Set default labels after DOM is ready so elements exist
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setDefaultChangeLabels());
    } else {
      this.setDefaultChangeLabels();
    }
    
    // Set up real-time listeners
    this.setupUserCountListener();
    this.setupCoachCountListener();
    this.setupRevenueListener();
    this.setupSessionsListener();
    
    // Save snapshot every hour
    this.startSnapshotScheduler();
  }

  // Ensure labels have default text on initial paint
  setDefaultChangeLabels() {
    try {
      const statCards = document.querySelectorAll('.stat-card');
      if (statCards[0]) {
        const el = statCards[0].querySelector('.stat-change');
        if (el) el.textContent = '+0 users this month';
      }
      if (statCards[1]) {
        const el = statCards[1].querySelector('.stat-change');
        if (el) el.textContent = '+0 this month';
      }
      if (statCards[2]) {
        const el = statCards[2].querySelector('.stat-change');
        if (el) el.textContent = '+$0 this month';
      }
      if (statCards[3]) {
        const el = statCards[3].querySelector('.stat-change');
        if (el) el.textContent = '+0% this week';
      }
    } catch (e) {}
  }

  // Load historical stats for comparison
  async loadHistoricalStats() {
    try {
      const snapshot = await get(child(ref(this.rtdb), 'admin/stats/previous'));
      if (snapshot.exists()) {
        this.previousStats = snapshot.val();
        console.log('📈 Loaded historical stats:', this.previousStats);
      } else {
        // First time - current becomes previous
        await this.saveHistoricalSnapshot();
      }
    } catch (error) {
      console.error('Error loading historical stats:', error);
    }
  }

  // Save current stats as historical snapshot
  async saveHistoricalSnapshot() {
    try {
      const now = new Date();
      const snapshotData = {
        ...this.currentStats,
        timestamp: now.toISOString(),
        month: now.getMonth(),
        year: now.getFullYear()
      };

      await set(ref(this.rtdb, 'admin/stats/previous'), snapshotData);
      await set(ref(this.rtdb, `admin/stats/history/${now.getTime()}`), snapshotData);
      
      console.log('💾 Saved historical snapshot');
    } catch (error) {
      console.error('Error saving snapshot:', error);
    }
  }

  // Schedule periodic snapshots
  startSnapshotScheduler() {
    // Save snapshot every hour
    setInterval(() => {
      this.saveHistoricalSnapshot();
    }, 60 * 60 * 1000); // 1 hour

    // Also save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveHistoricalSnapshot();
    });
  }

  // Real-time user count
  setupUserCountListener() {
    const usersRef = ref(this.rtdb, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      const count = Object.keys(users).length;
      
      this.currentStats.totalUsers = count;
      this.updateUI('totalUsers', count);
      
      // Calculate new users for current month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      const newUsersThisMonth = Object.values(users).filter(u => {
        const created = u && u.createdAt ? new Date(u.createdAt).getTime() : 0;
        return created >= startOfMonth;
      }).length;
      this.updateChangeIndicator('totalUsers', newUsersThisMonth, 'this month');
      
      console.log(`👥 Total Users: ${count} (+${newUsersThisMonth} this month)`);
    });
    
    this.listeners.push(unsubscribe);
  }

  // Real-time coach count
  setupCoachCountListener() {
    const usersRef = ref(this.rtdb, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      
      // Count approved coaches only
      const coachCount = Object.values(users).filter(user => 
        (user.accountType === 'coach' || user.role === 'coach') && 
        user.coachApproved === true
      ).length;
      
      this.currentStats.activeCoaches = coachCount;
      this.updateUI('totalCoaches', coachCount);
      
      // New coaches approved this month (use approvedAt if present, else createdAt)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      const newCoachesThisMonth = Object.values(users).filter(user => {
        if (!user) return false;
        const isCoach = (user.accountType === 'coach' || user.role === 'coach') && user.coachApproved === true;
        const approvedAt = user.approvedAt || user.coachApprovedAt || user.updatedAt || user.createdAt;
        const ts = approvedAt ? new Date(approvedAt).getTime() : 0;
        return isCoach && ts >= startOfMonth;
      }).length;
      this.updateChangeIndicator('totalCoaches', newCoachesThisMonth, 'this month');
      
      console.log(`🏋️‍♂️ Active Coaches: ${coachCount} (+${newCoachesThisMonth} this month)`);
    });
    
    this.listeners.push(unsubscribe);
  }

  // Real-time revenue calculation
  setupRevenueListener() {
    const usersRef = ref(this.rtdb, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      
      // Calculate revenue from active memberships
      let totalRevenue = 0;
      let revenueThisMonth = 0;
      const now = Date.now();
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      
      Object.values(users).forEach(user => {
        if (user.membership && user.membership.status === 'active') {
          const expiryDate = new Date(user.membership.expiry).getTime();
          
          // Only count if membership hasn't expired
          if (expiryDate > now) {
            const plan = user.membership.plan || 'basic';
            const price = MEMBERSHIP_PRICES[plan] || MEMBERSHIP_PRICES.basic;
            totalRevenue += price;
            const startDate = user.membership.startDate ? new Date(user.membership.startDate).getTime() : 0;
            if (startDate >= startOfMonth) {
              revenueThisMonth += price;
            }
          }
        }
      });
      
      this.currentStats.monthlyRevenue = totalRevenue;
      this.updateUI('monthlyRevenue', `$${totalRevenue.toLocaleString()}`);
      
      // Revenue added this month
      this.updateChangeIndicator('monthlyRevenue', revenueThisMonth, 'this month');
      
      console.log(`💰 Monthly Revenue: $${totalRevenue} (+$${revenueThisMonth} this month)`);
    });
    
    this.listeners.push(unsubscribe);
  }

  // Real-time sessions tracking
  setupSessionsListener() {
    const bookingsRef = ref(this.rtdb, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const bookings = snapshot.val() || {};
      
      // Calculate active sessions percentage
      const now = Date.now();
      const last7Days = now - (7 * 24 * 60 * 60 * 1000);
      
      let totalBookings = 0;
      let completedBookings = 0;
      
      Object.values(bookings).forEach(booking => {
        const bookingTime = booking.createdAt || booking.timestamp || 0;
        
        // Only count bookings from last 7 days
        if (bookingTime > last7Days) {
          totalBookings++;
          if (booking.status === 'completed' || booking.attended === true) {
            completedBookings++;
          }
        }
      });
      
      const percentage = totalBookings > 0 
        ? Math.round((completedBookings / totalBookings) * 100) 
        : 0;
      
      this.currentStats.activeSessions = percentage;
      this.updateUI('activeSessions', `${percentage}%`);
      
      // Calculate percentage point change
      const change = percentage - (this.previousStats.activeSessions || 0);
      this.updateChangeIndicator('activeSessions', change, 'this week');
      
      console.log(`📊 Active Sessions: ${percentage}% (${change >= 0 ? '+' : ''}${change}pp)`);
    });
    
    this.listeners.push(unsubscribe);
  }

  // Update UI elements
  updateUI(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      // Set value directly (no animation)
      if (typeof value === 'number') {
        element.textContent = value.toLocaleString();
      } else {
        element.textContent = value;
      }
    }
  }

  // Animate value changes
  animateValue(element, start, end) {
    // Extract numbers for animation
    const startNum = parseFloat(String(start).replace(/[^0-9.-]/g, '')) || 0;
    const endNum = parseFloat(String(end).replace(/[^0-9.-]/g, '')) || 0;
    
    if (startNum === endNum) {
      element.textContent = end;
      return;
    }
    
    const duration = 1000; // 1 second
    const startTime = performance.now();
    const prefix = String(end).match(/^\$/)?.[0] || '';
    const suffix = String(end).match(/%$/)?.[0] || '';
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startNum + (endNum - startNum) * easeOutQuart;
      
      const formatted = Math.round(current).toLocaleString();
      element.textContent = `${prefix}${formatted}${suffix}`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = end; // Ensure final value is exact
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Update change indicator
  updateChangeIndicator(statType, change, period) {
    // Map to card elements
    const cardMapping = {
      totalUsers: 0,
      totalCoaches: 1,
      monthlyRevenue: 2,
      activeSessions: 3
    };
    
    const cardIndex = cardMapping[statType];
    const statCards = document.querySelectorAll('.stat-card');
    
    if (statCards[cardIndex]) {
      const changeElement = statCards[cardIndex].querySelector('.stat-change');
      if (changeElement) {
        const sign = change >= 0 ? '+' : '';
        const absVal = Math.abs(change);
        let text = '';
        if (statType === 'monthlyRevenue') {
          text = `${sign}$${absVal.toLocaleString()} ${period}`;
        } else if (statType === 'totalUsers') {
          text = `${sign}${absVal} users ${period}`;
        } else if (statType === 'totalCoaches') {
          text = `${sign}${absVal} ${period}`;
        } else if (statType === 'activeSessions') {
          text = `${sign}${absVal}% ${period}`;
        }
        changeElement.textContent = text.trim();
        
        // Update styling based on positive/negative
        changeElement.className = 'stat-change';
        if (change > 0) {
          changeElement.classList.add('positive');
        } else if (change < 0) {
          changeElement.classList.add('negative');
        } else {
          changeElement.classList.add('neutral');
        }
      }
    }
  }

  // Calculate percentage change
  calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Calculate absolute change
  calculateAbsoluteChange(current, previous) {
    return current - previous;
  }

  // Clean up listeners
  destroy() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners = [];
    console.log('🧹 Cleaned up real-time listeners');
  }
}

// Export for use in admin.html
export { RealtimeAdminStats };
