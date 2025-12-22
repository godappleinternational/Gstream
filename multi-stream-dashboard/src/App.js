import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import StreamPreview from './components/StreamPreview'; // NEW IMPORT

const platformEmbedUrls = {
  youtube: (id) => `https://www.youtube.com/embed/${id}`,
  twitch: (channel) =>
    `https://player.twitch.tv/?channel=${channel}&parent=localhost`,
  facebook: (id) =>
    `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/facebook/videos/${id}/&show_text=0&width=560`,
};

export default function App() {
  const srsServerHost = process.env.REACT_APP_SRS_SERVER_HOST || 'G-App-Stream';
  const [ingestStreamKey, setIngestStreamKey] = useState('mystreamkey');
  const [streams, setStreams] = useState([
    { id: 'facebook', platform: 'Facebook', streamKey: '', status: '' },
    { id: 'youtube', platform: 'YouTube', streamKey: '', status: '' },
    { id: 'twitch', platform: 'Twitch', streamKey: '', status: '' },
  ]);

  const updateStreamKey = (id, key) => {
    setStreams((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, streamKey: key, status: key.trim() ? 'Live' : 'Offline' } : s
      )
    );
  };

  const ingestUrl = `rtmp://${srsServerHost}/live/${ingestStreamKey}`;

  const handleStartAllStreams = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/startRelay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebook: streams.find((s) => s.id === 'facebook').streamKey.trim(),
          youtube: streams.find((s) => s.id === 'youtube').streamKey.trim(),
          twitch: streams.find((s) => s.id === 'twitch').streamKey.trim(),
        }),
      });
      alert('Relay started! Streams should go live shortly.');
    } catch (error) {
      alert('Failed to start relay. Check backend server.');
      console.error(error);
    }
  };

  const handleStopAllStreams = async () => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stopRelay`, {
        method: 'POST',
      });
      alert('Relay stopped.');
    } catch (error) {
      alert('Failed to stop relay. Check backend server.');
      console.error(error);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', px: 4, py: 6, color: '#0B1D4F' }}>
      {/* Title, Account, RTMP sections - SAME AS BEFORE */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          fontSize: '3rem',
          fontWeight: '900',
          color: '#1A73E8',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          textAlign: 'center',
          marginBottom: 20,
          userSelect: 'none',
        }}
      >
        Gapp Stream
      </motion.div>

      {/* Account Details Card - SAME */}
      <Card sx={{ maxWidth: 400, mx: 'auto', mb: 6, bgcolor: '#fff', borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom color="#0B1D4F" textAlign="center">
            Support us
          </Typography>
          <Typography variant="body1" color="#0B1D4F" sx={{ mb: 0.5 }}>
            <strong>Bank Name:</strong> Palm Pay
          </Typography>
          <Typography variant="body1" color="#0B1D4F" sx={{ mb: 0.5 }}>
            <strong>Account Number:</strong> 8038460691
          </Typography>
          <Typography variant="body1" color="#0B1D4F">
            <strong>Account Name:</strong> Joshua Olakunle
          </Typography>
        </CardContent>
      </Card>

      {/* SRS Server Host - SAME */}
      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>SRS Server Host:</strong> {srsServerHost}
        </Typography>
      </Box>

      {/* RTMP Ingest URL - SAME */}
      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 6, p: 3, bgcolor: '#1A73E8', borderRadius: 2, color: 'white', textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          RTMP Ingest URL for OBS / vMix
        </Typography>
        <TextField
          label="Ingest Stream Key"
          variant="filled"
          value={ingestStreamKey}
          onChange={(e) => setIngestStreamKey(e.target.value)}
          sx={{ bgcolor: 'white', borderRadius: 1, mb: 2, maxWidth: 300, mx: 'auto' }}
          inputProps={{ style: { color: '#0B1D4F', fontWeight: 'bold' } }}
          helperText="Type a unique key for your stream"
        />
        <Box sx={{ bgcolor: '#7AA9F7', p: 1, borderRadius: 1, wordBreak: 'break-word', userSelect: 'all', fontWeight: 'medium', fontSize: '1rem', mx: 'auto', maxWidth: 600 }}>
          {ingestUrl}
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Copy this URL and use it in your streaming software (OBS, vMix, etc.).
        </Typography>
      </Box>

      {/* 🔥 NEW VIDEO PREVIEW SECTION */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#0B1D4F', textAlign: 'center' }}>
          🎥 Live Stream Preview & Camera Capture
        </Typography>
        <StreamPreview streamKey={ingestStreamKey} srsServer={srsServerHost} />
      </Box>

      {/* Rest of your existing code - Social media inputs, buttons, previews - SAME AS BEFORE */}
      <Grid container spacing={4} maxWidth={900} sx={{ mx: 'auto', mb: 6 }}>
        {streams.map(({ id, platform, streamKey, status }) => (
          <Grid item xs={12} md={4} key={id}>
            <Card variant="outlined" sx={{ bgcolor: '#F8F9FA' }}>
              <CardHeader
                title={<Typography variant="h6" sx={{ color: '#0B1D4F' }}>{platform}</Typography>}
                action={<Chip label={status || 'Offline'} color={status === 'Live' ? 'success' : 'default'} size="small" />}
              />
              <CardContent>
                <TextField
                  fullWidth
                  label={`${platform} Stream Key / ID`}
                  variant="outlined"
                  value={streamKey}
                  onChange={(e) => updateStreamKey(id, e.target.value)}
                  placeholder={`Enter your ${platform} stream key or ID`}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 6, textAlign: 'center' }}>
        <Button variant="contained" color="primary" sx={{ mr: 2, bgcolor: '#1A73E8' }} onClick={handleStartAllStreams}>
          Start All Streams
        </Button>
        <Button variant="outlined" color="primary" sx={{ color: '#1A73E8', borderColor: '#1A73E8' }} onClick={handleStopAllStreams}>
          Stop All Streams
        </Button>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#0B1D4F' }}>Live Stream Previews</Typography>
        <Grid container spacing={3}>
          {streams.filter((s) => s.streamKey.trim()).map(({ id, platform, streamKey }) => {
            const embedUrl = platformEmbedUrls[id](streamKey.trim());
            return (
              <Grid item xs={12} md={4} key={`preview-${id}`}>
                <Card>
                  <CardHeader
                    title={<Typography variant="subtitle1" sx={{ color: '#0B1D4F' }}>{platform} Preview</Typography>}
                    sx={{ bgcolor: '#1A73E8', color: 'white' }}
                  />
                  <Box
                    component="iframe"
                    src={embedUrl}
                    width="100%"
                    height="200"
                    frameBorder="0"
                    allowFullScreen
                    sx={{ display: 'block' }}
                    title={`${platform} live preview`}
                  />
                </Card>
              </Grid>
            );
          })}
          {streams.filter((s) => !s.streamKey.trim()).length === streams.length && (
            <Typography sx={{ mt: 4, mx: 'auto', color: '#555' }}>
              Enter stream keys to see live previews here.
            </Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
