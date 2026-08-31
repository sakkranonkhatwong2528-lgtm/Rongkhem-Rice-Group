import { compressImage } from "./image-compressor.js";
import { uploadImage } from "./upload-helper.js";

imageInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  showToast("กำลังประมวลผลรูปภาพ...", "info");
  const compressed = await compressImage(file, 800, 0.7); // avatar ไม่ต้องใหญ่มาก
  selectedFile = compressed;
  previewImage(compressed, imagePreview);
  btnRemoveImage.style.display = "inline-flex";

  console.log(`ขนาดเดิม: ${(file.size/1024).toFixed(0)}KB → หลังบีบอัด: ${(compressed.size/1024).toFixed(0)}KB`);
});
