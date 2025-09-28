// Coach Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const coachMenuBtn = document.getElementById('coachMenuBtn');
    const coachDropdown = document.getElementById('coachDropdown');
    const coachLogoutBtn = document.getElementById('coachLogoutBtn');
    const addClientBtn = document.getElementById('addClientBtn');
    const scheduleSessionBtn = document.getElementById('scheduleSessionBtn');
    const viewMessagesBtn = document.getElementById('viewMessagesBtn');
    const updateAvailabilityBtn = document.getElementById('updateAvailabilityBtn');
        
                // Load PeerJS library
                const peerjsScript = document.createElement('script');
                peerjsScript.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
                document.head.appendChild(peerjsScript);
        
                peerjsScript.onload = function() {
                    // --- PeerJS P2P Video Call Logic (Unified with User Dashboard) ---
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

                    // Show modal when "Call Client" is clicked
                    const viewMessagesBtn = document.getElementById('viewMessagesBtn');
                    if (viewMessagesBtn) {
                        viewMessagesBtn.onclick = function() {
                            callModal.style.display = 'block';
                            if (!peer) setupPeer();
                        };
                    }

                    // Also allow client card video call buttons to open modal
                    const clientCallBtns = document.querySelectorAll('.client-card .btn-success');
                    clientCallBtns.forEach(btn => {
                        btn.onclick = function() {
                            callModal.style.display = 'block';
                            if (!peer) setupPeer();
                        };
                    });

                    if (closeCallModalBtn) {
                        closeCallModalBtn.onclick = function () {
                            callModal.style.display = "none";
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
                        // Redirect to coach dashboard after ending call
                        window.location.href = 'coach-dashboard.html';
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

    // Authentication and coach info are now handled by Firebase in the HTML <script type="module">.

    // Coach menu toggle
    if (coachMenuBtn && coachDropdown) {
        coachMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            coachDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!coachMenuBtn.contains(e.target) && !coachDropdown.contains(e.target)) {
                coachDropdown.classList.remove('active');
            }
        });
    }



    // Quick action buttons
    if (addClientBtn) {
        addClientBtn.addEventListener('click', function() {
            showAddClientModal();
        });
    }

    if (scheduleSessionBtn) {
        scheduleSessionBtn.addEventListener('click', function() {
            showScheduleSessionModal();
        });
    }

    
    if (updateAvailabilityBtn) {
        updateAvailabilityBtn.addEventListener('click', function() {
            showAvailabilityModal();
        });
    }

    // Initialize coach dashboard
    initializeCoachDashboard();
});

// Initialize coach dashboard with data
function initializeCoachDashboard() {
    // Load coach stats
    loadCoachStats();
    
    // Load today's schedule
    loadTodaysSchedule();
    
    // Load client data
    loadClientData();
    
    // Load recent messages
    loadRecentMessages();
    
    // Load earnings data
    loadEarningsData();
}

// Load coach statistics
function loadCoachStats() {
    // Simulate loading coach stats
    const stats = {
        activeClients: 12,
        sessionsToday: 8,
        averageRating: 4.9,
        monthlyEarnings: 2400
    };
    
    // Update stat cards
    const clientsCard = document.querySelector('.stat-card:nth-child(1) h3');
    const sessionsCard = document.querySelector('.stat-card:nth-child(2) h3');
    const ratingCard = document.querySelector('.stat-card:nth-child(3) h3');
    const earningsCard = document.querySelector('.stat-card:nth-child(4) h3');
    
    if (clientsCard) clientsCard.textContent = stats.activeClients;
    if (sessionsCard) sessionsCard.textContent = stats.sessionsToday;
    if (ratingCard) ratingCard.textContent = stats.averageRating;
    if (earningsCard) earningsCard.textContent = `$${stats.monthlyEarnings}`;
}

