// ─── Ease-Moji Service Worker ──────────────────────────────────────

const BACKEND_URL = 'https://ease-moji-backend.onrender.com'; // ← Same as storage.js

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
  if (details.reason === 'install' || details.reason === 'update') {
    verifyLicense();
  }
});

// ── Periodic license check ────────────────────────────────────

async function verifyLicense() {
  const { settings = {} } = await chrome.storage.local.get('settings');
  if (!settings.licenseKey) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/verify?license=${encodeURIComponent(settings.licenseKey)}`);
    const data = await res.json();
    if (data.valid) {
      await chrome.storage.local.set({
        settings: { ...settings, licenseTier: data.tier, licenseExpires: data.expires_at }
      });
    } else if (data.reason === 'expired' || data.reason === 'cancelled') {
      await chrome.storage.local.set({
        settings: { ...settings, licenseTier: null, licenseExpires: null }
      });
    }
  } catch (e) {
    // Network error — retry next cycle
  }
}

chrome.alarms.create('license-check', { periodInMinutes: 360 });
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'license-check') verifyLicense();
});
