// Online Gym Dashboard JavaScript

document.addEventListener("DOMContentLoaded", function () {
  const openMessagesBtn = document.getElementById("openMessages");
  const scheduleCallBtn = document.getElementById("scheduleCall");
  const uploadProgressBtn = document.getElementById("uploadProgress");
  const startWorkoutBtn = document.getElementById("startWorkout");
  const viewScheduleBtn = document.getElementById("viewSchedule");
  const nutritionLogBtn = document.getElementById("nutritionLog");

  const messagingModal = document.getElementById("messagingModal");
  const progressModal = document.getElementById("progressModal");
  const closeModalBtns = document.querySelectorAll(".close");

  const messageInput = document.getElementById("messageInput");
  const sendMessageBtn = document.getElementById("sendMessage");
  const chatMessages = document.getElementById("chatMessages");
  const progressForm = document.getElementById("progressForm");

  // Open modal based on URL hash (when navigated from dashboard)
  if (window.location.hash === "#messages") {
    messagingModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  } else if (window.location.hash === "#upload") {
    progressModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  // Open messaging modal
  openMessagesBtn.addEventListener("click", function () {
    messagingModal.style.display = "block";
    document.body.style.overflow = "hidden";
  });

  // Schedule call functionality
  scheduleCallBtn.addEventListener("click", function () {
    window.location.href = "coaching.html";
  });

  // Upload progress functionality
  uploadProgressBtn.addEventListener("click", function () {
    progressModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  // Start workout functionality
  startWorkoutBtn.addEventListener("click", function () {
    window.location.href = "workouts.html";
  });

  // View schedule functionality
  viewScheduleBtn.addEventListener("click", function () {
    window.location.href = "classes.html";
  });

  // Nutrition log functionality
  nutritionLogBtn.addEventListener("click", function () {
    window.location.href = "workouts.html";
  });

  // Close modals
  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest(".modal");
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    });
  });

  // Close modals when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Send message functionality
  sendMessageBtn.addEventListener("click", function () {
    sendMessage();
  });

  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Progress form submission
  progressForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const progressData = {
      type: formData.get("progressType"),
      value: formData.get("progressValue"),
      notes: formData.get("progressNotes"),
      file: formData.get("progressFile"),
    };

    // Show loading
    showLoading();

    // Simulate API call
    setTimeout(() => {
      hideLoading();
      alert(
        "Progress uploaded successfully! Your coach will review it shortly."
      );
      progressModal.style.display = "none";
      document.body.style.overflow = "auto";
      this.reset();
    }, 2000);
  });

  // Add messaging styles
  const messagingStyle = document.createElement("style");
  messagingStyle.textContent = `
        .messaging-modal {
            max-width: 1000px;
            max-height: 80vh;
        }
        
        .messaging-container {
            display: grid;
            grid-template-columns: 300px 1fr;
            height: 500px;
            border: 1px solid #333;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .chat-sidebar {
            background-color: #1a1a1a;
            border-right: 1px solid #333;
            padding: 1rem;
        }
        
        .chat-sidebar h3 {
            color: #ffd700;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .conversation-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .conversation-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .conversation-item:hover {
            background-color: #333;
        }
        
        .conversation-item.active {
            background-color: #ffd700;
            color: #0a0a0a;
        }
        
        .conversation-avatar {
            width: 40px;
            height: 40px;
            background-color: #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }
        
        .conversation-info {
            flex: 1;
            min-width: 0;
        }
        
        .conversation-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }
        
        .conversation-preview {
            font-size: 0.9rem;
            color: #999;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .conversation-item.active .conversation-preview {
            color: #666;
        }
        
        .conversation-time {
            font-size: 0.8rem;
            color: #999;
        }
        
        .conversation-item.active .conversation-time {
            color: #666;
        }
        
        .chat-main {
            display: flex;
            flex-direction: column;
            background-color: #0a0a0a;
        }
        
        .chat-header {
            padding: 1rem;
            border-bottom: 1px solid #333;
            background-color: #1a1a1a;
        }
        
        .chat-user-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .chat-avatar {
            width: 40px;
            height: 40px;
            background-color: #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }
        
        .chat-name {
            font-weight: 600;
            color: #ffffff;
        }
        
        .chat-status {
            font-size: 0.9rem;
            color: #4CAF50;
        }
        
        .chat-messages {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .message {
            max-width: 70%;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .message.sent {
            align-self: flex-end;
        }
        
        .message.received {
            align-self: flex-start;
        }
        
        .message-content {
            padding: 0.75rem 1rem;
            border-radius: 18px;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .message.sent .message-content {
            background-color: #ffd700;
            color: #0a0a0a;
        }
        
        .message.received .message-content {
            background-color: #333;
            color: #ffffff;
        }
        
        .message-time {
            font-size: 0.8rem;
            color: #999;
            padding: 0 0.5rem;
        }
        
        .chat-input {
            display: flex;
            padding: 1rem;
            border-top: 1px solid #333;
            background-color: #1a1a1a;
        }
        
        .chat-input input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #333;
            border-radius: 20px;
            background-color: #2a2a2a;
            color: #ffffff;
            font-size: 0.9rem;
        }
        
        .chat-input input:focus {
            outline: none;
            border-color: #ffd700;
        }
        
        .chat-input button {
            margin-left: 0.5rem;
            padding: 0.75rem 1.5rem;
            background-color: #ffd700;
            color: #0a0a0a;
            border: none;
            border-radius: 20px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .chat-input button:hover {
            background-color: #ffed4e;
        }
        
        @media (max-width: 768px) {
            .messaging-container {
                grid-template-columns: 1fr;
                height: 400px;
            }
            
            .chat-sidebar {
                display: none;
            }
        }
    `;
  document.head.appendChild(messagingStyle);

  // Add dashboard card animations
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

  // Observe dashboard cards for animation
  const dashboardCards = document.querySelectorAll(".dashboard-card");
  dashboardCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = `opacity 0.6s ease ${
      index * 0.1
    }s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });
});

// Send message function
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");
  const message = messageInput.value.trim();

  if (message) {
    // Create message element
    const messageElement = document.createElement("div");
    messageElement.className = "message sent";
    messageElement.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</div>
        `;

    // Add to chat
    chatMessages.appendChild(messageElement);

    // Clear input
    messageInput.value = "";

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate coach response after 2 seconds
    setTimeout(() => {
      const coachResponse = getCoachResponse(message);
      const responseElement = document.createElement("div");
      responseElement.className = "message received";
      responseElement.innerHTML = `
                <div class="message-content">${coachResponse}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</div>
            `;

      chatMessages.appendChild(responseElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 2000);
  }
}

