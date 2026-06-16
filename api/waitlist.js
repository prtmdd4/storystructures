/* api/waitlist.js — serverless: email waitlist capture
   POST { email: string, source?: string }
   Returns { ok: true } or { error }
*/

import { createClient } from '@supabase/supabase-js';

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  const email  = (body?.email  || '').trim().toLowerCase().slice(0, 254);
  const source = (body?.source || 'home').slice(0, 50);

  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'Please enter a valid email address' });
    return;
  }

  if (!supabase) {
    /* Dev mode: just confirm without storing */
    console.log(`[waitlist] ${email} (${source}) — no Supabase configured`);
    res.status(200).json({ ok: true, dev: true });
    return;
  }

  const { error } = await supabase
    .from('ss_waitlist')
    .upsert({ email, source, created_at: new Date().toISOString() }, { onConflict: 'email' });

  if (error && error.code !== '23505') { // 23505 = unique violation (already signed up)
    console.error('Supabase waitlist error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again!' });
    return;
  }

  res.status(200).json({ ok: true });
}
