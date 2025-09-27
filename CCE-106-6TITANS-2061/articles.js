// Articles Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const readMoreBtns = document.querySelectorAll(".read-more");
  const articleModal = document.getElementById("articleModal");
  const closeModal = document.querySelector(".close");
  const articleContent = document.getElementById("articleContent");

  // Tab switching functionality
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all tabs and contents
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab and corresponding content
      this.classList.add("active");
      document.getElementById(targetTab + "Articles").classList.add("active");
    });
  });

  // Read more functionality
  readMoreBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const articleCard = this.closest(".article-card");
      const title = articleCard.querySelector(".article-title").textContent;
      const description = articleCard.querySelector(
        ".article-description"
      ).textContent;
      const icon = articleCard.querySelector(".article-icon").textContent;
      const author = articleCard.querySelector(
        ".article-author span"
      ).textContent;
      const date = articleCard.querySelector(".article-date span").textContent;
      const category =
        articleCard.querySelector(".article-category").textContent;

      // Get full article content based on title
      const fullContent = getArticleContent(title);

      // Populate modal
      articleContent.innerHTML = `
                <div class="article-header">
                    <div class="article-icon-large">${icon}</div>
                    <div class="article-title-large">${title}</div>
                    <div class="article-meta-large">
                        <div class="article-author-large">
                            <i class="fas fa-user"></i>
                            <span>${author}</span>
                        </div>
                        <div class="article-date-large">
                            <i class="fas fa-calendar"></i>
                            <span>${date}</span>
                        </div>
                        <div class="article-category-large">${category}</div>
                    </div>
                </div>
                <div class="article-body">
                    <p class="article-intro">${description}</p>
                    ${fullContent}
                </div>
                <div class="article-actions">
                    <button class="btn btn-secondary" id="shareArticle">Share Article</button>
                    <button class="btn btn-primary" id="bookmarkArticle">Bookmark</button>
                </div>
            `;

      // Show modal
      articleModal.style.display = "block";
      document.body.style.overflow = "hidden";
    });
  });

  // Close modal
  closeModal.addEventListener("click", function () {
    articleModal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === articleModal) {
      articleModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Styles are now in assets/css/article.css

  // Add article card animations
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

  // Observe article cards for animation
  const articleCards = document.querySelectorAll(".article-card");
  articleCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = `opacity 0.6s ease ${
      index * 0.1
    }s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });
});

// Get full article content based on title
function getArticleContent(title) {
  const articles = {
    "10 Essential Exercises for Beginners": `
            <div class="article-section">
                <h3>Getting Started with Exercise</h3>
                <p>Starting a fitness journey can be overwhelming, but these 10 fundamental exercises will help you build a strong foundation. Each exercise targets multiple muscle groups and can be modified for any fitness level.</p>
                
                <h4>1. Bodyweight Squats</h4>
                <p>Stand with feet shoulder-width apart, lower your body as if sitting back into a chair, then return to standing. This exercise strengthens your legs, glutes, and core.</p>
                
                <h4>2. Push-ups</h4>
                <p>Start in a plank position, lower your chest to the ground, then push back up. Modify by doing knee push-ups or wall push-ups if needed.</p>
                
                <h4>3. Plank</h4>
                <p>Hold a straight line from head to heels, supporting your weight on your forearms and toes. This builds core strength and stability.</p>
                
                <div class="article-tip">
                    <h4>Pro Tip</h4>
                    <p>Focus on proper form over quantity. It's better to do 5 perfect squats than 20 with poor form.</p>
                </div>
                
                <h4>4. Lunges</h4>
                <p>Step forward with one leg, lowering your hips until both knees are bent at 90 degrees. Alternate legs for a complete lower body workout.</p>
                
                <h4>5. Glute Bridges</h4>
                <p>Lie on your back with knees bent, lift your hips up by squeezing your glutes. This exercise strengthens your posterior chain.</p>
                
                <h4>6. Mountain Climbers</h4>
                <p>Start in plank position, alternate bringing each knee to your chest. This provides cardio and core benefits.</p>
                
                <h4>7. Dead Bug</h4>
                <p>Lie on your back, extend opposite arm and leg while keeping your lower back pressed to the floor. This improves core stability.</p>
                
                <h4>8. Wall Sit</h4>
                <p>Slide down a wall until your thighs are parallel to the floor. Hold this position to build leg endurance.</p>
                
                <h4>9. Bird Dog</h4>
                <p>Start on hands and knees, extend opposite arm and leg while maintaining balance. This improves coordination and core strength.</p>
                
                <h4>10. Calf Raises</h4>
                <p>Stand on the edge of a step, rise up onto your toes, then lower below the step level. This strengthens your calves and improves balance.</p>
                
                <h3>Creating Your Routine</h3>
                <p>Start with 2-3 sets of 8-12 repetitions for each exercise. As you get stronger, increase repetitions or add resistance. Remember to warm up before exercising and cool down afterward.</p>
            </div>
        `,
    "Meal Prep Made Simple": `
            <div class="article-section">
                <h3>The Art of Meal Preparation</h3>
                <p>Meal prep is the secret weapon of successful fitness enthusiasts. By dedicating just 2 hours on Sunday, you can set yourself up for a week of healthy eating without the daily stress of cooking.</p>
                
                <h4>Step 1: Plan Your Meals</h4>
                <p>Start by choosing 2-3 protein sources, 3-4 vegetables, and 2-3 complex carbohydrates. This variety keeps meals interesting while ensuring nutritional balance.</p>
                
                <h4>Step 2: Create Your Shopping List</h4>
                <p>Write down everything you need, organized by store sections. This saves time and prevents impulse purchases.</p>
                
                <div class="article-tip">
                    <h4>Time-Saving Tip</h4>
                    <p>Choose vegetables that can be roasted together at the same temperature. Sweet potatoes, broccoli, and bell peppers all cook well at 400°F.</p>
                </div>
                
                <h4>Step 3: Batch Cooking</h4>
                <p>Cook proteins in large quantities using methods like baking, grilling, or slow cooking. Prepare grains like quinoa, brown rice, or oats in advance.</p>
                
                <h4>Step 4: Vegetable Prep</h4>
                <p>Wash, chop, and store vegetables in clear containers. Some vegetables like carrots and celery can be pre-cut and stored in water.</p>
                
                <h4>Step 5: Assembly and Storage</h4>
                <p>Portion meals into individual containers. Store proteins and vegetables separately to maintain freshness. Add sauces and dressings just before eating.</p>
                
                <h3>Sample Meal Prep Menu</h3>
                <ul>
                    <li><strong>Breakfast:</strong> Overnight oats with berries and nuts</li>
                    <li><strong>Lunch:</strong> Grilled chicken with roasted vegetables and quinoa</li>
                    <li><strong>Dinner:</strong> Baked salmon with sweet potato and steamed broccoli</li>
                    <li><strong>Snacks:</strong> Greek yogurt with fruit, mixed nuts, or hummus with vegetables</li>
                </ul>
                
                <h3>Storage Tips</h3>
                <p>Use airtight containers and label everything with dates. Most prepped meals stay fresh for 3-5 days in the refrigerator. Freeze portions you won't eat within 5 days.</p>
            </div>
        `,
    "Why HIIT is the Ultimate Fat Burner": `
            <div class="article-section">
                <h3>The Science Behind HIIT</h3>
                <p>High-Intensity Interval Training (HIIT) has revolutionized the fitness world by proving that you don't need hours in the gym to see results. The science is clear: HIIT burns more fat in less time than traditional steady-state cardio.</p>
                
                <h4>What Makes HIIT So Effective?</h4>
                <p>HIIT alternates between short bursts of maximum effort and brief recovery periods. This approach creates an "afterburn effect" where your body continues burning calories for hours after your workout ends.</p>
                
                <h4>The EPOC Effect</h4>
                <p>Excess Post-Exercise Oxygen Consumption (EPOC) is the key to HIIT's fat-burning power. After intense exercise, your body needs extra oxygen to restore itself to resting state, burning additional calories in the process.</p>
                
                <div class="article-tip">
                    <h4>Research Shows</h4>
                    <p>Studies have found that HIIT can burn 25-30% more calories than steady-state cardio, even though the actual workout time is much shorter.</p>
                </div>
                
                <h4>Metabolic Benefits</h4>
                <p>HIIT improves insulin sensitivity, increases growth hormone production, and enhances fat oxidation. These metabolic changes make your body more efficient at burning fat throughout the day.</p>
                
                <h4>Sample HIIT Workout</h4>
                <p>Try this 20-minute fat-burning HIIT routine:</p>
                <ul>
                    <li>5-minute warm-up</li>
                    <li>4 rounds of: 30 seconds max effort, 90 seconds recovery</li>
                    <li>5-minute cool-down</li>
                </ul>
                
                <h4>Getting Started with HIIT</h4>
                <p>Begin with a 1:3 work-to-rest ratio (30 seconds work, 90 seconds rest). As you get fitter, progress to 1:2, then 1:1 ratios. Always listen to your body and maintain proper form.</p>
                
                <h3>Safety Considerations</h3>
                <p>HIIT is intense, so proper warm-up and cool-down are essential. Start slowly and gradually increase intensity. If you're new to exercise, consider working with a trainer to ensure proper form.</p>
            </div>
        `,
    "Complete Guide to Strength Training": `
            <div class="article-section">
                <h3>Building a Strong Foundation</h3>
                <p>Strength training is about more than just lifting weights. It's about building functional strength, improving bone density, and creating a body that can handle life's demands with ease.</p>
                
                <h4>The Fundamentals</h4>
                <p>Every strength training program should include these basic movement patterns: squat, hinge, push, pull, and carry. These movements form the foundation of human movement.</p>
                
                <h4>Progressive Overload</h4>
                <p>The key to getting stronger is progressive overload - gradually increasing the stress placed on your body. This can be done by increasing weight, reps, sets, or frequency.</p>
                
                <div class="article-tip">
                    <h4>Form First</h4>
                    <p>Perfect your technique before adding weight. Poor form with heavy weights leads to injury and limits progress.</p>
                </div>
                
                <h4>Sample Beginner Program</h4>
                <p>Start with this 3-day per week routine:</p>
                <ul>
                    <li><strong>Day 1:</strong> Squats, Push-ups, Rows</li>
                    <li><strong>Day 2:</strong> Deadlifts, Overhead Press, Pull-ups</li>
                    <li><strong>Day 3:</strong> Lunges, Bench Press, Lat Pulldowns</li>
                </ul>
                
                <h4>Recovery and Nutrition</h4>
                <p>Strength training breaks down muscle tissue, and proper recovery allows it to rebuild stronger. Get adequate sleep, eat enough protein, and allow 48 hours between training the same muscle groups.</p>
                
                <h3>Common Mistakes to Avoid</h3>
                <p>Don't skip the warm-up, avoid ego lifting, and remember that consistency beats intensity. It's better to train moderately for years than intensely for months.</p>
            </div>
        `,
    "Yoga for Beginners: Start Your Journey": `
            <div class="article-section">
                <h3>Finding Balance Through Yoga</h3>
                <p>Yoga is more than just physical exercise - it's a practice that combines movement, breath, and mindfulness to create a sense of balance and well-being.</p>
                
                <h4>Benefits of Yoga</h4>
                <p>Regular yoga practice improves flexibility, strength, balance, and mental clarity. It also reduces stress, improves sleep, and enhances overall quality of life.</p>
                
                <h4>Essential Poses for Beginners</h4>
                <p>Start with these fundamental poses:</p>
                <ul>
                    <li><strong>Mountain Pose:</strong> Foundation of all standing poses</li>
                    <li><strong>Downward Dog:</strong> Full-body stretch and strength</li>
                    <li><strong>Warrior I & II:</strong> Leg strength and balance</li>
                    <li><strong>Child's Pose:</strong> Resting and grounding pose</li>
                </ul>
                
                <div class="article-tip">
                    <h4>Breathe Deeply</h4>
                    <p>Focus on your breath throughout your practice. Deep, controlled breathing helps you stay present and move more mindfully.</p>
                </div>
                
                <h4>Creating a Home Practice</h4>
                <p>You don't need a studio to start yoga. Find a quiet space, use a yoga mat or towel, and start with 10-15 minutes daily. There are many free online resources to guide you.</p>
                
                <h3>Mindfulness and Meditation</h3>
                <p>Yoga is about connecting mind and body. Take time to notice how poses feel in your body and how your breath changes. This awareness is the true gift of yoga practice.</p>
            </div>
        `,
    "The Importance of Recovery and Rest": `
            <div class="article-section">
                <h3>Recovery: The Missing Piece</h3>
                <p>Many people focus on training hard but neglect recovery. However, recovery is when the magic happens - it's when your body adapts to training and gets stronger.</p>
                
                <h4>Why Recovery Matters</h4>
                <p>During exercise, you break down muscle tissue and deplete energy stores. Recovery allows your body to repair, rebuild, and come back stronger than before.</p>
                
                <h4>Signs You Need More Recovery</h4>
                <ul>
                    <li>Persistent fatigue</li>
                    <li>Decreased performance</li>
                    <li>Mood changes</li>
                    <li>Increased injury risk</li>
                    <li>Poor sleep quality</li>
                </ul>
                
                <div class="article-tip">
                    <h4>Listen to Your Body</h4>
                    <p>If you feel tired, take a rest day. Your body knows what it needs better than any training schedule.</p>
                </div>
                
                <h4>Recovery Strategies</h4>
                <p>Optimize your recovery with these techniques:</p>
                <ul>
                    <li><strong>Sleep:</strong> Aim for 7-9 hours of quality sleep</li>
                    <li><strong>Nutrition:</strong> Eat enough protein and calories</li>
                    <li><strong>Hydration:</strong> Drink plenty of water</li>
                    <li><strong>Active Recovery:</strong> Light movement on rest days</li>
                    <li><strong>Stress Management:</strong> Practice relaxation techniques</li>
                </ul>
                
                <h3>Rest Days Are Training Days</h3>
                <p>Remember, rest days are not lazy days - they're essential training days that allow your body to adapt and grow stronger. Embrace them as part of your fitness journey.</p>
            </div>
        `,
  };

  return articles[title] || "<p>Full article content coming soon...</p>";
}

// Add event listeners for modal actions
document.addEventListener("click", function (e) {
  if (e.target.id === "shareArticle") {
    if (navigator.share) {
      navigator.share({
        title: document.querySelector(".article-title-large").textContent,
        text: document.querySelector(".article-intro").textContent,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert("Article link copied to clipboard!");
      });
    }
  }

  if (e.target.id === "bookmarkArticle") {
    // Simple bookmark functionality
    const title = document.querySelector(".article-title-large").textContent;
    const bookmarks = JSON.parse(
      localStorage.getItem("articleBookmarks") || "[]"
    );

    if (!bookmarks.includes(title)) {
      bookmarks.push(title);
      localStorage.setItem("articleBookmarks", JSON.stringify(bookmarks));
      e.target.textContent = "Bookmarked!";
      e.target.style.backgroundColor = "#4CAF50";
    } else {
      alert("Article already bookmarked!");
    }
  }
});
