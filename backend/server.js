require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createLicense, verifyLicense, getLicenseByCustomer, cancelLicense } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe webhook needs raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cors());

// ── Create Checkout Session ─────────────────────────────────────

app.post('/api/create-checkout', async (req, res) => {
  const { tier, email, extensionId } = req.body;

  if (!['basic', 'premium'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier. Must be "basic" or "premium".' });
  }

  const priceId = tier === 'basic'
    ? process.env.BASIC_PRICE_ID
    : process.env.PREMIUM_PRICE_ID;

  if (!priceId) {
    return res.status(500).json({ error: 'Price not configured on server.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${process.env.FRONTEND_URL || 'https://ease-moji.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://ease-moji.app'}/cancel`,
      metadata: { tier, extension_id: extensionId },
    });

    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Stripe Webhook ──────────────────────────────────────────────

app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const tier = session.metadata?.tier || 'basic';
        const email = session.customer_details?.email;

        // Calculate expiry (30 days from now for monthly)
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const licenseKey = createLicense({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          tier,
          email,
          expiresAt,
        });

        console.log(`License created: ${licenseKey} (${tier}) for ${email}`);

        // In production: send license key via email
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;

        // Extend license by 30 days from now
        const license = getLicenseByCustomer(customerId);
        if (license) {
          const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const { getDb } = require('./db');
          getDb().prepare('UPDATE licenses SET expires_at = ?, status = ? WHERE stripe_customer_id = ?')
            .run(newExpiry, 'active', customerId);
          console.log(`License renewed for customer ${customerId}`);
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;

        if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
          cancelLicense(subscription.id);
          console.log(`License cancelled for subscription ${subscription.id}`);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Verify License ─────────────────────────────────────────────

app.get('/api/verify', (req, res) => {
  const { license } = req.query;

  if (!license) {
    return res.status(400).json({ valid: false, reason: 'missing_license' });
  }

  const result = verifyLicense(license.trim().toUpperCase());
  
  if (result.valid) {
    res.json({
      valid: true,
      tier: result.tier,
      expires_at: result.expires_at,
    });
  } else {
    res.json({
      valid: false,
      reason: result.reason,
    });
  }
});

// ── Payment Success Page ────────────────────────────────────────

app.get('/success', async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.send(renderPage(null, 'No session ID provided.'));
  }

  let license = null;
  let attempts = 0;

  // Retry loop: webhook might arrive slightly before or after the redirect
  while (!license && attempts < 10) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const customerId = session.customer;

      if (customerId) {
        license = getLicenseByCustomer(customerId);
      }

      if (!license) {
        // Also try by subscription ID
        if (session.subscription) {
          const { getDb } = require('./db');
          license = getDb().prepare('SELECT * FROM licenses WHERE stripe_subscription_id = ?').get(session.subscription);
        }
      }
    } catch (e) {
      console.error('Success page error:', e.message);
    }

    if (!license) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
  }

  if (license) {
    res.send(renderPage(license, null));
  } else {
    res.send(renderPage(null, 'License not found yet. Please check your email for the license key, or contact support.'));
  }
});

function renderPage(license, error) {
  const key = license?.license_key || '';
  const tier = license?.tier === 'premium' ? '👑 Premium' : license?.tier === 'basic' ? '🚀 Basic' : '';
  const expires = license?.expires_at ? new Date(license.expires_at).toLocaleDateString() : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ease-Moji — License Activated</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0f172a; color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 20px;
    }
    .card {
      background: #1e293b; border: 1px solid #334155; border-radius: 16px;
      padding: 40px; max-width: 520px; width: 100%; text-align: center;
    }
    .card h1 { font-size: 28px; margin-bottom: 8px; }
    .card .sub { color: #94a3b8; font-size: 14px; margin-bottom: 28px; }
    .badge {
      display: inline-block; padding: 6px 16px; border-radius: 999px;
      font-size: 13px; font-weight: 600; margin-bottom: 20px;
    }
    .badge.basic { background: #22c55e22; color: #22c55e; border: 1px solid #22c55e44; }
    .badge.premium { background: #8b5cf622; color: #8b5cf6; border: 1px solid #8b5cf644; }
    .key-box {
      background: #0f172a; border: 1px solid #334155; border-radius: 10px;
      padding: 16px 20px; margin: 16px 0; word-break: break-all;
      font-family: 'SF Mono', 'Fira Code', monospace; font-size: 14px;
      letter-spacing: 0.5px; user-select: all; cursor: pointer;
    }
    .key-box:hover { border-color: #8b5cf6; }
    .steps { text-align: left; margin: 24px 0; }
    .steps ol { padding-left: 20px; color: #94a3b8; font-size: 13px; line-height: 2; }
    .btn {
      display: inline-block; padding: 12px 28px; border-radius: 8px;
      background: #8b5cf6; color: #fff; text-decoration: none;
      font-size: 14px; font-weight: 500; margin-top: 8px;
    }
    .btn:hover { background: #7c3aed; }
    .error { color: #ef4444; font-size: 14px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>😀 Ease-Moji</h1>
    <p class="sub">${error ? 'Something went wrong' : 'Your license is ready!'}</p>
    ${error ? `<div class="error">${error}</div>` : `
      <div class="badge ${license?.tier}">${tier}</div>
      <p style="color:#94a3b8;font-size:13px;margin-bottom:8px">Your license key</p>
      <div class="key-box" onclick="navigator.clipboard.writeText('${key}');this.textContent='✓ Copied!';setTimeout(()=>this.textContent='${key}',2000)">${key}</div>
      ${expires ? `<p style="color:#94a3b8;font-size:12px">Expires ${expires}</p>` : ''}
      <div class="steps">
        <ol>
          <li>Click the key above to copy it</li>
          <li>Open <strong>Ease-Moji Settings</strong></li>
          <li>Paste into the <strong>License Key</strong> field</li>
          <li>Click <strong>Activate</strong></li>
        </ol>
      </div>
      <p style="color:#94a3b8;font-size:12px">A copy was also sent to your email.</p>
    `}
  </div>
</body>
</html>`;
}

// ── Health Check ───────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ease-Moji backend running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});
