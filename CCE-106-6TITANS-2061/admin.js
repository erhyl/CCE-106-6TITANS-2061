// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard
    initializeAdminDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize charts
    initializeCharts();
    
    // Load dashboard data
    loadDashboardData();
});

// Initialize admin dashboard
function initializeAdminDashboard() {
    console.log('Admin dashboard initialized');
    
    // Set current user info (adminName now static or from Firebase)
    document.getElementById('userName').textContent = 'Admin';
    
    // Initialize tooltips and other UI elements
    initializeTooltips();
}

// Set up event listeners
function setupEventListeners() {
    // Admin menu toggle
const adminMenuBtn = document.getElementById('adminMenuBtn');
const adminDropdown = document.getElementById('adminDropdown');

if (adminMenuBtn && adminDropdown) {
    adminMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        adminDropdown.classList.toggle('active');
    });
}

document.addEventListener('click', function(e) {
    if (adminDropdown && !adminDropdown.contains(e.target) && e.target !== adminMenuBtn) {
        adminDropdown.classList.remove('active');
    }
});
    
    // Quick action buttons
    setupQuickActionButtons();
    
    // Modal controls
    setupModalControls();
    
    // Refresh data button
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboardData);
    }
    
    // Export data button
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDashboardData);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }

    // Profile button
    const profileBtn = document.getElementById('adminProfileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAdminProfileMenu();
        });
    }
}

// Show admin profile menu (simple modal or alert for now)
function showAdminProfileMenu() {
    // You can replace this with a modal for a better UI
    alert('Profile\n\n- Dashboard\n- Profile\n- Settings\n- Logout');
}

// Setup quick action buttons
function setupQuickActionButtons() {
    // Navigate to dedicated pages
    const usersBtn = document.getElementById('addUserBtn');
    if (usersBtn) {
        usersBtn.addEventListener('click', function() {
            window.location.href = 'admin-users.html';
        });
    }

    const coachesBtn = document.getElementById('addCoachBtn');
    if (coachesBtn) {
        coachesBtn.addEventListener('click', function() {
            window.location.href = 'admin-coaches.html';
        });
    }

    const classesBtn = document.getElementById('createClassBtn');
    if (classesBtn) {
        classesBtn.addEventListener('click', function() {
            window.location.href = 'admin-classes.html';
        });
    }

    // Other actions remain handled here
    const viewReportsBtn = document.getElementById('viewReportsBtn');
    if (viewReportsBtn) {
        viewReportsBtn.addEventListener('click', function(){ handleQuickAction('viewReports'); });
    }
    const manageContentBtn = document.getElementById('manageContentBtn');
    if (manageContentBtn) {
        manageContentBtn.addEventListener('click', function(){ handleQuickAction('manageContent'); });
    }
    const systemSettingsBtn = document.getElementById('systemSettingsBtn');
    if (systemSettingsBtn) {
        systemSettingsBtn.addEventListener('click', function(){ handleQuickAction('systemSettings'); });
    }
}

// Setup modal controls
function setupModalControls() {
    // Manage Users Modal
    const manageUsersModal = document.getElementById('manageUsersModal');
    const closeManageUsersModal = document.getElementById('closeManageUsersModal');
    if (closeManageUsersModal) closeManageUsersModal.addEventListener('click', () => closeModal('manageUsersModal'));

    // Manage Coaches Modal
    const manageCoachesModal = document.getElementById('manageCoachesModal');
    const closeManageCoachesModal = document.getElementById('closeManageCoachesModal');
    if (closeManageCoachesModal) closeManageCoachesModal.addEventListener('click', () => closeModal('manageCoachesModal'));
    // Add User Modal
    const addUserModal = document.getElementById('addUserModal');
    const closeAddUserModal = document.getElementById('closeAddUserModal');
    const cancelAddUser = document.getElementById('cancelAddUser');
    const addUserForm = document.getElementById('addUserForm');
    
    if (closeAddUserModal) {
        closeAddUserModal.addEventListener('click', () => closeModal('addUserModal'));
    }
    
    if (cancelAddUser) {
        cancelAddUser.addEventListener('click', () => closeModal('addUserModal'));
    }
    
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
    
    // Add Coach Modal
    const addCoachModal = document.getElementById('addCoachModal');
    const closeAddCoachModal = document.getElementById('closeAddCoachModal');
    const cancelAddCoach = document.getElementById('cancelAddCoach');
    const addCoachForm = document.getElementById('addCoachForm');
    
    if (closeAddCoachModal) {
        closeAddCoachModal.addEventListener('click', () => closeModal('addCoachModal'));
    }
    
    if (cancelAddCoach) {
        cancelAddCoach.addEventListener('click', () => closeModal('addCoachModal'));
    }
    
    if (addCoachForm) {
        addCoachForm.addEventListener('submit', handleAddCoach);
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('body-no-scroll');
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hide');
        document.body.classList.remove('body-no-scroll');
        
        setTimeout(() => {
            modal.classList.remove('show', 'hide');
        }, 300);
    }
}