// Load today's schedule
function loadTodaysSchedule() {
    // Simulate loading schedule data
    const schedule = [
        {
            time: '9:00 AM',
            title: 'John Doe - Personal Training',
            description: 'Strength Training Session',
            status: 'completed'
        },
        {
            time: '10:30 AM',
            title: 'Jane Smith - Video Call',
            description: 'Nutrition Consultation',
            status: 'upcoming'
        },
        {
            time: '2:00 PM',
            title: 'Mike Johnson - Group Class',
            description: 'HIIT Training',
            status: 'upcoming'
        },
        {
            time: '4:00 PM',
            title: 'Sarah Wilson - Personal Training',
            description: 'Cardio & Strength',
            status: 'upcoming'
        }
    ];
    
    // Update timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        if (schedule[index]) {
            const timeEl = item.querySelector('.timeline-time');
            const titleEl = item.querySelector('h4');
            const descEl = item.querySelector('p');
            const statusEl = item.querySelector('.timeline-status');
            
            if (timeEl) timeEl.textContent = schedule[index].time;
            if (titleEl) titleEl.textContent = schedule[index].title;
            if (descEl) descEl.textContent = schedule[index].description;
            if (statusEl) {
                statusEl.textContent = schedule[index].status === 'completed' ? 'Completed' : 
                                    schedule[index].status === 'upcoming' ? 'Upcoming' : 'Starting Soon';
                statusEl.className = `timeline-status ${schedule[index].status}`;
            }
        }
    });
}

// Load client data
function loadClientData() {
    // Simulate loading client data
    const clients = [
        {
            name: 'John Doe',
            program: 'Weight Loss Program',
            progress: 75,
            avatar: 'https://via.placeholder.com/60'
        },
        {
            name: 'Jane Smith',
            program: 'Muscle Building',
            progress: 60,
            avatar: 'https://via.placeholder.com/60'
        },
        {
            name: 'Mike Johnson',
            program: 'General Fitness',
            progress: 90,
            avatar: 'https://via.placeholder.com/60'
        }
    ];
    
    // Update client cards
    const clientCards = document.querySelectorAll('.client-card');
    clientCards.forEach((card, index) => {
        if (clients[index]) {
            const avatarEl = card.querySelector('.client-avatar img');
            const nameEl = card.querySelector('h4');
            const programEl = card.querySelector('p');
            const progressBar = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.client-progress span');
            
            if (avatarEl) avatarEl.src = clients[index].avatar;
            if (nameEl) nameEl.textContent = clients[index].name;
            if (programEl) programEl.textContent = clients[index].program;
            if (progressBar) progressBar.style.width = `${clients[index].progress}%`;
            if (progressText) progressText.textContent = `${clients[index].progress}% to goal`;
        }
    });
}

// Load recent messages
function loadRecentMessages() {
    // Simulate loading messages data
    const messages = [
        {
            name: 'John Doe',
            message: 'Thanks for the workout today! I\'m feeling stronger already.',
            time: '2 min ago',
            unread: true,
            avatar: 'https://via.placeholder.com/40'
        },
        {
            name: 'Jane Smith',
            message: 'Can we schedule an extra session this week?',
            time: '1 hour ago',
            unread: false,
            avatar: 'https://via.placeholder.com/40'
        },
        {
            name: 'Mike Johnson',
            message: 'I uploaded my progress photos. What do you think?',
            time: '3 hours ago',
            unread: false,
            avatar: 'https://via.placeholder.com/40'
        }
    ];
    
    // Update message items
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach((item, index) => {
        if (messages[index]) {
            const avatarEl = item.querySelector('.message-avatar img');
            const nameEl = item.querySelector('h4');
            const messageEl = item.querySelector('p');
            const timeEl = item.querySelector('.message-time');
            const statusEl = item.querySelector('.message-status');
            
            if (avatarEl) avatarEl.src = messages[index].avatar;
            if (nameEl) nameEl.textContent = messages[index].name;
            if (messageEl) messageEl.textContent = messages[index].message;
            if (timeEl) timeEl.textContent = messages[index].time;
            if (statusEl) {
                if (messages[index].unread) {
                    statusEl.classList.add('unread');
                } else {
                    statusEl.classList.remove('unread');
                }
            }
        }
    });
}

