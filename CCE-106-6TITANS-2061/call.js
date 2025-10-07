// Automatic PeerJS-based 1:1 call
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room') || Math.random().toString(36).slice(2, 10);
  const partnerId = urlParams.get('partner');
  const partnerName = decodeURIComponent(urlParams.get('partnerName') || 'Partner');
  const isInitiator = urlParams.get('initiator') === 'true';
  
  console.log('📞 Video Call Started');
  console.log('🆔 Room ID:', roomId);
  console.log('👤 Partner:', partnerName);
  console.log('🎬 Initiator:', isInitiator);
  
  document.getElementById('roomIdText').textContent = `${partnerName} - ${roomId.substring(0, 15)}...`;

  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const toggleCamBtn = document.getElementById('toggleCam');
  const toggleMicBtn = document.getElementById('toggleMic');
  const shareScreenBtn = document.getElementById('shareScreen');
  const copyLinkBtn = document.getElementById('copyLink');
  const hangupBtn = document.getElementById('hangup');

  let localStream = null;
  let currentCall = null;
  let myPeerId = null;
  let connectedPeers = new Set();

  // Create peer with room-based ID for easier discovery
  const peer = new Peer(undefined, { 
    debug: 2,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
  });

  console.log('🔧 PeerJS initialized');

  async function initMedia() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
  }

  function getInviteLink() {
    const base = window.location.origin + window.location.pathname;
    return `${base}?room=${encodeURIComponent(roomId)}`;
  }

  function callPeerIfReady(id) {
    if (!localStream) return;
    if (currentCall) currentCall.close();
    currentCall = peer.call(id, localStream, { metadata: { roomId } });
    setupCallHandlers(currentCall);
  }

  function setupCallHandlers(call) {
    call.on('stream', (remoteStream) => {
      remoteVideo.srcObject = remoteStream;
    });
    call.on('close', () => {
      remoteVideo.srcObject = null;
    });
    call.on('error', () => {
      // noop
    });
  }

  peer.on('open', async (id) => {
    myPeerId = id;
    console.log('✅ My Peer ID:', myPeerId);
    
    await initMedia();
    console.log('📹 Media initialized');

    // Use Firebase for signaling (more reliable than PeerJS data channels)
    await signalPeerIdViaFirebase(id);
    
    // Listen for other peer's ID
    listenForPeerSignal();
    
    // Also set up backup P2P signaling
    peer.on('connection', (incoming) => {
      console.log('📡 Data connection received from:', incoming.peer);
      incoming.on('data', (msg) => {
        if (msg && msg.type === 'introduce' && msg.id && !connectedPeers.has(msg.id)) {
          console.log('👋 Peer introduced via P2P:', msg.id);
          connectedPeers.add(msg.id);
          callPeerIfReady(msg.id);
        }
      });
      incoming.on('open', () => {
        incoming.send({ type: 'introduce', id: myPeerId });
      });
    });
  });

  // Signal peer ID via Firebase for reliable discovery
  async function signalPeerIdViaFirebase(peerId) {
    try {
      // Import Firebase modules
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js');
      const { getDatabase, ref, set, onValue, get } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
      
      const firebaseConfig = {
        apiKey: "AIzaSyC2YE5Cn0gbiuQ5sq8lErotl01itq5-hYk",
        authDomain: "titans-8d454.firebaseapp.com",
        databaseURL: "https://titans-8d454-default-rtdb.firebaseio.com",
        projectId: "titans-8d454"
      };
      
      const app = initializeApp(firebaseConfig, 'call-app');
      const db = getDatabase(app);
      
      // Store my peer ID in Firebase under this room
      const mySignalRef = ref(db, `call_signals/${roomId}/${myPeerId}`);
      await set(mySignalRef, {
        peerId: myPeerId,
        timestamp: Date.now(),
        isInitiator: isInitiator
      });
      
      console.log('✅ Peer ID signaled via Firebase');
      
      // Check if partner is already waiting
      const roomRef = ref(db, `call_signals/${roomId}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const peers = snapshot.val();
        const otherPeers = Object.keys(peers).filter(p => p !== myPeerId);
        
        if (otherPeers.length > 0 && isInitiator) {
          console.log('🎯 Partner already waiting, initiating call...');
          setTimeout(() => callPeerIfReady(otherPeers[0]), 1000);
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Firebase signaling failed:', error);
    }
  }

  // Listen for partner's peer ID via Firebase
  async function listenForPeerSignal() {
    try {
      const { getApps } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js');
      const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js');
      
      const app = getApps().find(a => a.name === 'call-app');
      if (!app) {
        console.warn('⚠️ Firebase app not found for listener');
        return;
      }
      
      const db = getDatabase(app);
      const roomRef = ref(db, `call_signals/${roomId}`);
      
      console.log('👂 Listening for partner at:', `call_signals/${roomId}`);
      
      onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const peers = snapshot.val();
          const otherPeers = Object.keys(peers).filter(p => p !== myPeerId);
          
          if (otherPeers.length > 0) {
            const partnerPeerId = otherPeers[0];
            if (!connectedPeers.has(partnerPeerId)) {
              console.log('🎯 Partner joined via Firebase:', partnerPeerId);
              connectedPeers.add(partnerPeerId);
              
              if (isInitiator) {
                console.log('📞 Initiating call to partner...');
                setTimeout(() => callPeerIfReady(partnerPeerId), 500);
              } else {
                console.log('📱 Waiting for initiator to call...');
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn('⚠️ Firebase listener error:', err);
    }
  }

  peer.on('call', async (call) => {
    if (!localStream) await initMedia();
    currentCall = call;
    call.answer(localStream);
    setupCallHandlers(call);
  });

  // Controls
  toggleCamBtn.addEventListener('click', () => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      const icon = toggleCamBtn.querySelector('i');
      if (icon) {
        icon.className = track.enabled ? 'fas fa-video' : 'fas fa-video-slash';
      }
      toggleCamBtn.style.background = track.enabled ? '#1a1a1a' : '#f44336';
      toggleCamBtn.style.borderColor = track.enabled ? '#333' : '#f44336';
    }
  });

  toggleMicBtn.addEventListener('click', () => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      const icon = toggleMicBtn.querySelector('i');
      if (icon) {
        icon.className = track.enabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
      }
      toggleMicBtn.style.background = track.enabled ? '#1a1a1a' : '#f44336';
      toggleMicBtn.style.borderColor = track.enabled ? '#333' : '#f44336';
    }
  });

  shareScreenBtn.addEventListener('click', async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      const sender = currentCall && currentCall.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
      screenTrack.onended = () => {
        const camTrack = localStream.getVideoTracks()[0];
        if (sender && camTrack) sender.replaceTrack(camTrack);
      };
    } catch {}
  });

  copyLinkBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getInviteLink());
      if (window.Utils && window.Utils.showToast) window.Utils.showToast('Invite link copied', 'success');
    } catch {}
  });

  hangupBtn.addEventListener('click', async () => {
    if (currentCall) currentCall.close();
    peer.destroy();
    
    // Determine where to redirect based on user role
    try {
      const { getApps } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js');
      const { getAuth } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
      const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
      
      const app = getApps()[0];
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const accountType = userData.accountType || userData.role || 'member';
          
          // Redirect based on role
          if (accountType === 'coach') {
            window.location.href = 'coach-dashboard.html';
          } else if (accountType === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'user-dashboard.html';
          }
          return;
        }
      }
    } catch (error) {
      console.warn('Error determining redirect:', error);
    }
    
    // Fallback: redirect to user dashboard
    window.location.href = 'user-dashboard.html';
  });
})();


