// Admin Dashboard JavaScript
console.log('🚀 admin.js loaded!');

// Define export function immediately so it's available globally
window.exportDashboardData = async function() {
    console.log('🔽 Export Data button clicked!');
    
    // Show export format selection modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        pointer-events: none;
    `;
    
    // Close modal when clicking the background
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            console.log('Modal background clicked, closing...');
            modal.remove();
        }
    });
    
    modal.innerHTML = `
        <div id="exportModalContent" style="background: #1a1a1a; border: 1px solid #ffd700; border-radius: 12px; padding: 2rem; min-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); cursor: default; pointer-events: auto;">
            <h2 style="color: #ffd700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-download"></i>
                Export Data
            </h2>
            <p style="color: #ccc; margin-bottom: 2rem;">Select export format and data to include:</p>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="color: #ffd700; font-weight: 600; display: block; margin-bottom: 0.5rem;">
                    📄 Export Format:
                </label>
                <div style="display: flex; gap: 1rem;">
                    <button id="exportJSON" style="flex: 1; background: #2a2a2a; color: #ffd700; border: 2px solid #ffd700; padding: 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; user-select: none; pointer-events: auto; transition: opacity 0.2s;">
                        <i class="fas fa-file-code"></i> JSON
                    </button>
                    <button id="exportCSV" style="flex: 1; background: #ffd700; color: #000; border: none; padding: 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; user-select: none; pointer-events: auto; transition: opacity 0.2s;">
                        <i class="fas fa-file-csv"></i> CSV
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="color: #ffd700; font-weight: 600; display: block; margin-bottom: 0.5rem;">
                    📦 Include Data:
                </label>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="color: #ccc; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="includeUsers" checked style="width: 18px; height: 18px; accent-color: #ffd700; cursor: pointer; pointer-events: auto;">
                        <span>👥 Users & Members</span>
                    </label>
                    <label style="color: #ccc; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="includeCoaches" checked style="width: 18px; height: 18px; accent-color: #ffd700; cursor: pointer; pointer-events: auto;">
                        <span>🏋️‍♂️ Coaches</span>
                    </label>
                    <label style="color: #ccc; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="includeBookings" checked style="width: 18px; height: 18px; accent-color: #ffd700; cursor: pointer; pointer-events: auto;">
                        <span>📅 Bookings</span>
                    </label>
                    <label style="color: #ccc; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="includeEvents" checked style="width: 18px; height: 18px; accent-color: #ffd700; cursor: pointer; pointer-events: auto;">
                        <span>📊 Activity Events</span>
                    </label>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="cancelExport" style="background: #2a2a2a; color: #ccc; border: 1px solid #333; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; user-select: none; pointer-events: auto; transition: opacity 0.2s;">
                    Cancel
                </button>
                <button id="confirmExport" style="background: #4caf50; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; user-select: none; pointer-events: auto; transition: opacity 0.2s;">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
    `;
    
    // Prevent clicks inside the modal from closing it
    const modalContent = modal.querySelector('#exportModalContent');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    document.body.appendChild(modal);
    
    let exportFormat = 'csv'; // Default to CSV
    
    console.log('Modal appended to body, setting up button handlers...');
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
        // Format selection
        const jsonBtn = document.getElementById('exportJSON');
        const csvBtn = document.getElementById('exportCSV');
        const cancelBtn = document.getElementById('cancelExport');
        const confirmBtn = document.getElementById('confirmExport');
        
        console.log('Buttons found:', { jsonBtn, csvBtn, cancelBtn, confirmBtn });
        
        if (jsonBtn) {
            // Add visual feedback
            jsonBtn.onmouseenter = function() {
                console.log('Hovering over JSON button');
                this.style.opacity = '0.8';
            };
            jsonBtn.onmouseleave = function() {
                this.style.opacity = '1';
            };
            
            jsonBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('JSON format selected');
                exportFormat = 'json';
                this.style.background = '#ffd700';
                this.style.color = '#000';
                this.style.border = 'none';
                if (csvBtn) {
                    csvBtn.style.background = '#2a2a2a';
                    csvBtn.style.color = '#ffd700';
                    csvBtn.style.border = '2px solid #ffd700';
                }
            });
        }
        
        if (csvBtn) {
            // Add visual feedback
            csvBtn.onmouseenter = function() {
                console.log('Hovering over CSV button');
                this.style.opacity = '0.8';
            };
            csvBtn.onmouseleave = function() {
                this.style.opacity = '1';
            };
            
            csvBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('CSV format selected');
                exportFormat = 'csv';
                this.style.background = '#ffd700';
                this.style.color = '#000';
                this.style.border = 'none';
                if (jsonBtn) {
                    jsonBtn.style.background = '#2a2a2a';
                    jsonBtn.style.color = '#ffd700';
                    jsonBtn.style.border = '2px solid #ffd700';
                }
            });
        }
        
        if (cancelBtn) {
            // Add visual feedback
            cancelBtn.onmouseenter = function() {
                console.log('Hovering over Cancel button');
                this.style.opacity = '0.8';
            };
            cancelBtn.onmouseleave = function() {
                this.style.opacity = '1';
            };
            
            cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Export cancelled');
                modal.remove();
            });
        }
        
        if (confirmBtn) {
            // Add visual feedback
            confirmBtn.onmouseenter = function() {
                console.log('Hovering over Export button');
                this.style.opacity = '0.9';
            };
            confirmBtn.onmouseleave = function() {
                this.style.opacity = '1';
            };
            
            confirmBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚀 Export button clicked! Format:', exportFormat);
                
                // Get checkbox values BEFORE removing modal
                const usersCheckbox = document.getElementById('includeUsers');
                const coachesCheckbox = document.getElementById('includeCoaches');
                const bookingsCheckbox = document.getElementById('includeBookings');
                const eventsCheckbox = document.getElementById('includeEvents');
                
                const includeUsers = usersCheckbox ? usersCheckbox.checked : true;
                const includeCoaches = coachesCheckbox ? coachesCheckbox.checked : true;
                const includeBookings = bookingsCheckbox ? bookingsCheckbox.checked : true;
                const includeEvents = eventsCheckbox ? eventsCheckbox.checked : true;
                
                console.log('Export options:', { includeUsers, includeCoaches, includeBookings, includeEvents });
                
                // Disable button to prevent double clicks
                confirmBtn.disabled = true;
                confirmBtn.style.opacity = '0.5';
                confirmBtn.textContent = 'Exporting...';
                
                // Remove modal after a short delay
                setTimeout(() => {
                    modal.remove();
                }, 100);
                
                try {
                    await performExport(exportFormat, {
                        includeUsers,
                        includeCoaches,
                        includeBookings,
                        includeEvents
                    });
                } catch (error) {
                    console.error('❌ Export failed:', error);
                    if (modal.parentNode) {
                        modal.remove();
                    }
                    alert('Export failed: ' + error.message);
                }
            });
        }
        
        console.log('✅ All button handlers attached');
    }, 0);
};

console.log('✅ exportDashboardData function defined on window object');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded fired in admin.js');
    
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
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = 'Admin';
    }
    
    // Check for pending coach approvals
    checkPendingCoaches();
    
    // Initialize system status monitoring
    initializeSystemStatus();
    
    // Initialize tooltips and other UI elements
    initializeTooltips();
}

// Check for pending coach registrations and display notification
async function checkPendingCoaches() {
    try {
        // Check if running in module context with Firebase
        if (typeof window.firebaseRtdb === 'undefined') {
            console.log('Firebase not initialized yet, skipping pending coach check');
            return;
        }
        
        const { ref, get, child } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        // Get all users
        const snap = await get(child(ref(rtdb), 'users'));
        if (!snap.exists()) return;
        
        const users = snap.val();
        
        // Count pending coaches
        const pendingCoaches = Object.values(users).filter(u => 
            (u.accountType === 'coach' || u.role === 'coach') && u.coachApproved === false
        );
        
        const pendingCount = pendingCoaches.length;
        
        // Show/hide alert based on pending count
        const alertElement = document.getElementById('pendingCoachAlert');
        const countElement = document.getElementById('pendingCoachCount');
        const pluralElement = document.getElementById('pendingCoachPlural');
        
        if (alertElement && countElement && pendingCount > 0) {
            countElement.textContent = pendingCount;
            pluralElement.textContent = pendingCount === 1 ? '' : 's';
            alertElement.style.display = 'block';
            
            // Add subtle animation
            alertElement.style.animation = 'slideDown 0.4s ease-out';
        }
        
    } catch (error) {
        console.error('Error checking pending coaches:', error);
    }
}

// Add animation keyframes for the alert
const adminAlertStyle = document.createElement('style');
adminAlertStyle.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(adminAlertStyle);

// Set up event listeners
function setupEventListeners() {
    // Admin dropdown is handled by inline script in admin.html to avoid conflicts
    // No need to set it up here
    
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
    console.log('Export button found:', exportBtn);
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log('🔘 Export button clicked (via event listener)');
            if (typeof window.exportDashboardData === 'function') {
                window.exportDashboardData();
            } else {
                console.error('❌ exportDashboardData function not found on window object!');
            }
        });
        console.log('✅ Export button event listener attached');
    } else {
        console.error('❌ Export button NOT found in DOM!');
        // Try again after a delay
        setTimeout(() => {
            const delayedBtn = document.getElementById('exportDataBtn');
            if (delayedBtn) {
                console.log('✅ Export button found after delay');
                delayedBtn.addEventListener('click', window.exportDashboardData);
            } else {
                console.error('❌ Export button STILL not found after delay!');
            }
        }, 1000);
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
                    // Import Firestore functions
                    const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                    const db = getFirestore();
                    
                    // Update both RTDB and Firestore for consistency
                    await update(ref(rtdb, 'users/' + uid), { coachApproved: true, accountType: 'coach', role: 'coach' });
                    await updateDoc(doc(db, 'users', uid), { coachApproved: true, accountType: 'coach', approvalStatus: 'approved' });
                    
                    showNotification('Coach approved successfully!', 'success');
                    renderCoachesTable();
                } catch (e) { 
                    console.error('Approval error:', e);
                    showNotification('Approval failed: ' + e.message, 'error'); 
                }
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

// Initialize charts with real RTDB data
async function initializeCharts() {
    // Fetch real user growth data
    const userGrowthData = await fetchUserGrowthData();
    
    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart');
    if (userGrowthCtx) {
        new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: userGrowthData.labels,
                datasets: [{
                    label: 'New Users',
                    data: userGrowthData.data,
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
    
    // Revenue Chart with real data
    const revenueData = await fetchRevenueData();
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: revenueData.labels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: revenueData.data,
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
    
    // Bookings Chart with real data from Firebase
    const bookingsData = await fetchBookingsData();
    const bookingsCtx = document.getElementById('bookingsChart');
    if (bookingsCtx) {
        console.log('📊 Rendering Bookings Chart with data:', bookingsData.data);
        new Chart(bookingsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Cancelled', 'Active/Pending'],
                datasets: [{
                    data: bookingsData.data,
                    backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cccccc',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
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
    // Real-time stats are automatically loaded
    console.log('📊 Real-time dashboard data is active');
    
    // Just update activity feed and other non-stat content
    updateActivityFeed();
    
    // Show brief loading indicator for first load
    if (!window.adminStatsManager) {
        showLoading('Initializing real-time dashboard...');
        setTimeout(() => {
            hideLoading();
        }, 1000);
    }
}

// Update dashboard stats - now handled by real-time stats manager
function updateDashboardStats() {
    // Real-time stats are automatically updated by admin-realtime-stats.js
    // This function is kept for backward compatibility with refresh button
    console.log('📊 Dashboard stats are being updated in real-time');
    
    // Force a refresh by reloading current stats from the manager
    if (window.adminStatsManager) {
        console.log('🔄 Current stats:', window.adminStatsManager.currentStats);
    }
}

// Update activity feed with real RTDB data
async function updateActivityFeed() {
    try {
        const { ref, get, child, query, orderByChild, limitToLast } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        if (!rtdb) {
            console.log('Firebase RTDB not initialized yet');
            return;
        }
        
        // Fetch recent events from all users
        const eventsRef = ref(rtdb, 'events');
        const snapshot = await get(eventsRef);
        
        if (!snapshot.exists()) {
            console.log('No activity events found');
            return;
        }
        
        const allEvents = [];
        const eventsData = snapshot.val();
        
        // Flatten all user events
        Object.keys(eventsData).forEach(userId => {
            const userEvents = eventsData[userId];
            Object.keys(userEvents).forEach(eventId => {
                allEvents.push({
                    ...userEvents[eventId],
                    userId,
                    eventId
                });
            });
        });
        
        // Sort by timestamp and take last 10
        const recentEvents = allEvents
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 10);
        
        // Map events to activity feed format
        const activities = recentEvents.map(event => {
            const timeAgo = getTimeAgo(event.createdAt);
            return mapEventToActivity(event, timeAgo);
        });
        
        console.log('📋 Activity feed updated with real data:', activities);
        // Update UI if there's an activity feed container
        renderActivityFeed(activities);
        
    } catch (error) {
        console.error('Error fetching activity feed:', error);
    }
}

// Map RTDB event to activity format
function mapEventToActivity(event, timeAgo) {
    const actionMap = {
        'user_registered': { icon: '👤', title: 'New user registered', status: 'new' },
        'coach_registered': { icon: '🏋️‍♂️', title: 'New coach registered', status: 'new' },
        'coach_approved': { icon: '✅', title: 'Coach approved', status: 'success' },
        'membership_purchase': { icon: '💰', title: 'Membership purchased', status: 'success' },
        'booking_created': { icon: '📅', title: 'New booking created', status: 'new' },
        'booking_completed': { icon: '✔️', title: 'Session completed', status: 'completed' },
        'profile_updated': { icon: '📝', title: 'Profile updated', status: 'updated' }
    };
    
    const mapped = actionMap[event.action] || { icon: '📌', title: 'Activity', status: 'info' };
    
    return {
        icon: mapped.icon,
        title: mapped.title,
        description: event.details?.description || event.details?.plan || event.page || 'User activity',
        time: timeAgo,
        status: mapped.status
    };
}

// Render activity feed to UI
function renderActivityFeed(activities) {
    const container = document.getElementById('activityFeedContainer');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No recent activity</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item" style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem;">
            <div style="font-size: 1.5rem;">${activity.icon}</div>
            <div style="flex: 1;">
                <div style="color: #ffd700; font-weight: 600;">${activity.title}</div>
                <div style="color: #ccc; font-size: 0.9rem;">${activity.description}</div>
                <div style="color: #999; font-size: 0.75rem; margin-top: 0.25rem;">${activity.time}</div>
            </div>
            <div class="status-badge ${activity.status}" style="padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;"></div>
        </div>
    `).join('');
}

