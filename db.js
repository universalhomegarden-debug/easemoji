const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'ease-moji.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key TEXT UNIQUE NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        tier TEXT NOT NULL CHECK(tier IN ('basic', 'premium')),
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
        email TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT,
        last_verified_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_license_key ON licenses(license_key);
      CREATE INDEX IF NOT EXISTS idx_stripe_customer ON licenses(stripe_customer_id);
    `);
  }
  return db;
}

function createLicense({ stripeCustomerId, stripeSubscriptionId, tier, email, expiresAt }) {
  const { v4: uuid } = require('uuid');
  const licenseKey = `EM-${uuid().slice(0, 8).toUpperCase()}-${uuid().slice(0, 4).toUpperCase()}-${uuid().slice(0, 4).toUpperCase()}-${uuid().slice(0, 12).toUpperCase()}`;

  const stmt = getDb().prepare(`
    INSERT INTO licenses (license_key, stripe_customer_id, stripe_subscription_id, tier, email, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(licenseKey, stripeCustomerId, stripeSubscriptionId, tier, email, expiresAt);
  return licenseKey;
}

function verifyLicense(licenseKey) {
  const row = getDb().prepare('SELECT * FROM licenses WHERE license_key = ?').get(licenseKey);
  if (!row) return { valid: false, reason: 'not_found' };
  if (row.status !== 'active') return { valid: false, reason: row.status };
  
  // Check expiration
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    getDb().prepare('UPDATE licenses SET status = ? WHERE license_key = ?').run('expired', licenseKey);
    return { valid: false, reason: 'expired' };
  }

  // Update last verified
  getDb().prepare('UPDATE licenses SET last_verified_at = datetime("now") WHERE license_key = ?').run(licenseKey);

  return {
    valid: true,
    tier: row.tier,
    license_key: row.license_key,
    expires_at: row.expires_at,
    created_at: row.created_at,
  };
}

function getLicenseByCustomer(stripeCustomerId) {
  return getDb().prepare('SELECT * FROM licenses WHERE stripe_customer_id = ?').get(stripeCustomerId);
}

function cancelLicense(stripeSubscriptionId) {
  getDb().prepare('UPDATE licenses SET status = ? WHERE stripe_subscription_id = ?').run('cancelled', stripeSubscriptionId);
}

module.exports = { createLicense, verifyLicense, getLicenseByCustomer, cancelLicense };
