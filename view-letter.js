import { supabase } from "./supabase-config.js";

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

// ===== TYPING / FADE-IN ANIMATION =====
function animateLetter(lines) {
  const body = document.getElementById("letterBody");
  if (!body) return;
  body.innerHTML = "";

  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  body.appendChild(cursor);

  let lineIndex = 0;
  const lineEls = [];

  lines.forEach((text) => {
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
      // Show images and edit actions after typing finishes
      document.getElementById("imagesSection").style.display = "block";
      document.getElementById("viewActions").style.display = "block";
      return;
    }
    lineEls[lineIndex].classList.add("visible");
    lineIndex += 1;
    const delay = lines[lineIndex - 1] === "" ? 200 : 520;
    setTimeout(revealNext, delay);
  }

  setTimeout(revealNext, 1200);
}

function extractStoragePathFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const prefix = "/storage/v1/object/public/letter-images/";
    if (parsedUrl.pathname.startsWith(prefix)) {
      return decodeURIComponent(parsedUrl.pathname.slice(prefix.length));
    }
  } catch (error) {
    console.warn("Could not parse image URL:", url, error);
  }
  return null;
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  initParticles();

  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user");
  const letterIdStr = urlParams.get("id");
  const letterId = letterIdStr ? parseInt(letterIdStr, 10) : null;

  if (!user || !letterId) {
    window.location.href = "main.html";
    return;
  }

  document.getElementById("backBtn").href = `letters.html?user=${user}`;
  document.getElementById("editBtn").href = `write-letter.html?user=${user}&id=${letterId}`;

  const deleteBtn = document.getElementById("deleteBtn");
  deleteBtn.addEventListener("click", async () => {
    const confirmed = window.confirm("Delete this letter and its uploaded images?");
    if (!confirmed) return;

    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting...";

    try {
      const { data: currentLetter, error: fetchError } = await supabase
        .from("letters")
        .select("images")
        .eq("id", letterId)
        .single();

      if (fetchError) throw fetchError;

      const imageUrls = Array.isArray(currentLetter?.images) ? currentLetter.images : [];
      const storagePaths = imageUrls
        .map(extractStoragePathFromUrl)
        .filter(Boolean);

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("letter-images")
          .remove(storagePaths);

        if (storageError) {
          console.error("Storage delete error:", storageError);
        }
      }

      const { error: deleteError } = await supabase
        .from("letters")
        .delete()
        .eq("id", letterId);

      if (deleteError) throw deleteError;

      window.location.href = `letters.html?user=${user}`;
    } catch (error) {
      console.error("Error deleting letter:", error);
      deleteBtn.disabled = false;
      deleteBtn.textContent = "🗑️ Delete Letter";
      alert("Could not delete the letter. Please try again.");
    }
  });

  // Change signature based on who is writing/reading
  if (user === "athul") {
    document.getElementById("signatureName").textContent = "Athul 💗";
  } else {
    document.getElementById("signatureName").textContent = "Yours 💗";
  }

  try {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', letterId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error("Supabase error:", error);
      }
      throw error;
    }

    if (data) {
      // Update Header
      const fName = data.folder_name || "Unnamed";
      document.getElementById("folderNameDisplay").textContent = `📁 ${fName}`;
      
      // Split content into lines for the typing animation
      const content = data.content || "";
      const lines = content.split('\n');
      
      // Show the letter card now that we have data
      document.getElementById("letterCard").style.display = "block";
      
      // Start typing animation
      animateLetter(lines);

      // Render images (hidden until typing finishes)
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        const imagesGrid = document.getElementById("imagesGrid");
        data.images.forEach(url => {
          const img = document.createElement("img");
          img.src = url;
          img.className = "uploaded-image";
          img.loading = "lazy";
          imagesGrid.appendChild(img);
        });
      }

    } else {
      document.getElementById("folderNameDisplay").textContent = "Letter not found";
      document.getElementById("greetingTitle").textContent = "Oops!";
    }
  } catch (error) {
    console.error("Error fetching letter:", error);
    document.getElementById("folderNameDisplay").textContent = "Error loading letter";
    document.getElementById("greetingTitle").textContent = "Error";
    const body = document.getElementById("letterBody");
    if (body) {
      body.textContent = "There was a problem loading this letter. Please check your connection or database configuration.";
    }
    document.getElementById("letterCard").style.display = "block";
  }
});
