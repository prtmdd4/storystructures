/**
 * Unit tests for pure logic functions.
 * Run with: node --test tests/logic.test.mjs
 */
import { test } from 'node:test';
import assert    from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath }    from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
eval(readFileSync(resolve(ROOT, 'data/lessons.js'), 'utf8'));
eval(readFileSync(resolve(ROOT, 'data/stories.js'), 'utf8'));
eval(readFileSync(resolve(ROOT, 'js/validate-story.js'), 'utf8'));

/* ---- Helpers mirrored from app code -------------------- */
function activeQuestions(story) {
  if (story.level === 1) {
    const active = new Set(['introduction', 'climax', 'resolution']);
    return story.quiz.filter(q => active.has(q.part));
  }
  return story.quiz;
}

function passThreshold(story) { return story.level === 1 ? 2 : 4; }

function scoreQuiz(questions, answers) {
  return answers.filter((a, i) => a === questions[i].answer).length;
}

function meetsMastery(story, score) {
  return score >= passThreshold(story);
}

function isUnlocked(story, completedIds) {
  if (story.level === 1) return true;
  const lvl1Done = globalThis.STORIES.filter(s => s.level === 1 && completedIds.includes(s.id)).length;
  if (story.level === 2) return lvl1Done >= 1;
  const lvl2Done = globalThis.STORIES.filter(s => s.level === 2 && completedIds.includes(s.id)).length;
  return lvl2Done >= 2;
}

/* ---- Data integrity tests ------------------------------ */
test('STORIES has 10 entries', () => {
  assert.equal(globalThis.STORIES.length, 10);
});

test('each story has all 5 parts', () => {
  const PARTS = globalThis.PARTS;
  globalThis.STORIES.forEach(story => {
    PARTS.forEach(p => {
      assert.ok(story.parts[p], `${story.id} missing part: ${p}`);
    });
  });
});

test('each story quiz has 5 questions', () => {
  globalThis.STORIES.forEach(story => {
    assert.equal(story.quiz.length, 5, `${story.id} quiz should have 5 questions`);
  });
});

test('each quiz question has valid answer index', () => {
  globalThis.STORIES.forEach(story => {
    story.quiz.forEach((q, i) => {
      assert.ok(q.answer >= 0 && q.answer < q.choices.length,
        `${story.id} q${i}: answer index ${q.answer} out of bounds`);
    });
  });
});

test('each quiz question has a "part" and "why" field', () => {
  globalThis.STORIES.forEach(story => {
    story.quiz.forEach((q, i) => {
      assert.ok(q.part, `${story.id} q${i} missing part`);
      assert.ok(q.why,  `${story.id} q${i} missing why`);
    });
  });
});

test('level 1 stories have 3 of 5 quiz questions on active parts', () => {
  const l1 = globalThis.STORIES.filter(s => s.level === 1);
  l1.forEach(story => {
    const qs = activeQuestions(story);
    assert.equal(qs.length, 3, `${story.id} should have 3 active questions`);
  });
});

test('level 2 and 3 stories have 5 active quiz questions', () => {
  globalThis.STORIES.filter(s => s.level > 1).forEach(story => {
    assert.equal(activeQuestions(story).length, 5, `${story.id} should have 5 questions`);
  });
});

/* ---- Scoring & mastery tests --------------------------- */
test('perfect quiz score passes mastery for all levels', () => {
  globalThis.STORIES.forEach(story => {
    const qs    = activeQuestions(story);
    const score = qs.length;
    assert.ok(meetsMastery(story, score), `${story.id} perfect score should pass`);
  });
});

test('zero score fails mastery for all stories', () => {
  globalThis.STORIES.forEach(story => {
    assert.equal(meetsMastery(story, 0), false, `${story.id} zero score should fail`);
  });
});

test('level 1 passes at 2/3', () => {
  const story = globalThis.STORIES.find(s => s.level === 1);
  assert.ok(meetsMastery(story, 2));
  assert.equal(meetsMastery(story, 1), false);
});

test('level 2 passes at 4/5', () => {
  const story = globalThis.STORIES.find(s => s.level === 2);
  assert.ok(meetsMastery(story, 4));
  assert.equal(meetsMastery(story, 3), false);
});

/* ---- Unlock logic tests -------------------------------- */
test('all level-1 stories are always unlocked', () => {
  globalThis.STORIES.filter(s => s.level === 1).forEach(story => {
    assert.ok(isUnlocked(story, []), `${story.id} should always be unlocked`);
  });
});

