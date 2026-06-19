/* Render — builds DOM for home, lesson, and transition screens.
   Practice and quiz screens are in dragdrop.js and quiz.js.      */

const Render = (() => {

  /* ---- Story Mountain SVG --------------------------------- */
  function mountainSVG(activePart = null, doneParts = []) {
    const W = 530, H = 220;
    const pts = PARTS.map(p => PART_META[p]);

    const pathD = `M ${pts[0].mountainX} ${pts[0].mountainY}
      C 100 ${pts[0].mountainY}, 110 ${pts[1].mountainY}, ${pts[1].mountainX} ${pts[1].mountainY}
      C 195 ${pts[1].mountainY - 20}, 210 ${pts[2].mountainY}, ${pts[2].mountainX} ${pts[2].mountainY}
      C 320 ${pts[2].mountainY}, 335 ${pts[3].mountainY - 20}, ${pts[3].mountainX} ${pts[3].mountainY}
      C 420 ${pts[3].mountainY}, 430 ${pts[4].mountainY}, ${pts[4].mountainX} ${pts[4].mountainY}`;

    let dots = '';
    PARTS.forEach((p, i) => {
      const m = pts[i];
      const isDone   = doneParts.includes(p);
      const isActive = activePart === p;
      const r  = isActive ? 16 : 10;
      const fill = isDone || isActive ? m.color : '#ccc';
      const textY = m.mountainY > 140 ? m.mountainY + 24 : m.mountainY - 16;

      dots += `<circle cx="${m.mountainX}" cy="${m.mountainY}" r="${r}"
        fill="${fill}" stroke="#fff" stroke-width="2.5"
        class="mountain-point" aria-label="${m.label}"/>
        <text x="${m.mountainX}" y="${textY}" text-anchor="middle"
          class="mountain-label" fill="${fill}">${m.emoji} ${m.simpleLabel}</text>`;
    });

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Story mountain diagram"
        xmlns="http://www.w3.org/2000/svg">
      <path d="${pathD}" fill="none" stroke="#ddd" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  }

  /* ---- HOME screen ---------------------------------------- */
  function home() {
    const wrap = el('div', 'home-screen');

    wrap.innerHTML = `
      <div class="home-intro">
        <h2>📖 Let's Learn Story Structure!</h2>
        <p>Stories have 5 parts. Pick a story and let's discover them together!</p>
      </div>`;

    /* AI story card */
    const aiCard = el('div', 'ai-story-card');
    aiCard.innerHTML = `
      <div class="ai-card-sparkle" aria-hidden="true">✨ ✨ ✨</div>
      <h3>Make Your Own Story!</h3>
      <p>Type any idea — an animal, a place, a superpower — and we'll build a brand-new story just for you!</p>
      <div class="ai-card-actions">
        <button class="btn ai-generate-btn" id="ai-gen-btn">✨ Create a Story</button>
        <button class="btn btn-secondary" id="ai-gallery-btn">🎨 Story Gallery</button>
        ${AiStory.hasByokKey()
          ? '<button class="btn btn-secondary btn-small" id="ai-remove-key-btn">🔑 Remove My Key</button>'
          : ''}
      </div>`;
    wrap.appendChild(aiCard);

    aiCard.querySelector('#ai-gen-btn').addEventListener('click', () => AiStory.showModal());
    aiCard.querySelector('#ai-gallery-btn').addEventListener('click', () => App.go('gallery', { scope: 'community' }));
    const rkBtn = aiCard.querySelector('#ai-remove-key-btn');
    if (rkBtn) rkBtn.addEventListener('click', () => {
      AiStory.removeByokKey();
      App.go('home');
    });

    const levels = [1, 2, 3];
    const levelLabels = {
      1: '⭐ Level 1 — Beginning, Middle & End',
      2: '⭐⭐ Level 2 — All Five Parts',
      3: '⭐⭐⭐ Level 3 — Expert Explorer',
    };

    levels.forEach(lvl => {
      const storiesInLevel = STORIES.filter(s => s.level === lvl);
      const anyUnlocked = storiesInLevel.some(s => Progress.isUnlocked(s));

      const hdr = el('div', 'level-header');
      hdr.textContent = levelLabels[lvl];
      if (!anyUnlocked) hdr.style.opacity = '.5';
      wrap.appendChild(hdr);

      const grid = el('div', 'story-grid');
      storiesInLevel.forEach(story => {
        const unlocked = Progress.isUnlocked(story);
        const stars    = Progress.getStars(story.id);

        const card = el('div', 'story-card' + (unlocked ? '' : ' locked'));
        if (unlocked) { card.tabIndex = 0; card.setAttribute('role', 'button'); }
        card.setAttribute('aria-label',
          unlocked ? `${story.title}, ${stars} star${stars !== 1 ? 's' : ''}` : `${story.title}, locked`);

        card.innerHTML = `
          <div class="card-level">Story ${STORIES.indexOf(story) + 1}</div>
          <div class="card-title">${story.title}</div>
          <div class="card-stars">${starDisplay(stars)}</div>
          ${!unlocked ? '<span class="lock-icon" aria-hidden="true">🔒</span>' : ''}`;

        if (unlocked) {
          card.addEventListener('click', () => App.go('lesson', { storyIdx: STORIES.indexOf(story), lessonStep: 0 }));
          card.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); card.click(); } });
        }
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
    });

    /* Waitlist footer */
    const wlFooter = el('div', 'waitlist-footer-strip');
    wlFooter.innerHTML = `
      <p>Love it? The full version has 100+ read-aloud stories, reading levels &amp; more.</p>
      <button class="btn btn-secondary btn-small" id="wl-footer-btn">📬 Join the Waitlist</button>`;
    wrap.appendChild(wlFooter);
    wrap.querySelector('#wl-footer-btn').addEventListener('click', () => AiStory.showWaitlistModal('home_footer'));

    /* greet the child on landing (respects the mute toggle) */
    setTimeout(() => Audio.ui('welcome'), 400);

    return wrap;
  }

  /* ---- LESSON screen -------------------------------------- */
  function lesson(storyIdx, step) {
    const story = STORIES[storyIdx];
    const totalSteps = PARTS.length; // 0-4 = one per part
    const isAi = !!story.ai;

    const wrap = el('div', 'lesson-screen');

    /* progress pips */
    let pips = '<div class="lesson-progress" role="progressbar" aria-valuenow="' + step + '" aria-valuemax="' + totalSteps + '">';
    PARTS.forEach((_, i) => {
      pips += `<div class="lesson-pip ${i < step ? 'complete' : i === step ? 'active' : ''}"></div>`;
    });
    pips += '</div>';

    const part = PARTS[step];
    const meta = PART_META[part];

    /* mountain with this part highlighted and previous ones done */
    const doneParts = PARTS.slice(0, step);

    wrap.innerHTML = `
      ${pips}
      <div class="mountain-wrap" aria-hidden="true">
        ${mountainSVG(part, doneParts)}
      </div>
      <h2 style="text-align:center;margin-bottom:4px;">
        ${isAi ? '✨ Your Story!' : `📖 Lesson ${storyIdx + 1} of ${STORIES.length}`}
      </h2>
      <p style="text-align:center;color:var(--clr-text-soft);margin-bottom:18px;">${story.title}</p>`;

    /* part card — the worked example is ALWAYS the story the child is studying
       (consistent, never the repeated "Friendly Giant"). The big ▶/⏸ button
       reads the main narration: curated = the concept definition, AI/own = the
       part name announced then the story's real sentence. For AI/own stories
       the generic definition/tip stay on screen but are not read aloud (only
       the actual story is narrated), so their speaker buttons are omitted. */
    const card = el('div', `part-card ${meta.cssClass}`);
    card.innerHTML = `
      <div class="part-card-header">
        <span class="part-emoji" aria-hidden="true">${meta.emoji}</span>
        <div>
          <div class="part-name-big">${meta.label}</div>
          <div class="part-simple-label">(also called the "${meta.simpleLabel}")</div>
        </div>
        <button class="btn-icon" style="font-size:1.5em;" id="lesson-play-btn" aria-label="Play"></button>
      </div>
      <p class="part-def">${meta.definition}
        ${isAi ? '' : '<button class="btn-icon" style="font-size:.85em;" id="lesson-def-btn" aria-label="Play"></button>'}
      </p>
      <p class="part-tip">💡 <em>${meta.tip}</em>
        ${isAi ? '' : '<button class="btn-icon" style="font-size:.9em;" id="lesson-tip-btn" aria-label="Play"></button>'}
      </p>
      <div class="example-box">
        <p><strong>Example from "${story.title}":</strong>
          <button class="btn-icon" style="font-size:.85em;" id="lesson-example-btn" aria-label="Play"></button>
        </p>
        <p>"${story.parts[part]}"</p>
      </div>`;
    wrap.appendChild(card);

    /* Wire the play/pause buttons. The example + primary button read the
       story's own sentence (announcing the part name first for AI stories). */
    const playMain = () =>
      isAi ? Audio.announcePart(part, () => Audio.storyPart(story.id, part))
           : Audio.lessonPart(part);
    const mainKey = isAi ? `story-${story.id}-${part}` : `lesson-${part}`;

    Audio.bindToggle(card.querySelector('#lesson-play-btn'), mainKey, playMain);
    Audio.bindToggle(card.querySelector('#lesson-example-btn'), `story-${story.id}-${part}`,
      () => isAi ? Audio.announcePart(part, () => Audio.storyPart(story.id, part))
                 : Audio.storyPart(story.id, part));

    const defBtn = card.querySelector('#lesson-def-btn');
    if (defBtn) Audio.bindToggle(defBtn, `lesson-${part}`, () => Audio.lessonPart(part));
    const tipBtn = card.querySelector('#lesson-tip-btn');
    if (tipBtn) Audio.bindToggle(tipBtn, `lesson-${part}-tip`, () => Audio.lessonTip(part));

    /* nav buttons */
    const btnRow = el('div', 'btn-row');
    if (step > 0) {
      const back = button('← Back', 'btn btn-secondary',
        () => App.go('lesson', { storyIdx, lessonStep: step - 1 }));
      btnRow.appendChild(back);
    } else {
      const home = button('🏠 Home', 'btn btn-secondary',
        () => App.go('home'));
      btnRow.appendChild(home);
    }

    if (step < totalSteps - 1) {
      const next = button('Next Part →', 'btn',
        () => App.go('lesson', { storyIdx, lessonStep: step + 1 }));
      btnRow.appendChild(next);
    } else {
      const practice = button("Let's Practice! 🎯", 'btn',
        () => { Audio.ui('now-practice'); App.go('practice', { storyIdx }); });
      btnRow.appendChild(practice);
    }

    wrap.appendChild(btnRow);

    /* auto-narrate: AI stories announce the part name then read their own
       sentence (real ElevenLabs voice, with Web Speech as a last resort —
       see Audio.storyPart); curated stories play the cached concept
       definition, same as always. */
    setTimeout(() => {
      if (isAi) Audio.announcePart(part, () => Audio.storyPart(story.id, part));
      else Audio.lessonPart(part);
    }, 400);

    return wrap;
  }

  /* ---- CELEBRATION / RESULT screens are in quiz.js -------- */

  /* ---- Helpers -------------------------------------------- */
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function button(label, cls, onClick) {
    const b = document.createElement('button');
    b.className = cls;
    b.innerHTML = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function starDisplay(n) {
    if (n === 0) return '<span style="color:#ccc">☆☆</span>';
    if (n === 1) return '⭐<span style="color:#ccc">☆</span>';
    return '⭐⭐';
  }

  return { home, lesson, mountainSVG, el, button, starDisplay };
})();
