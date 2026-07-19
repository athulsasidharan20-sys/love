import { supabase } from './supabase-config.js';

const grid = document.getElementById('memories-grid');
const emptyState = document.getElementById('empty-state');
const modal = document.getElementById('memoryModal');
const form = document.getElementById('memoryForm');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const authorInput = document.getElementById('author');
const dateInput = document.getElementById('date');
const imageFileInput = document.getElementById('imageFile');

let memories = [];
let selectedImageUrl = '';

function openModal() {
  modal.classList.add('active');
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
}

function closeModal() {
  modal.classList.remove('active');
  form.reset();
  selectedImageUrl = '';
  imageFileInput.value = '';
}

function formatDate(value) {
  if (!value) return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const parsed = new Date(value + 'T00:00:00');
  return parsed.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const { error: uploadError } = await supabase.storage.from('memory-images').upload(fileName, file, { upsert: false });
  if (uploadError) throw uploadError;
  const { data: publicUrlData } = supabase.storage.from('memory-images').getPublicUrl(fileName);
  if (!publicUrlData?.publicUrl) throw new Error('Unable to generate public URL');
  return publicUrlData.publicUrl;
}

async function deleteImage(path) {
  if (!path) return;
  const fileName = path.split('/').pop();
  await supabase.storage.from('memory-images').remove([fileName]);
}

async function loadMemories() {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  memories = (data || []).map((item) => ({
    ...item,
    date: item.memory_date || item.date || null
  }));
  renderMemories();
}

function renderMemories() {
  grid.innerHTML = '';
  if (!memories.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  memories.forEach((memory) => {
    const card = document.createElement('article');
    card.className = 'memory-card';
    card.innerHTML = `
      <div class="memory-pin"></div>
      ${memory.image_url ? `<img class="memory-image" src="${memory.image_url}" alt="${memory.title}" />` : '<div class="memory-image" style="background:linear-gradient(135deg,#fff5f7,#ffe4ec);display:flex;align-items:center;justify-content:center;color:#ec4899;font-weight:700;">No image</div>'}
      <h3 class="memory-title">${memory.title}</h3>
      <p class="memory-body">${memory.body}</p>
      <div class="memory-meta">
        <span>${memory.date || formatDate(memory.created_at)}</span>
        <button class="delete-btn" data-id="${memory.id}" title="Delete memory"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const author = authorInput.value;
  const date = dateInput.value;
  const file = imageFileInput.files?.[0];

  if (!title || !body) {
    alert('Please fill in the title and body.');
    return;
  }

  try {
    let imageUrl = selectedImageUrl;
    if (file) {
      imageUrl = await uploadImage(file);
    }

    const { error } = await supabase.from('memories').insert({
      title,
      body,
      author,
      memory_date: date,
      image_url: imageUrl || null,
      rotation: Math.floor(Math.random() * 8) - 4,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
    closeModal();
    await loadMemories();
  } catch (error) {
    console.error(error);
    alert('Unable to save memory.');
  }
}

async function handleDelete(id, imageUrl) {
  try {
    const { error } = await supabase.from('memories').delete().eq('id', id);
    if (error) throw error;
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop();
      await supabase.storage.from('memory-images').remove([fileName]);
    }
    await loadMemories();
  } catch (error) {
    console.error(error);
    alert('Unable to delete memory.');
  }
}

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});
form.addEventListener('submit', handleSubmit);
grid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  const id = Number(button.getAttribute('data-id'));
  const memory = memories.find((item) => item.id === id);
  if (memory) handleDelete(id, memory.image_url);
});

window.addEventListener('load', () => {
  const canvas = document.getElementById('collage-ambient-particles');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class RomanticParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 80;
      this.size = Math.random() * 6 + 3;
      this.speedY = -(Math.random() * 0.5 + 0.15);
      this.speedX = Math.random() * 0.35 - 0.18;
      this.alpha = Math.random() * 0.3 + 0.14;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 0.35 - 0.18;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.01) * 0.15;
      this.rotation += this.rotationSpeed;
      if (this.y < canvas.height * 0.2) this.alpha -= 0.002;
      if (this.y < 0 || this.alpha <= 0) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, 0, 0, this.size);
      ctx.bezierCurveTo(this.size, 0, this.size / 2, -this.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor(window.innerWidth / 35), 20);
    for (let i = 0; i < count; i++) {
      particles.push(new RomanticParticle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  initParticles();
  animate();
  window.addEventListener('resize', resizeCanvas);
});

loadMemories().catch((error) => {
  console.error(error);
  emptyState.hidden = false;
  grid.innerHTML = '<div class="empty-state"><h3 class="header-title" style="font-size:1.35rem;">Unable to load memories</h3><p class="header-copy">Check your Supabase configuration and table setup.</p></div>';
});
