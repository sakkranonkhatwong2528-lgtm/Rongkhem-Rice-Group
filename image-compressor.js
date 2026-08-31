/**
 * บีบอัดรูปภาพก่อนอัปโหลด เพื่อลดขนาดไฟล์และประหยัด Storage/แบนด์วิดท์
 * @param {File} file - ไฟล์รูปต้นฉบับ
 * @param {number} maxWidth - ความกว้างสูงสุด (px) ค่าเริ่มต้น 1200
 * @param {number} quality - คุณภาพ 0-1 ค่าเริ่มต้น 0.75
 * @returns {Promise<File>} ไฟล์ที่บีบอัดแล้ว (ยังเป็น File object ใช้กับ uploadImage ได้เลย)
 */
function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file); // ไม่ใช่รูป ไม่ต้องบีบอัด
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = reject;
    reader.readAsDataURL(file);

    img.onload = () => {
      let { width, height } = img;

      // ย่อขนาดตามสัดส่วนถ้ากว้างเกิน maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("บีบอัดรูปไม่สำเร็จ")); return; }
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปได้"));
  });
}

export { compressImage };
