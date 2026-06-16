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
  }

  /* Convenience helpers */
  const storyPart  = (storyId, part) => play(`story-${storyId}-${part}`);
  const lessonPart = (part)          => play(`lesson-${part}`);
  const lessonTip  = (part)          => play(`lesson-${part}-tip`);
  const lessonEx   = (part)          => play(`lesson-${part}-example`);
  const quizQ      = (storyId, idx)  => play(`quiz-${storyId}-q${idx}`);
  const ui         = (phrase)        => play(`ui-${phrase}`);

  return { init, play, stop, storyPart, lessonPart, lessonTip, lessonEx, quizQ, ui };
})();
