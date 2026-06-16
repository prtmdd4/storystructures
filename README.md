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
| `SAVE_PER_DEVICE` | No (default: `20`) | Max BYOK stories one device can save to the gallery per day (spam guard — saving is free for us, but unbounded saves could flood the gallery). |

Without `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` set, the API routes still work
but skip rate limiting / persistence (useful for local dev). Without
`OPENROUTER_API_KEY`, the free tier returns a clear "not configured" error —
kids can still use BYOK (see below).

### Supabase setup

This project shares a Supabase instance with other apps. Five tables exist,
namespaced with `ss_` to stay clearly separated:

- `ss_waitlist` (email, source, created_at) — signups from the waitlist modal.
- `ss_free_usage` (device_id, day, count) — per-device daily AI generation count.
- `ss_global_usage` (day, count) — global daily AI generation count (cost cap).
- `ss_ai_stories` (story_key, device_id, theme, title, parts, quiz, level,
  hidden, created_at) — every AI-generated story, so creators can revisit
  theirs ("My Stories") and others can browse them ("Community Stories").
  Text fields are HTML-escaped exactly once at save time (see "Security" below)
  before being stored — never re-escape them.
- `ss_save_usage` (device_id, day, count) — per-device daily save count, a
  spam guard specifically for the BYOK path (free-tier saves are already
  capped by `ss_free_usage`).

All five have RLS **enabled with no policies**, so only the `service_role`
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

### Story persistence & the gallery

Every AI-generated story (free tier or BYOK) is saved to `ss_ai_stories` so:
- The creator can revisit it later via **🎨 Story Gallery → ⭐ My Stories**.
- Other visitors can play it via **🎨 Story Gallery → 🌍 Community Stories**.

After generating, a child sees a **story preview** screen first (not the
generic curated-story lesson) — it announces each part by name and reads
that part's actual sentence aloud (Web Speech API), then hands off to the
same sort/quiz flow as every other story. See `Render.storyPreview` in
`js/render.js`.

There's no privacy toggle yet — anything generated is visible to everyone in
the Community tab by default (the `hidden` column on `ss_ai_stories` exists
for future moderation, but nothing sets it today).

### Security: sanitizing AI text before storage

AI story text is LLM output responding to free-text user input. Once stories
are shared with strangers via the gallery, inserting that text unescaped into
`innerHTML` (which `render.js`/`dragdrop.js`/`quiz.js` all do) is a stored-XSS
vector — a malicious theme/title could run script in every viewer's browser.

The fix: `sanitizeStory()` / `escapeHtml()` in `js/validate-story.js` HTML-escape
all free-text fields (title, parts, quiz q/choices/why). This runs **exactly
once**, server-side, at the single point each story is persisted:
- `api/generate.js` (free tier) — sanitizes right after `validateStory()` passes.
- `api/save-story.js` (BYOK) — the *only* place a BYOK story is sanitized; the
  client never pre-sanitizes, and always plays back whatever this endpoint
  returns rather than its own raw copy.

**Do not call `sanitizeStory()` more than once on the same object** —
escaping already-escaped text mangles ordinary punctuation (an apostrophe
becomes `&amp;#39;` instead of `&#39;`, which then displays literally instead
of decoding back to `'`).

AI-generated stories also live in the in-memory `STORIES` array client-side
while being played (same as the curated 10) — that part is unchanged and
still resets on refresh; what's new is that the *content* is now durable in
Supabase regardless of whether the in-memory copy survives.

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
js/validate-story.js     shared AI-story schema validator + sanitizer (browser + server)
js/aistory.js            "Make Your Own Story" UI: free tier, BYOK, waitlist, gallery
js/render.js             home, lesson, and AI-story-preview screen DOM builders
js/dragdrop.js           practice screen: Pointer Events drag/drop + keyboard
js/quiz.js               quiz screen: scoring, mastery gate, remediation
js/app.js                state machine, confetti, navigation (incl. gallery/preview screens)
lib/device.js            shared device-id cookie helper (outside api/ so Vercel won't route it)
lib/persist.js           shared insert into ss_ai_stories
api/generate.js          serverless: free-tier AI generation (rate-limited, sanitizes, persists)
api/save-story.js        serverless: validates/sanitizes/persists a BYOK story, returns canonical copy
api/stories.js           serverless: browse community/own AI stories for the gallery
api/waitlist.js          serverless: email capture
tools/generate-audio.mjs author-time ElevenLabs narration generator
audio/                   generated mp3s + manifest.json (committed)
tests/logic.test.mjs     node:test unit tests (scoring, mastery, unlock, validateStory, sanitizeStory)
```

## Tests

```bash
node --test tests/logic.test.mjs
```
