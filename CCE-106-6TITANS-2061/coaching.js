// Coaching Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  const bookSessionBtns = document.querySelectorAll(".book-session");
  const bookingModal = document.getElementById("bookingModal");
  const bookingForm = document.getElementById("bookingForm");
  const closeModal = document.querySelector(".close");
  const coachNameInput = document.getElementById("coachName");

  // Book session functionality
  bookSessionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const coachName = this.getAttribute("data-coach");

      // Populate coach name in modal
      coachNameInput.value = coachName;

      // Show modal with animation
      bookingModal.classList.add("show");
      document.body.style.overflow = "hidden";
    });
  });

  // Close modal
  closeModal.addEventListener("click", function () {
    bookingModal.classList.remove("show");
    document.body.style.overflow = "auto";
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === bookingModal) {
      bookingModal.classList.remove("show");
      document.body.style.overflow = "auto";
    }
  });

  // Handle form submission
  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const bookingData = {
      coachName: formData.get("coachName"),
      sessionType: formData.get("sessionType"),
      preferredDate: formData.get("preferredDate"),
      preferredTime: formData.get("preferredTime"),
      memberName: formData.get("memberName"),
      memberEmail: formData.get("memberEmail"),
      memberPhone: formData.get("memberPhone"),
      goals: formData.get("goals"),
      experience: formData.get("experience"),
    };

    // Validate required fields
    if (
      !bookingData.sessionType ||
      !bookingData.preferredDate ||
      !bookingData.preferredTime ||
      !bookingData.memberName ||
      !bookingData.memberEmail ||
      !bookingData.memberPhone
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const auth = window.firebaseAuth;
    const rtdb = window.firebaseRtdb;
    const { ref, set, push, get, child } = window.firebaseRT || {};
    if (!auth || !rtdb || !ref || !set || !push) {
      alert('Service unavailable. Please refresh the page.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to book a session.');
      return;
    }

    // Membership gating
    try {
      if (get) {
        const userSnap = await get(child(ref(rtdb), 'users/' + user.uid));
        const userData = userSnap.exists() ? userSnap.val() : null;
        if (!userData || !userData.membership || userData.membership.status !== 'active') {
          alert('Booking requires an active membership.');
          return;
        }
      }
    } catch {}

    showLoading();
    try {
      // Get coach ID from the form
      const coachNameInput = document.getElementById('coachName');
      const coachId = coachNameInput ? coachNameInput.getAttribute('data-coach-id') : null;
      
      // Check if coach is trusted
      let isTrustedCoach = false;
      try {
        const coachProfilesSnapshot = await get(ref(rtdb, 'coachProfiles'));
        if (coachProfilesSnapshot.exists()) {
          const coachProfiles = coachProfilesSnapshot.val();
          const coachProfile = Object.values(coachProfiles).find(profile => 
            profile.coachId === coachId || profile.coachUid === coachId
          );
          isTrustedCoach = coachProfile?.trustedCoach || false;
        }
      } catch (error) {
        console.error('Error checking coach trust status:', error);
      }

      // Create booking in RTDB under coachBookings
      const key = push(ref(rtdb, 'coachBookings')).key;
      const initialStatus = isTrustedCoach ? 'pending_coach_approval' : 'pending_admin_approval';
      const workflowStage = isTrustedCoach ? 'coach_review' : 'admin_review';
      
      await set(ref(rtdb, `coachBookings/${key}`), {
        id: key,
        coachId: coachId, // Link to coach profile
        coachName: bookingData.coachName,
        sessionType: bookingData.sessionType,
        preferredDate: bookingData.preferredDate,
        preferredTime: bookingData.preferredTime,
        memberName: bookingData.memberName,
        memberEmail: bookingData.memberEmail,
        memberPhone: bookingData.memberPhone,
        goals: bookingData.goals || '',
        experience: bookingData.experience || '',
        memberId: user.uid,
        userId: user.uid, // Added for messaging compatibility
        status: initialStatus, // Trusted coaches skip admin approval
        workflowStage: workflowStage,
        bookingDate: new Date().toISOString(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Notification to member
      const notifKey = push(ref(rtdb, 'notifications/' + user.uid)).key;
      await set(ref(rtdb, `notifications/${user.uid}/${notifKey}`), {
        type: 'booking',
        message: isTrustedCoach 
          ? `Session request with ${bookingData.coachName} submitted - Awaiting coach confirmation`
          : `Session request with ${bookingData.coachName} submitted - Awaiting admin approval`,
        data: { bookingId: key },
        read: false,
        createdAt: Date.now()
      });

      // Notification to all admins (only for non-trusted coaches)
      if (!isTrustedCoach) {
        const usersSnap = await get(ref(rtdb, 'users'));
        if (usersSnap.exists()) {
          const users = usersSnap.val();
          for (const [uid, userData] of Object.entries(users)) {
            if (userData.role === 'admin') {
              const adminNotifKey = push(ref(rtdb, `notifications/${uid}`)).key;
              await set(ref(rtdb, `notifications/${uid}/${adminNotifKey}`), {
                type: 'booking_pending',
                message: `New booking request from ${bookingData.memberName} for ${bookingData.coachName}`,
                data: { bookingId: key, memberId: user.uid },
                read: false,
                createdAt: Date.now()
              });
            }
          }
        }
      }

      // Notification to coach (for trusted coaches)
      if (isTrustedCoach) {
        // Find coach's UID from coach profiles
        const coachProfilesSnapshot = await get(ref(rtdb, 'coachProfiles'));
        if (coachProfilesSnapshot.exists()) {
          const coachProfiles = coachProfilesSnapshot.val();
          const coachProfile = Object.values(coachProfiles).find(profile => 
            profile.coachId === coachId || profile.coachUid === coachId
          );
          
          if (coachProfile && coachProfile.coachUid) {
            const coachNotifKey = push(ref(rtdb, `notifications/${coachProfile.coachUid}`)).key;
            await set(ref(rtdb, `notifications/${coachProfile.coachUid}/${coachNotifKey}`), {
              type: 'booking_pending_approval',
              message: `New booking request: ${bookingData.memberName} on ${bookingData.preferredDate} at ${bookingData.preferredTime} - Please accept or reschedule`,
              bookingId: key,
              read: false,
              createdAt: Date.now()
            });
          }
        }
      }

      // Audit event
      const evtKey = push(ref(rtdb, 'events/' + user.uid)).key;
      await set(ref(rtdb, `events/${user.uid}/${evtKey}`), {
        action: 'booking_created',
        details: { type: 'coach', coachName: bookingData.coachName, status: initialStatus },
        page: 'coaching',
        createdAt: Date.now()
      });

      hideLoading();
      if (window.Utils && window.Utils.showToast) {
        window.Utils.showToast(
          isTrustedCoach 
            ? `Booking request submitted! Awaiting coach confirmation.`
            : `Booking request submitted! Awaiting admin confirmation.`, 
          'success'
        );
      } else {
        alert(
          isTrustedCoach 
            ? `Booking request submitted! The coach will review your request shortly.`
            : `Booking request submitted! An admin will review your request shortly.`
        );
      }
      bookingModal.classList.remove("show");
      document.body.style.overflow = "auto";
      this.reset();
    } catch (err) {
      hideLoading();
      if (window.Utils && window.Utils.showToast) {
        window.Utils.showToast(`Booking failed: ${err.message}`, 'error');
      } else {
        alert('Booking failed: ' + err.message);
      }
    }
  });

  // Set minimum date to today
  const dateInput = document.getElementById("preferredDate");
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // Add form validation styles
  const formStyle = document.createElement("style");
  formStyle.textContent = `
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

        .form-group select option {
            background-color: #2a2a2a;
            color: #ffffff;
        }

        .coach-card {
            transition: all 0.3s ease;
        }

        .coach-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
        }

        .coach-avatar {
            transition: all 0.3s ease;
        }

        .coach-card:hover .coach-avatar {
            transform: scale(1.1);
            background-color: #ffd700;
            color: #0a0a0a;
        }

        .book-session {
            transition: all 0.3s ease;
        }

        .book-session:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }

        .badge {
            transition: all 0.3s ease;
        }

        .coach-card:hover .badge {
            background-color: #ffd700;
            color: #0a0a0a;
        }

        .stars {
            transition: all 0.3s ease;
        }

        .coach-card:hover .stars {
            transform: scale(1.1);
        }
    `;
  document.head.appendChild(formStyle);

  // Add coach card animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe coach cards for animation
  const coachCards = document.querySelectorAll(".coach-card");
  coachCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = `opacity 0.6s ease ${
      index * 0.1
    }s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });
});

// Add coach filtering functionality
function filterCoaches(specialization) {
  const coachCards = document.querySelectorAll(".coach-card");

  coachCards.forEach((card) => {
    const coachSpecialization = card
      .querySelector(".coach-specialization")
      .textContent.toLowerCase();

    if (
      specialization === "all" ||
      coachSpecialization.includes(specialization.toLowerCase())
    ) {
      card.style.display = "block";
      card.style.animation = "fadeIn 0.5s ease-in";
    } else {
      card.style.display = "none";
    }
  });
}

// Add search functionality
function searchCoaches(query) {
  const coachCards = document.querySelectorAll(".coach-card");
  const searchTerm = query.toLowerCase();

  coachCards.forEach((card) => {
    const coachName = card
      .querySelector(".coach-name")
      .textContent.toLowerCase();
    const specialization = card
      .querySelector(".coach-specialization")
      .textContent.toLowerCase();
    const description = card
      .querySelector(".coach-description")
      .textContent.toLowerCase();

    if (
      coachName.includes(searchTerm) ||
      specialization.includes(searchTerm) ||
      description.includes(searchTerm)
    ) {
      card.style.display = "block";
      card.style.animation = "fadeIn 0.5s ease-in";
    } else {
      card.style.display = "none";
    }
  });
}

// Add keyboard navigation for accessibility
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (modal.classList.contains("show")) {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
      }
    });
  }
});

// Add form field validation
function validateFormField(field) {
  const value = field.value.trim();
  const fieldName = field.name;

  // Remove existing error styling
  field.style.borderColor = "#333";

  if (field.hasAttribute("required") && !value) {
    field.style.borderColor = "#ff6b6b";
    return false;
  }

  // Email validation
  if (fieldName === "memberEmail" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      field.style.borderColor = "#ff6b6b";
      return false;
    }
  }

  // Phone validation
  if (fieldName === "memberPhone" && value) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
      field.style.borderColor = "#ff6b6b";
      return false;
    }
  }

  return true;
}

// Add real-time validation
document.addEventListener("DOMContentLoaded", function () {
  const formFields = document.querySelectorAll(
    "#bookingForm input, #bookingForm select, #bookingForm textarea"
  );

  formFields.forEach((field) => {
    field.addEventListener("blur", function () {
      validateFormField(this);
    });

    field.addEventListener("input", function () {
      if (this.style.borderColor === "rgb(255, 107, 107)") {
        validateFormField(this);
      }
    });
  });
});
