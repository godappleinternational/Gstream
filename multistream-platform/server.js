const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs/promises'); // Use promise-based fs API
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.json({ message: '🚀 Gstream Backend LIVE on port 4000!' });
});


// === EDIT THESE TO YOUR ENVIRONMENT ===
const SRS_CONFIG_FILE = '/path/to/your/srs.conf'; // Full path to your SRS main config file
const SRS_RELOAD_COMMAND = 'systemctl reload srs'; // Command to reload SRS after config change
// ======================================

// Helper function to update SRS config and reload it
async function updateSRSRelay({ facebook, youtube, twitch }) {
  // Validate or sanitize input stream keys
  facebook = facebook ? facebook.trim() : '';
  youtube = youtube ? youtube.trim() : '';
  twitch = twitch ? twitch.trim() : '';

  // Build the relay push configuration parts conditionally
  const relayPushes = [];

  if (youtube) {
    relayPushes.push(`push rtmp://a.rtmp.youtube.com/live2/${youtube};`);
  }
  if (facebook) {
    relayPushes.push(`push rtmp://live-api-s.facebook.com:80/rtmp/${facebook};`);
  }
  if (twitch) {
    relayPushes.push(`push rtmp://live.twitch.tv/app/${twitch};`);
  }

  // Compose the full relay config block
  const relayBlock = `
vhost live {
  relay {
    enabled on;
    ${relayPushes.join('\n    ')}
  }
}
`;

  try {
    // Write the new config (overwrites file entirely)
    await fs.writeFile(SRS_CONFIG_FILE, relayBlock, 'utf8');
    console.log('SRS config updated successfully.');

    // Reload SRS server to apply new config
    const { stdout, stderr } = await execAsync(SRS_RELOAD_COMMAND);
    console.log('SRS reload output:', stdout);
    if (stderr) console.error('SRS reload error output:', stderr);
  } catch (err) {
    console.error('Error updating or reloading SRS:', err);
    throw err;
  }
}

// API endpoint to start relay with the provided stream keys
app.post('/api/startRelay', async (req, res) => {
  try {
    const { facebook, youtube, twitch } = req.body;
    console.log('Received startRelay request:', req.body);

    if (!facebook && !youtube && !twitch) {
      return res.status(400).json({ error: 'At least one stream key (facebook, youtube, or twitch) is required.' });
    }

    await updateSRSRelay({ facebook, youtube, twitch });
    res.json({ message: 'Relay config updated and SRS reloaded successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update relay config or reload SRS.' });
  }
});

// API endpoint to stop/clear all relays
app.post('/api/stopRelay', async (req, res) => {
  try {
    console.log('Received stopRelay request');
    // Clear all relay pushes by passing empty keys
    await updateSRSRelay({ facebook: '', youtube: '', twitch: '' });
    res.json({ message: 'All streams stopped and relay config cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear relay config or reload SRS.' });
  }
});

// Health check / simple status endpoint (optional)
app.get('/api/status', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Start Express server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
