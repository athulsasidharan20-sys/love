// ===== MODAL LOGIC =====
const openBtn      = document.getElementById("openBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose   = document.getElementById("modalClose");
const birthdayForm = document.getElementById("birthdayForm");
const formError    = document.getElementById("formError");
// Open modal
openBtn.addEventListener("click", () => {
  modalOverlay.classList.add("active");
  document.getElementById("dayInput").focus();
});
// Close modal
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
function closeModal() {
  modalOverlay.classList.remove("active");
  formError.textContent = "";
}
// Keyboard close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("active")) closeModal();
});
// Form submit
birthdayForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const day   = parseInt(document.getElementById("dayInput").value);
  const month = document.getElementById("monthInput").value;
  const year  = parseInt(document.getElementById("yearInput").value);
  // Validation
  if (!day || day < 1 || day > 31) {
    formError.textContent = "Please enter a valid day (1–31).";
    return;
  }
  if (!month) {
    formError.textContent = "Please select a month.";
    return;
  }
  if (!year || year < 1900 || year > 2025) {
    formError.textContent = "Please enter a valid year (1900–2025).";
    return;
  }
  formError.textContent = "";
  // Save birthday to sessionStorage and navigate
  sessionStorage.setItem("birthday", JSON.stringify({ day, month, year }));
  // Fun transition animation before redirect
  document.body.style.transition = "opacity 0.6s ease";
  document.body.style.opacity = "0";
  setTimeout(() => {
    window.location.href = "main.html";
  }, 650);
});