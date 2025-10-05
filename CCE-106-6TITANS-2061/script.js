// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = '#0a0a0a';
        navbar.style.backdropFilter = 'none';
    }
});

// Button click animations
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect CSS
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .hero-content, .hero-image');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Form validation and submission
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ff6b6b';
            isValid = false;
        } else {
            input.style.borderColor = '#333';
        }
    });
    
    return isValid;
}

// Add form validation to all forms
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
});

// Loading animation
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
    }
}

// Add loading styles
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .loading-spinner {
        text-align: center;
        color: #ffd700;
    }
    
    .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid #333;
        border-top: 3px solid #ffd700;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loadingStyle);

// Utility functions
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

// Throttle function for scroll events
const throttledScrollHandler = debounce(() => {
    // Handle scroll events here
}, 100);

window.addEventListener('scroll', throttledScrollHandler);



// Console welcome message
console.log('%c💪 Welcome to 6Titans! 💪', 'color: #ffd700; font-size: 20px; font-weight: bold;');
console.log('%cTransform your body, transform your life!', 'color: #cccccc; font-size: 14px;');

// In-app notifications listener via Realtime Database if available
function _initNotificationsWhenReady() {
  try {
    if (!(window.firebaseAuth && window.firebaseRtdb && window.firebaseRT)) return false;
        const { ref, onValue, child, get, set, update } = window.firebaseRT;
        const rtdb = window.firebaseRtdb;
        function attachDropdownNotifications(user){
            try {
                const profileMenu = document.getElementById('profileMenu') || document.querySelector('.profile-menu');
                if (!profileMenu) return;
                const list = profileMenu.querySelector('.profile-menu-list');
                if (!list) return;
                if (!list.querySelector('#openNotif')) {
                    const li = document.createElement('li');
                    li.innerHTML = '<a href="#" id="openNotif"><i class="fas fa-bell"></i> Notifications <span class="notif-badge" id="notifBadgeDd" style="display:none;background:#ff6b6b;color:#fff;border-radius:999px;padding:2px 8px;font-size:10px;margin-left:8px;">0</span></a>';
                    list.prepend(li);
                }
                let panel = document.getElementById('dropdownNotifPanel');
                if (!panel) {
                    panel = document.createElement('div');
                    panel.id = 'dropdownNotifPanel';
                    panel.style.position = 'absolute';
                    panel.style.right = '16px';
                    panel.style.top = '72px';
                    panel.style.background = '#1a1a1a';
                    panel.style.border = '1px solid #333';
                    panel.style.borderRadius = '8px';
                    panel.style.padding = '10px';
                    panel.style.minWidth = '280px';
                    panel.style.maxHeight = '50vh';
                    panel.style.overflow = 'auto';
                    panel.style.display = 'none';
                    panel.style.zIndex = '2200';
                    panel.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;"><strong style="color:#ffd700">Notifications</strong><button id="markAllRead" style="background:#2a2a2a;border:1px solid #333;color:#fff;padding:4px 8px;border-radius:6px;cursor:pointer">Mark all read</button></div><div id="notifList" style="display:flex;flex-direction:column;gap:6px;"></div>';
                    document.body.appendChild(panel);
                }
                const openNotif = document.getElementById('openNotif');
                const badgeDd = document.getElementById('notifBadgeDd');
                if (openNotif && user) {
                    openNotif.onclick = (e)=>{ e.preventDefault(); panel.style.display = panel.style.display==='none'?'block':'none'; };
                    document.addEventListener('click', (e)=>{ if (panel.style.display==='block' && !e.target.closest('#openNotif') && !e.target.closest('#dropdownNotifPanel')) panel.style.display='none'; });
                    const listDiv = panel.querySelector('#notifList');
                    const markBtn = panel.querySelector('#markAllRead');
                    onValue(ref(rtdb, 'notifications/' + user.uid), (snap)=>{
                        const data = snap.val() || {};
                        const unread = Object.values(data).filter(n=>n && n.read===false).length;
                        if (badgeDd) { badgeDd.style.display = unread>0 ? 'inline-block' : 'none'; badgeDd.textContent = String(unread); }
                        if (listDiv) {
                            const entries = Object.entries(data).slice(-10).reverse();
                            listDiv.innerHTML = entries.map(([id,n])=>`<div style=\"padding:8px;border:1px solid #333;border-radius:6px;color:#ddd;background:${n.read?'#161616':'#202020'};\"><div style=\"color:#ffd700;font-weight:600;\">${n.type||'notice'}</div><div>${n.message||''}</div><small style=\"color:#888;\">${new Date(n.createdAt||Date.now()).toLocaleString()}</small></div>`).join('');
                        }
                        if (markBtn) {
                            markBtn.onclick = async ()=>{
                                try {
                                    const updates = {};
                                    Object.entries(data).forEach(([id,n])=>{ if (n && n.read===false) updates['notifications/'+user.uid+'/'+id+'/read'] = true; });
                                    if (Object.keys(updates).length>0) await update(ref(rtdb), updates);
                                } catch {}
                            };
                        }
                    });
                }
            } catch {}
        }
        window.firebaseAuth.onAuthStateChanged((user) => {
            if (!user) return;
            const notifRef = ref(rtdb, 'notifications/' + user.uid);
            onValue(notifRef, (snapshot) => {
                const data = snapshot.val();
                if (!data) return;
                // Show the latest unread notifications (basic)
                Object.values(data).slice(-3).forEach((n) => {
                    if (window.Utils && window.Utils.showToast && n && n.read === false) {
                        window.Utils.showToast(n.message || 'You have a new notification', 'info');
                    }
                });
                // Update navbar badge count
                try {
                    const unread = Object.values(data).filter((n)=>n && n.read===false).length;
                    let bell = document.getElementById('notifBell');
                    if (!bell) {
                        const navMenu = document.querySelector('.nav-menu');
                        if (navMenu) {
                            const li = document.createElement('li');
                            li.className = 'nav-item';
                            li.innerHTML = '<a href="#" class="nav-link" id="notifBell" style="position:relative"><i class="fas fa-bell"></i><span id="notifBadge" style="position:absolute;top:-6px;right:-10px;background:#ff6b6b;color:#fff;border-radius:999px;padding:2px 6px;font-size:10px;display:none;">0</span></a>';
                            navMenu.appendChild(li);
                            bell = li.querySelector('#notifBell');
                            // Panel
                            const panel = document.createElement('div');
                            panel.id = 'notifPanel';
                            panel.style.position = 'absolute';
                            panel.style.right = '16px';
                            panel.style.top = '64px';
                            panel.style.background = '#1a1a1a';
                            panel.style.border = '1px solid #333';
                            panel.style.borderRadius = '8px';
                            panel.style.padding = '8px';
                            panel.style.minWidth = '260px';
                            panel.style.maxHeight = '50vh';
                            panel.style.overflow = 'auto';
                            panel.style.display = 'none';
                            panel.style.zIndex = '1200';
                            document.body.appendChild(panel);
                            bell.addEventListener('click', (e)=>{ e.preventDefault(); panel.style.display = panel.style.display==='none'?'block':'none'; });
                            document.addEventListener('click', (e)=>{ if (panel.style.display==='block' && !e.target.closest('#notifBell')) panel.style.display='none'; });
                        }
                    }
                    const badge = document.getElementById('notifBadge');
                    if (badge) {
                        if (unread>0) { badge.style.display='inline-block'; badge.textContent = String(unread); } else { badge.style.display='none'; }
                    }
                    // Also update any dropdown notification badges
                    try {
                        document.querySelectorAll('.notif-badge').forEach((el)=>{
                            if (unread>0) { el.style.display='inline-block'; el.textContent = String(unread); }
                            else { el.style.display='none'; }
                        });
                    } catch {}
                    // Render panel list
                    const panel = document.getElementById('notifPanel');
                    if (panel) {
                        const entries = Object.entries(data).slice(-10).reverse();
                        panel.innerHTML = entries.map(([id,n])=>`<div style="padding:8px;border-bottom:1px solid #333;color:#ddd;"><div style="font-weight:600;color:#ffd700;">${n.type||'notice'}</div><div>${n.message||''}</div><small style="color:#888;">${new Date(n.createdAt||Date.now()).toLocaleString()}</small></div>`).join('');
                    }
                } catch{}
            });
            // attach dropdown notifications if a profile menu exists on this page
            attachDropdownNotifications(user);
        });
    // Also observe DOM for late-loaded dropdowns and attach when they appear
    const mo = new MutationObserver(() => {
      const pm = document.getElementById('profileMenu');
      const u = window.firebaseAuth.currentUser;
      if (pm && u) attachDropdownNotifications(u);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return true;
  } catch (e) { return false; }
}

// Try immediately, then retry for late-initialized pages
if (!_initNotificationsWhenReady()) {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (_initNotificationsWhenReady() || attempts > 20) clearInterval(timer);
  }, 300);
}

