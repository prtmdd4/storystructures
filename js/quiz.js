/* Quiz — one question at a time, immediate per-question feedback,
   mastery gate: level 1 = 2/3, level 2-3 = 4/5.             */

const Quiz = (() => {

  /* Active-question filter: Level 1 only quizzes on the 3 active parts */
  function activeQuestions(story) {
    if (story.level === 1) {
      const active = new Set(['introduction', 'climax', 'resolution']);
      return story.quiz.filter(q => active.has(q.part));
    }
    return story.quiz;
  }

  function passThreshold(story) {
    return story.level === 1 ? 2 : 4;
  }

  /* ---- Build one question screen -------------------------- */
  function buildQuestion(storyIdx, questionIdx, results) {
    const story     = STORIES[storyIdx];
    const questions = activeQuestions(story);
    const qObj      = questions[questionIdx];
    const total     = questions.length;

    const wrap = Render.el('div', 'quiz-screen');

    /* Header */
    wrap.innerHTML = `
      <div class="quiz-header">
        <h2>📝 Quiz — ${story.title}</h2>
        <p>Question ${questionIdx + 1} of ${total}</p>
      </div>`;

    /* Progress bar */
    let pips = '<div class="quiz-progress-bar" role="progressbar" aria-valuenow="' + questionIdx + '" aria-valuemax="' + total + '">';
    questions.forEach((_, i) => {
      let cls = '';
      if (i < results.length) cls = results[i] ? 'correct' : 'incorrect';
      else if (i === questionIdx) cls = 'current';
      pips += `<div class="q-pip ${cls}"></div>`;
    });
    pips += '</div>';
    wrap.insertAdjacentHTML('beforeend', pips);

    /* Question card */
    const qIdx = story.quiz.indexOf(qObj);
    const card = Render.el('div', 'quiz-question-card');
    card.innerHTML = `
      <div class="quiz-q-text">
        <span class="quiz-q-num" aria-hidden="true">${questionIdx + 1}</span>
        <span>${qObj.q}</span>
        <button class="btn-icon" style="font-size:1.1em;" id="quiz-play-btn" aria-label="Play"></button>
      </div>`;

    const list = Render.el('ul', 'choice-list');
    list.setAttribute('role', 'list');

    /* Shuffle choice order but track correct index */
    const indexed = qObj.choices.map((c, i) => ({ text: c, isCorrect: i === qObj.answer }));
    const shuffled = shuffle(indexed);

    shuffled.forEach((choice, ci) => {
      const li = document.createElement('li');
      const btn = Render.el('button', 'choice-btn');
      btn.dataset.correct = choice.isCorrect ? '1' : '0';
      btn.setAttribute('aria-label', choice.text);
      btn.innerHTML = `<span class="choice-icon" aria-hidden="true">○</span> ${choice.text}`;

      btn.addEventListener('click', () => onAnswer(choice.isCorrect, btn, list, feedbackEl, nextBtn, qObj, results));
      li.appendChild(btn);
      list.appendChild(li);
    });

    card.appendChild(list);

    /* Feedback box (hidden until answered) */
    const feedbackEl = Render.el('div', 'quiz-feedback');
    card.appendChild(feedbackEl);

    wrap.appendChild(card);

    Audio.bindToggle(card.querySelector('#quiz-play-btn'),
      `quiz-${story.id}-q${qIdx}`, () => Audio.quizQ(story.id, qIdx));

    /* Next button (hidden until answered) */
    const nextBtn = Render.el('button', 'btn');
    nextBtn.style.display = 'none';
    nextBtn.textContent = questionIdx < total - 1 ? 'Next Question →' : 'See My Results!';
    nextBtn.addEventListener('click', () => {
      if (questionIdx < total - 1) {
        App.go('quiz', { storyIdx, questionIdx: questionIdx + 1, results });
      } else {
        App.go('result', { storyIdx, results });
      }
    });
    wrap.appendChild(nextBtn);

    /* Auto-read question after brief delay */
    setTimeout(() => Audio.quizQ(story.id, story.quiz.indexOf(qObj)), 500);

    return wrap;
  }

  function onAnswer(isCorrect, clickedBtn, list, feedbackEl, nextBtn, qObj, results) {
    results.push(isCorrect);  // record before rendering next question
    /* disable all choices */
    list.querySelectorAll('.choice-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.correct === '1') {
        b.classList.add('correct-ans');
        b.querySelector('.choice-icon').textContent = '✓';
      }
    });

    if (isCorrect) {
      clickedBtn.classList.add('correct-ans');
      clickedBtn.querySelector('.choice-icon').textContent = '✓';
      feedbackEl.className = 'quiz-feedback correct-fb';
      feedbackEl.innerHTML = '✅ <strong>Correct!</strong><div class="why">' + qObj.why + '</div>';
      Audio.ui('great-job');
    } else {
      clickedBtn.classList.add('wrong-ans');
      clickedBtn.querySelector('.choice-icon').textContent = '✗';
      feedbackEl.className = 'quiz-feedback incorrect-fb';
      feedbackEl.innerHTML = '❌ <strong>Not quite!</strong><div class="why">' + qObj.why + '</div>';
      Audio.ui('try-again');
    }

    nextBtn.style.display = 'inline-block';
  }

  /* ---- Result screen -------------------------------------- */
  function buildResult(storyIdx, results) {
    const story     = STORIES[storyIdx];
    const questions = activeQuestions(story);
    const pass      = passThreshold(story);
    const score     = results.filter(Boolean).length;
    const passed    = score >= pass;

    if (passed) Progress.markQuizPassed(story.id);

    const wrap = Render.el('div', 'result-screen');

    const earnedStars = Progress.getStars(story.id);
    wrap.innerHTML = `
      <div class="result-stars">${earnedStars >= 2 ? '⭐⭐' : '⭐'}</div>
      <div class="result-score">${score} out of ${questions.length}</div>
      <div class="result-msg">${passed
        ? "Amazing! You passed the quiz! 🎉"
        : `You need ${pass} correct to pass. Keep trying — you can do it!`}</div>`;

    if (passed) {
      Audio.chime('success');
      Audio.ui('passed');
      Confetti.launch();
      setTimeout(Confetti.stop, 4000);
    } else {
      Audio.ui('retry');
      /* show which parts to review */
      const missed = questions.filter((q, i) => !results[i]);
      if (missed.length) {
        const missedBox = Render.el('div', 'missed-parts-list');
        missedBox.innerHTML = '<h3>Let\'s review these parts:</h3>';
        missed.forEach(q => {
          const meta = PART_META[q.part];
          const item = Render.el('div', 'missed-part-item');
          item.innerHTML = `<span class="missed-part-label">${meta.emoji} ${meta.label}:</span>
            <span>${meta.definition}</span>`;
          missedBox.appendChild(item);
        });
        wrap.appendChild(missedBox);
      }
    }

    /* Buttons */
    const btnRow = Render.el('div', 'btn-row');

    if (!passed) {
      const retry = Render.el('button', 'btn');
      retry.textContent = '🔄 Try the Quiz Again';
      retry.addEventListener('click', () => App.go('quiz', { storyIdx, questionIdx: 0, results: [] }));
      btnRow.appendChild(retry);

      const reteach = Render.el('button', 'btn btn-secondary');
      reteach.textContent = '📖 Review the Lesson';
      reteach.addEventListener('click', () => App.go('lesson', { storyIdx, lessonStep: 0 }));
      btnRow.appendChild(reteach);
    }

    const nextIdx = storyIdx + 1;
    if (nextIdx < STORIES.length && Progress.isUnlocked(STORIES[nextIdx])) {
      const nextBtn = Render.el('button', 'btn');
      nextBtn.textContent = 'Next Story →';
      nextBtn.addEventListener('click', () => App.go('lesson', { storyIdx: nextIdx, lessonStep: 0 }));
      btnRow.appendChild(nextBtn);
    }

    const homeBtn = Render.el('button', 'btn btn-secondary');
    homeBtn.textContent = '🏠 Home';
    homeBtn.addEventListener('click', () => App.go('home'));
    btnRow.appendChild(homeBtn);

    wrap.appendChild(btnRow);
    return wrap;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return { buildQuestion, buildResult };
})();
