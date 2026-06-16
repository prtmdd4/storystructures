/* Progress — localStorage persistence */

const Progress = (() => {
  const KEY = 'story-structure-v1';

  let state = { stars: {}, completedPuzzle: {}, totalStars: 0 };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw);
    } catch (_) { /* ignore */ }
    _sync();
  }

  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

  function _sync() {
    state.totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0);
    document.getElementById('total-stars').textContent = state.totalStars;
  }

  function markPuzzleDone(storyId) {
    state.completedPuzzle[storyId] = true;
    if (!state.stars[storyId]) state.stars[storyId] = 1;
    _sync(); save();
  }

  function markQuizPassed(storyId) {
    state.stars[storyId] = 2;
    _sync(); save();
  }

  function getStars(storyId) { return state.stars[storyId] || 0; }

  function isPuzzleDone(storyId) { return !!state.completedPuzzle[storyId]; }

  function isUnlocked(story) {
    if (story.level === 1) return true;
    if (story.level === 2) {
      return STORIES.some(s => s.level === 1 && getStars(s.id) >= 1);
    }
    const l2done = STORIES.filter(s => s.level === 2 && getStars(s.id) >= 1).length;
    return l2done >= 2;
  }

  function reset() {
    state = { stars: {}, completedPuzzle: {}, totalStars: 0 };
    _sync(); save();
  }

  return { load, markPuzzleDone, markQuizPassed, getStars, isPuzzleDone, isUnlocked, reset };
})();
