import { supabase } from "./supabase-config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user"); // "athul" or "her"

  if (!user) {
    window.location.href = "main.html";
    return;
  }

  // Set page titles based on user
  const titleEl = document.getElementById("pageTitle");
  const writeBtn = document.getElementById("writeLetterBtn");

  if (user === "athul") {
    titleEl.textContent = "Athul's Letters";
  } else {
    titleEl.textContent = "Neha's Letters";
  }

  writeBtn.href = `write-letter.html?user=${user}`;

  const loadingIndicator = document.getElementById("loadingIndicator");
  const emptyState = document.getElementById("emptyState");
  const foldersGrid = document.getElementById("foldersGrid");

  try {
    const { data: letters, error } = await supabase
      .from('letters')
      .select('*')
      .eq('owner', user)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    loadingIndicator.style.display = "none";

    if (!letters || letters.length === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
      letters.forEach((data) => {
        const dateStr = data.created_at ? new Date(data.created_at).toLocaleDateString() : "Unknown date";

        const card = document.createElement("a");
        card.href = `view-letter.html?user=${user}&id=${data.id}`;
        card.className = "folder-card fade-in-up";

        const fName = data.folder_name || "Unnamed";

        card.innerHTML = `
          <div class="folder-icon">📁</div>
          <div class="folder-name">${fName}</div>
          <div class="folder-date">${dateStr}</div>
        `;
        foldersGrid.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Error fetching letters:", error);
    loadingIndicator.textContent = "Error loading letters. Please check your configuration.";
  }
});