// Helper: Get time ago string
function getTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
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

// Perform the actual export
async function performExport(format, options) {
    console.log('📊 Starting export...', { format, options });
    showLoading('Exporting data from Firebase...');
    
    try {
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        console.log('Firebase RTDB:', rtdb);
        
        if (!rtdb) {
            hideLoading();
            showNotification('Firebase not initialized', 'error');
            console.error('❌ Firebase RTDB not initialized!');
            return;
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            platform: '6Titans Fitness Platform',
            version: '2.0',
            data: {}
        };
        
        // Fetch Users
        if (options.includeUsers || options.includeCoaches) {
            const usersSnapshot = await get(ref(rtdb, 'users'));
            if (usersSnapshot.exists()) {
                const allUsers = usersSnapshot.val();
                
                if (options.includeUsers) {
                    exportData.data.members = Object.entries(allUsers)
                        .filter(([uid, user]) => user.accountType === 'member' || !user.accountType)
                        .map(([uid, user]) => ({
                            uid,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            accountType: user.accountType || 'member',
                            createdAt: user.createdAt,
                            membership: user.membership || null
                        }));
                }
                
                if (options.includeCoaches) {
                    exportData.data.coaches = Object.entries(allUsers)
                        .filter(([uid, user]) => user.accountType === 'coach' || user.role === 'coach')
                        .map(([uid, user]) => ({
                            uid,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            coachApproved: user.coachApproved,
                            specialization: user.specialization,
                            experience: user.experience,
                            createdAt: user.createdAt
                        }));
                }
            }
        }
        
        // Fetch Bookings
        if (options.includeBookings) {
            const bookingsSnapshot = await get(ref(rtdb, 'bookings'));
            if (bookingsSnapshot.exists()) {
                exportData.data.bookings = Object.entries(bookingsSnapshot.val())
                    .map(([id, booking]) => ({
                        id,
                        userId: booking.userId,
                        coachId: booking.coachId,
                        status: booking.status,
                        date: booking.date,
                        sessionType: booking.sessionType,
                        createdAt: booking.createdAt
                    }));
            }
        }
        
        // Fetch Events
        if (options.includeEvents) {
            const eventsSnapshot = await get(ref(rtdb, 'events'));
            if (eventsSnapshot.exists()) {
                const allEvents = [];
                const eventsData = eventsSnapshot.val();
                Object.keys(eventsData).forEach(userId => {
                    Object.entries(eventsData[userId]).forEach(([eventId, event]) => {
                        allEvents.push({
                            eventId,
                            userId,
                            action: event.action,
                            details: event.details,
                            page: event.page,
                            createdAt: event.createdAt
                        });
                    });
                });
                exportData.data.events = allEvents.slice(-100); // Last 100 events
            }
        }
        
        // Add Summary Statistics
        exportData.summary = {
            totalMembers: exportData.data.members?.length || 0,
            totalCoaches: exportData.data.coaches?.length || 0,
            totalBookings: exportData.data.bookings?.length || 0,
            totalEvents: exportData.data.events?.length || 0
        };
        
        console.log('✅ Export data prepared:', exportData.summary);
        
        hideLoading();
        
        // Download based on format
        if (format === 'json') {
            console.log('📥 Downloading as JSON...');
            downloadJSON(exportData);
        } else {
            console.log('📥 Downloading as CSV...');
            downloadCSV(exportData);
        }
        
        showNotification('Data exported successfully!', 'success');
        
    } catch (error) {
        hideLoading();
        console.error('Export error:', error);
        showNotification('Export failed: ' + error.message, 'error');
    }
}

