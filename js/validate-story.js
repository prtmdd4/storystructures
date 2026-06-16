/* validateStory — shared pure validation module.
   Works in browser (IIFE sets globalThis.validateStory)
   and Node (eval this file to get the same global).
   Used by: js/aistory.js (BYOK path), api/generate.js (server path). */

(function (g) {
  const VALID_PARTS  = ['introduction', 'rising', 'climax', 'falling', 'resolution'];
  const BANNED_WORDS = ['kill', 'murder', 'sex', 'blood', 'hate', 'drug', 'weapon', 'gore'];

  function validateStory(obj) {
    const errors = [];

    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return { ok: false, errors: ['Response is not a JSON object'] };
    }

    /* title */
    if (!obj.title || typeof obj.title !== 'string' || obj.title.trim().length < 2) {
      errors.push('Missing or empty title');
    }

    /* parts */
    if (!obj.parts || typeof obj.parts !== 'object' || Array.isArray(obj.parts)) {
      errors.push('Missing parts object');
    } else {
      VALID_PARTS.forEach(p => {
        const s = obj.parts[p];
        if (!s || typeof s !== 'string' || s.trim().length < 10) {
          errors.push(`parts.${p} missing or too short`);
        }
      });
    }

    /* quiz */
    if (!Array.isArray(obj.quiz) || obj.quiz.length !== 5) {
      errors.push(`quiz must be array of 5 (got ${Array.isArray(obj.quiz) ? obj.quiz.length : typeof obj.quiz})`);
    } else {
      const usedParts = new Set();
      obj.quiz.forEach((q, i) => {
        if (!q || typeof q !== 'object') { errors.push(`quiz[${i}] not an object`); return; }
        if (!q.q || q.q.trim().length < 5)  errors.push(`quiz[${i}].q missing`);
        if (!Array.isArray(q.choices) || q.choices.length < 3) errors.push(`quiz[${i}].choices needs ≥3 items`);
        if (typeof q.answer !== 'number' || !Number.isInteger(q.answer) ||
            q.answer < 0 || q.answer >= (q.choices || []).length) {
          errors.push(`quiz[${i}].answer out of range`);
        }
        if (!VALID_PARTS.includes(q.part)) errors.push(`quiz[${i}].part invalid: "${q.part}"`);
        if (usedParts.has(q.part))         errors.push(`quiz[${i}].part "${q.part}" used twice`);
        usedParts.add(q.part);
        if (!q.why || q.why.trim().length < 5) errors.push(`quiz[${i}].why missing`);
      });
    }

    /* content safety */
    const fullText = JSON.stringify(obj).toLowerCase();
    BANNED_WORDS.forEach(w => {
      if (fullText.includes(w)) errors.push(`Content filter: "${w}" not allowed`);
    });

    return { ok: errors.length === 0, errors };
  }

  /* ---- Sanitization ----------------------------------------
     AI story text is LLM output responding to free-text user input, and it
     gets inserted into the page via innerHTML (render.js/dragdrop.js/quiz.js).
     Once stories are shared in a public gallery, unescaped text is a stored-XSS
     vector. escapeHtml/sanitizeStory run ONCE, server-side, right after
     validateStory() passes — never call this more than once on the same object
     (double-escaping mangles ordinary punctuation like apostrophes/ampersands). */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeStory(obj) {
    const out = { ...obj };
    out.title = escapeHtml(obj.title);
    out.parts = {};
    VALID_PARTS.forEach(p => { out.parts[p] = escapeHtml(obj.parts[p]); });
    out.quiz = obj.quiz.map(q => ({
      ...q,
      q:       escapeHtml(q.q),
      choices: q.choices.map(escapeHtml),
      why:     escapeHtml(q.why),
      /* answer (int) and part (enum) are not free text — left as-is */
    }));
    return out;
  }

  g.validateStory     = validateStory;
  g.sanitizeStory      = sanitizeStory;
  g.escapeHtml         = escapeHtml;
  g.VALID_STORY_PARTS = VALID_PARTS;
})(typeof globalThis !== 'undefined' ? globalThis : window);
