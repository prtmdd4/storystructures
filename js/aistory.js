/* AiStory — "Make Your Own Story" feature.
   Free tier: calls /api/generate (our OpenRouter key, rate-limited via Supabase).
   BYOK tier: calls OpenRouter directly from browser (user's key, our cost = $0).
   Shared validation: js/validate-story.js (IIFE, already loaded before this module).
   Audio: browser Web Speech API (no ElevenLabs cost for AI-generated stories). */

const AiStory = (() => {

  /* OpenRouter model for BYOK browser calls */
  const BYOK_MODEL       = 'meta-llama/llama-3.1-8b-instruct';
  const WAITLIST_SHOWN_KEY = 'ss-waitlist-shown';
  const BYOK_KEY_NAME      = 'ss-byok-key';

  /* ---- Shared prompt (mirrors api/generate.js) --------------- */
  function buildMessages(theme) {
    return [
      {
        role: 'system',
        content: `You are a creative children's story writer for kids aged 6-9 (grades 1-3).
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
    {"q": "Question?", "choices": ["A", "B", "C"], "answer": 0, "part": "introduction", "why": "Explanation."},
    {"q": "Question?", "choices": ["A", "B", "C"], "answer": 2, "part": "rising",       "why": "Explanation."},
    {"q": "Question?", "choices": ["A", "B", "C"], "answer": 1, "part": "climax",       "why": "Explanation."},
    {"q": "Question?", "choices": ["A", "B", "C"], "answer": 0, "part": "falling",      "why": "Explanation."},
    {"q": "Question?", "choices": ["A", "B", "C"], "answer": 2, "part": "resolution",   "why": "Explanation."}
  ]
}
Rules: vary answer positions, one quiz question per story part, simple grade 1-3 vocabulary, positive wholesome content only.`,
      },
      {
        role: 'user',
        content: `Write a short story about: ${theme}`,
      },
    ];
  }

  /* ---- Call OpenRouter via browser (BYOK) -------------------- */
  async function callOpenRouterBYOK(apiKey, theme) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'HTTP-Referer':  location.origin,
        'X-Title':       'Story Structure for Kids',
      },
      body: JSON.stringify({
        model:           BYOK_MODEL,
        response_format: { type: 'json_object' },
        messages:        buildMessages(theme),
        max_tokens:  900,
        temperature: 0.8,
      }),
    });

    if (res.status === 401) throw new Error('INVALID_KEY');
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`OpenRouter error ${res.status}: ${t.slice(0, 200)}`);
    }

    const data = await res.json();
    const raw  = data.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty response from model');

    const clean = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(clean);
  }

  /* ---- Call our /api/generate endpoint (free tier) ----------- */
  async function callFreeTier(theme) {
    const res = await fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ theme, level: 2 }),
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Generation failed');
      err.code  = data.code || 'unknown';
      err.status = res.status;
      throw err;
    }
    return data;
  }

  /* ---- Main generate orchestrator ---------------------------- */
  async function generate(theme, statusEl, btnEl) {
    const byokKey = localStorage.getItem(BYOK_KEY_NAME);
    let story;

    try {
      if (byokKey) {
        story = await callOpenRouterBYOK(byokKey, theme);
        story.id    = `ai-${Date.now()}`;
        story.level = 2;
        story.ai    = true;
      } else {
        story = await callFreeTier(theme);
      }

      /* Client-side validation (catches BYOK edge cases) */
      const v = validateStory(story);
      if (!v.ok) throw new Error('Story format error: ' + v.errors[0]);

      return story;

    } catch (err) {
      if (err.status === 429) {
        showByokModal(theme, 'quota');
        return null;
      }
      if (err.message === 'INVALID_KEY') {
        localStorage.removeItem(BYOK_KEY_NAME);
        showByokModal(theme, 'bad_key');
        return null;
      }
      throw err;
    }
  }

  /* ---- Push story into STORIES and navigate to it ------------ */
  function playStory(story) {
    /* Remove any previous AI story from STORIES to avoid growth */
    const prevIdx = STORIES.findIndex(s => s.ai && s.id !== story.id);
    if (prevIdx !== -1) STORIES.splice(prevIdx, 1);

    /* Push new story */
    STORIES.push(story);
    const storyIdx = STORIES.length - 1;

    closeModal();
    App.go('lesson', { storyIdx, lessonStep: 0 });

    /* Show waitlist prompt once, on first AI story success */
    if (!localStorage.getItem(WAITLIST_SHOWN_KEY)) {
      localStorage.setItem(WAITLIST_SHOWN_KEY, '1');
      setTimeout(() => showWaitlistModal('first_story'), 200);
    }
  }

  /* ---- Modal helpers ----------------------------------------- */
  function closeModal() {
    const m = document.getElementById('ai-modal-overlay');
    if (m) m.remove();
  }

  function makeOverlay() {
    closeModal();
    const overlay = document.createElement('div');
    overlay.id = 'ai-modal-overlay';
    overlay.className = 'ai-modal-overlay';
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
    return overlay;
  }

  /* ---- "Make Your Own Story" input modal --------------------- */
  function showModal() {
    const overlay = makeOverlay();
    const box = document.createElement('div');
    box.className = 'ai-modal';
    box.innerHTML = `
      <h2>✨ Make Your Own Story!</h2>
      <p>Type anything — an animal, a place, a superpower — and we'll build a brand-new story!</p>
      <div class="ai-theme-row">
        <input id="ai-theme-input" class="ai-theme-input" type="text" maxlength="100"
               placeholder="e.g. a dragon who loves pancakes"
               autocomplete="off" spellcheck="false" />
        <button id="ai-go-btn" class="btn ai-go-btn">✨ Create!</button>
      </div>
      <p id="ai-status" class="ai-status" aria-live="polite"></p>
      <button class="ai-modal-close" aria-label="Close" onclick="document.getElementById('ai-modal-overlay').remove()">✕</button>`;

    overlay.appendChild(box);

    const input  = box.querySelector('#ai-theme-input');
    const goBtn  = box.querySelector('#ai-go-btn');
    const status = box.querySelector('#ai-status');

    input.focus();

    async function doGenerate() {
      const theme = input.value.trim();
      if (!theme) { input.focus(); return; }

      goBtn.disabled  = true;
      goBtn.textContent = '⏳ Creating…';
      status.textContent = 'Crafting your story…';

      try {
        const story = await generate(theme, status, goBtn);
        if (story) playStory(story);
        else {
          /* Modal has been replaced by BYOK modal */
          return;
        }
      } catch (err) {
        status.textContent = err.message || 'Something went wrong. Try again!';
        goBtn.disabled   = false;
        goBtn.textContent = '✨ Create!';
      }
    }

    goBtn.addEventListener('click', doGenerate);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doGenerate(); });
  }

  /* ---- BYOK modal -------------------------------------------- */
  function showByokModal(theme, reason) {
    const overlay = makeOverlay();
    const box = document.createElement('div');
    box.className = 'ai-modal byok-modal';

    const intro = reason === 'bad_key'
      ? `<p class="byok-error">That key didn't work. Double-check and try again!</p>`
      : reason === 'quota'
      ? `<p>You've used your free stories for today! 🎉</p>`
      : `<p>Let's keep the story magic going!</p>`;

    box.innerHTML = `
      <button class="ai-modal-close" aria-label="Close" onclick="document.getElementById('ai-modal-overlay').remove()">✕</button>
      <h2>🔑 Use Your Own OpenRouter Key</h2>
      ${intro}
      <p>Get a <strong>free</strong> OpenRouter key at <strong>openrouter.ai</strong> and paste it below to make unlimited stories. Your key stays on your device only — we never see it.</p>
      <div class="ai-theme-row">
        <input id="byok-input" class="ai-theme-input" type="password"
               placeholder="sk-or-v1-..." autocomplete="off" />
        <button id="byok-save-btn" class="btn">Save &amp; Create</button>
      </div>
      <p id="byok-status" class="ai-status" aria-live="polite"></p>
      <hr style="margin:18px 0;border-color:#eee;">
      <p style="font-size:.9em;color:#666;">OR come back tomorrow for more free stories!</p>
      <button class="btn btn-secondary" style="width:100%;margin-top:8px;" onclick="AiStory.showWaitlistModal('quota')">📬 Join the waitlist for unlimited access</button>`;

    overlay.appendChild(box);
    const keyInput = box.querySelector('#byok-input');
    const saveBtn  = box.querySelector('#byok-save-btn');
    const status   = box.querySelector('#byok-status');

    keyInput.focus();

    saveBtn.addEventListener('click', async () => {
      const key = keyInput.value.trim();
      if (!key.startsWith('sk-')) {
        status.textContent = 'Key should start with "sk-". Paste the full key from OpenRouter.';
        return;
      }
      localStorage.setItem(BYOK_KEY_NAME, key);
      saveBtn.disabled = true;
      status.textContent = 'Testing your key…';
      try {
        const story = await generate(theme, status, saveBtn);
        if (story) playStory(story);
      } catch (err) {
        localStorage.removeItem(BYOK_KEY_NAME);
        status.textContent = err.message || 'Key test failed. Check and try again.';
        saveBtn.disabled = false;
      }
    });

    keyInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); });
  }

  /* ---- Waitlist modal ---------------------------------------- */
  function showWaitlistModal(source = 'home') {
    const overlay = makeOverlay();
    const box = document.createElement('div');
    box.className = 'ai-modal waitlist-modal';
    box.innerHTML = `
      <button class="ai-modal-close" aria-label="Close" onclick="document.getElementById('ai-modal-overlay').remove()">✕</button>
      <div class="waitlist-emoji">🚀</div>
      <h2>Love Story Structure?</h2>
      <p>The <strong>full version</strong> is coming with:</p>
      <ul class="waitlist-features">
        <li>📚 100+ read-aloud stories with narration</li>
        <li>🎯 Reading-level matching for your child</li>
        <li>✏️ Story Studio — let kids write their own!</li>
        <li>👩‍🏫 Teacher &amp; parent progress dashboard</li>
      </ul>
      <p>Drop your email and we'll tell you the moment it's ready.</p>
      <div class="ai-theme-row">
        <input id="waitlist-email" class="ai-theme-input" type="email"
               placeholder="your@email.com" autocomplete="email" />
        <button id="waitlist-submit" class="btn">Notify Me!</button>
      </div>
      <p id="waitlist-status" class="ai-status" aria-live="polite"></p>`;

    overlay.appendChild(box);
    const emailInput = box.querySelector('#waitlist-email');
    const submitBtn  = box.querySelector('#waitlist-submit');
    const status     = box.querySelector('#waitlist-status');

    emailInput.focus();

    submitBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      if (!email.includes('@')) { status.textContent = 'Please enter a valid email!'; return; }

      submitBtn.disabled    = true;
      status.textContent    = 'Signing you up…';

      try {
        const res = await fetch('/api/waitlist', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, source }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        status.className  = 'ai-status success';
        status.textContent = "🎉 You're on the list! We'll be in touch.";
        submitBtn.remove();
        emailInput.remove();
      } catch (err) {
        status.textContent = err.message || 'Something went wrong. Try again!';
        submitBtn.disabled = false;
      }
    });

    emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitBtn.click(); });
  }

  /* ---- BYOK key management (for home screen) ----------------- */
  function hasByokKey()    { return !!localStorage.getItem(BYOK_KEY_NAME); }
  function removeByokKey() { localStorage.removeItem(BYOK_KEY_NAME); }

  return { showModal, showWaitlistModal, showByokModal, hasByokKey, removeByokKey };
})();
