// Workout Plans Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const choosePlanBtns = document.querySelectorAll(".choose-plan");
  const planModal = document.getElementById("planModal");
  const closeModal = document.querySelector(".close");
  const closeModalBtn = document.getElementById("closeModal");
  const selectPlanBtn = document.getElementById("selectPlan");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");

  // Tab switching functionality
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all tabs and contents
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab and corresponding content
      this.classList.add("active");
      document.getElementById(targetTab + "Plans").classList.add("active");
    });
  });

  // Plan selection functionality
  choosePlanBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const planCard = this.closest(".plan-card");
      const planName = planCard.querySelector(".plan-name").textContent;
      const planDescription =
        planCard.querySelector(".plan-description").textContent;
      const planIcon = planCard.querySelector(".plan-icon").textContent;
      const planDetails = planCard.querySelectorAll(".plan-detail");

      // Get plan details
      const duration = planDetails[0].textContent.trim();
      const timeOrMeals = planDetails[1].textContent.trim();

      // Determine if it's a workout or diet plan
      const isWorkoutPlan = planCard.closest("#workoutPlans") !== null;

      // Populate modal
      modalTitle.textContent = planName;
      modalContent.innerHTML = `
                <div class="plan-modal-header">
                    <div class="plan-modal-icon">${planIcon}</div>
                    <div class="plan-modal-info">
                        <h3>${planName}</h3>
                        <p>${planDescription}</p>
                    </div>
                </div>
                <div class="plan-modal-details">
                    <div class="plan-detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>Duration: ${duration}</span>
                    </div>
                    <div class="plan-detail-item">
                        <i class="fas ${
                          isWorkoutPlan ? "fa-clock" : "fa-utensils"
                        }"></i>
                        <span>${
                          isWorkoutPlan ? "Session Length" : "Meals per Day"
                        }: ${timeOrMeals}</span>
                    </div>
                </div>
                <div class="plan-modal-features">
                    <h4>What's Included:</h4>
                    <ul>
                        ${
                          isWorkoutPlan
                            ? getWorkoutFeatures(planName)
                            : getDietFeatures(planName)
                        }
                    </ul>
                </div>
                <div class="plan-modal-benefits">
                    <h4>Benefits:</h4>
                    <ul>
                        ${
                          isWorkoutPlan
                            ? getWorkoutBenefits(planName)
                            : getDietBenefits(planName)
                        }
                    </ul>
                </div>
            `;

      // Show modal
      planModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  // Close modal
  closeModal.addEventListener("click", function () {
    planModal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  closeModalBtn.addEventListener("click", function () {
    planModal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === planModal) {
      planModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Select plan functionality
  selectPlanBtn.addEventListener("click", function () {
    const planName = modalTitle.textContent;

    // Show loading
    showLoading();

    // Simulate API call
    setTimeout(() => {
      hideLoading();
      alert(
        `Great choice! You've selected the ${planName} plan. You will receive detailed instructions via email shortly.`
      );
      planModal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 2000);
  });

  // Add modal styles
  const modalStyle = document.createElement("style");
  modalStyle.textContent = `
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .plan-modal-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #333;
        }
        
        .plan-modal-icon {
            font-size: 3rem;
            color: #ffd700;
        }
        
        .plan-modal-info h3 {
            color: #ffffff;
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        .plan-modal-info p {
            color: #cccccc;
            margin: 0;
        }
        
        .plan-modal-details {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .plan-detail-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #cccccc;
        }
        
        .plan-detail-item i {
            color: #ffd700;
        }
        
        .plan-modal-features,
        .plan-modal-benefits {
            margin-bottom: 1.5rem;
        }
        
        .plan-modal-features h4,
        .plan-modal-benefits h4 {
            color: #ffd700;
            margin-bottom: 1rem;
        }
        
        .plan-modal-features ul,
        .plan-modal-benefits ul {
            list-style: none;
            padding: 0;
        }
        
        .plan-modal-features li,
        .plan-modal-benefits li {
            color: #cccccc;
            margin-bottom: 0.5rem;
            padding-left: 1.5rem;
            position: relative;
        }
        
        .plan-modal-features li::before,
        .plan-modal-benefits li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #4CAF50;
            font-weight: bold;
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #333;
        }
        
        @media (max-width: 768px) {
            .plan-modal-details {
                flex-direction: column;
                gap: 1rem;
            }
            
            .modal-actions {
                flex-direction: column;
            }
        }
    `;
  document.head.appendChild(modalStyle);
});

// Helper functions for plan features and benefits
function getWorkoutFeatures(planName) {
  const features = {
    "Beginner Strength": [
      "Progressive weight training program",
      "Form correction and safety tips",
      "Equipment alternatives for home gyms",
      "Weekly progress tracking",
    ],
    "Fat Burn HIIT": [
      "High-intensity interval training",
      "Cardio and strength combinations",
      "Calorie burn optimization",
      "Quick 30-minute sessions",
    ],
    "Cardio Blast": [
      "Heart rate zone training",
      "Variety of cardio exercises",
      "Endurance building program",
      "Low-impact options included",
    ],
    "Advanced Strength": [
      "Periodized training program",
      "Advanced lifting techniques",
      "Plateau-breaking strategies",
      "Competition preparation",
    ],
    "Yoga Flow": [
      "Flexibility and mobility work",
      "Breathing techniques",
      "Mindfulness practices",
      "Stress reduction methods",
    ],
    CrossFit: [
      "Functional fitness movements",
      "High-intensity workouts",
      "Community challenges",
      "Scalable difficulty levels",
    ],
  };

  return features[planName]
    ? features[planName].map((feature) => `<li>${feature}</li>`).join("")
    : "<li>Customized workout plan</li>";
}

function getWorkoutBenefits(planName) {
  const benefits = {
    "Beginner Strength": [
      "Build foundational strength",
      "Improve muscle tone",
      "Boost metabolism",
      "Increase bone density",
    ],
    "Fat Burn HIIT": [
      "Burn maximum calories",
      "Improve cardiovascular health",
      "Build lean muscle",
      "Boost metabolism for hours",
    ],
    "Cardio Blast": [
      "Strengthen heart and lungs",
      "Improve endurance",
      "Burn calories efficiently",
      "Reduce stress",
    ],
    "Advanced Strength": [
      "Break through plateaus",
      "Build maximum strength",
      "Improve power output",
      "Enhance athletic performance",
    ],
    "Yoga Flow": [
      "Improve flexibility",
      "Reduce stress and anxiety",
      "Enhance balance and coordination",
      "Promote mindfulness",
    ],
    CrossFit: [
      "Improve overall fitness",
      "Build functional strength",
      "Enhance endurance",
      "Join a supportive community",
    ],
  };

  return benefits[planName]
    ? benefits[planName].map((benefit) => `<li>${benefit}</li>`).join("")
    : "<li>Improved fitness and health</li>";
}

function getDietFeatures(planName) {
  const features = {
    "Weight Loss": [
      "Calorie-controlled meal plans",
      "Balanced macronutrients",
      "Shopping lists and recipes",
      "Portion control guidelines",
    ],
    "Muscle Building": [
      "High-protein meal plans",
      "Pre and post-workout nutrition",
      "Supplement recommendations",
      "Meal timing strategies",
    ],
    Vegan: [
      "Plant-based protein sources",
      "Nutrient-dense recipes",
      "Vitamin B12 guidance",
      "Sustainable eating tips",
    ],
    Keto: [
      "Low-carb meal plans",
      "Ketosis tracking guide",
      "Fat adaptation tips",
      "Electrolyte management",
    ],
    Mediterranean: [
      "Heart-healthy recipes",
      "Olive oil and fish focus",
      "Antioxidant-rich foods",
      "Portion control guidance",
    ],
    "Intermittent Fasting": [
      "Fasting schedule options",
      "Meal timing strategies",
      "Hydration guidelines",
      "Fasting benefits explanation",
    ],
  };

  return features[planName]
    ? features[planName].map((feature) => `<li>${feature}</li>`).join("")
    : "<li>Customized nutrition plan</li>";
}

function getDietBenefits(planName) {
  const benefits = {
    "Weight Loss": [
      "Sustainable weight reduction",
      "Improved energy levels",
      "Better portion control",
      "Healthier relationship with food",
    ],
    "Muscle Building": [
      "Optimal muscle growth",
      "Faster recovery times",
      "Increased strength gains",
      "Better workout performance",
    ],
    Vegan: [
      "Reduced inflammation",
      "Lower cholesterol levels",
      "Environmental sustainability",
      "Rich in antioxidants",
    ],
    Keto: [
      "Rapid fat loss",
      "Improved mental clarity",
      "Stable blood sugar levels",
      "Reduced hunger cravings",
    ],
    Mediterranean: [
      "Heart disease prevention",
      "Improved brain health",
      "Longevity benefits",
      "Reduced inflammation",
    ],
    "Intermittent Fasting": [
      "Improved insulin sensitivity",
      "Enhanced autophagy",
      "Simplified meal planning",
      "Potential longevity benefits",
    ],
  };

  return benefits[planName]
    ? benefits[planName].map((benefit) => `<li>${benefit}</li>`).join("")
    : "<li>Improved health and nutrition</li>";
}
