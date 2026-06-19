/* Drag-Drop / Practice screen
   Uses Pointer Events (works on mouse + touch + pen).
   Keyboard: Tab to card, Space/Enter to "select", Tab to zone, Space/Enter to place.
   Level 1: 2 parts pre-placed, child places 3. Immediate per-drop feedback.
   Level 2: Child places all 5. Immediate per-drop feedback.
   Level 3: All 5 parts, feedback only on Submit.              */

const Practice = (() => {
  let storyId  = null;
  let dragState = null;   // { card, clone, offsetX, offsetY }
  let selected  = null;   // keyboard-selected card

  function config(story) {
    if (story.level === 1) return {
      activeParts: ['introduction', 'climax', 'resolution'],
      prePlaced:   ['rising', 'falling'],
      immediate:   true,
      showSimple:  true,
    };
    if (story.level === 2) return {
      activeParts: PARTS.slice(),
      prePlaced:   [],
      immediate:   true,
      showSimple:  false,
    };
    return {
      activeParts: PARTS.slice(),
      prePlaced:   [],
      immediate:   false,
      showSimple:  false,
    };
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---- Build the practice screen DOM ---------------------- */
  function build(idx) {
    const story = STORIES[idx];
    storyId = story.id;
    const cfg = config(story);

    const wrap = Render.el('div', 'practice-screen');
    wrap.setAttribute('data-story-id', storyId);

    wrap.innerHTML = `
      <div class="practice-header">
        <h2>${story.title}</h2>
        <p>Here's your story, all mixed up! Put the parts in order, from the
           beginning to the end. Read them yourself — or tap
           <button class="btn-icon" style="font-size:1em;" id="practice-play-btn" aria-label="Play"></button>
           to have a part read to you.</p>
      </div>
      ${cfg.showSimple ? '<p class="kb-hint">💡 Tip: look for Beginning → Big Moment → The End</p>' : ''}
      <p class="kb-hint">⌨️ Keyboard: press <strong>Space</strong> on a card to select it, then <strong>Space</strong> on a slot to place it.</p>`;

    /* Play/pause for the spoken sorting instructions (auto-plays on landing,
       both gated by the global mute toggle). */
    Audio.bindToggle(wrap.querySelector('#practice-play-btn'), 'ui-sort-intro', () => Audio.ui('sort-intro'));
    setTimeout(() => Audio.ui('sort-intro'), 400);

    /* Card tray */
    const tray = Render.el('div', 'card-tray');
    tray.id = `tray-${storyId}`;
    tray.setAttribute('aria-label', 'Sentence cards — drag from here');
    wrap.appendChild(tray);

    shuffle(cfg.activeParts).forEach(part => tray.appendChild(buildCard(story, part, false)));

    /* Drop-zone grid */
    const grid = Render.el('div', 'dropzone-grid');
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', 'Story structure slots');

    PARTS.forEach(part => {
      const meta  = PART_META[part];
      const isPre = cfg.prePlaced.includes(part);

      const dzWrap = Render.el('div', 'dropzone-wrap');
      dzWrap.innerHTML = `
        <div class="dropzone-label">
          <span aria-hidden="true">${meta.emoji}</span>
          <span>${meta.label}</span>
          <button class="btn-icon" style="font-size:.75em;" aria-label="Hear ${meta.label} definition"
            onclick="Audio.play('${meta.narrationKey}')">🔊</button>
        </div>
        ${cfg.showSimple ? `<div class="dropzone-sublabel">(${meta.simpleLabel})</div>` : ''}`;

      const zone = Render.el('div', 'dropzone' + (isPre ? ' pre-placed' : ''));
      zone.dataset.accept  = part;
      zone.dataset.storyId = storyId;

      if (!isPre) {
        zone.tabIndex = 0;
        zone.setAttribute('role', 'application');
        zone.setAttribute('aria-label', `${meta.label} slot — empty`);
        zone.addEventListener('keydown', onZoneKey);
      }

      const ph = Render.el('span', 'dropzone-placeholder');
      ph.textContent = '↓';
      ph.setAttribute('aria-hidden', 'true');
      zone.appendChild(ph);

      if (isPre) {
        zone.innerHTML = '';
        zone.appendChild(buildCard(story, part, true));
        zone.classList.add('correct');
      }

      dzWrap.appendChild(zone);
      grid.appendChild(dzWrap);
    });

    wrap.appendChild(grid);

    /* All-correct message */
    const okMsg = Render.el('div', 'all-correct-msg');
    okMsg.id = `ok-${storyId}`;
    okMsg.innerHTML = '🎉 All parts correct! Ready for the quiz?';
    wrap.appendChild(okMsg);

    /* Footer buttons */
    const btnRow = Render.el('div', 'btn-row practice-footer');

    if (!cfg.immediate) {
      const sub = Render.el('button', 'btn');
      sub.textContent = 'Check My Answers';
      sub.addEventListener('click', () => checkAll(story));
      btnRow.appendChild(sub);
    }

    const backBtn = Render.el('button', 'btn btn-secondary');
    backBtn.textContent = '← Back to Lesson';
    backBtn.addEventListener('click', () => App.go('lesson', { storyIdx: idx, lessonStep: PARTS.length - 1 }));
    btnRow.appendChild(backBtn);

    wrap.appendChild(btnRow);
    return wrap;
  }

  /* ---- Build a draggable card ----------------------------- */
  function buildCard(story, part, isPrePlaced) {
    const card = Render.el('div', 'draggable' + (isPrePlaced ? ' pre-placed' : ''));
    card.dataset.part    = part;
    card.dataset.storyId = story.id;

    if (!isPrePlaced) {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', story.parts[part] + ' — press Space to select');
      card.addEventListener('keydown', onCardKey);
      card.addEventListener('pointerdown', onPointerDown);
    }

    card.innerHTML = `
      <button class="card-audio-btn" aria-label="Read this sentence aloud"
        onclick="event.stopPropagation(); Audio.storyPart('${story.id}','${part}')">🔊</button>
      <span>${story.parts[part]}</span>`;

    return card;
  }

  /* ---- Pointer-Event drag --------------------------------- */
  function onPointerDown(e) {
    if (e.button !== undefined && e.button > 0) return;
    const card = e.currentTarget;
    e.preventDefault();

    const rect = card.getBoundingClientRect();
    const clone = card.cloneNode(true);
    clone.id = 'drag-clone';
    clone.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
    document.body.appendChild(clone);
    card.classList.add('dragging');

    dragState = { card, clone, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  }

  function onPointerMove(e) {
    if (!dragState) return;
    dragState.clone.style.left = (e.clientX - dragState.offsetX) + 'px';
    dragState.clone.style.top  = (e.clientY - dragState.offsetY) + 'px';

    document.querySelectorAll('.dropzone').forEach(z => z.classList.remove('drag-over'));
    const zone = hitZone(e.clientX, e.clientY);
    if (zone && !zone.classList.contains('pre-placed')) zone.classList.add('drag-over');
  }

  function onPointerUp(e) {
    if (!dragState) return;
    const { card, clone } = dragState;
    clone.remove();
    card.classList.remove('dragging');
    document.querySelectorAll('.dropzone').forEach(z => z.classList.remove('drag-over'));

    const zone = hitZone(e.clientX, e.clientY);
    if (zone && !zone.classList.contains('pre-placed')) placeCard(card, zone);
    dragState = null;
  }

  function hitZone(x, y) {
    for (const el of document.elementsFromPoint(x, y)) {
      if (el.classList && el.classList.contains('dropzone')) return el;
      const z = el.closest && el.closest('.dropzone');
      if (z) return z;
    }
    return null;
  }

  /* ---- Keyboard ------------------------------------------- */
  function onCardKey(e) {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    const card = e.currentTarget;
    if (selected === card) { deselect(); return; }
    deselect();
    selected = card;
    card.classList.add('selected');
  }

  function onZoneKey(e) {
    if ((e.key === ' ' || e.key === 'Enter') && selected) {
      e.preventDefault();
      placeCard(selected, e.currentTarget);
      deselect();
    }
  }

  function deselect() {
    if (selected) { selected.classList.remove('selected'); selected = null; }
  }

  /* ---- Place card into a zone ----------------------------- */
  function placeCard(card, zone) {
    if (zone.classList.contains('pre-placed')) return;

    /* swap out any existing occupant */
    const occupant = zone.querySelector('.draggable:not(.pre-placed)');
    if (occupant) returnToTray(occupant);

    zone.innerHTML = '';
    zone.appendChild(card);
    card.classList.remove('selected');
    zone.setAttribute('aria-label', `${PART_META[zone.dataset.accept].label} slot — filled`);

    const story = STORIES.find(s => s.id === storyId);
    const cfg   = config(story);
    if (cfg.immediate) applyFeedback(card, zone);
    checkIfAllCorrect(story);
  }

  function returnToTray(card) {
    const tray = document.getElementById(`tray-${storyId}`);
    if (tray) { tray.appendChild(card); card.classList.remove('placed'); }
  }

  /* ---- Immediate feedback (levels 1 & 2) ------------------ */
  function applyFeedback(card, zone) {
    if (card.dataset.part === zone.dataset.accept) {
      zone.classList.add('correct');
      zone.classList.remove('incorrect');
    } else {
      zone.classList.add('incorrect');
      zone.classList.remove('correct');
      card.classList.add('shake');
      setTimeout(() => {
        card.classList.remove('shake');
        zone.innerHTML = '';
        zone.classList.remove('incorrect');
        const ph = Render.el('span', 'dropzone-placeholder');
        ph.textContent = '↓'; ph.setAttribute('aria-hidden', 'true');
        zone.appendChild(ph);
        zone.setAttribute('aria-label', `${PART_META[zone.dataset.accept].label} slot — empty`);
        returnToTray(card);
      }, 500);
    }
  }

  /* ---- Level 3 submit check ------------------------------- */
  function checkAll(story) {
    let errors = 0;
    document.querySelectorAll(`.dropzone[data-story-id="${storyId}"]`).forEach(zone => {
      const card = zone.querySelector('.draggable');
      if (card && card.dataset.part === zone.dataset.accept) {
        zone.classList.add('correct');
      } else {
        zone.classList.add('incorrect'); errors++;
      }
    });
    if (errors === 0) onAllCorrect(story);
  }

  /* ---- Check if all 5 slots are correctly filled ---------- */
  function checkIfAllCorrect(story) {
    const zones = document.querySelectorAll(`.dropzone[data-story-id="${storyId}"]`);
    let correct = 0;
    zones.forEach(zone => {
      const card = zone.querySelector('.draggable');
      if (card && card.dataset.part === zone.dataset.accept) correct++;
    });
    if (correct >= 5) onAllCorrect(story);
  }

  function onAllCorrect(story) {
    const msg = document.getElementById(`ok-${storyId}`);
    if (msg && msg.style.display !== 'block') {
      msg.style.display = 'block';
      Progress.markPuzzleDone(story.id);

      const footer = document.querySelector('.practice-footer');
      if (footer) {
        footer.innerHTML = '';
        const startQuiz = Render.el('button', 'btn');
        startQuiz.textContent = '🎯 Start Quiz!';
        startQuiz.addEventListener('click', () =>
          App.go('quiz', { storyIdx: STORIES.indexOf(story), questionIdx: 0, results: [] }));
        footer.appendChild(startQuiz);

        const backBtn = Render.el('button', 'btn btn-secondary');
        backBtn.textContent = '← Back to Lesson';
        backBtn.addEventListener('click', () =>
          App.go('lesson', { storyIdx: STORIES.indexOf(story), lessonStep: PARTS.length - 1 }));
        footer.appendChild(backBtn);
      }

      Audio.chime('success');
      Confetti.launch();
      setTimeout(Confetti.stop, 3500);
    }
  }

  /* global pointer listeners */
  document.addEventListener('pointermove',   onPointerMove);
  document.addEventListener('pointerup',     onPointerUp);
  document.addEventListener('pointercancel', onPointerUp);

  return { build };
})();
