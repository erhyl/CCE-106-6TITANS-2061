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

      // Show modal
      bookingModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
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
  bookingForm.addEventListener("submit", function (e) {
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

    // Show loading
    showLoading();

    // For video-call session, generate a room and redirect
    if (bookingData.sessionType === "video-call") {
      const roomId = Math.random().toString(36).slice(2, 10);
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      bookings.push({
        type: "video-call",
        roomId,
        coachName: bookingData.coachName,
        preferredDate: bookingData.preferredDate,
        preferredTime: bookingData.preferredTime,
        memberEmail: bookingData.memberEmail,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("bookings", JSON.stringify(bookings));

      hideLoading();
      window.location.href = `call.html?room=${encodeURIComponent(roomId)}`;
      return;
    }

    // Simulate API call for other session types
    setTimeout(() => {
      hideLoading();
      alert(`Session booked successfully with ${bookingData.coachName}!`);
      bookingModal.style.display = "none";
      document.body.style.overflow = "auto";
      this.reset();
    }, 800);
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
      if (modal.style.display === "block") {
        modal.style.display = "none";
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
