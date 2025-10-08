// Membership Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const choosePlanBtns = document.querySelectorAll('.choose-plan');
    const membershipModal = document.getElementById('membershipModal');
    const closeModal = document.querySelector('.close');
    const closeModalBtn = document.getElementById('closeModal');
    const confirmMembershipBtn = document.getElementById('confirmMembership');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    // Plan selection functionality
    choosePlanBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const planType = this.getAttribute('data-plan');
            const planData = getPlanData(planType);
            
            // Populate modal
            modalTitle.textContent = `Join ${planData.name} Plan`;
            modalContent.innerHTML = `
                <div class="plan-summary">
                    <div class="plan-header">
                        <h3>${planData.name}</h3>
                        <div class="plan-price-large">${planData.price}</div>
                    </div>
                    <div class="plan-features-list">
                        <h4>What's Included:</h4>
                        <ul>
                            ${planData.features.map(feature => `<li><i class="fas fa-check"></i>${feature}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <form id="membershipForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">First Name *</label>
                            <input type="text" id="firstName" name="firstName" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name *</label>
                            <input type="text" id="lastName" name="lastName" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number *</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="billingAddress">Billing Address *</label>
                        <textarea id="billingAddress" name="billingAddress" rows="3" required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City *</label>
                            <input type="text" id="city" name="city" required>
                        </div>
                        <div class="form-group">
                            <label for="zipCode">ZIP Code *</label>
                            <input type="text" id="zipCode" name="zipCode" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="paymentMethod">Payment Method *</label>
                        <select id="paymentMethod" name="paymentMethod" required>
                            <option value="">Select payment method</option>
                            <option value="credit-card">Credit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="bank-transfer">Bank Transfer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
                            I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="privacy-link">Privacy Policy</a> *
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="newsletter" name="newsletter">
                            Subscribe to our newsletter for fitness tips and updates
                        </label>
                    </div>
                </form>
            `;
            
            // Store selected plan
            confirmMembershipBtn.setAttribute('data-plan', planType);
            
            // Prefill from logged-in user
            try {
                const auth = window.firebaseAuth;
                const rtdb = window.firebaseRtdb;
                const { ref, get, child } = window.firebaseRT || {};
                const user = auth && auth.currentUser;
                const first = document.getElementById('firstName');
                const last = document.getElementById('lastName');
                const email = document.getElementById('email');
                if (user) {
                    // Prefer Firestore (matches coaching behavior), then fallback to RTDB
                    try {
                        const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
                        const db = getFirestore();
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (userDoc.exists()) {
                            const d = userDoc.data();
                            if (first) { first.value = d.firstName || (user.displayName ? user.displayName.split(' ')[0] : ''); first.readOnly = true; }
                            if (last) { last.value = d.lastName || (user.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''); last.readOnly = true; }
                            if (email) { email.value = d.email || user.email || ''; email.readOnly = true; }
                        } else if (rtdb && ref && get && child) {
                            const snap = await get(child(ref(rtdb), 'users/' + user.uid));
                            const d = snap.exists() ? snap.val() : {};
                            if (first) { first.value = d.firstName || (user.displayName ? user.displayName.split(' ')[0] : ''); first.readOnly = true; }
                            if (last) { last.value = d.lastName || (user.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''); last.readOnly = true; }
                            if (email) { email.value = d.email || user.email || ''; email.readOnly = true; }
                        }
                    } catch {}
                }
            } catch {}

            // Show modal
            membershipModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        membershipModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    closeModalBtn.addEventListener('click', function() {
        membershipModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === membershipModal) {
            membershipModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle membership confirmation (write to Firestore)
    confirmMembershipBtn.addEventListener('click', async function() {
        const form = document.getElementById('membershipForm');
        const planType = this.getAttribute('data-plan');
        
        if (!validateMembershipForm(form)) return;
        
        const auth = window.firebaseAuth;
        const rtdb = window.firebaseRtdb;
        const { ref, set, update, rtdbServerTimestamp, push } = window.firebaseRT || {};
        if (!auth || !rtdb || !ref || !set) {
            alert('Service not ready. Please refresh the page.');
            return;
        }
        const user = auth.currentUser;
        if (!user) {
            alert('Please log in to purchase a membership.');
            return;
        }

        showLoading();
        try {
            const uid = user.uid;
            // Set membership under RTDB
            await update(ref(rtdb, 'users/' + uid), {
                uid,
                membership: {
                    status: 'active',
                    plan: planType,
                    expiry: new Date(Date.now() + 30*24*60*60*1000).toISOString()
                }
            });

            // Audit event
            const evtKey = push(ref(rtdb, 'events/' + uid)).key;
            await set(ref(rtdb, `events/${uid}/${evtKey}`), {
                action: 'membership_purchase',
                details: { plan: planType },
                page: 'membership',
                createdAt: Date.now()
            });

            // Notification
            const notifKey = push(ref(rtdb, 'notifications/' + uid)).key;
            await set(ref(rtdb, `notifications/${uid}/${notifKey}`), {
                type: 'membership',
                message: `Your ${planType} membership is now active!`,
                data: { plan: planType },
                read: false,
                createdAt: Date.now()
            });

            hideLoading();
            if (window.Utils && window.Utils.showToast) {
                window.Utils.showToast(`Membership activated: ${planType}`, 'success');
            } else {
                alert(`Membership activated: ${planType}`);
            }

            // Close modal
            membershipModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        } catch (err) {
            hideLoading();
            if (window.Utils && window.Utils.showToast) {
                window.Utils.showToast(`Could not activate membership: ${err.message}`, 'error');
            } else {
                alert('Could not activate membership: ' + err.message);
            }
        }
    });

    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .plan-summary {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background-color: #1a1a1a;
            border-radius: 8px;
            border: 1px solid #333;
        }
        
        .plan-header {
            text-align: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #333;
        }
        
        .plan-header h3 {
            color: #ffd700;
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        .plan-price-large {
            color: #ffffff;
            font-size: 2rem;
            font-weight: 700;
        }
        
        .plan-features-list h4 {
            color: #ffd700;
            margin-bottom: 1rem;
        }
        
        .plan-features-list ul {
            list-style: none;
            padding: 0;
        }
        
        .plan-features-list li {
            color: #cccccc;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .plan-features-list li i {
            color: #4CAF50;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #ffd700;
            font-weight: 600;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #333;
            border-radius: 6px;
            background-color: #2a2a2a;
            color: #ffffff;
            font-size: 1rem;
            transition: border-color 0.3s ease;
            font-family: inherit;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #ffd700;
            box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .form-group input[type="checkbox"] {
            width: auto;
            margin-right: 0.5rem;
        }
        
        .form-group label:has(input[type="checkbox"]) {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            font-weight: normal;
            color: #cccccc;
        }
        
        .terms-link,
        .privacy-link {
            color: #ffd700;
            text-decoration: none;
        }
        
        .terms-link:hover,
        .privacy-link:hover {
            text-decoration: underline;
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #333;
        }
        
        .faq-section {
            margin-top: 4rem;
        }
        
        .faq-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .faq-item {
            background-color: #1a1a1a;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #333;
        }
        
        .faq-item h4 {
            color: #ffd700;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .faq-item p {
            color: #cccccc;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .modal-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(modalStyle);

    // Add pricing card animations
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

    // Observe pricing cards for animation
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Gate: if user is logged in, read membership and reflect current status on UI
    try {
        const auth = window.firebaseAuth;
        const rtdb = window.firebaseRtdb;
        const { ref, get, child } = window.firebaseRT || {};
        if (auth && rtdb && ref && get && child) {
            const unsub = auth.onAuthStateChanged(async (user) => {
                if (!user) return;
                try {
                    const snap = await get(child(ref(rtdb), 'users/' + user.uid));
                    const data = snap.exists() ? snap.val() : null;
                    if (data && data.membership && data.membership.status === 'active') {
                        // Inform user they already have an active plan
                        const banner = document.createElement('div');
                        banner.style.backgroundColor = '#1a1a1a';
                        banner.style.border = '1px solid #333';
                        banner.style.borderLeft = '4px solid #4CAF50';
                        banner.style.color = '#ffffff';
                        banner.style.padding = '12px 16px';
                        banner.style.borderRadius = '8px';
                        banner.style.margin = '1rem 0';
                        banner.textContent = `Your membership is active: ${data.membership.plan.toUpperCase()} (expires ${new Date(data.membership.expiry).toLocaleDateString()})`;
                        const container = document.querySelector('.membership .container');
                        if (container) container.insertBefore(banner, container.children[2] || null);
                    }
                } catch {}
            });
        }
    } catch {}
});

// Get plan data based on plan type
function getPlanData(planType) {
    const plans = {
        basic: {
            name: 'Basic',
            price: '$29/month',
            features: [
                'Access to gym facilities',
                'Basic workout plans',
                'Group classes',
                'Progress tracking'
            ]
        },
        premium: {
            name: 'Premium',
            price: '$59/month',
            features: [
                'Everything in Basic',
                'Personal trainer sessions',
                'Custom meal plans',
                'Online coaching',
                'Video call sessions'
            ]
        },
        elite: {
            name: 'Elite',
            price: '$99/month',
            features: [
                'Everything in Premium',
                '24/7 coach access',
                'Nutrition counseling',
                'Priority booking',
                'Exclusive workshops'
            ]
        },
        student: {
            name: 'Student',
            price: '$19/month',
            features: [
                'Access to gym facilities',
                'Basic workout plans',
                'Group classes',
                'Student ID required'
            ]
        },
        family: {
            name: 'Family',
            price: '$149/month',
            features: [
                'Up to 4 family members',
                'Everything in Premium',
                'Family workout sessions',
                'Childcare during workouts'
            ]
        },
        corporate: {
            name: 'Corporate',
            price: 'Custom pricing',
            features: [
                'Bulk pricing for teams',
                'On-site fitness classes',
                'Wellness programs',
                'Health assessments'
            ]
        }
    };
    
    return plans[planType] || plans.basic;
}

// Validate membership form
function validateMembershipForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ff6b6b';
            isValid = false;
        } else {
            field.style.borderColor = '#333';
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.style.borderColor = '#ff6b6b';
                isValid = false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(field.value.replace(/[\s\-\(\)]/g, ''))) {
                field.style.borderColor = '#ff6b6b';
                isValid = false;
            }
        }
    });
    
    // Inline error message instead of popup
    const existingError = document.getElementById('membershipFormError');
    if (!isValid) {
        const errorBanner = existingError || document.createElement('div');
        errorBanner.id = 'membershipFormError';
        errorBanner.style.backgroundColor = '#1a1a1a';
        errorBanner.style.border = '1px solid #333';
        errorBanner.style.borderLeft = '4px solid #ff6b6b';
        errorBanner.style.color = '#ffffff';
        errorBanner.style.padding = '12px 16px';
        errorBanner.style.borderRadius = '8px';
        errorBanner.style.marginBottom = '1rem';
        errorBanner.textContent = 'Please fill in all required fields correctly.';
        const formParent = form.parentElement;
        if (formParent && !existingError) {
            formParent.prepend(errorBanner);
        }
    } else if (existingError) {
        existingError.remove();
    }
    
    return isValid;
}

// Add real-time form validation
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('input', function(e) {
        if (e.target.matches('#membershipForm input, #membershipForm select, #membershipForm textarea')) {
            if (e.target.style.borderColor === 'rgb(255, 107, 107)') {
                validateMembershipForm(e.target.closest('form'));
            }
        }
    });
});
