// ─── Ease-Moji Popup ──────────────────────────────────────────────

import { FREE_EMOJIS, PREMIUM_EMOJIS } from '../lib/emoji-data.js';
import { addRecent, getSettings, isPremium } from '../lib/storage.js';

const $ = id => document.getElementById(id);
const grid = $('grid');
const search = $('search');
const upgradeLink = $('upgradeLink');
const settingsBtn = $('settingsBtn');

let settings = {};

async function init() {
  settings = await getSettings();

  $('settingsBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());
  $('upgradeLink').addEventListener('click', () => chrome.runtime.openOptionsPage());
  $('search').addEventListener('input', renderGrid);

  renderGrid();
}

function renderGrid() {
  const q = search.value.toLowerCase().trim();
  grid.innerHTML = '';
  const emojiSets = [FREE_EMOJIS];
  if (isPremium(settings)) emojiSets.push(PREMIUM_EMOJIS);

  if (q) {
    // Search mode
    let count = 0;
    for (const set of emojiSets) {
      for (const [cat, items] of Object.entries(set)) {
        for (const item of items) {
          if (item.n.toLowerCase().includes(q)) {
            const btn = document.createElement('button');
            btn.textContent = item.e;
            btn.title = item.n;
            btn.addEventListener('click', () => copyEmoji(item.e));
            grid.appendChild(btn);
            if (++count >= 60) break;
          }
        }
        if (count >= 60) break;
      }
      if (count >= 60) break;
    }
    if (count === 0) {
      grid.innerHTML = '<div class="no-results">No emojis found</div>';
    }
    return;
  }

  // Recent
  const recents = settings.recentEmojis || [];
  if (recents.length > 0) {
    const h = document.createElement('div');
    h.className = 'section-h';
    h.textContent = 'Recent';
    grid.appendChild(h);
    for (const em of recents.slice(0, 8)) {
      const btn = document.createElement('button');
      btn.textContent = em;
      btn.addEventListener('click', () => copyEmoji(em));
      grid.appendChild(btn);
    }
  }

  // Show first items from each category
  const cats = Object.keys(FREE_EMOJIS);
  for (const cat of cats) {
    const items = FREE_EMOJIS[cat];
    if (!items || items.length === 0) continue;
    const h = document.createElement('div');
    h.className = 'section-h';
    h.textContent = cat;
    grid.appendChild(h);
    const toShow = items.slice(0, 16);
    for (const item of toShow) {
      const btn = document.createElement('button');
      btn.textContent = item.e;
      btn.title = item.n;
      btn.addEventListener('click', () => copyEmoji(item.e));
      grid.appendChild(btn);
    }
  }
}

async function copyEmoji(emojiChar) {
  try {
    await navigator.clipboard.writeText(emojiChar);
    await addRecent(emojiChar);
    // Brief visual feedback
    const popup = document.createElement('div');
    popup.textContent = `✅ Copied ${emojiChar}`;
    popup.style.cssText = 'position:fixed;bottom:8px;left:50%;transform:translateX(-50%);background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;z-index:999;animation:fadeOut 1.2s forwards;pointer-events:none;';
    const style = document.createElement('style');
    style.textContent = '@keyframes fadeOut{0%{opacity:1}70%{opacity:1}to{opacity:0}}';
    document.head.appendChild(style);
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1200);
  } catch {}
}

document.addEventListener('DOMContentLoaded', init);