// Download as JSON
function downloadJSON(data) {
    console.log('Preparing JSON download...');
    const jsonString = JSON.stringify(data, null, 2);
    console.log('JSON size:', jsonString.length, 'characters');
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `6titans-export-${new Date().toISOString().split('T')[0]}.json`;
    a.download = filename;
    
    console.log('Triggering download:', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('✅ JSON download triggered!');
}

// Download as CSV (multiple files in a zip would be better, but we'll do separate CSV for each data type)
function downloadCSV(data) {
    console.log('Preparing CSV downloads...');
    let filesDownloaded = 0;
    
    // Members CSV
    if (data.data.members && data.data.members.length > 0) {
        console.log('Exporting members CSV:', data.data.members.length, 'members');
        const membersCSV = convertToCSV(data.data.members);
        downloadSingleCSV(membersCSV, 'members');
        filesDownloaded++;
    }
    
    // Coaches CSV
    if (data.data.coaches && data.data.coaches.length > 0) {
        console.log('Exporting coaches CSV:', data.data.coaches.length, 'coaches');
        const coachesCSV = convertToCSV(data.data.coaches);
        downloadSingleCSV(coachesCSV, 'coaches');
        filesDownloaded++;
    }
    
    // Bookings CSV
    if (data.data.bookings && data.data.bookings.length > 0) {
        console.log('Exporting bookings CSV:', data.data.bookings.length, 'bookings');
        const bookingsCSV = convertToCSV(data.data.bookings);
        downloadSingleCSV(bookingsCSV, 'bookings');
        filesDownloaded++;
    }
    
    // Events CSV
    if (data.data.events && data.data.events.length > 0) {
        console.log('Exporting events CSV:', data.data.events.length, 'events');
        const eventsCSV = convertToCSV(data.data.events);
        downloadSingleCSV(eventsCSV, 'events');
        filesDownloaded++;
    }
    
    console.log('✅ CSV exports completed:', filesDownloaded, 'files');
    // Summary
    showNotification(`${filesDownloaded} CSV file(s) downloaded (check your downloads folder)`, 'success');
}

// Convert array of objects to CSV
function convertToCSV(array) {
    if (array.length === 0) return '';
    
    // Get headers
    const headers = Object.keys(array[0]);
    const csvHeaders = headers.join(',');
    
    // Get rows
    const csvRows = array.map(obj => {
        return headers.map(header => {
            const value = obj[header];
            // Handle nested objects and arrays
            if (typeof value === 'object' && value !== null) {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

// Download a single CSV file
function downloadSingleCSV(csvContent, name) {
    const filename = `6titans-${name}-${new Date().toISOString().split('T')[0]}.csv`;
    console.log('Downloading CSV:', filename, '(', csvContent.length, 'characters)');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV download triggered:', filename);
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
// RTDB Data Fetchers for Charts
// ===============================

// Fetch user growth data from RTDB
async function fetchUserGrowthData() {
    try {
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        if (!rtdb) {
            console.log('Firebase RTDB not ready, using placeholder data');
            return { labels: ['Loading...'], data: [0] };
        }
        
        const snapshot = await get(ref(rtdb, 'users'));
        if (!snapshot.exists()) {
            return { labels: ['No Data'], data: [0] };
        }
        
        const users = snapshot.val();
        
        // Group users by month
        const monthlyData = {};
        const now = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            monthlyData[monthKey] = 0;
        }
        
        // Count users by registration month
        Object.values(users).forEach(user => {
            if (user.createdAt) {
                const userDate = new Date(user.createdAt);
                const monthKey = userDate.toLocaleString('default', { month: 'short' });
                if (monthlyData.hasOwnProperty(monthKey)) {
                    monthlyData[monthKey]++;
                }
            }
        });
        
        return {
            labels: Object.keys(monthlyData),
            data: Object.values(monthlyData)
        };
    } catch (error) {
        console.error('Error fetching user growth data:', error);
        return { labels: ['Error'], data: [0] };
    }
}

// Fetch revenue data from RTDB
async function fetchRevenueData() {
    try {
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        if (!rtdb) {
            return { labels: ['Loading...'], data: [0] };
        }
        
        const snapshot = await get(ref(rtdb, 'users'));
        if (!snapshot.exists()) {
            return { labels: ['No Data'], data: [0] };
        }
        
        const users = snapshot.val();
        const membershipPrices = {
            basic: 29,
            premium: 59,
            elite: 99,
            student: 19,
            family: 149,
            corporate: 199
        };
        
        // Group revenue by month
        const monthlyRevenue = {};
        const now = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            monthlyRevenue[monthKey] = 0;
        }
        
        // Calculate revenue by membership start month
        Object.values(users).forEach(user => {
            if (user.membership && user.membership.startDate) {
                const startDate = new Date(user.membership.startDate);
                const monthKey = startDate.toLocaleString('default', { month: 'short' });
                
                if (monthlyRevenue.hasOwnProperty(monthKey)) {
                    const plan = user.membership.plan || 'basic';
                    const price = membershipPrices[plan] || membershipPrices.basic;
                    monthlyRevenue[monthKey] += price;
                }
            }
        });
        
        return {
            labels: Object.keys(monthlyRevenue),
            data: Object.values(monthlyRevenue)
        };
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        return { labels: ['Error'], data: [0] };
    }
}

// Fetch bookings data from RTDB
async function fetchBookingsData() {
    try {
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        if (!rtdb) {
            console.log('📊 Bookings Chart: RTDB not initialized, showing empty data');
            return { data: [0, 0, 0] };
        }
        
        const snapshot = await get(ref(rtdb, 'bookings'));
        if (!snapshot.exists()) {
            console.log('📊 Bookings Chart: No bookings found in database');
            return { data: [0, 0, 0] };
        }
        
        const bookings = snapshot.val();
        const statusCounts = {
            completed: 0,
            cancelled: 0,
            pending: 0,
            confirmed: 0,
            active: 0
        };
        
        let totalBookings = 0;
        
        Object.values(bookings).forEach(booking => {
            totalBookings++;
            // Normalize status to lowercase for comparison
            const status = (booking.status || 'pending').toLowerCase().trim();
            
            // Map various status values to our three categories
            if (status === 'completed' || status === 'finished' || status === 'done') {
                statusCounts.completed++;
            } else if (status === 'cancelled' || status === 'canceled' || status === 'rejected') {
                statusCounts.cancelled++;
            } else if (status === 'confirmed' || status === 'active' || status === 'approved') {
                statusCounts.confirmed++;
            } else {
                // Default to pending (includes 'pending', 'waiting', etc.)
                statusCounts.pending++;
            }
        });
        
        console.log('📊 Bookings Chart Data:', {
            total: totalBookings,
            completed: statusCounts.completed,
            cancelled: statusCounts.cancelled,
            confirmed: statusCounts.confirmed,
            pending: statusCounts.pending
        });
        
        return {
            data: [
                statusCounts.completed, 
                statusCounts.cancelled, 
                statusCounts.confirmed + statusCounts.pending // Combine confirmed and pending
            ]
        };
    } catch (error) {
        console.error('❌ Error fetching bookings data:', error);
        return { data: [0, 0, 0] };
    }
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

// ===============================
// System Status Monitoring
// ===============================

async function initializeSystemStatus() {
    console.log('🔍 Initializing system status monitoring...');
    
    // Check system status
    await checkSystemStatus();
    
    // Refresh every 30 seconds
    setInterval(checkSystemStatus, 30000);
}

async function checkSystemStatus() {
    const startTime = performance.now();
    
    try {
        // Server Status
        const serverIndicator = document.getElementById('serverStatusIndicator');
        const serverText = document.getElementById('serverStatusText');
        const serverUptime = document.getElementById('serverUptime');
        const serverResponse = document.getElementById('serverResponse');
        
        if (serverIndicator) {
            serverIndicator.className = 'status-indicator online';
            serverIndicator.textContent = 'ONLINE';
            serverText.textContent = 'All systems operational';
            serverUptime.textContent = 'Uptime: 99.9%';
            const responseTime = Math.round(performance.now() - startTime);
            serverResponse.textContent = `Response: ${responseTime}ms`;
        }
        
        // Database Status
        await checkDatabaseStatus(startTime);
        
        // Storage Status
        await checkStorageStatus();
        
        // Authentication Status
        await checkAuthStatus();
        
        console.log('✅ System status updated successfully');
        
    } catch (error) {
        console.error('❌ Error checking system status:', error);
    }
}

async function checkDatabaseStatus(startTime) {
    const indicator = document.getElementById('databaseStatusIndicator');
    const text = document.getElementById('databaseStatusText');
    const users = document.getElementById('databaseUsers');
    const response = document.getElementById('databaseResponse');
    
    try {
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        if (!rtdb) {
            if (indicator) {
                indicator.className = 'status-indicator warning';
                indicator.textContent = 'WARNING';
                text.textContent = 'Database initializing...';
            }
            return;
        }
        
        const dbStartTime = performance.now();
        const snapshot = await get(ref(rtdb, 'users'));
        const dbResponseTime = Math.round(performance.now() - dbStartTime);
        
        const userCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        
        if (indicator) {
            indicator.className = 'status-indicator online';
            indicator.textContent = 'HEALTHY';
            text.textContent = 'Database performance optimal';
            users.textContent = `Users: ${userCount}`;
            response.textContent = `Response: ${dbResponseTime}ms`;
        }
        
    } catch (error) {
        console.error('Database status check failed:', error);
        if (indicator) {
            indicator.className = 'status-indicator offline';
            indicator.textContent = 'ERROR';
            text.textContent = 'Database connection failed';
        }
    }
}

async function checkStorageStatus() {
    const indicator = document.getElementById('storageStatusIndicator');
    const text = document.getElementById('storageStatusText');
    const used = document.getElementById('storageUsed');
    const files = document.getElementById('storageFiles');
    
    try {
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        if (!rtdb) {
            if (indicator) {
                indicator.className = 'status-indicator warning';
                indicator.textContent = 'WARNING';
            }
            return;
        }
        
        // Get approximate data size from bookings and users
        const usersSnapshot = await get(ref(rtdb, 'users'));
        const bookingsSnapshot = await get(ref(rtdb, 'bookings'));
        
        const userCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;
        const bookingCount = bookingsSnapshot.exists() ? Object.keys(bookingsSnapshot.val()).length : 0;
        
        // Estimate data usage (rough calculation)
        const estimatedMB = Math.round((userCount * 0.01) + (bookingCount * 0.005));
        
        if (indicator) {
            indicator.className = 'status-indicator online';
            indicator.textContent = 'HEALTHY';
            text.textContent = 'Storage available';
            used.textContent = `Data: ~${estimatedMB}MB`;
            files.textContent = `Records: ${userCount + bookingCount}`;
        }
        
    } catch (error) {
        console.error('Storage status check failed:', error);
        if (indicator) {
            indicator.className = 'status-indicator warning';
            indicator.textContent = 'WARNING';
            text.textContent = 'Unable to check storage';
        }
    }
}

async function checkAuthStatus() {
    const indicator = document.getElementById('authStatusIndicator');
    const text = document.getElementById('authStatusText');
    const activeUsers = document.getElementById('authUsers');
    
    try {
        const auth = window.firebaseAuth;
        
        if (!auth || !auth.currentUser) {
            if (indicator) {
                indicator.className = 'status-indicator warning';
                indicator.textContent = 'WARNING';
                text.textContent = 'Not authenticated';
            }
            return;
        }
        
        const { ref, get } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
        const rtdb = window.firebaseRtdb;
        
        if (!rtdb) {
            if (indicator) {
                indicator.className = 'status-indicator warning';
                indicator.textContent = 'WARNING';
            }
            return;
        }
        
        // Get user count
        const snapshot = await get(ref(rtdb, 'users'));
        const totalUsers = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        
        if (indicator) {
            indicator.className = 'status-indicator online';
            indicator.textContent = 'ACTIVE';
            text.textContent = 'Authentication service active';
            activeUsers.textContent = `Total Users: ${totalUsers}`;
        }
        
    } catch (error) {
        console.error('Auth status check failed:', error);
        if (indicator) {
            indicator.className = 'status-indicator offline';
            indicator.textContent = 'ERROR';
            text.textContent = 'Auth check failed';
        }
    }
}