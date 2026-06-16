# Story Structure for Kids

A free, offline-friendly web app that teaches kids ages 6–9 the 5 parts of a
story (Introduction → Rising Action → Climax → Falling Action → Resolution)
through a drag-and-drop sorting game and quiz, with gradual difficulty
progression, stars, and read-aloud narration.

It also has an **AI "Make Your Own Story"** feature — a prototype hook that
lets a child type a theme and get a brand-new story, used to validate demand
for a bigger paid version (see [Part C of the plan](#why-the-ai-feature-exists)).

---

## Running the game (no setup required)

The core game is a pure static site — no build step, no server needed:

```bash
python3 -m http.server
# open http://localhost:8000
```

Everything works offline except the "✨ Make Your Own Story" card on the
home screen, which needs the API described below.

## Running everything, including AI generation

The AI feature needs two serverless functions (`api/generate.js`,
`api/waitlist.js`). Run them locally with the Vercel CLI:

```bash
npm install
npx vercel dev
```

### Required environment variables

Create a `.env.local` (gitignored) or set these in the Vercel dashboard:

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes, for free-tier AI generation | Our key, paying for the free quota. **Never sent to the browser.** Get one at openrouter.ai. |
| `AI_MODEL` | No (default: `meta-llama/llama-3.1-8b-instruct`) | OpenRouter model id. Picked for cheap, reliable JSON output. |
| `SUPABASE_URL` | No, but rate limiting/waitlist are disabled without it | Project URL. |
| `SUPABASE_SERVICE_KEY` | No, same as above | The **service_role** secret key (Settings → API in Supabase dashboard) — NOT the anon/publishable key. Needed because the `ss_*` tables have RLS enabled with no public policies. |
| `FREE_PER_DEVICE` | No (default: `3`) | Free AI stories per device per day. |
| `FREE_GLOBAL_CAP` | No (default: `50`) | Hard daily cap across all users — our cost backstop. |

Without `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` set, `api/generate.js` and
`api/waitlist.js` still work but skip rate limiting / persistence (useful for
local dev). Without `OPENROUTER_API_KEY`, the free tier returns a clear
"not configured" error — kids can still use BYOK (see below).

### Supabase setup

This project shares a Supabase instance with other apps. Three tables exist,
namespaced with `ss_` to stay clearly separated:

- `ss_waitlist` (email, source, created_at) — signups from the waitlist modal.
- `ss_free_usage` (device_id, day, count) — per-device daily AI generation count.
- `ss_global_usage` (day, count) — global daily AI generation count (cost cap).

All three have RLS **enabled with no policies**, so only the `service_role`
key (used server-side in `api/*.js`) can read/write them — the anon key has
zero access. Two `SECURITY DEFINER` RPCs (`ss_increment_device_usage`,
`ss_increment_global_usage`) do atomic counter increments to avoid race
conditions. See the migration for the exact SQL if you need to recreate this
elsewhere.

### Deploying

```bash
npx vercel --prod
```

Vercel auto-detects the static files + `api/` functions — no extra config
beyond `vercel.json` (which just sets function memory/timeout).

---

## Why the AI feature exists

The core game (10 hand-written, ElevenLabs-narrated stories) is the polished
product. The "Make Your Own Story" feature is a deliberately **cheap
prototype** layered on top, built to:

1. Let a child generate unlimited fresh stories to keep teaching engaging.
2. Validate market demand (via the waitlist) for a bigger version — 100+
   curated stories, reading-level matching, a kid-authoring "Story Studio",
   and a teacher dashboard — **before** investing in building it.

Cost discipline, by design:
- **Free tier** runs on our OpenRouter key, capped at 3 stories/device/day
  and 50/day globally. At the default model's pricing, a story costs a
  fraction of a cent — the global cap is a hard backstop, not the real limit.
- **BYOK ("bring your own key")**: once a child's free quota is used, they
  can paste their own free OpenRouter key. That key lives in `localStorage`
  only and calls OpenRouter **directly from the browser** — our server never
  sees it, and it costs us nothing.
- **AI story narration uses the browser's built-in Web Speech API**, not
  ElevenLabs, so generated stories cost nothing extra to narrate. The 10
  built-in stories keep their premium cached ElevenLabs audio.
- **Output is schema-validated** (`js/validate-story.js`, shared by both the
  server and BYOK paths) before it ever reaches the game, so a malformed or
  unsafe AI response can't break the UI.

AI-generated stories are session-only (pushed into the in-memory `STORIES`
array, not persisted) — refreshing the page clears them. This is intentional
for a prototype; the curated 10 stories always persist via `localStorage`.

---

## Authoring a new (hand-written) story

Stories live in `data/stories.js` as plain objects — no HTML to edit:

```js
{
  id: 'lost-kitten',
  title: 'The Lost Kitten',
  level: 1,   // 1 = 3 active parts (intro/climax/resolution), 2-3 = all 5
  parts: {
    introduction: '...', rising: '...', climax: '...',
    falling: '...', resolution: '...',
  },
  quiz: [
    { q: '...', choices: ['...', '...', '...'], answer: 0,
      part: 'introduction', why: '...' },
    // one question per part, 5 total
  ],
}
```

After adding a story, regenerate its narration (see below) and run the tests:

```bash
node --test tests/logic.test.mjs
```

## Regenerating ElevenLabs audio

Author-time only — output is committed, runtime never calls ElevenLabs:

```bash
ELEVENLABS_API_KEY=sk_xxx ELEVENLABS_VOICE_ID=Gfpl8Yo74Is0W6cPUWWT node tools/generate-audio.mjs
```

Re-runs skip any clip whose text hasn't changed (content-hash caching), so
adding one story only generates that story's clips.

## Project layout

```
index.html              shell: header, #app mount point, audio/confetti elements
css/styles.css           all styling
data/lessons.js          the 5 part definitions (label, definition, tip, example)
data/stories.js          the 10 hand-written stories
js/audio.js              plays cached ElevenLabs mp3s; Web Speech fallback for AI stories
js/progress.js           localStorage: stars, completed puzzles, level unlocks
js/validate-story.js     shared AI-story schema validator (browser + server)
js/aistory.js            "Make Your Own Story" UI: free tier, BYOK, waitlist modals
js/render.js             home + lesson screen DOM builders
js/dragdrop.js           practice screen: Pointer Events drag/drop + keyboard
js/quiz.js               quiz screen: scoring, mastery gate, remediation
js/app.js                state machine, confetti, navigation
api/generate.js          serverless: free-tier AI generation (rate-limited)
api/waitlist.js          serverless: email capture
tools/generate-audio.mjs author-time ElevenLabs narration generator
audio/                   generated mp3s + manifest.json (committed)
tests/logic.test.mjs     node:test unit tests (scoring, mastery, unlock, validateStory)
```

## Tests

```bash
node --test tests/logic.test.mjs
```
