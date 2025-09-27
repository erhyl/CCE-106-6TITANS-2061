// User Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const startWorkoutBtn = document.getElementById('startWorkoutBtn');
    const bookClassBtn = document.getElementById('bookClassBtn');
    const logProgressBtn = document.getElementById('logProgressBtn');
    const messageCoachBtn = document.getElementById('messageCoachBtn');

    // --- PeerJS Video Call Logic (Unified with Coach Dashboard) ---
    // Load PeerJS library dynamically
    const peerjsScript = document.createElement('script');
    peerjsScript.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
    document.head.appendChild(peerjsScript);
    peerjsScript.onload = function() {
        let peer, localStream, currentCall;
        let camEnabled = true, micEnabled = true;
        const callModal = document.getElementById("videoCallModal");
        const closeCallModalBtn = document.getElementById("closeCallModal");
        const myPeerIdInput = document.getElementById("myPeerId");
        const copyPeerIdBtn = document.getElementById("copyPeerIdBtn");
        const callPeerIdInput = document.getElementById("callPeerId");
        const startCallBtn = document.getElementById("startCallBtn");
        const endCallBtn = document.getElementById("endCallBtn");
        const localVideo = document.getElementById("localVideo");
        const remoteVideo = document.getElementById("remoteVideo");
        const toggleCamBtn = document.getElementById("toggleCamBtn");
        const toggleMicBtn = document.getElementById("toggleMicBtn");

        // Show modal when "Message Coach" is clicked
        if (messageCoachBtn) {
            messageCoachBtn.onclick = function() {
                callModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                if (!peer) setupPeer();
            };
        }
        if (closeCallModalBtn) {
            closeCallModalBtn.onclick = function () {
                callModal.style.display = "none";
                document.body.style.overflow = '';
                endPeerCall();
            };
        }
        // Remove click-outside-to-close behavior for video call modal
        function setupPeer() {
            peer = new Peer();
            peer.on("open", (id) => {
                myPeerIdInput.value = id;
            });
            peer.on("call", (call) => {
                getLocalStream().then((stream) => {
                    call.answer(stream);
                    setLocalVideo(stream);
                    call.on("stream", (remoteStream) => setRemoteVideo(remoteStream));
                    currentCall = call;
                    endCallBtn.style.display = "";
                });
            });
        }
        function getLocalStream() {
            if (localStream) return Promise.resolve(localStream);
            return navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    localStream = stream;
                    setLocalVideo(stream);
                    return stream;
                });
        }
        function setLocalVideo(stream) {
            localVideo.srcObject = stream;
        }
        function setRemoteVideo(stream) {
            remoteVideo.srcObject = stream;
        }
        if (startCallBtn) {
            startCallBtn.onclick = function () {
                const remoteId = callPeerIdInput.value.trim();
                if (!remoteId) return alert("Enter a Peer ID to call!");
                getLocalStream().then((stream) => {
                    const call = peer.call(remoteId, stream);
                    call.on("stream", (remoteStream) => setRemoteVideo(remoteStream));
                    currentCall = call;
                    endCallBtn.style.display = "";
                });
            };
        }
        if (endCallBtn) {
            endCallBtn.onclick = endPeerCall;
        }
        function endPeerCall() {
            if (currentCall) currentCall.close();
            if (remoteVideo) remoteVideo.srcObject = null;
            endCallBtn.style.display = "none";
            // Reset cam/mic state
            if (localStream) {
                localStream.getTracks().forEach((track) => (track.enabled = true));
                camEnabled = micEnabled = true;
                updateDeviceButtons();
            }
            callModal.style.display = 'none';
        }
        if (copyPeerIdBtn) {
            copyPeerIdBtn.onclick = function () {
                myPeerIdInput.select();
                document.execCommand("copy");
                copyPeerIdBtn.textContent = "Copied!";
                setTimeout(() => (copyPeerIdBtn.textContent = "Copy"), 1000);
            };
        }
        // Camera/mic toggle logic
        if (toggleCamBtn) {
            toggleCamBtn.onclick = function () {
                if (!localStream) return;
                camEnabled = !camEnabled;
                localStream
                    .getVideoTracks()
                    .forEach((track) => (track.enabled = camEnabled));
                updateDeviceButtons();
            };
        }
        if (toggleMicBtn) {
            toggleMicBtn.onclick = function () {
                if (!localStream) return;
                micEnabled = !micEnabled;
                localStream
                    .getAudioTracks()
                    .forEach((track) => (track.enabled = micEnabled));
                updateDeviceButtons();
            };
        }
        function updateDeviceButtons() {
            if (toggleCamBtn) {
                toggleCamBtn.innerHTML = camEnabled
                    ? '<i class="fas fa-video"></i>'
                    : '<i class="fas fa-video-slash"></i>';
                toggleCamBtn.style.background = camEnabled ? "#ffd700" : "#444";
            }
            if (toggleMicBtn) {
                toggleMicBtn.innerHTML = micEnabled
                    ? '<i class="fas fa-microphone"></i>'
                    : '<i class="fas fa-microphone-slash"></i>';
                toggleMicBtn.style.background = micEnabled ? "#ffd700" : "#444";
            }
        }
    };

    // Check authentication
    const userSession = checkAuthStatus();
    if (!userSession) {
        window.location.href = 'login.html';
        return;
    }

    // Update user name
    const userName = document.getElementById('userName');
    if (userName && userSession.firstName) {
        userName.textContent = userSession.firstName;
    }

    // User menu toggle
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Quick action buttons
    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener('click', function() {
            window.location.href = 'workouts.html';
        });
    }

    if (bookClassBtn) {
        bookClassBtn.addEventListener('click', function() {
            window.location.href = 'classes.html';
        });
    }

    if (logProgressBtn) {
        logProgressBtn.addEventListener('click', function() {
            window.location.href = 'online-gym.html#upload';
        });
    }

    // Initialize dashboard data
    initializeDashboard();
});

