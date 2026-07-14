// ===== READ BIRTHDAY FROM SESSION =====
let birthday = null;
try {
  birthday = JSON.parse(sessionStorage.getItem("birthday") || "null");
} catch (error) {
  console.warn("Could not read birthday:", error);
}

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ===== BUILD GREETING =====
function buildGreeting() {
  if (!birthday) return;
  const greetEl = document.getElementById("greetingTitle");
  if (greetEl) {
    greetEl.textContent = "For my Thangam";
  }
}

// ===== LETTER LINES =====
const LETTER_LINES = [
  "Dya thangoo.",
  "Neeye atttitude idumbo enk sangadam illa nna vichaaram.",
  "enk nalla sangadam ind pinne nee already sangadathil aayond njn normal pole kaattaane,",
  "umm potte saarulla.",
  "",
  "Ithil type cheyyneneki pani ind korach.",
  "pinneye,ee laptop kolla tta fast and furious aayi ellam cheyyan pattind,",
  "enk venenki kadhayee add cheyya pashe umm ippo ningte sangadam maaratte pinne cheyya njn ",
  "",
  "enk ithil engane emoji idippikkum areela so ellathinu emoji ind vech aayikk nink ariya njn ethokke idum nn ",
  "Nink ellam ariyaa kaaranam nee ente thangam aane",
  "thangoo thangooo,",
  "Ummmmaaaaahhhh.",
  "sangadaavandaa oru thavana back adicha nammde photo karangnath kaana",
  "ath indaakaan korch kastapettu pashe kaaryillaa",
  "",
  "I love you more than words can ever express. 💖",
  "enk nee illaand pattilla so understand that and maryadhekk msg aykk",
  "Ummmmaaaaaahhhhhhh",
  "",
  "Thank you for simply being you. 💗",
];

// ===== TYPING / FADE-IN ANIMATION =====
function animateLetter() {
  const body = document.getElementById("letterBody");
  if (!body) return;
  body.innerHTML = "";

  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  body.appendChild(cursor);

  let lineIndex = 0;
  const lineEls = [];

  LETTER_LINES.forEach((text) => {
    const span = document.createElement("span");
    span.className = "line";
    if (text === "") {
      span.innerHTML = "&nbsp;";
      span.style.lineHeight = "1rem";
    } else {
      span.textContent = text;
    }
    body.insertBefore(span, cursor);
    lineEls.push(span);
  });

  function revealNext() {
    if (lineIndex >= lineEls.length) {
      cursor.remove();
      return;
    }
    lineEls[lineIndex].classList.add("visible");
    lineIndex += 1;
    const delay = LETTER_LINES[lineIndex - 1] === "" ? 200 : 520;
    setTimeout(revealNext, delay);
  }

  setTimeout(revealNext, 1200);
}

// ===== PARTICLE CANVAS =====
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244,143,177,${p.alpha})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });
    requestAnimationFrame(draw);
  }

  draw();
}

// ===== AUDIO PLAYER LOGIC =====
let currentAudio = null;
let currentPlayBtn = null;
let currentVinyl = null;
let currentWaves = null;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    if (currentPlayBtn) {
      currentPlayBtn.querySelector(".icon-play").style.display = "block";
      currentPlayBtn.querySelector(".icon-pause").style.display = "none";
    }
    if (currentVinyl) currentVinyl.classList.remove("spinning");
    if (currentWaves) currentWaves.classList.remove("playing");
    currentAudio = null;
    currentPlayBtn = null;
    currentVinyl = null;
    currentWaves = null;
  }
}

function initAudioPlayers() {
  document.querySelectorAll(".play-btn").forEach((btn) => {
    const audioId = btn.dataset.audio;
    const vinylId = btn.dataset.vinyl;
    const wavesId = btn.dataset.waves;
    const audio = document.getElementById(audioId);
    const vinyl = document.getElementById(vinylId);
    const waves = document.getElementById(wavesId);
    const bar = document.querySelector(`.progress-bar[data-audio="${audioId}"]`);
    const timeEl = document.getElementById(audioId.replace("audio", "time"));

    if (!audio || !vinyl || !waves) return;

    btn.addEventListener("click", () => {
      const isThisPlaying = (currentAudio === audio) && !audio.paused;
      stopCurrentAudio();
      if (!isThisPlaying) {
        audio.play().catch(() => {});
        btn.querySelector(".icon-play").style.display = "none";
        btn.querySelector(".icon-pause").style.display = "block";
        vinyl.classList.add("spinning");
        waves.classList.add("playing");
        currentAudio = audio;
        currentPlayBtn = btn;
        currentVinyl = vinyl;
        currentWaves = waves;
      }
    });

    if (bar) {
      bar.addEventListener("input", () => {
        if (audio.duration) {
          audio.currentTime = (bar.value / 100) * audio.duration;
        }
      });
    }

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        if (bar) bar.value = (audio.currentTime / audio.duration) * 100;
        if (timeEl) timeEl.textContent = formatTime(audio.currentTime);
      }
    });

    audio.addEventListener("error", () => {
      btn.disabled = true;
      btn.classList.add("is-disabled");
      btn.title = "Audio unavailable";
      btn.querySelector(".icon-play").style.display = "block";
      btn.querySelector(".icon-pause").style.display = "none";
      vinyl.classList.remove("spinning");
      waves.classList.remove("playing");
      if (timeEl) timeEl.textContent = "0:00";
    });

    audio.addEventListener("canplay", () => {
      btn.disabled = false;
      btn.classList.remove("is-disabled");
    });

    audio.addEventListener("ended", () => {
      btn.querySelector(".icon-play").style.display = "block";
      btn.querySelector(".icon-pause").style.display = "none";
      vinyl.classList.remove("spinning");
      waves.classList.remove("playing");
      if (bar) bar.value = 0;
      if (timeEl) timeEl.textContent = "0:00";
      currentAudio = null;
      currentPlayBtn = null;
      currentVinyl = null;
      currentWaves = null;
    });
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  buildGreeting();
  animateLetter();
  initParticles();
  initAudioPlayers();
});