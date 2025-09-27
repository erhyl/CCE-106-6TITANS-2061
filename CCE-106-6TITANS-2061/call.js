// Simple PeerJS-based 1:1 call using public cloud server
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room') || Math.random().toString(36).slice(2, 10);
  document.getElementById('roomIdText').textContent = roomId;

  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const toggleCamBtn = document.getElementById('toggleCam');
  const toggleMicBtn = document.getElementById('toggleMic');
  const shareScreenBtn = document.getElementById('shareScreen');
  const copyLinkBtn = document.getElementById('copyLink');
  const hangupBtn = document.getElementById('hangup');

  let localStream = null;
  let currentCall = null;

  const peer = new Peer(undefined, { debug: 1 });

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
    await initMedia();
    // Use a simple signaling via PeerJS rooms using roomId as peer id heuristic
    // Strategy: One side uses the actual peer id; the other tries to call all peers announced via room text chat is not available here.
    // Workaround: If URL has room param, assume the other user will open same link; use PeerJS connect datachannel to exchange ids.
    const conn = peer.connect(roomId);
    conn.on('open', () => {
      conn.send({ type: 'introduce', id });
    });
    conn.on('error', () => {});

    peer.on('connection', (incoming) => {
      incoming.on('data', (msg) => {
        if (msg && msg.type === 'introduce' && msg.id) {
          callPeerIfReady(msg.id);
        }
      });
      incoming.on('open', () => {
        incoming.send({ type: 'introduce', id });
      });
    });
  });

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
    if (track) track.enabled = !track.enabled;
  });

  toggleMicBtn.addEventListener('click', () => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (track) track.enabled = !track.enabled;
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

  hangupBtn.addEventListener('click', () => {
    if (currentCall) currentCall.close();
    peer.destroy();
    window.location.href = 'coach-dashboard.html';
  });
})();


