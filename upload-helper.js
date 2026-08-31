import { storage } from "./firebase-config.js";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

/**
 * อัปโหลดรูปภาพขึ้น Firebase Storage พร้อมแสดง progress bar
 * @param {File} file - ไฟล์รูปที่เลือก
 * @param {string} folder - โฟลเดอร์ปลายทาง เช่น "members", "announcements", "funerals"
 * @param {function} onProgress - callback รับ % ความคืบหน้า (0-100)
 * @returns {Promise<string>} downloadURL ของรูปที่อัปโหลดสำเร็จ
 */
function uploadImage(file, folder, onProgress) {
  return new Promise((resolve, reject) => {
    // ตรวจสอบไฟล์ก่อนอัปโหลด
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      reject(new Error("รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("ขนาดไฟล์ต้องไม่เกิน 5MB"));
      return;
    }

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(percent);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * ลบรูปภาพออกจาก Storage ด้วย URL เดิม
 * @param {string} imageUrl - URL รูปที่ต้องการลบ
 */
async function deleteImage(imageUrl) {
  if (!imageUrl) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (err) {
    console.warn("ไม่สามารถลบรูปเดิมได้ (อาจถูกลบไปแล้ว):", err.message);
  }
}

/**
 * แสดงตัวอย่างรูปก่อนอัปโหลด (preview)
 * @param {File} file
 * @param {HTMLImageElement} imgElement - element <img> ที่จะแสดง preview
 */
function previewImage(file, imgElement) {
  const reader = new FileReader();
  reader.onload = (e) => { imgElement.src = e.target.result; };
  reader.readAsDataURL(file);
}

export { uploadImage, deleteImage, previewImage };
