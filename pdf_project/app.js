const imageInput = document.getElementById("imageInput");
const fileInfo = document.getElementById("fileInfo");
const previewContainer = document.getElementById("previewContainer");
const generateBtn = document.getElementById("generateBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const qualitySelect = document.getElementById("qualitySelect");

let selectedImages = [];

imageInput.addEventListener("change", handleFileSelect);
clearAllBtn.addEventListener("click", clearAllImages);
generateBtn.addEventListener("click", generatePDF);

function handleFileSelect(event) {
  const files = Array.from(event.target.files);

  if (!files.length) return;

  const imageFiles = files.filter(file => file.type.startsWith("image/"));

  imageFiles.forEach(file => {
    selectedImages.push({
      id: createUniqueId(),
      file: file
    });
  });

  imageInput.value = "";
  renderPreview();
}

function renderPreview() {
  previewContainer.innerHTML = "";

  if (selectedImages.length === 0) {
    fileInfo.textContent = "Hali rasm tanlanmagan";
    return;
  }

  fileInfo.textContent = `${selectedImages.length} ta rasm tanlandi`;

  selectedImages.forEach((item, index) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const card = document.createElement("div");
      card.className = "preview-item";

      card.innerHTML = `
        <div class="preview-image-wrap">
          <img src="${e.target.result}" alt="Rasm ${index + 1}">
        </div>
        <div class="preview-content">
          <p class="preview-name">${item.file.name}</p>
          <button class="preview-remove" type="button" data-id="${item.id}">
            O‘chirish
          </button>
        </div>
      `;

      const removeBtn = card.querySelector(".preview-remove");
      removeBtn.addEventListener("click", () => removeImage(item.id));

      previewContainer.appendChild(card);
    };

    reader.readAsDataURL(item.file);
  });
}

function removeImage(id) {
  selectedImages = selectedImages.filter(item => item.id !== id);
  renderPreview();
}

function clearAllImages() {
  selectedImages = [];
  previewContainer.innerHTML = "";
  fileInfo.textContent = "Hali rasm tanlanmagan";
}

async function generatePDF() {
  if (selectedImages.length === 0) {
    alert("Iltimos, kamida bitta rasm tanlang.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "PDF yaratilmoqda...";

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const qualitySettings = getQualitySettings(qualitySelect.value);

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i].file;

      const originalDataUrl = await fileToDataURL(file);
      const optimizedDataUrl = await optimizeImageForPdf(
        originalDataUrl,
        qualitySettings.maxDimension,
        qualitySettings.quality
      );

      const img = await loadImage(optimizedDataUrl);

      if (i > 0) {
        pdf.addPage();
      }

      addImageToPdfPage(pdf, optimizedDataUrl, img);
    }

    pdf.save("quickpdf-images.pdf");
  } catch (error) {
    console.error(error);
    alert("Xatolik yuz berdi. Qayta urinib ko‘ring.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "PDF yaratish";
  }
}

function getQualitySettings(mode) {
  if (mode === "high") {
    return {
      maxDimension: 2200,
      quality: 0.92
    };
  }

  if (mode === "medium") {
    return {
      maxDimension: 1700,
      quality: 0.82
    };
  }

  return {
    maxDimension: 1300,
    quality: 0.72
  };
}

function addImageToPdfPage(pdf, imageData, img) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;

  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  let renderWidth = maxWidth;
  let renderHeight = (img.height * renderWidth) / img.width;

  if (renderHeight > maxHeight) {
    renderHeight = maxHeight;
    renderWidth = (img.width * renderHeight) / img.height;
  }

  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  pdf.addImage(imageData, "JPEG", x, y, renderWidth, renderHeight, undefined, "FAST");
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Faylni o‘qib bo‘lmadi"));

    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Rasm yuklanmadi"));

    img.src = src;
  });
}

function optimizeImageForPdf(dataUrl, maxDimension, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = function () {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(optimizedDataUrl);
    };

    img.onerror = () => reject(new Error("Rasmni optimizatsiya qilib bo‘lmadi"));
    img.src = dataUrl;
  });
}

function createUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}