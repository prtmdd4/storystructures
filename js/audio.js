/* Audio — loads manifest, plays cached mp3s, toggles on re-tap */

const Audio = (() => {
  const player = document.getElementById('audio-player');
  let manifest = {};
  let currentKey = null;
  let endedCallback = null; // lets play()/playUrl() chain a second clip after the first finishes

  /* Fallback map for the original sounds/ files (kept for part-name chimes) */
  const PART_SOUNDS = {
    introduction: 'sounds/introduction.mp3',
    rising:       'sounds/risingaction.mp3',
    climax:       'sounds/climax.mp3',
    falling:      'sounds/fallingaction.mp3',
    resolution:   'sounds/resolution.mp3',
  };

  async function init() {
    try {
      const r = await fetch('audio/manifest.json');
      if (r.ok) manifest = await r.json();
    } catch (_) {
      console.info('[Audio] No manifest found — audio narration will be unavailable.');
    }
    player.addEventListener('ended', () => {
      currentKey = null;
      const cb = endedCallback;
      endedCallback = null;
      if (cb) cb();
    });
  }

  function play(key, onEnded) {
    if (!key) { if (onEnded) onEnded(); return; }

    /* toggle off if same key is playing */
    if (currentKey === key && !player.paused) {
      player.pause();
      player.currentTime = 0;
      currentKey = null;
      endedCallback = null;
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

    if (currentKey === key && !player.paused) {
      player.pause();
      player.currentTime = 0;
      currentKey = null;
      endedCallback = null;
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
    currentKey = null;
    endedCallback = null;
    if (window.speechSynthesis) speechSynthesis.cancel();
  }

  /* Web Speech API fallback — only used if ElevenLabs generation for an AI
     story failed or isn't configured. */
  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utt   = new SpeechSynthesisUtterance(text);
    utt.rate    = 0.88;
    utt.pitch   = 1.05;
    utt.volume  = 1;
    speechSynthesis.speak(utt);
  }

  /* Reads one story sentence aloud. Order of preference:
       1. story.audio[part] — real ElevenLabs voice generated for this AI story
          (sentence-only, no part-name prefix, so it's safe to reuse on an
          unplaced Practice card without spoiling which slot it belongs in)
       2. manifest "story-{id}-{part}" — curated stories' cached ElevenLabs clip
       3. Web Speech — last-resort fallback if neither audio source exists */
  function storyPart(storyId, part) {
    const story = typeof STORIES !== 'undefined' && STORIES.find(s => s.id === storyId);
    if (story?.audio?.[part]) { playUrl(story.audio[part], `ai-${storyId}-${part}`); return; }

    const key = `story-${storyId}-${part}`;
    if (manifest[key]) { play(key); return; }

    if (story?.parts?.[part]) speak(story.parts[part]);
  }

  function quizQ(storyId, idx) {
    const story = typeof STORIES !== 'undefined' && STORIES.find(s => s.id === storyId);
    if (story?.audio?.[`q${idx}`]) { playUrl(story.audio[`q${idx}`], `ai-${storyId}-q${idx}`); return; }

    const key = `quiz-${storyId}-q${idx}`;
    if (manifest[key]) { play(key); return; }

    if (story?.quiz?.[idx]?.q) speak(story.quiz[idx].q);
  }

  const lessonPart   = (part)         => play(`lesson-${part}`);
  const lessonTip    = (part)         => play(`lesson-${part}-tip`);
  const lessonEx     = (part)         => play(`lesson-${part}-example`);
  const ui           = (phrase)       => play(`ui-${phrase}`);
  /* Bare "Introduction!" / "Rising Action!" etc. — generated once at author
     time (tools/generate-audio.mjs), reused for every AI story so the part
     name itself is never baked into a per-story (and thus per-Practice-card) clip. */
  const announcePart = (part, onEnded) => play(`announce-${part}`, onEnded);

  return {
    init, play, playUrl, stop, speak,
    storyPart, quizQ, lessonPart, lessonTip, lessonEx, announcePart, ui,
  };
})();