// Load earnings data
function loadEarningsData() {
    // Simulate loading earnings data
    const earnings = {
        thisWeek: 1200,
        thisMonth: 4800,
        totalSessions: 156,
        weekChange: 15,
        monthChange: 22
    };
    
    // Update earnings cards
    const weekCard = document.querySelector('.earnings-card:nth-child(1) .earnings-amount');
    const monthCard = document.querySelector('.earnings-card:nth-child(2) .earnings-amount');
    const sessionsCard = document.querySelector('.earnings-card:nth-child(3) .earnings-amount');
    
    if (weekCard) weekCard.textContent = `$${earnings.thisWeek}`;
    if (monthCard) monthCard.textContent = `$${earnings.thisMonth}`;
    if (sessionsCard) sessionsCard.textContent = earnings.totalSessions;
}

// Show add client modal
function showAddClientModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add New Client</h2>
            <form id="addClientForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="clientFirstName">First Name</label>
                        <input type="text" id="clientFirstName" name="clientFirstName" required>
                    </div>
                    <div class="form-group">
                        <label for="clientLastName">Last Name</label>
                        <input type="text" id="clientLastName" name="clientLastName" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="clientEmail">Email</label>
                    <input type="email" id="clientEmail" name="clientEmail" required>
                </div>
                <div class="form-group">
                    <label for="clientPhone">Phone</label>
                    <input type="tel" id="clientPhone" name="clientPhone" required>
                </div>
                <div class="form-group">
                    <label for="clientProgram">Program</label>
                    <select id="clientProgram" name="clientProgram" required>
                        <option value="">Select program</option>
                        <option value="weight-loss">Weight Loss</option>
                        <option value="muscle-gain">Muscle Gain</option>
                        <option value="general-fitness">General Fitness</option>
                        <option value="strength">Strength Training</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="clientGoals">Goals</label>
                    <textarea id="clientGoals" name="clientGoals" rows="3" placeholder="Describe client's fitness goals..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Add Client</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        modal.remove();
        document.body.style.overflow = 'auto';
    });
    
    // Handle form submission
    const form = modal.querySelector('#addClientForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading
        showLoading();
        
        // Simulate API call
        setTimeout(() => {
            hideLoading();
            alert('Client added successfully!');
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 2000);
    });
}

// Show schedule session modal
function showScheduleSessionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Schedule Session</h2>
            <form id="scheduleSessionForm">
                <div class="form-group">
                    <label for="sessionClient">Client</label>
                    <select id="sessionClient" name="sessionClient" required>
                        <option value="">Select client</option>
                        <option value="john-doe">John Doe</option>
                        <option value="jane-smith">Jane Smith</option>
                        <option value="mike-johnson">Mike Johnson</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="sessionType">Session Type</label>
                    <select id="sessionType" name="sessionType" required>
                        <option value="">Select type</option>
                        <option value="personal-training">Personal Training</option>
                        <option value="video-call">Video Call</option>
                        <option value="group-class">Group Class</option>
                        <option value="nutrition-consultation">Nutrition Consultation</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="sessionDate">Date</label>
                        <input type="date" id="sessionDate" name="sessionDate" required>
                    </div>
                    <div class="form-group">
                        <label for="sessionTime">Time</label>
                        <input type="time" id="sessionTime" name="sessionTime" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="sessionDuration">Duration (minutes)</label>
                    <input type="number" id="sessionDuration" name="sessionDuration" min="15" max="180" value="60" required>
                </div>
                <div class="form-group">
                    <label for="sessionNotes">Notes</label>
                    <textarea id="sessionNotes" name="sessionNotes" rows="3" placeholder="Add any notes about the session..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Schedule Session</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        modal.remove();
        document.body.style.overflow = 'auto';
    });
    
    // Handle form submission
    const form = modal.querySelector('#scheduleSessionForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading
        showLoading();
        
        // Simulate API call
        setTimeout(() => {
            hideLoading();
            alert('Session scheduled successfully!');
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 2000);
    });
}

