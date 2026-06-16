/* Audio — loads manifest, plays cached mp3s, toggles on re-tap */

const Audio = (() => {
  const player = document.getElementById('audio-player');
  let manifest = {};
  let currentKey = null;

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
    player.addEventListener('ended', () => { currentKey = null; });
  }

  function play(key) {
    if (!key) return;

    /* toggle off if same key is playing */
    if (currentKey === key && !player.paused) {
      player.pause();
      player.currentTime = 0;
      currentKey = null;
      return;
    }

    const src = manifest[key]
      ? `audio/${manifest[key]}`
      : PART_SOUNDS[key] || null;

    if (!src) return;

    player.src = src;
    currentKey = key;
    player.play().catch(() => { currentKey = null; });
  }

  function stop() {
    player.pause();
    player.currentTime = 0;
    currentKey = null;
    if (window.speechSynthesis) speechSynthesis.cancel();
  }

  /* Web Speech API fallback for AI-generated stories (no ElevenLabs cache) */
  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utt   = new SpeechSynthesisUtterance(text);
    utt.rate    = 0.88;
    utt.pitch   = 1.05;
    utt.volume  = 1;
    speechSynthesis.speak(utt);
  }

  /* Convenience helpers — fall back to Web Speech for AI stories (no manifest entry) */
  function storyPart(storyId, part) {
    const key = `story-${storyId}-${part}`;
    if (manifest[key]) { play(key); return; }
    const story = typeof STORIES !== 'undefined' && STORIES.find(s => s.id === storyId);
    if (story?.parts?.[part]) speak(story.parts[part]);
  }

  function quizQ(storyId, idx) {
    const key = `quiz-${storyId}-q${idx}`;
    if (manifest[key]) { play(key); return; }
    const story = typeof STORIES !== 'undefined' && STORIES.find(s => s.id === storyId);
    if (story?.quiz?.[idx]?.q) speak(story.quiz[idx].q);
  }

  const lessonPart = (part)   => play(`lesson-${part}`);
  const lessonTip  = (part)   => play(`lesson-${part}-tip`);
  const lessonEx   = (part)   => play(`lesson-${part}-example`);
  const ui         = (phrase) => play(`ui-${phrase}`);

  return { init, play, stop, speak, storyPart, lessonPart, lessonTip, lessonEx, quizQ, ui };
})();