// Handle quick actions
function handleQuickAction(action) {
    switch (action) {
        case 'createClass':
            showNotification('Create Class feature coming soon!', 'info');
            break;
        case 'viewReports':
            renderAnalyticsReport();
            break;
        case 'manageContent':
            showNotification('Content management feature coming soon!', 'info');
            break;
        case 'systemSettings':
            showNotification('System settings feature coming soon!', 'info');
            break;
        default:
            console.log('Unknown action:', action);
    }
}

// Render Users table with upgrade/downgrade
async function renderUsersTable() {
    const container = document.getElementById('usersTable');
    if (!container) return;
    container.innerHTML = '<p style="color:#ccc">Loading users...</p>';
    try {
        const { ref, get, child, update } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb; const auth = window.firebaseAuth;
        const snap = await get(child(ref(rtdb), 'users'));
        const users = snap.exists() ? snap.val() : {};
        const rows = Object.values(users).map((u) => {
            const plan = u.membership?.plan || 'none';
            const status = u.membership?.status || 'inactive';
            const email = u.email || '';
            const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || email || 'User';
            const uid = u.uid || '';
            return `
              <tr>
                <td>${name}</td>
                <td>${email}</td>
                <td>${status}</td>
                <td>${plan}</td>
                <td>
                  <button class="btn-sm" data-upgrade="${uid}" data-plan="basic">Basic</button>
                  <button class="btn-sm" data-upgrade="${uid}" data-plan="premium">Premium</button>
                  <button class="btn-sm" data-upgrade="${uid}" data-plan="elite">Elite</button>
                </td>
              </tr>`;
        }).join('');
        container.innerHTML = `
          <table class="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Plan</th><th>Actions</th></tr></thead>
            <tbody>${rows || ''}</tbody>
          </table>`;

        container.querySelectorAll('[data-upgrade]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const uid = btn.getAttribute('data-upgrade');
                const plan = btn.getAttribute('data-plan');
                try {
                    await update(ref(rtdb, 'users/' + uid + '/membership'), {
                        status: 'active', plan,
                        expiry: new Date(Date.now() + 30*24*60*60*1000).toISOString()
                    });
                    showNotification('Membership updated to ' + plan, 'success');
                    renderUsersTable();
                } catch (e) { showNotification('Update failed: ' + e.message, 'error'); }
            });
        });
    } catch (e) { container.innerHTML = '<p style="color:#ff6b6b">Failed to load users</p>'; }
}

// Render Coaches approval table
async function renderCoachesTable() {
    const container = document.getElementById('coachesTable');
    if (!container) return;
    container.innerHTML = '<p style="color:#ccc">Loading coaches...</p>';
    try {
        const { ref, get, child, update } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        const snap = await get(child(ref(rtdb), 'users'));
        const users = snap.exists() ? snap.val() : {};
        const coaches = Object.values(users).filter(u => u.accountType === 'coach' || u.role === 'coach');
        const rows = coaches.map((u) => {
            const email = u.email || '';
            const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || email || 'Coach';
            const uid = u.uid || '';
            const approved = u.coachApproved === true;
            return `
              <tr>
                <td>${name}</td>
                <td>${email}</td>
                <td>${approved ? 'Approved' : 'Pending'}</td>
                <td>
                  ${approved ? '' : `<button class="btn-sm" data-approve="${uid}">Approve</button>`}
                </td>
              </tr>`;
        }).join('');
        container.innerHTML = `
          <table class="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${rows || ''}</tbody>
          </table>`;

        container.querySelectorAll('[data-approve]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const uid = btn.getAttribute('data-approve');
                try {
                    await update(ref(rtdb, 'users/' + uid), { coachApproved: true });
                    showNotification('Coach approved', 'success');
                    renderCoachesTable();
                } catch (e) { showNotification('Approval failed: ' + e.message, 'error'); }
            });
        });
    } catch (e) { container.innerHTML = '<p style="color:#ff6b6b">Failed to load coaches</p>'; }
}