test('level-2 stories locked until 1 level-1 story is done', () => {
  const l2 = globalThis.STORIES.find(s => s.level === 2);
  assert.equal(isUnlocked(l2, []), false);
  const l1id = globalThis.STORIES.find(s => s.level === 1).id;
  assert.ok(isUnlocked(l2, [l1id]));
});

test('level-3 stories locked until 2 level-2 stories are done', () => {
  const l3 = globalThis.STORIES.find(s => s.level === 3);
  const l2ids = globalThis.STORIES.filter(s => s.level === 2).map(s => s.id);
  assert.equal(isUnlocked(l3, [l2ids[0]]), false);
  assert.ok(isUnlocked(l3, [l2ids[0], l2ids[1]]));
});

/* ---- PART_META completeness tests ---------------------- */
test('PART_META has all 5 parts with required fields', () => {
  ['introduction','rising','climax','falling','resolution'].forEach(p => {
    const m = globalThis.PART_META[p];
    assert.ok(m,              `PART_META missing ${p}`);
    assert.ok(m.label,        `${p} missing label`);
    assert.ok(m.definition,   `${p} missing definition`);
    assert.ok(m.example,      `${p} missing example`);
    assert.ok(m.narrationKey, `${p} missing narrationKey`);
  });
});

/* ---- validateStory tests -------------------------------- */
const goodStory = {
  title: 'The Magic Balloon',
  parts: {
    introduction: 'One sunny day, a girl named Lily found a glowing balloon tied to her fence.',
    rising:       'She climbed inside and the balloon lifted her high above the clouds.',
    climax:       'Suddenly, a strong wind carried the balloon toward a floating island in the sky!',
    falling:      'Lily steered the balloon carefully toward home, guided by the stars below.',
    resolution:   'She landed safely in her backyard, and the balloon turned into a golden star.',
  },
  quiz: [
    { q: 'Where did Lily find the balloon?', choices: ['On her fence', 'In a tree', 'By the river'], answer: 0, part: 'introduction', why: 'The story begins at Lily\'s fence.' },
    { q: 'What did Lily do with the balloon?', choices: ['Popped it', 'Climbed inside', 'Gave it away'], answer: 1, part: 'rising', why: 'Climbing inside starts the adventure.' },
    { q: 'What happened at the big moment?', choices: ['She fell', 'She slept', 'Wind took her to a floating island'], answer: 2, part: 'climax', why: 'The floating island is the exciting twist.' },
    { q: 'How did Lily find her way home?', choices: ['She used stars', 'She called for help', 'A bird guided her'], answer: 0, part: 'falling', why: 'Stars guided her home — things calming down.' },
    { q: 'What did the balloon become?', choices: ['A cloud', 'A golden star', 'A kite'], answer: 1, part: 'resolution', why: 'The golden star is the magical happy ending.' },
  ],
};

test('validateStory accepts a valid story', () => {
  const result = globalThis.validateStory(goodStory);
  assert.ok(result.ok, `Expected ok but got errors: ${result.errors.join(', ')}`);
});

test('validateStory rejects a story missing a part', () => {
  const bad = JSON.parse(JSON.stringify(goodStory));
  delete bad.parts.climax;
  const result = globalThis.validateStory(bad);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.includes('climax')));
});

test('validateStory rejects a story with wrong quiz count', () => {
  const bad = JSON.parse(JSON.stringify(goodStory));
  bad.quiz = bad.quiz.slice(0, 4);
  const result = globalThis.validateStory(bad);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.includes('quiz')));
});

test('validateStory rejects out-of-range answer index', () => {
  const bad = JSON.parse(JSON.stringify(goodStory));
  bad.quiz[0].answer = 10;
  const result = globalThis.validateStory(bad);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.includes('answer')));
});

test('validateStory rejects duplicate quiz parts', () => {
  const bad = JSON.parse(JSON.stringify(goodStory));
  bad.quiz[1].part = 'introduction'; // duplicate
  const result = globalThis.validateStory(bad);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.includes('used twice')));
});

test('validateStory rejects non-object input', () => {
  assert.equal(globalThis.validateStory(null).ok, false);
  assert.equal(globalThis.validateStory('string').ok, false);
  assert.equal(globalThis.validateStory([]).ok, false);
});

test('VALID_STORY_PARTS matches PARTS', () => {
  assert.deepEqual(
    globalThis.VALID_STORY_PARTS,
    ['introduction', 'rising', 'climax', 'falling', 'resolution']
  );
});
