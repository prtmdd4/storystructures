/* App — state machine, confetti, entry point */

/* ---- Confetti -------------------------------------------- */
const Confetti = (() => {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  let active    = false;
  let rafId     = null;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function launch() {
    stop();
    particles = Array.from({ length: 160 }, () => ({
      x:    Math.random() * canvas.width,
      y:    -(Math.random() * canvas.height * 0.5),
      w:    7 + Math.random() * 7,
      h:    4 + Math.random() * 5,
      dx:   (Math.random() - 0.5) * 4,
      dy:   3 + Math.random() * 4,
      rot:  Math.random() * 360,
      drot: (Math.random() - 0.5) * 9,
      color:`hsl(${Math.random() * 360},90%,55%)`,
    }));
    canvas.style.display = 'block';
    active = true;
    animate();
  }

  function animate() {
    if (!active) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allGone = true;
    particles.forEach(p => {
      p.x  += p.dx;
      p.y  += p.dy;
      p.rot += p.drot;
      if (p.y < canvas.height + 20) allGone = false;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (allGone) { stop(); return; }
    rafId = requestAnimationFrame(animate);
  }

  function stop() {
    active = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
    particles = [];
  }

  return { launch, stop };
})();

/* ---- App state machine ----------------------------------- */
const App = (() => {
  let state = { screen: 'home', storyIdx: 0, lessonStep: 0, questionIdx: 0, results: [] };

  function go(screen, opts = {}) {
    Audio.stop();
    state = { ...state, screen, ...opts };
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    const appEl = document.getElementById('app');
    appEl.innerHTML = '';

    let node;
    switch (state.screen) {
      case 'home':     node = Render.home(); break;
      case 'lesson':   node = Render.lesson(state.storyIdx, state.lessonStep); break;
      case 'practice': node = Practice.build(state.storyIdx); break;
      case 'quiz':     node = Quiz.buildQuestion(state.storyIdx, state.questionIdx, state.results); break;
      case 'result':   node = Quiz.buildResult(state.storyIdx, state.results); break;
      case 'gallery':  node = AiStory.buildGalleryScreen(state); break;
      default:         node = Render.home();
    }

    appEl.appendChild(node);
  }

  async function init() {
    Progress.load();
    await Audio.init();
    document.getElementById('header-home-btn').addEventListener('click', () => go('home'));
    render();
  }

  return { go, init };
})();

window.addEventListener('DOMContentLoaded', () => App.init());
