import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/* เช็คสถานะล็อกอินทันทีที่โหลดหน้า */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // ยังไม่ได้ล็อกอิน -> เด้งกลับหน้า login
    window.location.href = "login.html";
  } else {
    // อัปเดตชื่อผู้ใช้งานที่แสดงใน sidebar (ถ้ามี element นี้ในหน้า)
    const nameEl = document.querySelector(".user-info strong + span");
    if (nameEl && user.displayName) nameEl.textContent = user.displayName;
  }
});

/* ปุ่มออกจากระบบ (ทุกหน้ามีปุ่มนี้ใน sidebar อยู่แล้ว) */
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "login.html";
    });
  }
});
