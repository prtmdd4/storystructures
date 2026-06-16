#!/usr/bin/env node
/**
 * generate-audio.mjs — author-time ElevenLabs narration generator
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_xxx ELEVENLABS_VOICE_ID=Gfpl8Yo74Is0W6cPUWWT node tools/generate-audio.mjs
 *
 * • Reads data/lessons.js and data/stories.js by eval'ing them against globalThis.
 * • Hashes each (text + voiceId) → 12-char hex filename so re-runs skip existing files.
 * • Writes mp3s to audio/ and updates audio/manifest.json.
 */

import { createHash }                               from 'node:crypto';
import { readFileSync, writeFileSync, existsSync,
         mkdirSync }                                from 'node:fs';
import { resolve, dirname }                         from 'node:path';
import { fileURLToPath }                            from 'node:url';

const __dir    = dirname(fileURLToPath(import.meta.url));
const ROOT     = resolve(__dir, '..');
const AUDIO    = resolve(ROOT, 'audio');
const MANIFEST = resolve(AUDIO, 'manifest.json');

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'Gfpl8Yo74Is0W6cPUWWT';

if (!API_KEY) {
  console.error('ERROR: set ELEVENLABS_API_KEY env var before running.');
  process.exit(1);
}

/* ---- Load data files into globalThis -------------------- */
function loadData() {
  const lessonsCode = readFileSync(resolve(ROOT, 'data/lessons.js'), 'utf8');
  const storiesCode = readFileSync(resolve(ROOT, 'data/stories.js'), 'utf8');
  eval(lessonsCode);  // sets globalThis.PARTS, globalThis.PART_META, globalThis.UI_NARRATION
  eval(storiesCode);  // sets globalThis.STORIES
}

/* ---- Hash text + voice → 12-char hex ------------------- */
function hashText(text) {
  return createHash('sha256').update(text + VOICE_ID).digest('hex').slice(0, 12);
}

/* ---- Collect all (key, text) pairs to generate ---------- */
function collectClips() {
  const clips = [];

  /* UI phrases */
  Object.entries(globalThis.UI_NARRATION).forEach(([key, text]) => {
    clips.push({ key, text });
  });

  /* Lesson content — definition, tip, example for each part */
  globalThis.PARTS.forEach(part => {
    const m = globalThis.PART_META[part];
    clips.push({ key: `lesson-${part}`,         text: `${m.label}! Also called the ${m.simpleLabel}. ${m.definition}` });
    clips.push({ key: `lesson-${part}-tip`,     text: m.tip });
    clips.push({ key: `lesson-${part}-example`, text: m.example });
  });

  /* Story parts — each of the 5 sentences per story */
  globalThis.STORIES.forEach(story => {
    globalThis.PARTS.forEach(part => {
      clips.push({
        key:  `story-${story.id}-${part}`,
        text: story.parts[part],
      });
    });

    /* Quiz questions (and "why" explanations) */
    story.quiz.forEach((q, i) => {
      clips.push({ key: `quiz-${story.id}-q${i}`, text: q.q });
      clips.push({ key: `quiz-${story.id}-why${i}`, text: q.why });
    });
  });

  return clips;
}

/* ---- ElevenLabs API call -------------------------------- */
async function generateAudio(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method:  'POST',
    headers: {
      'xi-api-key':   API_KEY,
      'Content-Type': 'application/json',
      'Accept':       'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability:        0.65,
        similarity_boost: 0.80,
        style:            0.10,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status}: ${err}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/* ---- Small delay to stay within rate limits ------------- */
const delay = ms => new Promise(r => setTimeout(r, ms));

/* ---- Main ----------------------------------------------- */
async function main() {
  loadData();
  mkdirSync(AUDIO, { recursive: true });

  /* Load existing manifest */
  let manifest = {};
  if (existsSync(MANIFEST)) {
    try { manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')); } catch (_) {}
  }

  const clips   = collectClips();
  let generated = 0;
  let skipped   = 0;

  console.log(`\n🎙  Story Structure Audio Generator`);
  console.log(`   Voice: ${VOICE_ID}`);
  console.log(`   Clips to process: ${clips.length}\n`);

  for (const { key, text } of clips) {
    const h        = hashText(text);
    const filename = `${h}.mp3`;
    const filepath = resolve(AUDIO, filename);

    if (existsSync(filepath)) {
      manifest[key] = filename;
      skipped++;
      process.stdout.write(`  ⏭  SKIP  ${key}\n`);
      continue;
    }

    try {
      process.stdout.write(`  🎵  GEN   ${key} … `);
      const buf = await generateAudio(text);
      writeFileSync(filepath, buf);
      manifest[key] = filename;
      generated++;
      process.stdout.write('done\n');
      await delay(120); // stay well under rate limit
    } catch (err) {
      process.stdout.write(`FAILED — ${err.message}\n`);
    }
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  console.log(`\n✅  Done.  Generated: ${generated}  Skipped: ${skipped}`);
  console.log(`   Manifest written to audio/manifest.json\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
