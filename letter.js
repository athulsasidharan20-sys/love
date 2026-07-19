import { supabase } from "./supabase-config.js";

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
  "First of aall SORRY😓",
  "njn oru naay aahne ariyaa pashe sorry thangamm",
  "Enk neeye ul,lu.enk nee illand pattilla so nammall thammill preshnam vanna nammkk parank theerkka tta",
  "Avoiding venda tta sothmanii",
  "thangoo nee orappichoo one day njn nink princess treatment therum suree.",
  "Trust me",
  " Njn nalla kutty aahne,enik ente ellaam aahne nee ",
  "",
  "Sheri ath vidduuu,njn programmer aahne tta thangoo ",
  "love youuu❤️",
  "",
  "Athava nink phone kittatha avstha vanna nee ee site keroiya mathi tta",
  "Ummmmaaaaahhhh.",
  "Njn upgrade aakka ninkum letter ezthaan ullath",
  "pashe ath ineem pani aahne so ath padikkanam ini",
  "",
  "Meet aakaan pattatthathine sangadam ijd plus loaded fries kaykande ummm",
  "Nammall breakup aavaan paadilla tta thangoo",
  "nNammall aahne the best cute COUPLES .ath marakkanda.aalkaarde asooya kaaranam aahne ingane okke aavnath",
  "",
  "Ummaaahhhh 💗",
  "I WILL LOVE YOU ALWAYS ❤️"
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

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  buildGreeting();
  animateLetter();
  initParticles();
});