// Admin nav link removed - admins can access via profile dropdown or direct URL

// Membership expiry check -> create notification if within 7 days
try {
    if (window.firebaseAuth && window.firebaseRtdb && window.firebaseRT) {
        const { ref, child, get, push, set, update } = window.firebaseRT;
        const rtdb = window.firebaseRtdb;
        async function checkExpiry(user){
            try {
                const snap = await get(child(ref(rtdb), 'users/' + user.uid + '/membership'));
                if (!snap.exists()) return;
                const m = snap.val();
                if (!m || !m.expiry) return;
                const daysLeft = Math.ceil((new Date(m.expiry).getTime() - Date.now()) / (1000*60*60*24));
                if (daysLeft <= 7) {
                    const flagSnap = await get(child(ref(rtdb), 'users/' + user.uid + '/flags/lastExpiryNoticeDate'));
                    const todayKey = new Date().toISOString().slice(0,10);
                    if (!flagSnap.exists() || flagSnap.val() !== todayKey) {
                        const notifKey = push(ref(rtdb, 'notifications/' + user.uid)).key;
                        await set(ref(rtdb, `notifications/${user.uid}/${notifKey}`), {
                            type: 'membership',
                            message: `Your membership expires in ${daysLeft} day${daysLeft===1?'':'s'}.`,
                            read: false,
                            createdAt: Date.now()
                        });
                        await update(ref(rtdb, 'users/' + user.uid + '/flags'), { lastExpiryNoticeDate: todayKey });
                    }
                }
            } catch {}
        }
        window.firebaseAuth.onAuthStateChanged((user)=>{ if (user) { checkExpiry(user); setInterval(()=>checkExpiry(user), 6*60*60*1000); } });
    }
} catch {}