// Show availability modal
function showAvailabilityModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Update Availability</h2>
            <form id="availabilityForm">
                <div class="form-group">
                    <label>Available Days</label>
                    <div class="checkbox-grid">
                        <label class="checkbox-label">
                            <input type="checkbox" name="days" value="monday">
                            <span class="checkmark"></span>
                            Monday
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="days" value="tuesday">
                            <span class="checkmark"></span>
                            Tuesday
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="days" value="wednesday">
                            <span class="checkmark"></span>
                            Wednesday
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="days" value="thursday">
                            <span class="checkmark"></span>
                            Thursday
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="days" value="friday">
                            <span class="checkmark"></span>
                            Friday
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="days" value="saturday">
                            <span class="checkmark"></span>
                            Saturday
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="days" value="sunday">
                            <span class="checkmark"></span>
                            Sunday
                        </label>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="startTime">Start Time</label>
                        <input type="time" id="startTime" name="startTime" value="06:00" required>
                    </div>
                    <div class="form-group">
                        <label for="endTime">End Time</label>
                        <input type="time" id="endTime" name="endTime" value="22:00" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="breakTime">Break Time (minutes)</label>
                    <input type="number" id="breakTime" name="breakTime" min="0" max="120" value="30">
                </div>
                <button type="submit" class="btn btn-primary">Update Availability</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        modal.remove();
        document.body.style.overflow = 'auto';
    });
    
    // Handle form submission
    const form = modal.querySelector('#availabilityForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading
        showLoading();
        
        // Simulate API call
        setTimeout(() => {
            hideLoading();
            alert('Availability updated successfully!');
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 2000);
    });
}

// Add coach dashboard styles
const coachDashboardStyle = document.createElement('style');
coachDashboardStyle.textContent = `
    .coach-dashboard {
        padding: 120px 0 80px;
        background-color: #0a0a0a;
        min-height: 100vh;
    }
    
    .timeline-item {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .timeline-time {
        color: #ffd700;
        font-weight: 600;
        font-size: 1.1rem;
        min-width: 100px;
    }
    
    .timeline-content {
        flex: 1;
    }
    
    .timeline-content h4 {
        color: #ffffff;
        margin-bottom: 0.25rem;
    }
    
    .timeline-content p {
        color: #cccccc;
        font-size: 0.9rem;
    }
    
    .timeline-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: auto;
    }
    
    .timeline-status.completed {
        background-color: #4CAF50;
        color: #ffffff;
    }
    
    .timeline-status.upcoming {
        background-color: #ffd700;
        color: #0a0a0a;
    }
    
    .clients-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
    }
    
    .client-card {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .client-avatar img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .client-info {
        flex: 1;
    }
    
    .client-info h4 {
        color: #ffffff;
        margin-bottom: 0.25rem;
    }
    
    .client-info p {
        color: #cccccc;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .client-progress {
        margin-top: 0.5rem;
    }
    
    .progress-bar {
        width: 100%;
        height: 6px;
        background-color: #333;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 0.25rem;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #ffd700, #ff6b35);
        transition: width 0.3s ease;
    }
    
    .client-progress span {
        font-size: 0.8rem;
        color: #999;
    }
    
    .client-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .btn-sm {
        padding: 6px 12px;
        font-size: 0.8rem;
    }
    
    .messages-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .message-item {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        position: relative;
    }
    
    .message-avatar img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .message-content {
        flex: 1;
    }
    
    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;
    }
    
    .message-header h4 {
        color: #ffffff;
        font-size: 0.9rem;
    }
    
    .message-time {
        color: #999;
        font-size: 0.8rem;
    }
    
    .message-content p {
        color: #cccccc;
        font-size: 0.9rem;
    }
    
    .message-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #333;
    }
    
    .message-status.unread {
        background-color: #ffd700;
    }
    
    .earnings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
    }
    
    .earnings-card {
        background-color: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
    }
    
    .earnings-card h3 {
        color: #ffd700;
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
    
    .earnings-amount {
        color: #ffffff;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    
    .earnings-change {
        font-size: 0.9rem;
    }
    
    .earnings-change.positive {
        color: #4CAF50;
    }
    
    .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-top: 0.5rem;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #cccccc;
        cursor: pointer;
    }
    
    .checkbox-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #ffd700;
    }
    
    @media (max-width: 768px) {
        .timeline-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .timeline-status {
            margin-left: 0;
        }
        
        .client-card {
            flex-direction: column;
            text-align: center;
        }
        
        .client-actions {
            flex-direction: row;
            justify-content: center;
        }
        
        .message-item {
            flex-direction: column;
            text-align: center;
        }
        
        .message-header {
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .earnings-grid {
            grid-template-columns: 1fr;
        }
        
        .checkbox-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;
document.head.appendChild(coachDashboardStyle);