// Initialize dashboard with user data
function initializeDashboard() {
    // Load user stats
    loadUserStats();
    
    // Load today's schedule
    loadTodaysSchedule();
    
    // Load progress data
    loadProgressData();
    
    // Load recent activity
    loadRecentActivity();
    
    // Load upcoming classes
    loadUpcomingClasses();
}

// Load user statistics
function loadUserStats() {
    // Simulate loading user stats
    const stats = {
        streak: 7,
        todayWorkout: '45min',
        monthlyWorkouts: 12
    };
    
    // Update stat cards
    const streakCard = document.querySelector('.stat-card:nth-child(1) h3');
    const workoutCard = document.querySelector('.stat-card:nth-child(2) h3');
    const monthlyCard = document.querySelector('.stat-card:nth-child(3) h3');
    
    if (streakCard) streakCard.textContent = stats.streak;
    if (workoutCard) workoutCard.textContent = stats.todayWorkout;
    if (monthlyCard) monthlyCard.textContent = stats.monthlyWorkouts;
}

// Load today's schedule
function loadTodaysSchedule() {
    // Simulate loading schedule data
    const schedule = [
        {
            time: '6:00 AM',
            title: 'Morning Yoga',
            instructor: 'With Angelou Carino',
            status: 'completed'
        },
        {
            time: '7:00 PM',
            title: 'Personal Training',
            instructor: 'With Charles Cacam',
            status: 'upcoming'
        }
    ];
    
    // Update schedule items
    const scheduleItems = document.querySelectorAll('.schedule-item');
    scheduleItems.forEach((item, index) => {
        if (schedule[index]) {
            const timeEl = item.querySelector('.schedule-time');
            const titleEl = item.querySelector('h4');
            const instructorEl = item.querySelector('p');
            const statusEl = item.querySelector('.schedule-status');
            
            if (timeEl) timeEl.textContent = schedule[index].time;
            if (titleEl) titleEl.textContent = schedule[index].title;
            if (instructorEl) instructorEl.textContent = schedule[index].instructor;
            if (statusEl) {
                statusEl.textContent = schedule[index].status === 'completed' ? 'Completed' : 'Upcoming';
                statusEl.className = `schedule-status ${schedule[index].status}`;
            }
        }
    });
}

