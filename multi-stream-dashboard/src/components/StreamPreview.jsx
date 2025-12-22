import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js'; // npm install hls.js

const StreamPreview = ({ streamKey, srsServer }) => {
  const videoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const localStreamRef = useRef(null);

  // Feature 1: OBS Stream Display + Audio Toggle
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = `${srsServer}/live/${streamKey}.m3u8`;
    
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.muted = isMuted;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.muted = isMuted;
    }
  }, [streamKey, srsServer, isMuted]);

  // Feature 2: Browser Camera + Mic Capture
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      setCameras(devices.filter(d => d.kind === 'videoinput'));
      setMics(devices.filter(d => d.kind === 'audioinput'));
    });
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera },
        audio: { deviceId: selectedMic }
      });
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const toggleAudio = () => setIsMuted(!isMuted);

  return (
    <div className="stream-preview">
      {/* OBS/Vmix Stream Display */}
      <div className="obs-stream">
        <h3>📺 Live Stream Preview</h3>
        <video 
          ref={videoRef} 
          autoPlay 
          controls 
          muted={isMuted}
          width="100%" 
          height="300px"
          style={{ border: '2px solid #007bff', borderRadius: '8px' }}
        />
        <button onClick={toggleAudio} className="mute-btn">
          {isMuted ? '🔊 Unmute' : '🔇 Mute'}
        </button>
      </div>

      {/* Browser Camera Capture */}
      <div className="local-capture">
        <h3>📱 Direct Camera Capture</h3>
        <video 
          ref={localVideoRef} 
          autoPlay 
          muted 
          width="100%" 
          height="200px"
          style={{ border: '2px solid #28a745', borderRadius: '8px' }}
        />
        
        <div className="device-selectors">
          <select 
            value={selectedCamera} 
            onChange={(e) => setSelectedCamera(e.target.value)}
          >
            <option value="">Select Camera</option>
            {cameras.map((camera, i) => (
              <option key={i} value={camera.deviceId}>
                {camera.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedMic} 
            onChange={(e) => setSelectedMic(e.target.value)}
          >
            <option value="">Select Mic</option>
            {mics.map((mic, i) => (
              <option key={i} value={mic.deviceId}>
                {mic.label || `Mic ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
        
        <button onClick={startLocalStream} className="capture-btn">
          🎥 Start Capture
        </button>
      </div>
    </div>
  );
};

export default StreamPreview;
