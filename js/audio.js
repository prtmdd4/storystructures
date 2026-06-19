/* Audio — loads manifest, plays cached mp3s, toggles on re-tap.

   Adds:
   - a global mute toggle (persisted in localStorage), respected by every
     play path so "audio off" really means silent;
   - an `audiostate` CustomEvent (dispatched on document) so play/pause
     buttons can show ▶ / ⏸ that tracks what is actually playing — including
     the Web-Speech fallback, which does not use the <audio> element;
   - Audio.bindToggle(btn, key, playFn): a reusable play/pause button;
   - Audio.ui(key) falls back to Web Speech (UI_NARRATION text) when the
     cached clip is missing, so new narration works before audio is regen'd;
   - Audio.chime('success'): a short synthesized success sound (no asset). */

const Audio = (() => {
  const player = document.getElementById('audio-player');
  let manifest = {};
  let currentKey = null;
  let endedCallback = null; // lets play()/playUrl() chain a second clip after the first finishes

  const MUTE_KEY = 'ss-audio-muted';
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (_) {}

  /* Fallback map for the original sounds/ files (kept for part-name chimes) */
  const PART_SOUNDS = {
    introduction: 'sounds/introduction.mp3',
    rising:       'sounds/risingaction.mp3',
    climax:       'sounds/climax.mp3',
    falling:      'sounds/fallingaction.mp3',
    resolution:   'sounds/resolution.mp3',
  };

  /* ---- state broadcast (drives play/pause button icons) ----- */
  function notify(playing) {
    document.dispatchEvent(new CustomEvent('audiostate', {
      detail: { key: currentKey, playing },
    }));
  }

  async function init() {
    try {
      const r = await fetch('audio/manifest.json');
      if (r.ok) manifest = await r.json();
    } catch (_) {
      console.info('[Audio] No manifest found — audio narration will be unavailable.');
    }
    player.addEventListener('play', () => notify(true));
    player.addEventListener('ended', () => {
      currentKey = null;
      notify(false);
      const cb = endedCallback;
      endedCallback = null;
      if (cb) cb();
    });
    player.addEventListener('pause', () => { if (player.ended) return; notify(false); });
  }

  /* ---- mute -------------------------------------------------- */
  function isMuted() { return muted; }
  function setMuted(on) {
    muted = !!on;
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (_) {}
    if (muted) stop();
  }

  function play(key, onEnded) {
    if (!key) { if (onEnded) onEnded(); return; }
    if (muted) { if (onEnded) onEnded(); return; }

    /* toggle off if same key is playing */
    if (currentKey === key && !player.paused) {
      stop();
      return;
    }

    const src = manifest[key]
      ? `audio/${manifest[key]}`
      : PART_SOUNDS[key] || null;

    if (!src) { if (onEnded) onEnded(); return; }

    player.src = src;
    currentKey = key;
    endedCallback = onEnded || null;
    player.play().catch(() => { currentKey = null; endedCallback = null; if (onEnded) onEnded(); });
  }

  /* Plays an absolute URL (Supabase Storage clip for an AI story) the same
     way play() plays a manifest-relative key. */
  function playUrl(url, key, onEnded) {
    if (!url) { if (onEnded) onEnded(); return; }
    if (muted) { if (onEnded) onEnded(); return; }

    if (currentKey === key && !player.paused) {
      stop();
      return;
    }

    player.src = url;
    currentKey = key;
    endedCallback = onEnded || null;
    player.play().catch(() => { currentKey = null; endedCallback = null; if (onEnded) onEnded(); });
  }

  function stop() {
    player.pause();
    player.currentTime = 0;
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (currentKey !== null) { currentKey = null; notify(false); }
    endedCallback = null;
  }

  /* Web Speech API fallback — used if an ElevenLabs/cached clip isn't
     available. Accepts an optional key so play/pause buttons can track it. */
  function speak(text, key, onEnded) {
    if (!text || !window.speechSynthesis) { if (onEnded) onEnded(); return; }
    if (muted) { if (onEnded) onEnded(); return; }
    speechSynthesis.cancel();

    /* toggle off if the same key is already speaking */
    if (key && currentKey === key && speechSynthesis.speaking) {
      stop();
      return;
    }

    const utt   = new SpeechSynthesisUtterance(text);
    utt.rate    = 0.88;
    utt.pitch   = 1.05;
    utt.volume  = 1;
    currentKey  = key || `speak-${Date.now()}`;
    utt.onstart = () => notify(true);
    utt.onend   = () => {
      currentKey = null;
      notify(false);
      if (onEnded) onEnded();
    };
    speechSynthesis.speak(utt);
    /* some browsers fire onstart slowly; announce optimistically */
    notify(true);
  }

  /* Reads one story sentence aloud. Order of preference:
       1. story.audio[part] — real ElevenLabs voice generated for this AI story
       2. manifest "story-{id}-{part}" — curated stories' cached ElevenLabs clip
       3. Web Speech — last-resort fallback if neither audio source exists */
  function storyPart(storyId, part) {
    const story = typeof STORIES !== 'undefined' && STORIES.find(s => s.id === storyId);
    /* one stable key across all three sources so play/pause buttons can match */
    const key = `story-${storyId}-${part}`;
    if (story?.audio?.[part]) { playUrl(story.audio[part], key); return; }
    if (manifest[key])        { play(key); return; }
    if (story?.parts?.[part]) speak(story.parts[part], key);
  }

  function quizQ(storyId, idx) {
    const story = typeof STORIES !== 'undefined' && STORIES.find(s => s.id === storyId);
    const key = `quiz-${storyId}-q${idx}`;
    if (story?.audio?.[`q${idx}`]) { playUrl(story.audio[`q${idx}`], key); return; }
    if (manifest[key])             { play(key); return; }
    if (story?.quiz?.[idx]?.q) speak(story.quiz[idx].q, key);
  }

  const lessonPart   = (part)         => play(`lesson-${part}`);
  const lessonTip    = (part)         => play(`lesson-${part}-tip`);
  const lessonEx     = (part)         => play(`lesson-${part}-example`);

  /* UI narration: prefer the cached clip; fall back to Web Speech reading the
     UI_NARRATION text, so newly-added phrases work before audio is regen'd. */
  function ui(phrase) {
    const key = `ui-${phrase}`;
    if (manifest[key]) { play(key); return; }
    const text = (typeof UI_NARRATION !== 'undefined') && UI_NARRATION[key];
    if (text) speak(text, key);
  }

  /* Bare "Introduction!" / "Rising Action!" etc. — generated once at author
     time (tools/generate-audio.mjs), reused for every AI story so the part
     name itself is never baked into a per-story (and thus per-Practice-card) clip. */
  const announcePart = (part, onEnded) => play(`announce-${part}`, onEnded);

  /* ---- play/pause button helper ----------------------------- */
  /* Turns `btnEl` into a ▶/⏸ control for `key`. `playFn` starts playback for
     that key (e.g. () => Audio.storyPart(id, part)). The icon tracks real
     playback via the `audiostate` event, including the Web-Speech fallback. */
  function bindToggle(btnEl, key, playFn) {
    let playingThis = false;
    const setIcon = (playing) => {
      btnEl.textContent = playing ? '⏸' : '▶';
      btnEl.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    };
    setIcon(false);

    const onState = (e) => {
      if (!document.contains(btnEl)) { document.removeEventListener('audiostate', onState); return; }
      playingThis = !!(e.detail.playing && e.detail.key === key);
      setIcon(playingThis);
    };
    document.addEventListener('audiostate', onState);

    btnEl.addEventListener('click', () => {
      if (playingThis) { stop(); return; }
      playFn();
    });
    return btnEl;
  }

  /* ---- synthesized success chime (no asset) ----------------- */
  let actx = null;
  function chime(kind) {
    if (muted) return;
    if (kind !== 'success') return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const now = actx.currentTime;
      /* soft 3-note rising arpeggio: C5, E5, G5 */
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const t = now + i * 0.12;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        osc.connect(gain).connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch (_) { /* Web Audio unavailable — silently skip */ }
  }

  return {
    init, play, playUrl, stop, speak,
    storyPart, quizQ, lessonPart, lessonTip, lessonEx, announcePart, ui,
    isMuted, setMuted, bindToggle, chime,
  };
})();