// Load progress data
function loadProgressData() {
    // Simulate loading progress data
    const progressData = {
        weight: {
            start: 180,
            current: 175,
            goal: 170
        },
        consistency: {
            completed: 3,
            total: 7
        }
    };
    
    // Update weight progress
    const weightBar = document.querySelector('.bar-fill');
    if (weightBar) {
        const progress = ((progressData.weight.current - progressData.weight.goal) / (progressData.weight.start - progressData.weight.goal)) * 100;
        weightBar.style.height = `${100 - progress}%`;
    }
    
    // Update consistency chart
    const weekDays = document.querySelectorAll('.week-days .day');
    weekDays.forEach((day, index) => {
        if (index < progressData.consistency.completed) {
            day.classList.add('completed');
        }
    });
    
    const consistencyText = document.querySelector('.consistency-chart p');
    if (consistencyText) {
        consistencyText.textContent = `${progressData.consistency.completed}/${progressData.consistency.total} days this week`;
    }
}

// Load recent activity
function loadRecentActivity() {
    // Simulate loading activity data
    const activities = [
        {
            icon: '🏋️‍♂️',
            title: 'Completed Strength Training',
            description: '45 minutes • 2 hours ago'
        },
        {
            icon: '📊',
            title: 'Updated Progress Photos',
            description: 'Coach Charles reviewed • 1 day ago'
        },
        {
            icon: '💬',
            title: 'New message from Coach',
            description: 'Great progress this week! • 2 days ago'
        }
    ];
    
    // Update activity items
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach((item, index) => {
        if (activities[index]) {
            const iconEl = item.querySelector('.activity-icon');
            const titleEl = item.querySelector('h4');
            const descEl = item.querySelector('p');
            
            if (iconEl) iconEl.textContent = activities[index].icon;
            if (titleEl) titleEl.textContent = activities[index].title;
            if (descEl) descEl.textContent = activities[index].description;
        }
    });
}

// Load upcoming classes
function loadUpcomingClasses() {
    // Simulate loading classes data
    const classes = [
        {
            title: 'HIIT Training',
            time: 'Tomorrow 8:00 AM',
            description: 'High-intensity interval training for maximum results',
            instructor: 'Jude Tomonas',
            duration: '45min'
        },
        {
            title: 'Yoga Flow',
            time: 'Friday 6:00 PM',
            description: 'Flexibility and mindfulness practice',
            instructor: 'Angelou Carino',
            duration: '60min'
        }
    ];
    
    // Update class cards
    const classCards = document.querySelectorAll('.classes-grid .class-card');
    classCards.forEach((card, index) => {
        if (classes[index]) {
            const titleEl = card.querySelector('h3');
            const timeEl = card.querySelector('.class-time');
            const descEl = card.querySelector('p');
            const instructorEl = card.querySelector('.class-detail span');
            const durationEl = card.querySelectorAll('.class-detail span')[1];
            
            if (titleEl) titleEl.textContent = classes[index].title;
            if (timeEl) timeEl.textContent = classes[index].time;
            if (descEl) descEl.textContent = classes[index].description;
            if (instructorEl) instructorEl.textContent = classes[index].instructor;
            if (durationEl) durationEl.textContent = classes[index].duration;
        }
    });
}

// Show progress logging modal
function showProgressModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Log Progress</h2>
            <form id="progressForm">
                <div class="form-group">
                    <label for="progressType">Progress Type</label>
                    <select id="progressType" name="progressType" required>
                        <option value="">Select type</option>
                        <option value="weight">Weight Update</option>
                        <option value="measurements">Body Measurements</option>
                        <option value="workout">Workout Summary</option>
                        <option value="photo">Progress Photo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="progressValue">Value</label>
                    <input type="text" id="progressValue" name="progressValue" placeholder="e.g., 175 lbs or describe your progress">
                </div>
                <div class="form-group">
                    <label for="progressNotes">Notes</label>
                    <textarea id="progressNotes" name="progressNotes" rows="3" placeholder="Add any additional notes..."></textarea>
                </div>
                <div class="form-group">
                    <label for="progressFile">Upload File (Optional)</label>
                    <input type="file" id="progressFile" name="progressFile" accept="image/*">
                </div>
                <button type="submit" class="btn btn-primary">Log Progress</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Close modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        modal.remove();
        document.body.style.overflow = 'auto';
    });
    
    // Handle form submission
    const form = modal.querySelector('#progressForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading
        showLoading();
        
        // Simulate API call
        setTimeout(() => {
            hideLoading();
            alert('Progress logged successfully!');
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 2000);
    });
}

