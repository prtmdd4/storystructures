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

    return wrap;
  }

  /* ---- LESSON screen -------------------------------------- */
  function lesson(storyIdx, step) {
    const story = STORIES[storyIdx];
    const totalSteps = PARTS.length; // 0-4 = one per part

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
        📖 Lesson ${storyIdx + 1} of ${STORIES.length}
      </h2>
      <p style="text-align:center;color:var(--clr-text-soft);margin-bottom:18px;">${story.title}</p>`;

    /* part card */
    const card = el('div', `part-card ${meta.cssClass}`);
    card.innerHTML = `
      <div class="part-card-header">
        <span class="part-emoji" aria-hidden="true">${meta.emoji}</span>
        <div>
          <div class="part-name-big">${meta.label}</div>
          <div class="part-simple-label">(also called the "${meta.simpleLabel}")</div>
        </div>
        <button class="btn-icon" aria-label="Listen to definition"
          onclick="Audio.lessonPart('${part}')">🔊</button>
      </div>
      <p class="part-def">${meta.definition}</p>
      <p class="part-tip">💡 <em>${meta.tip}</em>
        <button class="btn-icon" style="font-size:.9em;" aria-label="Listen to tip"
          onclick="Audio.lessonTip('${part}')">🔊</button>
      </p>
      <div class="example-box">
        <p><strong>Example from "The Friendly Giant":</strong>
          <button class="btn-icon" style="font-size:.85em;" aria-label="Listen to example"
            onclick="Audio.lessonEx('${part}')">🔊</button>
        </p>
        <p>"${meta.example}"</p>
      </div>`;
    wrap.appendChild(card);

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

    /* auto-play the definition for this part */
    setTimeout(() => Audio.lessonPart(part), 400);

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
