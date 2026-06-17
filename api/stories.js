/* api/stories.js — serverless: browse AI-generated stories
   GET /api/stories?scope=community   (default — most recent public stories)
   GET /api/stories?scope=mine        (stories created on this device)
   Returns { stories: [...] }

   Content returned here was sanitized once at save time (api/generate.js /
   api/save-story.js), so it's safe to drop directly into innerHTML.
*/

import { createClient } from '@supabase/supabase-js';
import { getDeviceId }  from '../lib/device.js';

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const LIMIT = 60;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!supabase) { res.status(200).json({ stories: [] }); return; }

  const scope    = req.query?.scope === 'mine' ? 'mine' : 'community';
  const deviceId = getDeviceId(req);

  if (scope === 'mine' && !deviceId) {
    res.status(200).json({ stories: [] });
    return;
  }

  let query = supabase
    .from('ss_ai_stories')
    .select('story_key, device_id, theme, title, parts, quiz, level, audio, created_at')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(LIMIT);

  if (scope === 'mine') query = query.eq('device_id', deviceId);

  const { data, error } = await query;
  if (error) {
    console.error('stories list error:', error);
    res.status(500).json({ error: 'Could not load stories' });
    return;
  }

  const stories = (data || []).map(row => ({
    id:        row.story_key,
    title:     row.title,
    theme:     row.theme,
    parts:     row.parts,
    quiz:      row.quiz,
    level:     row.level,
    audio:     row.audio || {},
    createdAt: row.created_at,
    byMe:      deviceId ? row.device_id === deviceId : false,
    ai:        true,
  }));

  res.status(200).json({ stories });
}
