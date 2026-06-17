/* Runtime ElevenLabs generation for AI-created stories, uploaded to a
   public Supabase Storage bucket so the SAME voice used for curated
   content also narrates custom stories (not the browser's robotic
   Web Speech API). Mirrors tools/generate-audio.mjs's author-time call
   exactly (same model/voice settings) so the voice is indistinguishable.

   This runs on EVERY generation (not just once, like the author-time
   script) — it costs real ElevenLabs character quota per story. Failures
   (quota exhausted, key missing, network) are caught and logged; callers
   get back whatever clips succeeded (possibly none), and the frontend
   falls back to Web Speech for any part with no audio URL. Generation
   must never fail just because narration audio couldn't be made. */

const BUCKET     = 'ai-story-audio';
const MODEL_ID   = 'eleven_multilingual_v2';
const VOICE_SETTINGS = { stability: 0.65, similarity_boost: 0.80, style: 0.10, use_speaker_boost: true };

async function ttsBuffer(apiKey, voiceId, text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method:  'POST',
    headers: {
      'xi-api-key':   apiKey,
      'Content-Type': 'application/json',
      'Accept':       'audio/mpeg',
    },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/* Generates narration for every story part (sentence-only — deliberately
   NOT prefixed with the part name, since this same clip is reused by the
   Practice screen's "read aloud" button on an unplaced card, and announcing
   "Introduction!" there would give away which slot it belongs in) and every
   quiz question. The part-name announcement itself is a separate, author-
   time-generated, zero-marginal-cost clip — see js/audio.js announcePart()
   and tools/generate-audio.mjs's `announce-${part}` clips.
   Returns a map like { introduction: url, ..., q0: url, ... }.
   Returns {} (not a throw) on any failure, including missing config. */
export async function generateStoryAudio(supabase, story) {
  const apiKey  = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!supabase || !apiKey || !voiceId) return {};

  const clips = Object.keys(story.parts).map(part => ({ key: part, text: story.parts[part] }));
  story.quiz.forEach((q, i) => clips.push({ key: `q${i}`, text: q.q }));

  /* Generate with bounded concurrency. Sequentially these ~10 TTS+upload
     round-trips overran the serverless maxDuration and the function timed
     out (returning an HTML 504, which broke the client's res.json()).
     CONCURRENCY matches ElevenLabs' per-account concurrent-request cap
     (3 on the free/starter tier — going higher gets the extra requests
     429'd) — any clip that still fails is caught and simply omitted, so
     the frontend uses Web Speech for that part. */
  const CONCURRENCY = 3;
  const audio = {};

  async function generateOne({ key, text }) {
    try {
      const buf  = await ttsBuffer(apiKey, voiceId, text);
      const path = `${story.id}/${key}.mp3`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, buf, { contentType: 'audio/mpeg', upsert: true });
      if (upErr) { console.error(`audio upload failed (${key}):`, upErr.message); return; }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      audio[key] = data.publicUrl;
    } catch (err) {
      console.error(`ElevenLabs generation failed (${key}):`, err.message);
      /* keep going — partial narration beats none */
    }
  }

  for (let i = 0; i < clips.length; i += CONCURRENCY) {
    await Promise.all(clips.slice(i, i + CONCURRENCY).map(generateOne));
  }
  return audio;
}
