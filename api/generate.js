/* api/generate.js — serverless: AI story generation (free tier, rate-limited)
   POST { theme: string, level?: 1|2|3 }
   Returns story JSON or { error, code }

   Decisions logged here:
   - Model: meta-llama/llama-3.1-8b-instruct via OpenRouter (~$0.00006/story)
   - Rate limit: 3 stories/device/day + 50 global/day (Supabase counters)
   - Device ID: HttpOnly cookie (bypassable by clearing cookies; acceptable for prototype)
   - Retry: one automatic retry if model returns malformed JSON
   - BYOK path: handled entirely client-side in js/aistory.js (never touches this endpoint)
*/

import { readFileSync }  from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID }    from 'node:crypto';
import { createClient }  from '@supabase/supabase-js';

/* Load shared validateStory into globalThis via the IIFE */
eval(readFileSync(fileURLToPath(new URL('../js/validate-story.js', import.meta.url)), 'utf8'));

const MODEL          = process.env.AI_MODEL          || 'meta-llama/llama-3.1-8b-instruct';
const FREE_PER_DEV   = parseInt(process.env.FREE_PER_DEVICE  || '3',  10);
const FREE_GLOBAL    = parseInt(process.env.FREE_GLOBAL_CAP  || '50', 10);
const COOKIE_NAME    = 'ss_device';
const COOKIE_MAX_AGE = 365 * 24 * 3600; // 1 year

/* Supabase client — optional; if env vars absent, rate limiting is skipped (local dev) */
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

/* ---- Cookie helpers ---------------------------------------- */
function getDeviceId(req) {
  const raw   = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)ss_device=([a-f0-9-]{36})/);
  return match ? match[1] : null;
}

function setDeviceCookie(res, id) {
  res.setHeader('Set-Cookie',
    `${COOKIE_NAME}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`);
}

/* ---- Rate limiting via Supabase ---------------------------- */
function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

async function checkUsage(deviceId) {
  if (!supabase) return { allowed: true };
  const day = today();

  const { data: cur } = await supabase
    .from('ss_free_usage')
    .select('count')
    .eq('device_id', deviceId)
    .eq('day', day)
    .single();

  const devCount = cur ? cur.count : 0;
  if (devCount >= FREE_PER_DEV) return { allowed: false, reason: 'device_limit' };

  const { data: glob } = await supabase
    .from('ss_global_usage')
    .select('count')
    .eq('day', day)
    .single();

  const globalCount = glob ? glob.count : 0;
  if (globalCount >= FREE_GLOBAL) return { allowed: false, reason: 'global_limit' };

  return { allowed: true };
}

/* Atomic increments via SECURITY DEFINER RPCs (see migration: ss_increment_*_usage) */
async function recordUsage(deviceId) {
  if (!supabase) return;
  const day = today();
  await supabase.rpc('ss_increment_device_usage', { p_device: deviceId, p_day: day });
  await supabase.rpc('ss_increment_global_usage', { p_day: day });
}

/* ---- Story generation prompt ------------------------------- */
function buildPrompt(theme) {
  return {
    system: `You are a creative children's story writer for kids aged 6-9 (grades 1-3).
Return ONLY a valid JSON object — no markdown, no explanation, no text before or after.
The JSON must have exactly this structure:
{
  "title": "Story Title",
  "parts": {
    "introduction": "One sentence: who is the character and where are they. (15-25 words)",
    "rising": "One sentence: what challenge or problem appears. (15-25 words)",
    "climax": "One sentence: the most exciting or surprising moment! (15-25 words)",
    "falling": "One sentence: how things start to get better. (15-25 words)",
    "resolution": "One sentence: happy ending — how the story finishes. (15-25 words)"
  },
  "quiz": [
    {"q": "Question about introduction?", "choices": ["Option A", "Option B", "Option C"], "answer": 0, "part": "introduction", "why": "One sentence explanation."},
    {"q": "Question about rising action?", "choices": ["Option A", "Option B", "Option C"], "answer": 2, "part": "rising", "why": "One sentence explanation."},
    {"q": "Question about climax?", "choices": ["Option A", "Option B", "Option C"], "answer": 1, "part": "climax", "why": "One sentence explanation."},
    {"q": "Question about falling action?", "choices": ["Option A", "Option B", "Option C"], "answer": 0, "part": "falling", "why": "One sentence explanation."},
    {"q": "Question about resolution?", "choices": ["Option A", "Option B", "Option C"], "answer": 2, "part": "resolution", "why": "One sentence explanation."}
  ]
}
Rules:
- "answer" is the 0-based index of the CORRECT choice (must be 0, 1, or 2)
- Vary the answer position across questions — don't use the same index for all 5
- Each quiz question covers a DIFFERENT story part (one per part, all 5 parts used)
- Use simple vocabulary (grade 1-3)
- Keep the story positive, fun, and wholesome — no violence, fear, or sad endings
- The story must be creative and clearly about the given theme`,
    user: `Write a short story about: ${theme}`,
  };
}

/* ---- Call OpenRouter --------------------------------------- */
async function callOpenRouter(apiKey, prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
      'HTTP-Referer':  'https://storystructures.vercel.app',
      'X-Title':       'Story Structure for Kids',
    },
    body: JSON.stringify({
      model:           MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user',   content: prompt.user   },
      ],
      max_tokens:  900,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw  = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty response from model');

  /* Strip any accidental markdown fences */
  const clean = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
}

/* ---- Main handler ------------------------------------------ */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  /* Parse body */
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const theme = (body?.theme || '').trim().slice(0, 120);
  if (!theme || theme.length < 2) {
    res.status(400).json({ error: 'Please provide a story theme (e.g. "a dragon who bakes cookies")' });
    return;
  }

  /* Device ID */
  let deviceId = getDeviceId(req);
  const isNew  = !deviceId;
  if (!deviceId) {
    deviceId = randomUUID();
  }
  if (isNew) setDeviceCookie(res, deviceId);

  /* Rate limit check */
  const quota = await checkUsage(deviceId);
  if (!quota.allowed) {
    const msg = quota.reason === 'global_limit'
      ? 'The free story machine is resting for today! Come back tomorrow, or use your own OpenRouter key.'
      : `You've used your ${FREE_PER_DEV} free stories today! Add your own free OpenRouter key to keep going.`;
    res.status(429).json({ error: msg, code: quota.reason });
    return;
  }

  /* Check API key */
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({ error: 'AI generation not configured — set OPENROUTER_API_KEY' });
    return;
  }

  /* Generate story */
  const prompt = buildPrompt(theme);
  let story;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await callOpenRouter(process.env.OPENROUTER_API_KEY, prompt);
      const validation = globalThis.validateStory(raw);
      if (validation.ok) {
        story = raw;
        break;
      }
      if (attempt === 2) {
        console.error('Validation failed after retry:', validation.errors);
        res.status(502).json({ error: 'Story generation failed — the AI returned an unexpected format. Please try again!' });
        return;
      }
    } catch (err) {
      if (attempt === 2) {
        console.error('Generation error:', err.message);
        res.status(502).json({ error: 'Story generation failed. Please try again in a moment!' });
        return;
      }
    }
  }

  /* Record usage */
  await recordUsage(deviceId);

  /* Stamp the story with an ephemeral id and level */
  story.id    = `ai-${Date.now()}`;
  story.level = parseInt(body?.level || '2', 10) || 2;
  story.ai    = true;

  res.status(200).json(story);
}