// Get coach response based on message
function getCoachResponse(message) {
  const responses = [
    "That's great to hear! Keep up the excellent work!",
    "I'm proud of your progress. Consistency is key!",
    "How are you feeling after that workout?",
    "Remember to stay hydrated and get enough rest.",
    "Your dedication is really paying off!",
    "Let me know if you need any modifications to your routine.",
    "Great job! What's your next goal?",
    "I'm here to support you every step of the way!",
    "That's exactly the mindset we need for success!",
    "Keep pushing yourself, but listen to your body too.",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Add real-time updates simulation
function simulateRealTimeUpdates() {
  // Simulate new messages
  setInterval(() => {
    if (Math.random() < 0.1) {
      // 10% chance every 30 seconds
      const chatMessages = document.getElementById("chatMessages");
      if (chatMessages && chatMessages.children.length > 0) {
        const responses = [
          "How's your workout going?",
          "Don't forget to log your progress!",
          "Great job on your consistency!",
          "Any questions about your routine?",
          "Keep up the amazing work!",
        ];

        const message = responses[Math.floor(Math.random() * responses.length)];
        const messageElement = document.createElement("div");
        messageElement.className = "message received";
        messageElement.innerHTML = `
                    <div class="message-content">${message}</div>
                    <div class="message-time">${new Date().toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}</div>
                `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  }, 30000);
}

// Start real-time updates
document.addEventListener("DOMContentLoaded", function () {
  simulateRealTimeUpdates();
});
