// Class Schedules Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const bookingModal = document.getElementById("bookingModal");
  const bookingForm = document.getElementById("bookingForm");
  const closeModal = document.querySelector(".close");

  // Day filter functionality (works with dynamic cards too)
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");

      const selectedDay = this.getAttribute("data-day");

      // Filter class cards
      document.querySelectorAll('.class-card').forEach((card) => {
        if (
          selectedDay === "all" ||
          card.getAttribute("data-day") === selectedDay
        ) {
          card.style.display = "block";
          card.style.animation = "fadeIn 0.5s ease-in";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Book class functionality (event delegation for dynamic content)
  document.addEventListener('click', async function(e){
    const btn = e.target.closest('.book-class');
    if (!btn) return;
    const classCard = btn.closest('.class-card');
    if (!classCard) return;
    const className = classCard.querySelector('.class-name')?.textContent || '';
    const classTime = classCard.querySelector('.class-time')?.textContent || '';
    const instructor = classCard.querySelector('.class-detail span')?.textContent || '';
    document.getElementById('className').value = className;
    document.getElementById('classTime').value = classTime;
    document.getElementById('instructor').value = instructor;
    // Autofill member name/email from auth
    try {
      const auth = window.firebaseAuth;
      const rtdb = window.firebaseRtdb;
      const { ref, get, child } = window.firebaseRT || {};
      const user = auth && auth.currentUser;
      if (user && rtdb && ref && get && child) {
        const snap = await get(child(ref(rtdb), 'users/' + user.uid));
        const data = snap.exists() ? snap.val() : {};
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || (user.email ? user.email.split('@')[0] : '');
        const email = data.email || user.email || '';
        const nameInput = document.getElementById('memberName');
        const emailInput = document.getElementById('memberEmail');
        if (nameInput) { nameInput.value = fullName; nameInput.readOnly = true; }
        if (emailInput) { emailInput.value = email; emailInput.readOnly = true; }
      }
    } catch {}

    bookingModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  // Close modal
  closeModal.addEventListener("click", function () {
    bookingModal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === bookingModal) {
      bookingModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Handle form submission
  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const bookingData = {
      className: formData.get("className"),
      classTime: formData.get("classTime"),
      instructor: formData.get("instructor"),
      memberName: formData.get("memberName"),
      memberEmail: formData.get("memberEmail"),
      memberPhone: formData.get("memberPhone"),
    };

    const auth = window.firebaseAuth;
    const rtdb = window.firebaseRtdb;
    const { ref, set, push, get, child } = window.firebaseRT || {};
    if (!auth || !rtdb || !ref || !set || !push) {
      alert('Service unavailable. Please refresh.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to book classes.');
      return;
    }

    // Membership gating
    try {
      if (get) {
        const userSnap = await get(child(ref(rtdb), 'users/' + user.uid));
        const userData = userSnap.exists() ? userSnap.val() : null;
        if (!userData || !userData.membership || userData.membership.status !== 'active') {
          alert('Class booking requires an active membership.');
          return;
        }
      }
    } catch {}

    showLoading();
    try {
      // Create booking in RTDB
      const key = push(ref(rtdb, 'bookings')).key;
      await set(ref(rtdb, `bookings/${key}`), {
        id: key,
        type: 'class',
        memberId: user.uid,
        className: bookingData.className,
        classTime: bookingData.classTime,
        instructor: bookingData.instructor,
        status: 'pending',
        createdAt: Date.now()
      });

      // Notification to member
      const notifKey = push(ref(rtdb, 'notifications/' + user.uid)).key;
      await set(ref(rtdb, `notifications/${user.uid}/${notifKey}`), {
        type: 'class',
        message: `Class booking requested: ${bookingData.className}`,
        data: { bookingId: key },
        read: false,
        createdAt: Date.now()
      });

      // Audit event
      const evtKey = push(ref(rtdb, 'events/' + user.uid)).key;
      await set(ref(rtdb, `events/${user.uid}/${evtKey}`), {
        action: 'class_booked',
        details: { className: bookingData.className },
        page: 'classes',
        createdAt: Date.now()
      });

      hideLoading();
      if (window.Utils && window.Utils.showToast) {
        window.Utils.showToast('Class booked successfully!', 'success');
      } else {
        alert('Class booked successfully!');
      }
      bookingModal.style.display = "none";
      document.body.style.overflow = "auto";
      this.reset();
    } catch (err) {
      hideLoading();
      if (window.Utils && window.Utils.showToast) {
        window.Utils.showToast('Booking failed: ' + err.message, 'error');
      } else {
        alert('Booking failed: ' + err.message);
      }
    }
  });

  // Add fade-in animation CSS
  const style = document.createElement("style");
  style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .class-card {
            transition: all 0.3s ease;
        }
        
        .class-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
        }
    `;
  document.head.appendChild(style);
});

// Modal styles
const modalStyle = document.createElement("style");
modalStyle.textContent = `
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
    }

    .modal-content {
        background-color: #1a1a1a;
        margin: 5% auto;
        padding: 2rem;
        border: 1px solid #333;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        position: relative;
        animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        position: absolute;
        right: 20px;
        top: 15px;
        cursor: pointer;
        transition: color 0.3s ease;
    }

    .close:hover {
        color: #ffd700;
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

    .form-group input {
        width: 100%;
        padding: 12px;
        border: 1px solid #333;
        border-radius: 6px;
        background-color: #2a2a2a;
        color: #ffffff;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }

    .form-group input:focus {
        outline: none;
        border-color: #ffd700;
        box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
    }

    .form-group input[readonly] {
        background-color: #333;
        color: #999;
        cursor: not-allowed;
    }
`;
document.head.appendChild(modalStyle);
