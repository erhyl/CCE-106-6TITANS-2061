// Authentication JavaScript

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const coachLoginForm = document.getElementById("coachLoginForm");
  const passwordToggles = document.querySelectorAll(".password-toggle");
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  const passwordStrength = document.getElementById("passwordStrength");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Password toggle functionality
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input");
      const icon = this.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });

  // Password strength checker
  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;
      const strength = checkPasswordStrength(password);
      updatePasswordStrength(strength);
    });
  }

  // Confirm password validation
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", function () {
      const password = passwordInput.value;
      const confirmPassword = this.value;

      if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = "#ff6b6b";
        showPasswordError("Passwords do not match");
      } else {
        this.style.borderColor = "#333";
        hidePasswordError();
      }
    });
  }

  // Login, register, and coach forms are now handled by Firebase in the HTML files.

  // Social login buttons
  const socialButtons = document.querySelectorAll(".btn-social");
  socialButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const provider = this.classList.contains("google-btn")
        ? "google"
        : "facebook";
      handleSocialLogin(provider);
    });
  });

  // Apply to become a coach link (coach-login page)
  const applyCoachLink = document.getElementById("applyCoachLink");
  if (applyCoachLink) {
    applyCoachLink.addEventListener("click", function (e) {
      e.preventDefault();
      showCoachApplicationModal();
    });
  }
});


// Handle social login
function handleSocialLogin(provider) {
  showLoading();

  setTimeout(() => {
    hideLoading();
    alert(
      `${
        provider.charAt(0).toUpperCase() + provider.slice(1)
      } login would be implemented here.`
    );
  }, 1500);
}

// Validate login form
function validateLoginForm(data) {
  if (!data.email || !data.password) {
    alert("Please fill in all required fields.");
    return false;
  }

  if (!isValidEmail(data.email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  return true;
}

// Validate registration form
function validateRegistrationForm(data) {
  if (
    !data.firstName ||
    !data.lastName ||
    !data.email ||
    !data.password ||
    !data.confirmPassword ||
    !data.accountType
  ) {
    alert("Please fill in all required fields.");
    return false;
  }

  if (!isValidEmail(data.email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  if (data.password !== data.confirmPassword) {
    alert("Passwords do not match.");
    return false;
  }

  if (data.password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return false;
  }

  if (!data.agreeTerms) {
    alert("Please agree to the Terms of Service and Privacy Policy.");
    return false;
  }

  return true;
}

// Validate coach login form
function validateCoachLoginForm(data) {
  if (!data.coachId || !data.password) {
    alert("Please fill in all required fields.");
    return false;
  }

  return true;
}

// Check password strength
function checkPasswordStrength(password) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/)) strength++;
  if (password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^a-zA-Z0-9]/)) strength++;

  return strength;
}

// Update password strength indicator
function updatePasswordStrength(strength) {
  if (!passwordStrength) return;

  const strengthFill = passwordStrength.querySelector(".strength-fill");
  const strengthText = passwordStrength.querySelector(".strength-text");

  const strengthLevels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "#ff6b6b",
    "#ffa726",
    "#ffeb3b",
    "#66bb6a",
    "#4caf50",
  ];

  strengthFill.style.width = `${(strength / 5) * 100}%`;
  strengthFill.style.backgroundColor =
    strengthColors[strength - 1] || "#ff6b6b";
  strengthText.textContent = strengthLevels[strength - 1] || "Very Weak";
}

// Show password error
function showPasswordError(message) {
  let errorDiv = document.querySelector(".password-error");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "password-error";
    errorDiv.style.color = "#ff6b6b";
    errorDiv.style.fontSize = "0.8rem";
    errorDiv.style.marginTop = "0.5rem";
    document
      .getElementById("confirmPassword")
      .parentElement.appendChild(errorDiv);
  }
  errorDiv.textContent = message;
}

// Hide password error
function hidePasswordError() {
  const errorDiv = document.querySelector(".password-error");
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}



