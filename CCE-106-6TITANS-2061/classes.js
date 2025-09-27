// Class Schedules Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const classCards = document.querySelectorAll(".class-card");
  const bookingModal = document.getElementById("bookingModal");
  const bookingForm = document.getElementById("bookingForm");
  const closeModal = document.querySelector(".close");
  const bookClassBtns = document.querySelectorAll(".book-class");

  // Day filter functionality
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");

      const selectedDay = this.getAttribute("data-day");

      // Filter class cards
      classCards.forEach((card) => {
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

  // Book class functionality
  bookClassBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const classCard = this.closest(".class-card");
      const className = classCard.querySelector(".class-name").textContent;
      const classTime = classCard.querySelector(".class-time").textContent;
      const instructor =
        classCard.querySelector(".class-detail span").textContent;

      // Populate modal with class details
      document.getElementById("className").value = className;
      document.getElementById("classTime").value = classTime;
      document.getElementById("instructor").value = instructor;

      // Show modal
      bookingModal.style.display = "block";
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
      className: formData.get("className"),
      classTime: formData.get("classTime"),
      instructor: formData.get("instructor"),
      memberName: formData.get("memberName"),
      memberEmail: formData.get("memberEmail"),
      memberPhone: formData.get("memberPhone"),
    };

    // Show loading
    showLoading();

    // Simulate API call
    setTimeout(() => {
      hideLoading();

      // Show success message
      alert(
        "Class booked successfully! You will receive a confirmation email shortly."
      );

      // Close modal and reset form
      bookingModal.style.display = "none";
      document.body.style.overflow = "auto";
      this.reset();
    }, 2000);
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
