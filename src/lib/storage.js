// ─── Ease-Moji Storage ─────────────────────────────────────────────

const BACKEND_URL = 'https://ease-moji-backend.onrender.com'; // ← Change to your deployed backend URL

const DEFAULTS = {
  theme: 'system',      // 'light' | 'dark' | 'system'
  emojiSize: 'medium',  // 'small' | 'medium' | 'large'
  recentEmojis: [],     // max 20 recent emojis
  premium: { active: false, token: null, expires: null },
  topTier: { active: false, token: null, expires: null },
  position: 'bottom',
  skinTone: 'default',
  licenseKey: null,     // paid subscription license
  licenseTier: null,    // 'basic' | 'premium' | null
  licenseExpires: null,
};

export async function getSettings() {
  const r = await chrome.storage.local.get('settings');
  const saved = r.settings || {};
  return {
    ...DEFAULTS,
    ...saved,
    premium: { ...DEFAULTS.premium, ...(saved.premium || {}) },
    topTier: { ...DEFAULTS.topTier, ...(saved.topTier || {}) },
  };
}

export async function updateSettings(patch) {
  const cur = await getSettings();
  const merged = { ...cur, ...patch };
  await chrome.storage.local.set({ settings: merged });
  return merged;
}

export async function addRecent(emojiChar) {
  const s = await getSettings();
  let recents = s.recentEmojis || [];
  recents = recents.filter(e => e !== emojiChar);
  recents.unshift(emojiChar);
  if (recents.length > 20) recents = recents.slice(0, 20);
  await updateSettings({ recentEmojis: recents });
  return recents;
}

// ── Check if premium is active ──────────────────────────────

export function isPremium(settings) {
  if (settings.premium?.active) return true;
  // Check paid license
  if (settings.licenseKey && (settings.licenseTier === 'basic' || settings.licenseTier === 'premium')) {
    if (!settings.licenseExpires || new Date(settings.licenseExpires) > new Date()) return true;
  }
  return false;
}

export function isTopTier(settings) {
  if (settings.topTier?.active) return true;
  // Check paid license
  if (settings.licenseKey && settings.licenseTier === 'premium') {
    if (!settings.licenseExpires || new Date(settings.licenseExpires) > new Date()) return true;
  }
  return false;
}

// ── License / Subscription Management ─────────────────────────

export function getActiveTier(settings) {
  // Licensed subscription
  if (settings.licenseKey && settings.licenseTier) {
    if (settings.licenseExpires && new Date(settings.licenseExpires) < new Date()) {
      return null; // expired
    }
    return settings.licenseTier;
  }

  return null;
}

export async function setLicenseKey(licenseKey, tier, expiresAt) {
  await updateSettings({
    licenseKey,
    licenseTier: tier,
    licenseExpires: expiresAt,
  });
}

export async function clearLicense() {
  await updateSettings({
    licenseKey: null,
    licenseTier: null,
    licenseExpires: null,
  });
}

export async function verifyLicenseWithBackend(licenseKey) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/verify?license=${encodeURIComponent(licenseKey.trim())}`);
    const data = await res.json();
    return data;
  } catch (e) {
    return { valid: false, reason: 'network_error' };
  }
}

export { BACKEND_URL };
