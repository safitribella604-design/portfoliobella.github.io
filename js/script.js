// Logika halaman. Tidak perlu diubah — edit js/config.js saja.

const STORAGE_KEY = "portfolio-bella-photos-v1";
const MAX_PHOTO_SIZE = 900; // px, sisi terpanjang foto yang ditambah lewat tap

// ---------- Tombol Instagram & TikTok ----------
document.querySelectorAll("[data-link]").forEach((a) => {
  a.href = CONFIG.links[a.dataset.link];
});

// ---------- Foto yang ditambah lewat tap (disimpan di browser) ----------
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
const saved = loadSaved();

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
  catch { /* penyimpanan penuh / dimatikan: abaikan */ }
}

function shrinkImage(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_PHOTO_SIZE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// ---------- Kotak foto ----------
function buildSlot(slot) {
  const { hint = "", tag = "", alt = tag } = slot.dataset;
  slot.innerHTML = `
    <input type="file" accept="image/*" aria-label="Tambah foto ${alt}">
    <span class="hint">${hint}</span>
    <img alt="${alt}">
    ${tag ? `<span class="tag">${tag}</span>` : ""}
    <button type="button" class="remove" aria-label="Hapus foto">×</button>`;
}

function showPhoto(slot, src) {
  slot.querySelector("img").src = src;
  slot.classList.add("has-photo");
}

function setupSlot(slot) {
  const id = slot.dataset.slot;
  buildSlot(slot);
  const fileInput = slot.querySelector("input");
  const img = slot.querySelector("img");

  // 1) foto yang pernah ditambah lewat tap
  if (saved[id]) showPhoto(slot, saved[id]);

  // 2) foto dari folder images (kalau ada, ini yang dipakai)
  const path = CONFIG.photos[id];
  if (path) {
    const probe = new Image();
    probe.onload = () => {
      showPhoto(slot, path);
      slot.classList.add("from-file");
      fileInput.disabled = true;
    };
    probe.src = path; // kalau file tidak ada, diam saja
  }

  // tambah foto lewat tap
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    shrinkImage(file, (dataUrl) => {
      showPhoto(slot, dataUrl);
      saved[id] = dataUrl;
      persist();
    });
    fileInput.value = "";
  });

  // hapus foto
  slot.querySelector(".remove").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    img.removeAttribute("src");
    slot.classList.remove("has-photo");
    delete saved[id];
    persist();
  });
}

document.querySelectorAll("[data-slot]").forEach(setupSlot);