// Analytics: render a simple aggregate from RTDB (counts)
async function renderAnalyticsReport() {
    try {
        const { ref, get, child } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        const usersSnap = await get(child(ref(rtdb), 'users'));
        const bookingsSnap = await get(child(ref(rtdb), 'bookings'));
        const users = usersSnap.exists() ? usersSnap.val() : {};
        const bookings = bookingsSnap.exists() ? bookingsSnap.val() : {};
        const totalUsers = Object.keys(users).length;
        const coaches = Object.values(users).filter(u => (u.role === 'coach' || u.accountType === 'coach')).length;
        const activeMembers = Object.values(users).filter(u => u.membership && u.membership.status === 'active').length;
        const totalBookings = Object.keys(bookings).length;
        showNotification(`Users: ${totalUsers}, Coaches: ${coaches}, Active Members: ${activeMembers}, Bookings: ${totalBookings}`, 'info');
    } catch (e) {
        showNotification('Failed to load analytics', 'error');
    }
}

// When opening modals, render tables
const origOpenModal = openModal;
openModal = function(modalId){
    origOpenModal(modalId);
    if (modalId === 'manageUsersModal') renderUsersTable();
    if (modalId === 'manageCoachesModal') renderCoachesTable();
}

// Handle add user form submission
function handleAddUser(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        userType: formData.get('userType'),
        membershipPlan: formData.get('membershipPlan')
    };
    
    // Simulate API call
    showLoading('Adding user...');
    
    setTimeout(() => {
        hideLoading();
        showNotification('User added successfully!', 'success');
        closeModal('addUserModal');
        e.target.reset();
        refreshDashboardData();
    }, 2000);
}

// Handle add coach form submission
function handleAddCoach(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const coachData = {
        firstName: formData.get('coachFirstName'),
        lastName: formData.get('coachLastName'),
        email: formData.get('coachEmail'),
        specialization: formData.get('specialization'),
        experience: formData.get('experience'),
        certifications: formData.get('certifications')
    };
    
    // Simulate API call
    showLoading('Adding coach...');
    
    setTimeout(() => {
        hideLoading();
        showNotification('Coach added successfully!', 'success');
        closeModal('addCoachModal');
        e.target.reset();
        refreshDashboardData();
    }, 2000);
}

// Initialize charts
function initializeCharts() {
    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart');
    if (userGrowthCtx) {
        new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Users',
                    data: [120, 150, 180, 200, 250, 300],
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cccccc'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            }
        });
    }
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [35000, 42000, 38000, 45000, 50000, 55000],
                    backgroundColor: '#ff6b35',
                    borderColor: '#ff8c5a',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cccccc'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            }
        });
    }
    
    // Bookings Chart
    const bookingsCtx = document.getElementById('bookingsChart');
    if (bookingsCtx) {
        new Chart(bookingsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Cancelled', 'Pending'],
                datasets: [{
                    data: [75, 15, 10],
                    backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cccccc'
                        }
                    }
                }
            }
        });
    }
    
    // Activity Chart
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        new Chart(activityCtx, {
            type: 'radar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Users',
                    data: [65, 70, 80, 75, 85, 90, 60],
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.2)',
                    pointBackgroundColor: '#ffd700'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cccccc'
                        }
                    }
                },
                scales: {
                    r: {
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: '#333'
                        },
                        pointLabels: {
                            color: '#cccccc'
                        }
                    }
                }
            }
        });
    }
}