// Add dashboard styles
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `
    .dashboard {
        padding: 120px 0 80px;
        background-color: #0a0a0a;
        min-height: 100vh;
    }
    
    .dashboard-header {
        margin-bottom: 3rem;
    }
    
    .welcome-section h1 {
        color: #ffd700;
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }
    
    .welcome-section p {
        color: #cccccc;
        font-size: 1.1rem;
    }
    
    .dashboard-stats,
    .coach-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }
    
    .stat-card {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-2px);
        border-color: #ffd700;
    }
    
    .stat-icon {
        font-size: 2rem;
    }
    
    .stat-info h3 {
        color: #ffd700;
        font-size: 1.8rem;
        margin-bottom: 0.25rem;
    }
    
    .stat-info p {
        color: #cccccc;
        font-size: 0.9rem;
    }
    
    .dashboard-section {
        margin-bottom: 3rem;
    }
    
    .dashboard-section h2 {
        color: #ffd700;
        font-size: 1.8rem;
        margin-bottom: 1.5rem;
    }
    
    .quick-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .action-btn {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        color: #ffffff;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        text-align: center;
    }
    
    .action-btn:hover {
        border-color: #ffd700;
        transform: translateY(-2px);
    }
    
    .action-btn i {
        font-size: 1.5rem;
        color: #ffd700;
    }
    
    .action-btn span {
        font-weight: 600;
    }
    
    .schedule-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .schedule-item {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .schedule-time {
        color: #ffd700;
        font-weight: 600;
        font-size: 1.1rem;
        min-width: 80px;
    }
    
    .schedule-content h4 {
        color: #ffffff;
        margin-bottom: 0.25rem;
    }
    
    .schedule-content p {
        color: #cccccc;
        font-size: 0.9rem;
    }
    
    .schedule-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: auto;
    }
    
    .schedule-status.completed {
        background-color: #4CAF50;
        color: #ffffff;
    }
    
    .schedule-status.upcoming {
        background-color: #ffd700;
        color: #0a0a0a;
    }
    
    .progress-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
    }
    
    .progress-card {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
    }
    
    .progress-card h3 {
        color: #ffd700;
        margin-bottom: 1rem;
    }
    
    .progress-chart {
        margin-bottom: 1rem;
    }
    
    .chart-bar {
        width: 100%;
        height: 20px;
        background-color: #333;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    
    .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #ffd700, #ff6b35);
        transition: height 0.3s ease;
    }
    
    .chart-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #999;
    }
    
    .consistency-chart {
        text-align: center;
    }
    
    .week-days {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .day {
        width: 30px;
        height: 30px;
        background-color: #333;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 600;
        color: #999;
    }
    
    .day.completed {
        background-color: #4CAF50;
        color: #ffffff;
    }
    
    .activity-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .activity-item {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .activity-icon {
        font-size: 1.5rem;
    }
    
    .activity-content h4 {
        color: #ffffff;
        margin-bottom: 0.25rem;
    }
    
    .activity-content p {
        color: #cccccc;
        font-size: 0.9rem;
    }
    
    .classes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
    }
    
    .user-menu {
        position: relative;
    }
    
    .user-avatar {
        width: 40px;
        height: 40px;
        background-color: #ffd700;
        color: #0a0a0a;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: all 0.3s ease;
    }
    
    .user-avatar:hover {
        background-color: #ffed4e;
        transform: scale(1.05);
    }
    
    .coach-avatar {
        background-color: #ff6b35;
    }
    
    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 0.5rem 0;
        min-width: 200px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .user-dropdown.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .user-dropdown a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        color: #cccccc;
        text-decoration: none;
        transition: all 0.3s ease;
    }
    
    .user-dropdown a:hover {
        background-color: #333;
        color: #ffd700;
    }
    
    .user-dropdown a i {
        width: 16px;
        text-align: center;
    }
    
    @media (max-width: 768px) {
        .dashboard-stats,
        .coach-stats {
            grid-template-columns: 1fr;
        }
        
        .quick-actions {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .schedule-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .schedule-status {
            margin-left: 0;
        }
        
        .progress-grid {
            grid-template-columns: 1fr;
        }
        
        .classes-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(dashboardStyle);