// Add auth styles
const authStyle = document.createElement("style");
authStyle.textContent = `
    .auth-section {
        padding: 120px 0 80px;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
    }
    
    .auth-container {
        max-width: 500px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .auth-card {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .auth-card.coach-card {
        border-color: #ffd700;
        box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
    }
    
    .auth-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .auth-header .logo-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .auth-header h1 {
        color: #ffd700;
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .auth-header p {
        color: #cccccc;
        font-size: 1rem;
    }
    
    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .form-group label {
        color: #ffd700;
        font-weight: 600;
        font-size: 0.9rem;
    }
    
    .input-group {
        position: relative;
        display: flex;
        align-items: center;
    }
    
    .input-group i {
        position: absolute;
        left: 15px;
        color: #999;
        z-index: 2;
    }
    
    .input-group input,
    .input-group select {
        width: 100%;
        padding: 15px 15px 15px 45px;
        border: 1px solid #333;
        border-radius: 8px;
        background-color: #2a2a2a;
        color: #ffffff;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
    
    .input-group input:focus,
    .input-group select:focus {
        outline: none;
        border-color: #ffd700;
        box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
    }
    
    .password-toggle {
        position: absolute;
        right: 15px;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        z-index: 2;
    }
    
    .password-toggle:hover {
        color: #ffd700;
    }
    
    .password-strength {
        margin-top: 0.5rem;
    }
    
    .strength-bar {
        width: 100%;
        height: 4px;
        background-color: #333;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    
    .strength-fill {
        height: 100%;
        background-color: #ff6b6b;
        transition: all 0.3s ease;
    }
    
    .strength-text {
        font-size: 0.8rem;
        color: #999;
    }
    
    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #cccccc;
        font-size: 0.9rem;
        cursor: pointer;
    }
    
    .checkbox-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #ffd700;
    }
    
    .forgot-password {
        color: #ffd700;
        text-decoration: none;
        font-size: 0.9rem;
    }
    
    .forgot-password:hover {
        text-decoration: underline;
    }
    
    .auth-btn {
        width: 100%;
        padding: 15px;
        font-size: 1.1rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .auth-divider {
        text-align: center;
        position: relative;
        margin: 1rem 0;
    }
    
    .auth-divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background-color: #333;
    }
    
    .auth-divider span {
        background-color: #1a1a1a;
        padding: 0 1rem;
        color: #999;
        font-size: 0.9rem;
    }
    
    .social-login {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .btn-social {
        width: 100%;
        padding: 15px;
        border: 1px solid #333;
        border-radius: 8px;
        background-color: #2a2a2a;
        color: #ffffff;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .btn-social:hover {
        background-color: #333;
        border-color: #ffd700;
    }
    
    .google-btn:hover {
        background-color: #db4437;
        border-color: #db4437;
    }
    
    .facebook-btn:hover {
        background-color: #4267B2;
        border-color: #4267B2;
    }
    
    .auth-footer {
        text-align: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #333;
    }
    
    .auth-footer p {
        color: #cccccc;
        margin-bottom: 0.5rem;
    }
    
    .auth-footer a {
        color: #ffd700;
        text-decoration: none;
    }
    
    .auth-footer a:hover {
        text-decoration: underline;
    }
    
    .coach-features {
        margin: 2rem 0;
        padding: 1.5rem;
        background-color: #0a0a0a;
        border-radius: 8px;
        border: 1px solid #333;
    }
    
    .coach-features h3 {
        color: #ffd700;
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
    
    .coach-features ul {
        list-style: none;
        padding: 0;
    }
    
    .coach-features li {
        color: #cccccc;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .coach-features li i {
        color: #4CAF50;
        font-size: 0.9rem;
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
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .form-options {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .auth-card {
            padding: 1.5rem;
        }
    }
`;
document.head.appendChild(authStyle);

// --- Coach Application Modal ---
function showCoachApplicationModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content" role="dialog" aria-modal="true">
      <span class="close" aria-label="Close">&times;</span>
      <h2>Apply to Become a Coach</h2>
      <form id="coachApplicationForm" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="appFirstName">First Name</label>
            <div class="input-group">
              <i class="fas fa-user"></i>
              <input type="text" id="appFirstName" name="firstName" required />
            </div>
          </div>
          <div class="form-group">
            <label for="appLastName">Last Name</label>
            <div class="input-group">
              <i class="fas fa-user"></i>
              <input type="text" id="appLastName" name="lastName" required />
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="appEmail">Email</label>
          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input type="email" id="appEmail" name="email" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="appPassword">Password</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input type="password" id="appPassword" name="password" required />
            </div>
          </div>
          <div class="form-group">
            <label for="appConfirmPassword">Confirm Password</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input type="password" id="appConfirmPassword" name="confirmPassword" required />
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="appExperience">Experience</label>
          <div class="input-group">
            <i class="fas fa-clipboard"></i>
            <select id="appExperience" name="experience" required>
              <option value="">Select years of experience</option>
              <option value="0-1">0-1 years</option>
              <option value="2-4">2-4 years</option>
              <option value="5-9">5-9 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="appBio">Short Bio</label>
          <textarea id="appBio" name="bio" rows="3" placeholder="Tell us about your coaching background..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit Application</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", function () {
    modal.remove();
    document.body.style.overflow = "auto";
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = "auto";
    }
  });

  const form = modal.querySelector("#coachApplicationForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      experience: formData.get("experience"),
      bio: formData.get("bio"),
    };

    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.confirmPassword || !data.experience || !data.bio) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!isValidEmail(data.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    showLoading();
    setTimeout(() => {
      try {
        const users = getStoredUsers();
        const existing = findUserByEmail(data.email);
        if (existing) {
          // Upgrade existing member to coach
          existing.firstName = data.firstName;
          existing.lastName = data.lastName;
          existing.password = data.password; // keep/update password
          existing.accountType = "coach";
          existing.coachId = existing.coachId || generateCoachId(data.firstName, data.lastName);
          existing.experience = data.experience;
          existing.bio = data.bio;
          saveStoredUsers(users);


        } else {
          // Create new coach account
          const coachId = generateCoachId(data.firstName, data.lastName);
          users.push({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            accountType: "coach",
            coachId,
            experience: data.experience,
            bio: data.bio,
          });
          saveStoredUsers(users);


        }

        hideLoading();
        alert("Application approved! Your coach account is ready.");
        modal.remove();
        document.body.style.overflow = "auto";
        window.location.href = "coach-dashboard.html";
      } catch (err) {
        console.error(err);
        hideLoading();
        alert("Could not process application. Please try again.");
      }
    }, 800);
  });
}
