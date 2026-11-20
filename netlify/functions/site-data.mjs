import { getStore } from '@netlify/blobs';
import { createHmac, timingSafeEqual } from 'node:crypto';

const store = getStore({ name: 'shankar-bangle-store-live', consistency: 'strong' });
const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0'
};
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function signingSecret() {
  // OWNER_SESSION_SECRET is recommended. OWNER_PIN is a secure fallback so
  // the project still works when only the required OWNER_PIN is configured.
  return Netlify.env.get('OWNER_SESSION_SECRET') || Netlify.env.get('OWNER_PIN') || '';
}

function sign(value) {
  return createHmac('sha256', signingSecret()).update(value).digest('base64url');
}

function issueOwnerToken() {
  const payload = Buffer.from(JSON.stringify({
    role: 'owner',
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function isValidOwnerToken(token) {
  if (!token || !signingSecret()) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!safeEqual(signature, sign(payload))) return false;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return claims.role === 'owner' && Number.isFinite(claims.exp) && claims.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...JSON_HEADERS,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-owner-token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    });
  }

  if (request.method === 'GET') {
    try {
      const state = await store.get('published-state', { type: 'json' });
      return json({ state: state || null });
    } catch (error) {
      console.error('Unable to read published site data:', error);
      return json({ error: 'Unable to load published site data.' }, 500);
    }
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, POST, OPTIONS' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON request.' }, 400);
  }

  const configuredPin = Netlify.env.get('OWNER_PIN');
  if (!configuredPin) {
    return json({ error: 'OWNER_PIN environment variable is not configured in Netlify.' }, 503);
  }

  if (body?.action === 'auth') {
    const valid = typeof body.pin === 'string' && safeEqual(body.pin, configuredPin);
    return valid
      ? json({ authenticated: true, token: issueOwnerToken() })
      : json({ error: 'Incorrect owner PIN.' }, 401);
  }

  if (body?.action === 'save') {
    const token = request.headers.get('x-owner-token') || '';
    if (!isValidOwnerToken(token)) {
      return json({ error: 'Owner session is invalid or expired. Please log in again.' }, 401);
    }

    const state = body.state;
    if (!state || !Array.isArray(state.catalog)) {
      return json({ error: 'Invalid site data: catalog must be an array.' }, 400);
    }

    // Keep all shared editable content in Netlify Blobs so every visitor sees
    // the same catalog, branding, and homepage category/rotation settings.
    const publishedState = {
      catalog: state.catalog,
      logo: typeof state.logo === 'string' && state.logo ? state.logo : null,
      banner: typeof state.banner === 'string' && state.banner ? state.banner : null,
      homeCategories: Array.isArray(state.homeCategories) ? state.homeCategories : [],
      updatedAt: new Date().toISOString()
    };

    try {
      await store.setJSON('published-state', publishedState);
      return json({ saved: true, updatedAt: publishedState.updatedAt });
    } catch (error) {
      console.error('Unable to save published site data:', error);
      return json({ error: 'Netlify could not save the site data.' }, 500);
    }
  }

  return json({ error: 'Unknown action.' }, 400);
};
