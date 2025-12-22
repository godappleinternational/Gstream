// src/StreamKeyManager.js
import React, { useState } from 'react';

// Platforms with templates to generate embed URLs from stream keys/IDs
const platformEmbedTemplates = {
  facebook: (key) => `https://www.facebook.com/video/embed?video_id=${key}`,
  youtube: (key) => `https://www.youtube.com/embed/${key}`,
  twitch: (key) => `https://player.twitch.tv/?channel=${key}&parent=localhost`, // Replace parent with your domain in prod
};

const defaultPlatforms = [
  { name: 'Facebook', id: 'facebook' },
  { name: 'YouTube', id: 'youtube' },
  { name: 'Twitch', id: 'twitch' },
];

function generateEmbedUrl(platformId, streamKeyOrUrl) {
  if (!streamKeyOrUrl) return null;

  // If it's a full URL (for custom RTMP or full URL), use as-is
  if (streamKeyOrUrl.startsWith('http://') || streamKeyOrUrl.startsWith('https://')) {
    return streamKeyOrUrl;
  }

  // Otherwise, try to generate embed URL using known platform templates
  const template = platformEmbedTemplates[platformId];
  if (template) {
    return template(streamKeyOrUrl);
  }

  // Unknown platform or no template: return null (no preview)
  return null;
}

export default function StreamKeyManager() {
  const [streams, setStreams] = useState([
    { id: 'facebook', platform: 'Facebook', streamKey: '' },
    { id: 'youtube', platform: 'YouTube', streamKey: '' },
    { id: 'twitch', platform: 'Twitch', streamKey: '' },
  ]);

  const [customStreams, setCustomStreams] = useState([]);

  // Update stream key for platform/custom stream
  const updateStreamKey = (id, value, isCustom = false) => {
    if (isCustom) {
      setCustomStreams(prev =>
        prev.map(s => (s.id === id ? { ...s, streamKey: value } : s))
      );
    } else {
      setStreams(prev =>
        prev.map(s => (s.id === id ? { ...s, streamKey: value } : s))
      );
    }
  };

  // Add a new custom RTMP stream input
  const addCustomStream = () => {
    setCustomStreams(prev => [
      ...prev,
      { id: 'custom-' + Date.now(), platform: 'Custom RTMP', streamKey: '' },
    ]);
  };

  // Remove a custom RTMP stream input
  const removeCustomStream = (id) => {
    setCustomStreams(prev => prev.filter(s => s.id !== id));
  };

  // Gather all streams to pass to preview
  const allStreams = [...streams, ...customStreams].filter(s => s.streamKey.trim() !== '');

  // Generate embed URLs for all streams
  const streamPreviews = allStreams
    .map(({ id, platform, streamKey }) => {
      const embedUrl = generateEmbedUrl(id, streamKey.trim());
      return embedUrl ? { id, platform, embedUrl } : null;
    })
    .filter(Boolean); // Remove nulls

  return (
    <div>
      <h2>Manage Stream Keys & Preview</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          alert('Saved Stream Keys:\n' + JSON.stringify(allStreams, null, 2));
        }}
      >
        {streams.map(({ id, platform, streamKey }) => (
          <div key={id} style={{ marginBottom: 10 }}>
            <label>
              {platform} Stream Key or ID:
              <input
                type="text"
                value={streamKey}
                onChange={e => updateStreamKey(id, e.target.value)}
                placeholder={`Enter ${platform} stream key or ID`}
                style={{ marginLeft: 10, width: 300 }}
              />
            </label>
          </div>
        ))}

        <hr />

        <h3>Custom RTMP Streams</h3>
        {customStreams.length === 0 && <p>No custom streams added.</p>}
        {customStreams.map(({ id, platform, streamKey }) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ flexGrow: 1 }}>
              {platform} URL:
              <input
                type="text"
                value={streamKey}
                onChange={e => updateStreamKey(id, e.target.value, true)}
                placeholder="Enter custom RTMP or embed URL"
                style={{ marginLeft: 10, width: 300 }}
              />
            </label>
            <button
              type="button"
              onClick={() => removeCustomStream(id)}
              style={{ marginLeft: 10, backgroundColor: 'red', color: 'white' }}
            >
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addCustomStream}>
          Add Custom RTMP Stream
        </button>

        <hr />
        <button type="submit">Save Stream Keys</button>
      </form>

      <h3 style={{ marginTop: 30 }}>Live Stream Previews</h3>
      {streamPreviews.length === 0 && <p>No streams to preview yet.</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
          gap: 10,
          marginTop: 10,
        }}
      >
        {streamPreviews.map(({ id, platform, embedUrl }) => (
          <div key={id} style={{ border: '1px solid #ccc', padding: 10 }}>
            <h4>{platform} Preview</h4>
            <iframe
              src={embedUrl}
              width="100%"
              height="180"
              frameBorder="0"
              allowFullScreen
              title={`${platform} stream preview`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