// Load dashboard data
function loadDashboardData() {
    // Simulate loading data
    showLoading('Loading dashboard data...');
    
    setTimeout(() => {
        hideLoading();
        updateDashboardStats();
        updateActivityFeed();
    }, 1500);
}

// Update dashboard stats
function updateDashboardStats() {
    // Simulate real-time data updates
    const stats = {
        totalUsers: Math.floor(Math.random() * 500) + 1000,
        totalCoaches: Math.floor(Math.random() * 10) + 20,
        monthlyRevenue: Math.floor(Math.random() * 10000) + 40000,
        activeSessions: Math.floor(Math.random() * 20) + 80
    };
    
    // Update stat cards
    Object.keys(stats).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            animateNumber(element, stats[key]);
        }
    });
}

// Update activity feed
function updateActivityFeed() {
    const activities = [
        {
            icon: '👤',
            title: 'New user registered',
            description: 'Sarah Johnson joined the platform',
            time: '2 minutes ago',
            status: 'new'
        },
        {
            icon: '🏋️‍♂️',
            title: 'Class completed',
            description: 'HIIT Training with 15 participants',
            time: '15 minutes ago',
            status: 'completed'
        },
        {
            icon: '💰',
            title: 'Payment received',
            description: 'Monthly subscription from John Doe',
            time: '1 hour ago',
            status: 'success'
        },
        {
            icon: '📝',
            title: 'Coach profile updated',
            description: 'Charles Cacam updated availability',
            time: '2 hours ago',
            status: 'updated'
        }
    ];
    
    // This would typically update the activity feed with real data
    console.log('Activity feed updated with:', activities);
}

// Refresh dashboard data
function refreshDashboardData() {
    showLoading('Refreshing data...');
    
    setTimeout(() => {
        hideLoading();
        updateDashboardStats();
        updateActivityFeed();
        showNotification('Dashboard data refreshed!', 'success');
    }, 1000);
}

// Export dashboard data
function exportDashboardData() {
    showLoading('Preparing export...');
    
    setTimeout(() => {
        hideLoading();
        showNotification('Data export completed!', 'success');
        
        // Simulate file download
        const data = {
            timestamp: new Date().toISOString(),
            stats: {
                totalUsers: document.getElementById('totalUsers').textContent,
                totalCoaches: document.getElementById('totalCoaches').textContent,
                monthlyRevenue: document.getElementById('monthlyRevenue').textContent,
                activeSessions: document.getElementById('activeSessions').textContent
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `6titans-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, 2000);
}

// Handle admin logout
function handleAdminLogout() {
    (async () => {
        if (!confirm('Are you sure you want to logout?')) return;
        try {
            const auth = window.firebaseAuth;
            if (auth) {
                const { signOut } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
                await signOut(auth);
            }
            showNotification('Logged out successfully!', 'success');
        } catch (e) {
            showNotification('Logout error: ' + (e && e.message ? e.message : 'Unknown'), 'error');
        } finally {
            setTimeout(() => { window.location.href = 'admin-login.html'; }, 600);
        }
    })();
}

// Utility functions
function showLoading(message = 'Loading...') {
    // Create loading overlay
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.id = 'loadingOverlay';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p style="color: #ffd700; margin-top: 1rem;">${message}</p>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.remove();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.backgroundColor = getNotificationColor(type);
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('slide-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    return colors[type] || '#2196f3';
}

function animateNumber(element, targetNumber) {
    const startNumber = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * progress);
        
        if (element.id === 'monthlyRevenue') {
            element.textContent = `$${currentNumber.toLocaleString()}`;
        } else if (element.id === 'activeSessions') {
            element.textContent = `${currentNumber}%`;
        } else {
            element.textContent = currentNumber.toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// ===============================
// Admin.js - Dashboard functionality
// ===============================

function initializeTooltips() {
    // Add tooltip functionality to action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover-scale');
            this.classList.remove('hover-normal');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.add('hover-normal');
            this.classList.remove('hover-scale');
        });
    });
}

// CSS animations are now handled in admin.css

// (Logout logic is already handled above. Removed duplicate function and event listener.)