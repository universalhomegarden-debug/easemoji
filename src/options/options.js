// ─── Ease-Moji Options ─────────────────────────────────────────────

import { getSettings, updateSettings, setLicenseKey, clearLicense, verifyLicenseWithBackend, BACKEND_URL } from '../lib/storage.js';

const $ = id => document.getElementById(id);

async function loadSettings() {
  const s = await getSettings();
  $('themeSelect').value = s.theme || 'system';
  $('sizeSelect').value = s.emojiSize || 'medium';

  // License key
  if (s.licenseKey) {
    $('licenseInput').value = s.licenseKey;
    updateLicenseStatus(s);
  }

  updatePlanUI(s);
}

function updatePlanUI(s) {
  if (s.licenseKey && s.licenseTier) {
    $('activePlanCard').style.display = 'block';
    const tierName = s.licenseTier === 'premium' ? '👑 Premium' : '🚀 Basic';
    const expires = s.licenseExpires ? new Date(s.licenseExpires).toLocaleDateString() : 'never';
    $('activePlanText').textContent = `${tierName} — expires ${expires}`;
    $('activePlanText').style.color = s.licenseTier === 'premium' ? '#8b5cf6' : '#22c55e';
    $('basicPremiumBtn').textContent = 'Subscribe';
    $('basicPremiumBtn').disabled = false;
    $('topTierBtn').textContent = 'Premium Upgrade';
    $('topTierBtn').disabled = false;
  } else {
    $('activePlanCard').style.display = 'block';
    $('activePlanText').textContent = '💎 Free plan';
    $('activePlanText').style.color = 'var(--text-dim)';
    $('basicPremiumBtn').textContent = 'Subscribe';
    $('basicPremiumBtn').disabled = false;
    $('topTierBtn').textContent = 'Premium Upgrade';
    $('topTierBtn').disabled = false;
  }
}

function updateLicenseStatus(s) {
  const el = $('licenseStatus');
  if (s.licenseKey && s.licenseTier) {
    const tier = s.licenseTier === 'premium' ? 'Premium' : 'Basic';
    const expires = s.licenseExpires ? new Date(s.licenseExpires).toLocaleDateString() : 'never';
    const expired = s.licenseExpires && new Date(s.licenseExpires) < new Date();
    if (expired) {
      el.textContent = `⚠️ ${tier} license expired on ${expires}`;
      el.style.color = '#ef4444';
    } else {
      el.textContent = `✅ ${tier} license active — expires ${expires}`;
      el.style.color = '#22c55e';
    }
  } else {
    el.textContent = '';
  }
}

// ── Settings save ──────────────────────────────────────────────

$('themeSelect').addEventListener('change', () => {
  updateSettings({ theme: $('themeSelect').value });
});

$('sizeSelect').addEventListener('change', () => {
  updateSettings({ emojiSize: $('sizeSelect').value });
});

// ── Subscription buttons ────────────────────────────────────────

const STRIPE_LINKS = {
  basic: 'https://buy.stripe.com/bJe4gyfFT9lEeOa19N5gc00',
  premium: 'https://buy.stripe.com/8x27sK2T70P8gWibOr5gc01',
};

function openCheckout(tier) {
  const url = STRIPE_LINKS[tier];
  if (url) chrome.tabs.create({ url });
}

$('basicPremiumBtn').addEventListener('click', () => openCheckout('basic'));

$('topTierBtn').addEventListener('click', () => openCheckout('premium'));

$('deactivateBtn').addEventListener('click', async () => {
  if (!confirm('Clear your license key?')) return;
  await clearLicense();
  const s = await getSettings();
  updatePlanUI(s);
  $('licenseInput').value = '';
  $('licenseStatus').textContent = '';
  showToast('License removed');
});

// ── License activation ─────────────────────────────────────────

$('activateBtn').addEventListener('click', async () => {
  const key = $('licenseInput').value.trim();
  if (!key) {
    $('licenseStatus').textContent = 'Please enter a license key';
    $('licenseStatus').style.color = '#ef4444';
    return;
  }

  $('activateBtn').disabled = true;
  $('activateBtn').textContent = 'Verifying...';

  const result = await verifyLicenseWithBackend(key);
  if (result.valid) {
    await setLicenseKey(key, result.tier, result.expires_at);
    $('licenseStatus').textContent = `✅ ${result.tier === 'premium' ? 'Premium' : 'Basic'} license activated!`;
    $('licenseStatus').style.color = '#22c55e';
    const s = await getSettings();
    updatePlanUI(s);
  } else {
    const reasons = { not_found: 'License key not found', expired: 'License has expired', cancelled: 'License was cancelled', network_error: 'Could not reach server.' };
    $('licenseStatus').textContent = `❌ ${reasons[result.reason] || 'Invalid license key'}`;
    $('licenseStatus').style.color = '#ef4444';
  }

  $('activateBtn').disabled = false;
  $('activateBtn').textContent = 'Activate';
});

$('licenseInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('activateBtn').click();
});

// ── Toast helper ───────────────────────────────────────────────

function showToast(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#8b5cf6;color:#fff;padding:8px 18px;border-radius:20px;font-size:13px;z-index:999;animation:emFade 1.5s forwards;pointer-events:none;';
  const style = document.createElement('style');
  style.textContent = '@keyframes emFade{0%{opacity:0;transform:translateX(-50%) translateY(10px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}75%{opacity:1}to{opacity:0}}';
  document.head.appendChild(style);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

document.addEventListener('DOMContentLoaded', loadSettings);
