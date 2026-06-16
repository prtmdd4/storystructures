/* api/save-story.js — serverless: persist a BYOK-generated story
   POST { story: object, theme?: string }
   Returns { ok: true, story: <sanitized>, saved: bool, reason? }

   Why this exists: BYOK generation calls OpenRouter directly from the browser
   (js/aistory.js), so this story never passes through api/generate.js. This
   endpoint is the ONE place that validates + sanitizes + persists it, so the
   gallery can never end up serving raw, unescaped LLM output to other users.
   The server is the sole sanitizer (called exactly once) — the client must
   NOT pre-sanitize, or apostrophes/ampersands in ordinary text get mangled
   by double-escaping.

   Saving is best-effort: even if the device hit its save quota or Supabase
   is unreachable, we still return the sanitized story so the child can play
   what they made — we just skip the gallery insert.
*/

import { readFileSync }  from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createClient }  from '@supabase/supabase-js';
import { ensureDeviceId, today } from '../lib/device.js';

eval(readFileSync(fileURLToPath(new URL('../js/validate-story.js', import.meta.url)), 'utf8'));

const SAVE_PER_DEVICE = parseInt(process.env.SAVE_PER_DEVICE || '20', 10);

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

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
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const rawStory = body?.story;
  const theme    = (body?.theme || '').trim().slice(0, 120);

  const validation = globalThis.validateStory(rawStory);
  if (!validation.ok) {
    res.status(400).json({ error: 'Story failed validation: ' + validation.errors[0] });
    return;
  }

  /* Sanitize ONCE here — this is the canonical version returned to the client
     and stored in the gallery. */
  const story = globalThis.sanitizeStory(rawStory);
  story.id    = rawStory.id    || `ai-${Date.now()}`;
  story.level = rawStory.level || 2;
  story.ai    = true;

  const deviceId  = ensureDeviceId(req, res);
  const safeTheme = globalThis.escapeHtml(theme);

  if (!supabase) {
    res.status(200).json({ ok: true, story, saved: false, reason: 'no_supabase' });
    return;
  }

  const day = today();
  const { data: cur } = await supabase
    .from('ss_save_usage')
    .select('count')
    .eq('device_id', deviceId)
    .eq('day', day)
    .single();

  if ((cur?.count || 0) >= SAVE_PER_DEVICE) {
    res.status(200).json({ ok: true, story, saved: false, reason: 'save_limit' });
    return;
  }

  const { error } = await supabase.from('ss_ai_stories').insert({
    story_key: story.id,
    device_id: deviceId,
    theme:     safeTheme,
    title:     story.title,
    parts:     story.parts,
    quiz:      story.quiz,
    level:     story.level,
  });

  if (error && error.code !== '23505') {
    console.error('save-story insert error:', error);
    res.status(200).json({ ok: true, story, saved: false, reason: 'db_error' });
    return;
  }

  await supabase.rpc('ss_increment_save_usage', { p_device: deviceId, p_day: day }).catch(() => {});
  res.status(200).json({ ok: true, story, saved: true });
}
